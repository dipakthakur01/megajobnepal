import { apiClient as api } from './api';

export const employerService = {
  // Get all employers
  getAllEmployers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/employers?${params.toString()}`);
    return response;
  },

  // Get employer by ID
  getEmployerById: async (id) => {
    const response = await api.get(`/employers/${id}`);
    return response;
  },

  // Get current employer profile
  getCurrentEmployer: async () => {
    const response = await api.get('/employers/profile');
    return response;
  },

  // Update employer profile
  updateEmployerProfile: async (profileData) => {
    const response = await api.put('/employers/profile', profileData);
    return response;
  },

  // Upload company logo
  uploadCompanyLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    // Use low-level request to send FormData without forcing JSON headers
    const response = await api.request('/employers/upload-logo', {
      method: 'POST',
      body: formData
    });
    return response;
  },

  // Get employer dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/employers/dashboard/stats');
    return response;
  },

  // Get employer's posted jobs
  getEmployerJobs: async () => {
    const response = await api.get('/employers/jobs');
    return response;
  },

  // Get applications for employer's jobs
  getJobApplications: async (jobId = null) => {
    const url = jobId ? `/employers/applications/${jobId}` : '/employers/applications';
    const response = await api.get(url);
    return response;
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, notes = '') => {
    const response = await api.patch(`/employers/applications/${applicationId}`, {
      status,
      notes
    });
    return response;
  },

  // Get employer analytics
  getAnalytics: async (period = '30d') => {
    const response = await api.get(`/employers/analytics?period=${period}`);
    return response;
  },

  // Search candidates
  searchCandidates: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/employers/candidates/search?${params.toString()}`);
    return response;
  },

  // Get candidate profile
  getCandidateProfile: async (candidateId) => {
    const response = await api.get(`/employers/candidates/${candidateId}`);
    return response;
  },

  // Send message to candidate
  sendMessageToCandidate: async (candidateId, message) => {
    const response = await api.post(`/employers/candidates/${candidateId}/message`, {
      message
    });
    return response;
  },

  // Get company reviews
  getCompanyReviews: async () => {
    const response = await api.get('/employers/reviews');
    return response;
  },

  // Respond to review
  respondToReview: async (reviewId, response) => {
    const responseData = await api.post(`/employers/reviews/${reviewId}/respond`, {
      response
    });
    return responseData;
  },

  // Get subscription info
  getSubscriptionInfo: async () => {
    const response = await api.get('/employers/subscription');
    return response;
  },

  // Upgrade subscription
  upgradeSubscription: async (planId) => {
    const response = await api.post('/employers/subscription/upgrade', {
      planId
    });
    return response;
  },

  // Upload company banner
  uploadCompanyBanner: async (file) => {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.request('/employers/upload-banner', {
      method: 'POST',
      body: formData,
    });
    return response;
  }
};