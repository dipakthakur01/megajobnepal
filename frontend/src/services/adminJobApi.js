// Admin Job Management API Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * Admin Job Management API
 */
export const adminJobApi = {
  /**
   * Get all jobs for admin management with filtering
   */
  async getAllJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/jobs/all${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  /**
   * Get pending jobs waiting for approval
   */
  async getPendingJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/jobs/pending${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  /**
   * Get job approval statistics
   */
  async getJobStats() {
    return apiRequest('/admin/jobs/stats');
  },

  /**
   * Approve a job with optional tier assignment
   */
  async approveJob(jobId, data = {}) {
    return apiRequest(`/admin/jobs/${jobId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject a job with reason
   */
  async rejectJob(jobId, reason) {
    return apiRequest(`/admin/jobs/${jobId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Update job tier (for approved jobs)
   */
  async updateJobTier(jobId, tier) {
    return apiRequest(`/admin/jobs/${jobId}/tier`, {
      method: 'PUT',
      body: JSON.stringify({ tier }),
    });
  },

  /**
   * Bulk approve multiple jobs
   */
  async bulkApproveJobs(jobIds, tier = 'basic') {
    return apiRequest('/admin/jobs/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ jobIds, tier }),
    });
  },
};

/**
 * Job Tiers enum for frontend use
 */
export const JOB_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  FEATURED: 'featured',
};

/**
 * Job Approval Status enum for frontend use
 */
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/**
 * Helper function to get tier display name
 */
export function getTierDisplayName(tier) {
  const tierNames = {
    [JOB_TIERS.BASIC]: 'Basic',
    [JOB_TIERS.PREMIUM]: 'Premium',
    [JOB_TIERS.FEATURED]: 'Featured',
  };
  return tierNames[tier] || tier;
}

/**
 * Helper function to get approval status display name
 */
export function getApprovalStatusDisplayName(status) {
  const statusNames = {
    [APPROVAL_STATUS.PENDING]: 'Pending Approval',
    [APPROVAL_STATUS.APPROVED]: 'Approved',
    [APPROVAL_STATUS.REJECTED]: 'Rejected',
  };
  return statusNames[status] || status;
}

/**
 * Helper function to get tier badge color class
 */
export function getTierBadgeClass(tier) {
  const tierClasses = {
    [JOB_TIERS.BASIC]: 'badge-secondary',
    [JOB_TIERS.PREMIUM]: 'badge-primary',
    [JOB_TIERS.FEATURED]: 'badge-accent',
  };
  return tierClasses[tier] || 'badge-ghost';
}

/**
 * Helper function to get approval status badge color class
 */
export function getApprovalStatusBadgeClass(status) {
  const statusClasses = {
    [APPROVAL_STATUS.PENDING]: 'badge-warning',
    [APPROVAL_STATUS.APPROVED]: 'badge-success',
    [APPROVAL_STATUS.REJECTED]: 'badge-error',
  };
  return statusClasses[status] || 'badge-ghost';
}

export default adminJobApi;