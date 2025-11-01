const { getDB } = require('../config/db');
const aiCvAnalysisService = require('../services/aiCvAnalysisService');
const cvExportService = require('../services/cvExportService');
const path = require('path');
const bcrypt = require('bcrypt');
const sendOtpMail = require('../services/otpService');

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const db = getDB();
    
    const totalUsers = await db.collection('users').countDocuments();
    const totalJobs = await db.collection('jobs').countDocuments();
    const totalCompanies = await db.collection('companies').countDocuments();
    const totalApplications = await db.collection('applications').countDocuments();

    // Additional consolidated stats
    const activeUsers = await db.collection('users').countDocuments({ status: 'active' });
    const staffRoles = ['admin', 'hr', 'super_admin'];
    const totalStaff = await db.collection('users').countDocuments({ user_type: { $in: staffRoles } });
    const activeStaff = await db.collection('users').countDocuments({ user_type: { $in: staffRoles }, status: 'active' });

    // Get recent jobs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJobs = await db.collection('jobs').countDocuments({ 
      created_at: { $gte: thirtyDaysAgo } 
    });

    // Get recent applications (last 30 days)
    const recentApplications = await db.collection('applications').countDocuments({ 
      applied_at: { $gte: thirtyDaysAgo } 
    });

    res.json({
      totalUsers,
      activeUsers,
      totalStaff,
      activeStaff,
      totalJobs,
      totalCompanies,
      totalApplications,
      recentJobs,
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const db = getDB();

    let query = {};
    if (search) {
      const rx = new RegExp(search, 'i');
      query = {
        $or: [
          { name: rx },
          { email: rx }
        ]
      };
    }

    const users = await db.collection('users')
      .find(query, { projection: { password: 0 } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.json({
      users,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_users: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    
    const result = await db.collection('users').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Moderate job (approve/reject)
// IMPORTANT: Also set approval_status so public listings include approved jobs
const moderateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    const db = getDB();

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
    }

    const updateData = {
      status: action === 'approve' ? 'active' : 'rejected',
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      moderated_at: new Date(),
      moderated_by: req.user ? req.user.id : null,
      ...(action === 'approve'
        ? { approved_at: new Date().toISOString(), approved_by: req.user ? (req.user.userId || req.user.id) : null }
        : { rejected_at: new Date().toISOString(), rejected_by: req.user ? (req.user.userId || req.user.id) : null })
    };

    if (reason) {
      updateData.moderation_reason = reason;
    }

    const result = await db.collection('jobs').updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await db.collection('jobs').findOne({ _id: id });

    res.json({ 
      message: `Job ${action}d successfully`, 
      job 
    });
  } catch (error) {
    console.error('Error moderating job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Seed database with sample data
const seedDatabase = async (req, res) => {
  try {
    const db = getDB();
    
    // Check if jobs already exist
    const existingJobs = await db.collection('jobs').countDocuments();
    if (existingJobs > 0) {
      // Ensure approval_status on existing jobs by fetching and patching missing values
      const allExisting = await db.collection('jobs').find({}).toArray();
      let patched = 0;
      for (const job of allExisting) {
        if (!job.approval_status) {
          await db.collection('jobs').updateOne({ id: job._id }, { $set: { approval_status: 'approved' } });
          patched += 1;
        }
      }
      return res.json({ 
        message: 'Database already contains jobs', 
        count: existingJobs,
        updatedApprovalStatus: patched
      });
    }

    // Sample jobs data
    const sampleJobs = [
      {
        title: 'Senior Software Engineer',
        company: 'Himalayan Bank Ltd',
        location: 'Kathmandu',
        employment_type: 'full_time',
        category: 'Information Technology',
        salary_min: 80000,
        salary_max: 120000,
        experience_level: 'senior',
        description: 'We are looking for an experienced software engineer to join our digital banking team.',
        requirements: ['5+ years experience', 'Java/Spring expertise', 'Microservices architecture', 'Banking domain knowledge'],
        benefits: ['Health insurance', 'Retirement plans', 'Professional development', 'Performance bonuses'],
        deadline: new Date('2024-12-30'),
        status: 'active',
        tier: 'mega_job',
        featured: true,
        source: 'online'
      },
      {
        title: 'React Developer',
        company: 'TechVision Nepal',
        location: 'Kathmandu',
        employment_type: 'full_time',
        category: 'Information Technology',
        salary_min: 60000,
        salary_max: 90000,
        experience_level: 'mid',
        description: 'Join our team to build amazing web applications using modern frontend technologies.',
        requirements: ['React/Vue.js experience', 'JavaScript proficiency', 'CSS/HTML skills', 'Git knowledge'],
        benefits: ['Flexible hours', 'Learning opportunities', 'Modern office', 'Team events'],
        deadline: new Date('2025-01-15'),
        status: 'active',
        tier: 'premium_job',
        featured: false,
        source: 'online'
      },
      {
        title: 'Network Engineer',
        company: 'Nepal Telecommunications Authority',
        location: 'Lalitpur',
        employment_type: 'full_time',
        category: 'Engineering',
        salary_min: 70000,
        salary_max: 90000,
        experience_level: 'senior',
        description: 'Design and optimize our 4G/5G network infrastructure across Nepal.',
        requirements: ['Telecom Engineering degree', 'Network optimization experience', '5G knowledge', 'RF planning skills'],
        benefits: ['Cutting-edge technology', 'International exposure', 'Medical coverage', 'Career growth'],
        deadline: new Date('2024-12-25'),
        status: 'active',
        tier: 'mega_job',
        featured: true,
        source: 'online'
      },
      {
        title: 'Junior Software Developer',
        company: 'StartUp Tech',
        location: 'Kathmandu',
        employment_type: 'full_time',
        category: 'Information Technology',
        salary_min: 35000,
        salary_max: 50000,
        experience_level: 'entry',
        description: 'Great opportunity for fresh graduates to start their career in software development.',
        requirements: ['0-2 years experience', 'Basic programming knowledge', 'JavaScript/Python', 'Eagerness to learn'],
        benefits: ['Mentorship program', 'Learning opportunities', 'Flexible hours', 'Growth potential'],
        deadline: new Date('2025-02-17'),
        status: 'active',
        tier: 'prime_job',
        featured: false,
        source: 'online'
      },
      {
        title: 'Marketing Manager',
        company: 'Digital Innovation Hub',
        location: 'Kathmandu',
        employment_type: 'full_time',
        category: 'Marketing & Sales',
        salary_min: 55000,
        salary_max: 75000,
        experience_level: 'mid',
        description: 'Lead our marketing initiatives and drive brand awareness in the digital space.',
        requirements: ['3+ years marketing experience', 'Digital marketing expertise', 'Analytics skills', 'Team leadership'],
        benefits: ['Creative freedom', 'Performance bonuses', 'Professional development', 'Modern workspace'],
        deadline: new Date('2025-01-20'),
        status: 'active',
        tier: 'latest_job',
        featured: false,
        source: 'online'
      },
      {
        title: 'Accountant',
        company: 'Himalayan Bank',
        location: 'Kathmandu',
        employment_type: 'full_time',
        category: 'Banking & Finance',
        salary_min: 50000,
        salary_max: 70000,
        experience_level: 'mid',
        description: 'Handle financial records, prepare reports, and ensure compliance with banking regulations.',
        requirements: ['Bachelor in Accounting/Finance', '3+ years banking experience', 'Knowledge of banking software', 'Attention to detail'],
        benefits: ['Job security', 'Medical coverage', 'Retirement benefits', 'Training opportunities'],
        deadline: new Date('2025-03-01'),
        status: 'active',
        tier: 'newspaper_job',
        featured: false,
        source: 'newspaper'
      }
    ];

    // Add timestamps to sample jobs
    const jobsWithTimestamps = sampleJobs.map(job => ({
      ...job,
      // Mark seeded jobs as approved so they appear in public listings
      approval_status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Insert sample jobs
    const insertedIds = [];
    for (const job of jobsWithTimestamps) {
      const ins = await db.collection('jobs').insertOne(job);
      insertedIds.push(ins.insertedId);
    }
    res.json({ 
      message: 'Database seeded successfully', 
      count: insertedIds.length,
      insertedIds
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AI-powered CV shortlisting
const analyzeJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { threshold = 65 } = req.query;

    // Accept jobId as a plain string ID

    const analysis = await aiCvAnalysisService.analyzeAndRankCandidates(jobId);
    
    // Filter by threshold if provided
    const shortlistedCandidates = analysis.rankedCandidates.filter(
      candidate => candidate.totalScore >= threshold
    );

    res.json({
      ...analysis,
      shortlistedCandidates,
      threshold: parseInt(threshold),
      shortlistedCount: shortlistedCandidates.length
    });
  } catch (error) {
    console.error('Error analyzing job candidates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk AI analysis for multiple jobs
const bulkAnalyzeJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'Job IDs array is required' });
    }

    // Accept jobIds as plain string IDs

    const results = await aiCvAnalysisService.bulkAnalyzeJobs(jobIds);
    
    res.json({
      totalJobs: jobIds.length,
      results,
      summary: {
        successful: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length
      }
    });
  } catch (error) {
    console.error('Error in bulk job analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export single candidate CV
const exportCandidateCV = async (req, res) => {
  try {
    const { candidateId, applicationId } = req.params;
    const { format = 'pdf' } = req.query;

    // Accept candidateId and applicationId as plain string IDs

    const exportResult = await cvExportService.exportSingleCandidate(
      candidateId, 
      applicationId, 
      format
    );

    // Set appropriate headers for file download
    const contentTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.sendFile(exportResult.filepath);

  } catch (error) {
    console.error('Error exporting candidate CV:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export job candidates in bulk
const exportJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { format = 'excel', includeAIAnalysis = 'true' } = req.query;

    // Accept jobId as a plain string ID

    const exportResult = await cvExportService.exportJobCandidates(
      jobId, 
      format, 
      includeAIAnalysis === 'true'
    );

    // Set appropriate headers for file download
    const contentTypes = {
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.sendFile(exportResult.filepath);

  } catch (error) {
    console.error('Error exporting job candidates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Company management endpoints
const getAllCompanies = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, search = '', status, verified } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query against companies collection
    const searchQuery = {};
    if (search) {
      const rx = new RegExp(search, 'i');
      searchQuery.$or = [
        { name: rx },
        { email: rx },
        { industry: rx },
        { location: rx },
        { description: rx }
      ];
    }
    if (status && status !== 'all') searchQuery.status = status;
    if (verified === 'true') searchQuery.verified = true;
    if (verified === 'false') searchQuery.verified = false;

    const companies = await db.collection('companies')
      .find(searchQuery)
      .skip(skip)
      .limit(limitNum)
      .sort({ created_at: -1 })
      .toArray();

    const totalCompanies = await db.collection('companies').countDocuments(searchQuery);

    // Get job counts by matching company id or name
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const idStr = company._id?.toString?.() || company.id || '';
        const nameStr = company.name || company.company_name || '';
        const jobCount = await db.collection('jobs').countDocuments({
          $or: [
            { company_id: idStr },
            { company: nameStr }
          ]
        });
        return {
          ...company,
          jobCount
        };
      })
    );

    res.json({
      companies: companiesWithStats,
      totalCompanies,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCompanies / limitNum),
      hasNextPage: pageNum * limitNum < totalCompanies,
      hasPrevPage: pageNum > 1
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const db = getDB();
    const {
      name: rawName,
      company_name,
      email,
      phone,
      address,
      location, // accept location from frontend
      website,
      industry,
      company_size,
      description,
      verified,
      status
    } = req.body;

    const name = rawName || company_name;

    // Validate required fields aligned with UI form
    if (!email || !name) {
      return res.status(400).json({
        message: 'Company name and email are required'
      });
    }

    // Prevent duplicate companies by name or email
    const existingByName = await db.collection('companies').findOne({ name });
    const existingByEmail = await db.collection('companies').findOne({ email });
    if (existingByName || existingByEmail) {
      return res.status(400).json({ message: 'Company with same name or email already exists' });
    }

    const now = new Date();
    const newCompany = {
      name,
      email,
      phone: phone || '',
      address: address || '',
      location: location || address || '',
      website: website || '',
      description: description || '',
      industry: industry || '',
      company_size: company_size || '',
      verified: typeof verified === 'boolean' ? verified : true, // auto-verified by admin
      status: status || 'active',
      created_at: now,
      updated_at: now
    };

    const result = await db.collection('companies').insertOne(newCompany);

    res.status(201).json({ ...newCompany, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const updateData = { ...req.body };
    if (updateData.company_name && !updateData.name) updateData.name = updateData.company_name;
    delete updateData.password;
    delete updateData.user_type;
    updateData.updated_at = new Date();

    let result = await db.collection('companies').updateOne(
      { $or: [{ _id: id }, { id }] },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const updatedCompany = await db.collection('companies').findOne({ $or: [{ _id: id }, { id }] });

     res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    const db = getDB();


    // Find company by string id to get its name
    const company = await db.collection('companies').findOne({ $or: [{ _id: id }, { id }] });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Count active jobs by either company_id or company name
    const idStr = company._id?.toString?.() || company.id || id;
    const activeJobs = await db.collection('jobs').countDocuments({
      $or: [
        { company_id: idStr },
        { company: company.name },
        { company: company.company_name }
      ],
      status: 'active'
    });

     const shouldForce = String(force).toLowerCase() === 'true';
     if (activeJobs > 0 && !shouldForce) {
       return res.status(400).json({
         message: `Cannot delete company with ${activeJobs} active job(s). Please deactivate jobs first or pass force=true.`
       });
     }

     if (activeJobs > 0 && shouldForce) {
       await db.collection('jobs').updateMany(
         {
           $or: [
             { company_id: idStr },
             { company: company.name },
             { company: company.company_name }
           ],
           status: 'active'
         },
         { $set: { status: 'inactive', updated_at: new Date() } }
       );
     }

    const result = await db.collection('companies').deleteOne({ $or: [{ _id: id }, { id }] });

     if (result.deletedCount === 0) {
       return res.status(404).json({ message: 'Company not found' });
     }

     res.json({ message: 'Company deleted successfully', forced: shouldForce });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// NEW: Reset employers and references (Super Admin)
const resetEmployers = async (req, res) => {
  try {
    const db = getDB();
    // Delete employer users
    const delUsers = await db.collection('users').deleteMany({ user_type: 'employer' });
    // Delete all companies
    const delCompanies = await db.collection('companies').deleteMany({});
    // Remove employer/company references from jobs
    const updJobs = await db.collection('jobs').updateMany({}, { $unset: { company_id: '', created_by: '' } });
    // Remove employer_id from any remaining company docs (if any)
    const updCompanies = await db.collection('companies').updateMany({}, { $unset: { employer_id: '' } });
    return res.json({
      message: 'Employers and references reset successfully',
      deleted_employer_users: delUsers?.deletedCount || 0,
      deleted_companies: delCompanies?.deletedCount || 0,
      jobs_updated: updJobs?.modifiedCount || 0,
      companies_updated: updCompanies?.modifiedCount || 0
    });
  } catch (error) {
    console.error('Reset employers error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a company in companies collection
const approveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Accept company id as a plain string ID

    const updated = await db.collection('companies').findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      { $set: { status: 'active', verified: true, updated_at: new Date(), approved_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company approved successfully', company: updated?.value || updated });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send OTP for admin password change (disabled per policy)
const sendPasswordChangeOtp = async (req, res) => {
  try {
    return res.status(403).json({
      error: 'Admin OTP password change is disabled. Use non-OTP change or contact a Super Admin.'
    });
  } catch (error) {
    console.error('Admin send password change OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Change admin password with OTP (disabled; use non-OTP endpoint)
const changePasswordWithOtp = async (req, res) => {
  try {
    return res.status(403).json({
      error: 'Admin OTP password change is disabled. Use the non-OTP change endpoint.'
    });
  } catch (error) {
    console.error('Admin change password with OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Change admin password without OTP (admin must be logged in and provide current password)
const changePassword = async (req, res) => {
  try {
    if (!req.user || req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: requires admin role' });
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const db = getDB();

    // Fetch admin by email from JWT for consistency
    const admin = await db.collection('users').findOne({ email: req.user.email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Verify current password
    const storedHash = typeof admin.password === 'string' ? admin.password : (
      typeof admin.password_hash === 'string' ? admin.password_hash : null
    );

    if (!storedHash) {
      return res.status(400).json({ error: 'Stored password is invalid for this account' });
    }

    const isValid = await bcrypt.compare(String(currentPassword), storedHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(String(newPassword), saltRounds);

    const result = await db.collection('users').updateOne(
      { _id: admin._id },
      { $set: { password: hashedNewPassword, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Admin user not found for update' });
    }

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Admin change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset a user's password (super-admin only)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = getDB();
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(String(newPassword), saltRounds);

    const result = await db.collection('users').updateOne(
      { _id: id },
      { $set: { password: passwordHash, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset user password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin job management: create/update/delete
const createJobByAdmin = async (req, res) => {
  try {
    const db = getDB();
    const {
      title,
      description,
      requirements,
      location,
      category_id,
      company_id,
      company,
      employment_type,
      experience_level,
      salary_min,
      salary_max,
      tier,
      featured,
      deadline,
      status,
      license_required
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Title, description and location are required' });
    }

    const normalizedTier = tier === 'mega_job' ? 'megajob' : tier;

    const newJob = {
      title,
      description,
      requirements,
      location,
      category_id,
      company_id,
      company,
      employment_type,
      experience_level,
      salary_min,
      salary_max,
      // Ensure jobs created by Super Admin are immediately publishable
      // Default to MegaJob tier if none provided; normalize legacy 'mega_job'
      tier: normalizedTier || 'megajob',
      featured,
      license_required: !!license_required,
      deadline: deadline ? new Date(deadline) : undefined,
      status: status || 'active',
      // Mark as approved so it appears on public listings and dashboard counts
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: req.user?.userId || req.user?.id,
      created_by: req.user?.userId || req.user?.id,
      moderated_by: req.user?.id || req.user?.userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    Object.keys(newJob).forEach(k => newJob[k] === undefined && delete newJob[k]);

    const result = await db.collection('jobs').insertOne(newJob);
    if (result.insertedId) {
      newJob._id = result.insertedId;
      return res.status(201).json({ message: 'Job created successfully', job: newJob });
    }
    return res.status(500).json({ message: 'Failed to create job' });
  } catch (error) {
    console.error('Error creating job by admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateJobByAdmin = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const allowed = ['title', 'description', 'requirements', 'location', 'category_id', 'company_id', 'company', 'employment_type', 'experience_level', 'salary_min', 'salary_max', 'tier', 'featured', 'deadline', 'status', 'license_required'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.deadline) {
      update.deadline = new Date(update.deadline);
    }
    update.updated_at = new Date();

    const result = await db.collection('jobs').updateOne({ _id: id }, { $set: update });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await db.collection('jobs').findOne({ _id: id });
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job by admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteJobByAdmin = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db.collection('jobs').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job by admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload and update job cover image (admin/super admin)
const updateJobCoverByAdmin = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const upload = req.uploadResult;

    if (!upload) {
      return res.status(400).json({ message: 'No upload result found' });
    }

    const coverUrl = upload.secure_url || upload.url;
    const update = {
      cover_image_url: coverUrl,
      cover_image_public_id: upload.public_id || undefined,
      updated_at: new Date()
    };
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const result = await db.collection('jobs').updateOne({ _id: id }, { $set: update });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const job = await db.collection('jobs').findOne({ _id: id });
    return res.json({ message: 'Job cover image updated', job, upload });
  } catch (error) {
    console.error('Error updating job cover by admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Added minimal implementations for missing admin management endpoints ---
const createAdminUser = async (req, res) => {
  try {
    const db = getDB();
    const { email, name, full_name, password, role } = req.body || {};

    const allowedRoles = ['admin', 'hr', 'super_admin'];
    const normalizedRole = (role ? String(role).toLowerCase() : 'admin');
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(String(password), saltRounds);
    const displayName = full_name || name || '';
    const doc = {
      email,
      // Store both for compatibility with various UI mappings
      name: displayName,
      full_name: displayName,
      user_type: normalizedRole,
      status: 'active',
      password: passwordHash,
      created_at: new Date(),
      updated_at: new Date()
    };
    const result = await db.collection('users').insertOne(doc);
    const admin = { _id: result.insertedId, email, full_name: displayName, name: displayName, user_type: normalizedRole, status: 'active' };
    // Return both keys for backward compatibility with any existing clients
    return res.status(201).json({ message: 'Admin user created successfully', admin, user: admin });
  } catch (error) {
    console.error('Create admin user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAdminUser = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { email, name, full_name } = req.body || {};

    const update = {};
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email))) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      update.email = email;
    }
    // Prefer full_name when provided, otherwise name
    if (full_name !== undefined) {
      update.full_name = full_name;
      update.name = full_name;
    } else if (name !== undefined) {
      update.name = name;
      update.full_name = name;
    }
    update.updated_at = new Date();

    const result = await db.collection('users').updateOne({ _id: id }, { $set: update });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    const user = await db.collection('users').findOne({ _id: id });
    const admin = user ? {
      _id: user._id,
      email: user.email,
      full_name: user.full_name || user.name || '',
      name: user.full_name || user.name || '',
      user_type: user.user_type,
      status: user.status
    } : null;
    return res.json({ message: 'Admin user updated successfully', admin, user: admin });
  } catch (error) {
    console.error('Update admin user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const listAdminUsers = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, q } = req.query || {};

    const allowedRoles = ['admin', 'hr', 'super_admin'];
    const filter = { user_type: { $in: allowedRoles } };

    if (q && String(q).trim()) {
      const search = String(q).trim();
      // Use real RegExp objects so adapters (MySQL/memory) can match
      const rx = new RegExp(search, 'i');
      filter.$or = [
        { email: rx },
        { name: rx },
        { full_name: rx }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const cursor = db.collection('users')
      .find(filter, { projection: { password: 0 } })
      .sort({ updated_at: -1, created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const users = await cursor.toArray();
    const total = await db.collection('users').countDocuments(filter);

    return res.json({
      users,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total_users: total,
        total_pages: Math.max(1, Math.ceil(total / Number(limit)))
      }
    });
  } catch (error) {
    console.error('List admin users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    // Ensure only admin/super_admin users are deleted via this endpoint
    const user = await db.collection('users').findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!['admin', 'super_admin', 'hr'].includes(String(user.user_type))) {
      return res.status(400).json({ error: 'Only staff accounts can be deleted via this endpoint' });
    }
    const result = await db.collection('users').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Admin user not found for deletion' });
    }
    return res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Delete admin user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body || {};

    const allowed = ['active', 'inactive', 'suspended'];
    if (!allowed.includes(String(status))) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const result = await db.collection('users').updateOne({ _id: id }, { $set: { status, updated_at: new Date() } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = await db.collection('users').findOne({ _id: id });
    return res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { role } = req.body || {};

    const allowedRoles = ['admin', 'hr', 'super_admin'];
    if (!allowedRoles.includes(String(role))) {
      return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const result = await db.collection('users').updateOne({ _id: id }, { $set: { user_type: role, updated_at: new Date() } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = await db.collection('users').findOne({ _id: id });
    return res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
// --- End added admin management endpoints ---

// Admin: upload and set company logo by company ID
const updateCompanyLogoByAdmin = async (req, res) => {
  try {
    const db = getDB();
    const upload = req.uploadResult;
    const logoUrl = upload?.secure_url || upload?.url;
    if (!logoUrl) {
      return res.status(500).json({ message: 'Upload failed' });
    }

    const { id } = req.params;
    const result = await db.collection('companies').findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      { $set: { logo_url: logoUrl, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    const updatedCompany = result?.value || result || null;
    return res.json({ success: true, message: 'Logo updated successfully', logoUrl, company: updatedCompany });
  } catch (error) {
    console.error('Error updating company logo by admin:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset companies collection (Super Admin)
const resetCompanies = async (req, res) => {
  try {
    const db = getDB();
    const { mode = 'sample' } = req.query;

    // Known sample company names seeded in scripts
    const sampleNames = [
      'TechVision Nepal',
      'Himalayan Fintech',
      'TestCo',
      'Thakur Saloon',
      'Neon Management Service',
      'Test Company Ltd',
      'Test Company'
    ];

    let filter;
    if (String(mode).toLowerCase() === 'all') {
      filter = {}; // Purge all companies
    } else {
      filter = {
        $or: [
          { isSample: true },
          { source: 'sample' },
          { name: { $in: sampleNames } },
          { company_name: { $in: sampleNames } }
        ]
      };
    }

    const result = await db.collection('companies').deleteMany(filter);

    return res.json({
      message: 'Companies reset successfully',
      deletedCount: result?.deletedCount || 0,
      mode: String(mode).toLowerCase()
    });
  } catch (error) {
    console.error('Reset companies error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  moderateJob,
  seedDatabase,
  analyzeJobCandidates,
  bulkAnalyzeJobs,
  exportCandidateCV,
  exportJobCandidates,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  approveCompany,
  sendPasswordChangeOtp,
  changePasswordWithOtp,
  changePassword,
  createAdminUser,
  updateAdminUser,
  listAdminUsers,
  deleteAdminUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  createJobByAdmin,
  updateJobByAdmin,
  deleteJobByAdmin,
  updateJobCoverByAdmin,
  updateCompanyLogoByAdmin,
  resetCompanies,
  resetEmployers
 }