const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Job approval statuses
const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Job tiers for publishing
const JOB_TIERS = {
  MEGAJOB: 'megajob',
  PREMIUM: 'premium',
  PRIME: 'prime',
  NEWSPAPER: 'newspaper'
};

/**
 * Get all jobs with their approval status for admin management
 */
async function getAllJobsForAdmin(req, res) {
  try {
    const db = getDB();
    const { page = 1, limit = 20, status, approval_status, tier } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (status) filter.status = status;
    if (approval_status) filter.approval_status = approval_status;
    if (tier) filter.tier = tier;

    const jobs = await db.collection('jobs')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await db.collection('jobs').countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
}

/**
 * Get pending jobs waiting for approval
 */
async function getPendingJobs(req, res) {
  try {
    const db = getDB();
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { approval_status: APPROVAL_STATUS.PENDING };

    const jobs = await db.collection('jobs')
      .find(filter)
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await db.collection('jobs').countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending jobs',
      error: error.message
    });
  }
}

/**
 * Approve a job and set its tier
 */
async function approveJob(req, res) {
  try {
    const { jobId } = req.params;
    const { tier, notes } = req.body;

    if (!tier) {
      return res.status(400).json({ success: false, message: 'Tier is required' });
    }
    if (!Object.values(JOB_TIERS).includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job tier. Must be one of: megajob, premium, prime, newspaper'
      });
    }

    const db = getDB();
    const job = await db.collection('jobs').findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updatedJobData = {
      ...job,
      approval_status: APPROVAL_STATUS.APPROVED,
      tier,
      approved_at: new Date().toISOString(),
      approved_by: req.user.userId,
      approval_notes: notes || null,
      updated_at: new Date()
    };

    await db.collection('jobs').updateOne({ _id: jobId }, { $set: updatedJobData });

    res.json({
      success: true,
      message: 'Job approved successfully',
      data: { id: jobId, approval_status: APPROVAL_STATUS.APPROVED, tier, approved_at: updatedJobData.approved_at }
    });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ success: false, message: 'Failed to approve job', error: error.message });
  }
}

/**
 * Reject a job
 */
async function rejectJob(req, res) {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const db = getDB();
    const job = await db.collection('jobs').findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updatedJobData = {
      ...job,
      approval_status: APPROVAL_STATUS.REJECTED,
      rejected_at: new Date().toISOString(),
      rejected_by: req.user.userId,
      rejection_reason: reason,
      updated_at: new Date()
    };

    await db.collection('jobs').updateOne({ _id: jobId }, { $set: updatedJobData });

    res.json({
      success: true,
      message: 'Job rejected successfully',
      data: { id: jobId, approval_status: APPROVAL_STATUS.REJECTED, rejected_at: updatedJobData.rejected_at, rejection_reason: reason }
    });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ success: false, message: 'Failed to reject job', error: error.message });
  }
}

/**
 * Update job tier (for already approved jobs)
 */
async function updateJobTier(req, res) {
  try {
    const { jobId } = req.params;
    const { tier } = req.body;

    if (!Object.values(JOB_TIERS).includes(tier)) {
      return res.status(400).json({ success: false, message: 'Invalid job tier. Must be one of: megajob, premium, prime, newspaper' });
    }

    const db = getDB();
    const job = await db.collection('jobs').findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.approval_status !== APPROVAL_STATUS.APPROVED) {
      return res.status(400).json({ success: false, message: 'Can only update tier for approved jobs' });
    }

    const updatedJobData = { ...job, tier, tier_updated_at: new Date().toISOString(), tier_updated_by: req.user.userId, updated_at: new Date() };
    await db.collection('jobs').updateOne({ _id: jobId }, { $set: updatedJobData });

    res.json({ success: true, message: 'Job tier updated successfully', data: { id: jobId, tier, tier_updated_at: updatedJobData.tier_updated_at } });
  } catch (error) {
    console.error('Error updating job tier:', error);
    res.status(500).json({ success: false, message: 'Failed to update job tier', error: error.message });
  }
}

/**
 * Bulk approve jobs
 */
async function bulkApproveJobs(req, res) {
  try {
    const { jobIds, tier = JOB_TIERS.MEGAJOB } = req.body;
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Job IDs array is required' });
    }
    if (!Object.values(JOB_TIERS).includes(tier)) {
      return res.status(400).json({ success: false, message: 'Invalid job tier. Must be one of: megajob, premium, prime, newspaper' });
    }

    const db = getDB();
    const results = [];
    for (const jobId of jobIds) {
      try {
        const job = await db.collection('jobs').findOne({ _id: jobId });
        if (job) {
          const updatedJobData = { ...job, approval_status: APPROVAL_STATUS.APPROVED, tier, approved_at: new Date().toISOString(), approved_by: req.user.userId, updated_at: new Date() };
          await db.collection('jobs').updateOne({ _id: jobId }, { $set: updatedJobData });
          results.push({ id: jobId, status: 'approved' });
        } else {
          results.push({ id: jobId, status: 'not_found' });
        }
      } catch (error) {
        results.push({ id: jobId, status: 'error', error: error.message });
      }
    }
    res.json({ success: true, message: 'Bulk approval completed', results });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk approve jobs', error: error.message });
  }
}

/**
 * Get job approval statistics
 */
async function getJobStats(req, res) {
  try {
    const db = getDB();
    const total = await db.collection('jobs').countDocuments({});
    const pending = await db.collection('jobs').countDocuments({ approval_status: APPROVAL_STATUS.PENDING });
    const approved = await db.collection('jobs').countDocuments({ approval_status: APPROVAL_STATUS.APPROVED });
    const rejected = await db.collection('jobs').countDocuments({ approval_status: APPROVAL_STATUS.REJECTED });
    const by_tier = {
      megajob: await db.collection('jobs').countDocuments({ tier: JOB_TIERS.MEGAJOB }),
      premium: await db.collection('jobs').countDocuments({ tier: JOB_TIERS.PREMIUM }),
      prime: await db.collection('jobs').countDocuments({ tier: JOB_TIERS.PRIME }),
      newspaper: await db.collection('jobs').countDocuments({ tier: JOB_TIERS.NEWSPAPER })
    };
    res.json({ success: true, data: { total, pending, approved, rejected, by_tier } });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch job statistics', error: error.message });
  }
}

module.exports = {
  getAllJobsForAdmin,
  getPendingJobs,
  approveJob,
  rejectJob,
  updateJobTier,
  bulkApproveJobs,
  getJobStats
};