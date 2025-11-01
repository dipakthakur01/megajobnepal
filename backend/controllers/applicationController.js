const { getDB } = require('../config/db');

// Create new job application
const createApplication = async (req, res) => {
  try {
    const { job_id, jobId, cover_letter, resume_url, coverLetter, resumeUrl } = req.body;

    // Accept both job_id and jobId for compatibility
    const jobIdValue = job_id || jobId;
    const coverLetterValue = cover_letter || coverLetter;
    const resumeUrlValue = resume_url || resumeUrl;

    if (!jobIdValue) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const db = getDB();

    // Check if job exists
    const job = await db.collection('jobs').findOne({ _id: jobIdValue });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only allow applications for active and approved jobs
    if (job.status !== 'active' || job.approval_status !== 'approved') {
      return res.status(400).json({ error: 'Job is not open for applications' });
    }

    // Check if user already applied for this job
    const existingApplication = await db.collection('applications').findOne({
      job_id: jobIdValue,
      job_seeker_id: req.user.userId
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const newApplication = {
      job_id: jobIdValue,
      job_seeker_id: req.user.userId,
      // Link employer and company for employer dashboards and reporting
      employer_id: job.created_by || null,
      company_id: job.company_id || null,
      cover_letter: coverLetterValue,
      resume_url: resumeUrlValue,
      status: 'pending',
      applied_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('applications').insertOne(newApplication);

    if (result.insertedId) {
      newApplication._id = result.insertedId;
      res.status(201).json({
        message: 'Application submitted successfully',
        application: newApplication
      });
    } else {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's applications or applications for employer's jobs
const getApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      job_id 
    } = req.query;

    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = {};

    // If user is job seeker, get their applications
    if (req.user.user_type === 'job_seeker') {
      filter.job_seeker_id = req.user.userId;
    } 
    // If user is employer, get applications for their jobs
    else if (req.user.user_type === 'employer') {
      // First get all jobs created by this employer
      const employerJobs = await db.collection('jobs')
        .find({ created_by: req.user.userId })
        .project({ _id: 1 })
        .toArray();
      
      const jobIds = employerJobs.map(job => job._id);
      filter.job_id = { $in: jobIds };
    }

    // Additional filters
    if (status) filter.status = status;
    if (job_id) filter.job_id = job_id;

    // Get applications with job details
    const applications = await db.collection('applications')
      .find(filter)
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Fetch related jobs and users and join in-memory
    const jobIdsSet = new Set(applications.map(a => a.job_id));
    const userIdsSet = new Set(applications.map(a => a.job_seeker_id));
    const jobIds = Array.from(jobIdsSet);
    const userIds = Array.from(userIdsSet);

    const jobs = jobIds.length
      ? await db.collection('jobs').find({ _id: { $in: jobIds } }).toArray()
      : [];
    const users = userIds.length
      ? await db.collection('users').find({ _id: { $in: userIds } }).project({ password: 0 }).toArray()
      : [];

    const jobsMap = new Map(jobs.map(j => [j._id, j]));
    const usersMap = new Map(users.map(u => [u._id, u]));

    const enriched = applications
      .map(a => ({
        ...a,
        job: jobsMap.get(a.job_id) || null,
        job_seeker: usersMap.get(a.job_seeker_id) || null
      }))
      .filter(a => a.job && a.job_seeker);

    // Get total count for pagination
    const total = await db.collection('applications').countDocuments(filter);

    res.json({
      applications: enriched,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_applications: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update application status (for employers)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const db = getDB();

    // Check if application exists and belongs to employer's job
    const application = await db.collection('applications').findOne({ _id: id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const job = await db.collection('jobs').findOne({ _id: application.job_id });
    if (!job || String(job.created_by) !== String(req.user.userId)) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    // Update application status
    const result = await db.collection('applications').updateOne(
      { _id: id },
      { 
        $set: { 
          status,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus
};