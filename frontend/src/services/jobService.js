import { apiClient as api } from './api';

export const jobService = {
  // Get all jobs with filters
  getAllJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create new job (employer only)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update job (employer only)
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job (employer only)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Apply for job
  applyForJob: async (jobId, applicationData) => {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },

  // Get job applications (employer only)
  getJobApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  // Update application status (employer only)
  updateApplicationStatus: async (jobId, applicationId, status) => {
    const response = await api.patch(`/jobs/${jobId}/applications/${applicationId}`, { status });
    return response.data;
  },

  // Get user's applications
  getUserApplications: async () => {
    const response = await api.get('/jobs/my-applications');
    return response.data;
  },

  // Get employer's jobs
  getEmployerJobs: async () => {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  },

  // Search jobs
  searchJobs: async (query) => {
    const response = await api.get(`/jobs/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get featured jobs
  getFeaturedJobs: async () => {
    const response = await api.get('/jobs/featured');
    return response.data;
  },

  // Get recent jobs
  getRecentJobs: async (limit = 10) => {
    const response = await api.get(`/jobs/recent?limit=${limit}`);
    return response.data;
  },

  // Get jobs by category
  getJobsByCategory: async (category) => {
    const response = await api.get(`/jobs/category/${category}`);
    return response.data;
  },

  // Get job statistics
  getJobStats: async () => {
    const response = await api.get('/jobs/stats');
    return response.data;
  }
};