const { getDB } = require('../config/db');

function toSafeRegex(input) {
  try {
    const s = String(input || '');
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  } catch {
    return new RegExp('', 'i');
  }
}

// Get all jobs with filtering and pagination
const getJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      location, 
      company_id, 
      search,
      status,
      tier
    } = req.query;

    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter query for public jobs listing - only show approved jobs
    const filter = {};
    if (status) filter.status = status; else filter.status = 'active';
    // Show approved jobs, and for backward compatibility include jobs without approval_status
    filter.$or = [
      { approval_status: 'approved' },
      { approval_status: { $exists: false } }
    ];

    if (category) filter.category_id = category;
    if (location) filter.location = toSafeRegex(location);
    if (company_id) filter.company_id = company_id;
    if (tier) filter.tier = tier;
    if (search) {
      const sr = toSafeRegex(search);
      filter.$or = [
        { title: sr },
        { description: sr },
        { requirements: sr }
      ];
    }

    // Get jobs with pagination
    const jobs = await db.collection('jobs')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const total = await db.collection('jobs').countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_jobs: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Get employer's own jobs (authenticated)
const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { created_by: req.user.userId };
    if (status) filter.status = status;

    const jobs = await db.collection('jobs')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('jobs').countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_jobs: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const job = await db.collection('jobs').findOne({ _id: id });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Create new job (for employers)
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary_range,
      // new structured salary fields (optional)
      salary_type,
      salary,
      salary_min,
      salary_max,
      salary_currency,
      location,
      category_id,
      company_id,
      employment_type,
      experience_level,
      deadline
    } = req.body;

    if (!title || !description || !requirements || !location || !category_id || !company_id) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const db = getDB();

    // Derive salary_range for compatibility when structured fields are present
    let derivedSalaryRange = salary_range;
    try {
      const currency = salary_currency || 'NPR';
      if (!derivedSalaryRange && salary_type) {
        switch (String(salary_type)) {
          case 'negotiable':
            derivedSalaryRange = 'Negotiable';
            break;
          case 'competitive':
            derivedSalaryRange = 'Competitive';
            break;
          case 'range':
            if (salary_min && salary_max) {
              const min = parseInt(String(salary_min));
              const max = parseInt(String(salary_max));
              if (!isNaN(min) && !isNaN(max)) {
                derivedSalaryRange = `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
              }
            }
            break;
          case 'exact':
            if (salary) {
              const amt = parseInt(String(salary));
              if (!isNaN(amt)) {
                derivedSalaryRange = `${currency} ${amt.toLocaleString()}`;
              }
            }
            break;
        }
      }
    } catch (_) {}

    const newJob = {
      title,
      description,
      requirements,
      // store both for flexibility
      salary_range: derivedSalaryRange || salary_range,
      salary_type: salary_type || null,
      salary: salary || null,
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      salary_currency: salary_currency || (salary_type ? 'NPR' : null),
      location,
      category_id,
      company_id: company_id,
      employment_type,
      experience_level,
      status: 'active',
      // Auto-approve employer-created jobs so they appear on public listings immediately
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: req.user.userId,
      tier: null, // Tier can be adjusted later by admin if needed
      created_by: req.user.userId,
      created_at: new Date(),
      updated_at: new Date(),
      ...(deadline ? { deadline: new Date(deadline) } : {})
    };

    const result = await db.collection('jobs').insertOne(newJob);

    if (result.insertedId) {
      newJob._id = result.insertedId;
      res.status(201).json({
        message: 'Job created successfully',
        job: newJob
      });
    } else {
      res.status(500).json({ error: 'Failed to create job' });
    }
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

module.exports = {
  getJobs,
  getMyJobs,
  getJobById,
  createJob
};