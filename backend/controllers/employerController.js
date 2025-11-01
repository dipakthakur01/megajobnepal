const { getDB } = require('../config/db');
const { validate: uuidValidate } = require('uuid');

// Helper: pick allowed fields from request body (merged, single definition)
const pickAllowedCompanyFields = (body = {}) => {
  const allowed = [
    'name',
    'description',
    'industry',
    'website',
    'logo_url',
    'location',
    'company_size',
    'founded_year',
    'contact_email',
    'contact_phone',
    'employer_id',
    'is_featured',
    'is_top_hiring',
    'status',
    'company_type', // private/public/government
    'banner_url',
    'socials'
  ];
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  return update;
};

// Get all employers/companies
const getAllEmployers = async (req, res) => {
  try {
    const db = getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const companies = await db.collection('companies')
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray();

    const total = await db.collection('companies').countDocuments();

    res.json({
      companies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCompanies: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employer by ID
// Replace the function header to add UUID guard
const getEmployerById = async (req, res) => {
  try {
    const idParam = req.params.id;
    if (!uuidValidate(idParam)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    const db = getDB();
    const company = await db.collection('companies').findOne({ _id: idParam });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new employer profile
const createEmployer = async (req, res) => {
  try {
    const db = getDB();
    const companyData = pickAllowedCompanyFields(req.body);
    companyData.created_at = new Date();
    companyData.updated_at = new Date();
    const result = await db.collection('companies').insertOne(companyData);
    companyData._id = result.insertedId;
    res.status(201).json(companyData);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update employer profile
const updateEmployer = async (req, res) => {
  try {
    const db = getDB();
    const update = pickAllowedCompanyFields(req.body);
    update.updated_at = new Date();
    const updated = await db.collection('companies').findOneAndUpdate(
      { _id: req.params.id },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete employer
const deleteEmployer = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('companies').deleteOne({ _id: req.params.id });
    if (!result.deletedCount) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllEmployers,
  getEmployerById,
  createEmployer,
  updateEmployer,
  deleteEmployer
};

// New: Get current employer's company profile using auth context
const getCurrentEmployerProfile = async (req, res) => {
  try {
    const db = getDB();
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    let company = null;
    try { company = await db.collection('companies').findOne({ employer_id: employerId }); } catch {}
    if (!company) {
      company = await db.collection('companies').findOne({ employer_id: employerIdStr });
    }
    if (!company) {
      return res.status(404).json({ message: 'Company not found for employer' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error getting employer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: Update current employer's company profile
const updateCurrentEmployerProfile = async (req, res) => {
  try {
    const db = getDB();
    const update = pickAllowedCompanyFields(req.body);
    update.updated_at = new Date();
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    const filter = { employer_id: employerIdStr };
    const setUpdate = { employer_id: employerIdStr, ...update };

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    console.log('[EmployerProfile] Update request', {
      employerId: employerIdStr,
      updateKeys: Object.keys(update)
    });

    const result = await db.collection('companies').findOneAndUpdate(
      filter,
      {
        $set: setUpdate,
        $setOnInsert: { created_at: new Date(), status: 'active' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const updatedCompany = result.value || result;
    
    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found for employer' });
    }

    const created = Boolean(result?.lastErrorObject?.upserted);
    console.log('[EmployerProfile] Update success', { created });

    res.json({ success: true, message: 'Profile updated successfully', created, company: updatedCompany });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({ error: 'Failed to update employer profile', details: error.message });
  }
};

// New: After upload middleware, persist logo URL to company
const updateCompanyLogoForEmployer = async (req, res) => {
  try {
    const db = getDB();
    const upload = req.uploadResult;
    const logoUrl = upload?.secure_url || upload?.url;
    if (!logoUrl) {
      return res.status(500).json({ message: 'Upload failed' });
    }
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    const filter = { employer_id: employerIdStr };
    const result = await db.collection('companies').findOneAndUpdate(
      filter,
      {
        $set: { employer_id: employerIdStr, logo_url: logoUrl, updated_at: new Date() },
        $setOnInsert: { created_at: new Date(), status: 'active' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const updatedCompany = result.value || result || null;
    res.json({ success: true, message: 'Logo updated successfully', logoUrl, company: updatedCompany });
  } catch (error) {
    console.error('Error updating company logo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New: After upload middleware, persist banner URL to company
const updateCompanyBannerForEmployer = async (req, res) => {
  try {
    const db = getDB();
    const upload = req.uploadResult;
    const bannerUrl = upload?.secure_url || upload?.url;
    if (!bannerUrl) {
      return res.status(500).json({ message: 'Upload failed' });
    }
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    const filter = { employer_id: employerIdStr };
    const result = await db.collection('companies').findOneAndUpdate(
      filter,
      {
        $set: { employer_id: employerIdStr, banner_url: bannerUrl, updated_at: new Date() },
        $setOnInsert: { created_at: new Date(), status: 'active' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const updatedCompany = result.value || result || null;
    res.json({ success: true, message: 'Banner updated successfully', bannerUrl, company: updatedCompany });
  } catch (error) {
    console.error('Error updating company banner:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports.getCurrentEmployerProfile = getCurrentEmployerProfile;
module.exports.updateCurrentEmployerProfile = updateCurrentEmployerProfile;
module.exports.updateCompanyLogoForEmployer = updateCompanyLogoForEmployer;
module.exports.updateCompanyBannerForEmployer = updateCompanyBannerForEmployer;

// New: Subscription handlers
const getSubscriptionInfo = async (req, res) => {
  try {
    const db = getDB();
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    let company = null;
    try { company = await db.collection('companies').findOne({ employer_id: employerIdStr }); } catch {}
    if (!company) {
      try { company = await db.collection('companies').findOne({ employer_id: employerId }); } catch {}
    }
    const plan = company?.subscription_plan || 'Free';
    const credits = company?.subscription_credits ?? 0;
    const history = company?.subscription_history || [];
    return res.json({ plan, credits, history });
  } catch (error) {
    console.error('Error getting subscription info:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const upgradeSubscription = async (req, res) => {
  try {
    const db = getDB();
    const employerId = req.user.userId;
    const employerIdStr = employerId?.toString?.() || String(employerId);
    const planId = req.body?.planId || 'basic';

    const planMap = { basic: 'Basic', premium: 'Premium', enterprise: 'Enterprise' };
    const plan = planMap[planId] || planId;

    const filter = { employer_id: employerIdStr };
    const result = await db.collection('companies').findOneAndUpdate(
      filter,
      {
        $set: { employer_id: employerIdStr, subscription_plan: plan },
        $setOnInsert: { created_at: new Date(), status: 'active' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const updatedCompany = result.value || result || null;
    return res.json({ success: true, plan, company: updatedCompany });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Export new handlers
module.exports.getSubscriptionInfo = getSubscriptionInfo;
module.exports.upgradeSubscription = upgradeSubscription;