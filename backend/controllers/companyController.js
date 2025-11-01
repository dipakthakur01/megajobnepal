const { getDB } = require('../config/db');
// Using string IDs with Postgres-compatible adapter

function toSafeRegex(input) {
  try {
    const s = String(input || '');
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  } catch {
    return new RegExp('', 'i');
  }
}

// Get all companies with pagination
const getCompanies = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      industry 
    } = req.query;

    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter query
    const filter = {};
    
    if (search) {
      const sr = toSafeRegex(search);
      filter.$or = [
        { name: sr },
        { description: sr },
        { location: sr }
      ];
    }
    
    if (industry) {
      filter.industry = toSafeRegex(industry);
    }

    // Get companies with pagination
    const companies = await db.collection('companies')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const total = await db.collection('companies').countDocuments(filter);

    res.json({
      companies,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_companies: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Get single company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const company = await db.collection('companies').findOne({ _id: id });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Get company by name
const getCompanyByName = async (req, res) => {
  try {
    const { name } = req.params;
    const db = getDB();

    // Decode URL-encoded name
    const decodedName = decodeURIComponent(name);
    // Normalize common slug separators to spaces
    const normalizedName = decodedName.replace(/[-_]+/g, ' ').trim();

    // Try exact match first (fast, precise)
    let company = await db.collection('companies').findOne({ name: decodedName });
    if (!company) {
      company = await db.collection('companies').findOne({ name: normalizedName });
    }

    // Fallback to case-insensitive contains match (handles minor differences)
    if (!company) {
      // Build a flexible regex that treats hyphens/underscores/spaces equivalently
      const flexiblePattern = decodedName.replace(/[-_\s]+/g, '[-_\s]+');
      const regexFlexible = new RegExp(flexiblePattern, 'i');
      company = await db.collection('companies').findOne({ name: regexFlexible });
      if (!company) {
        const normalizedPattern = normalizedName.replace(/\s+/g, '\\s+');
        const regexNormalized = new RegExp(`^${normalizedPattern}$`, 'i');
        company = await db.collection('companies').findOne({ name: regexNormalized });
      }
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company by name error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Create new company (for employers)
const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      location,
      website,
      size,
      logo_url
    } = req.body;

    if (!name || !description || !industry || !location) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const db = getDB();

    // Check if company name already exists
    const existingCompany = await db.collection('companies').findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this name already exists' });
    }

    const newCompany = {
      name,
      description,
      industry,
      location,
      website,
      size,
      logo_url,
      employer_id: req.user.userId,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('companies').insertOne(newCompany);

    if (result.insertedId) {
      newCompany._id = result.insertedId;
      res.status(201).json({
        message: 'Company created successfully',
        company: newCompany
      });
    } else {
      res.status(500).json({ error: 'Failed to create company' });
    }
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

// Trusted companies for homepage section
const getTrustedCompanies = async (req, res) => {
  try {
    const db = getDB();
    const { limit = 20 } = req.query;

    const filter = {
      $or: [
        { is_featured: true },
        { is_top_hiring: true }
      ],
      status: 'active'
    };

    const companies = await db.collection('companies')
      .find(filter)
      .sort({ updated_at: -1, created_at: -1 })
      .limit(parseInt(limit))
      .project({ name: 1, logo_url: 1, website: 1, industry: 1 })
      .toArray();

    res.json({ companies });
  } catch (error) {
    console.error('Get trusted companies error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error?.message || error) });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  getCompanyByName,
  createCompany,
  getTrustedCompanies
};