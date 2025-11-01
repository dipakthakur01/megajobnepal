// Job model with validation schemas
const jobSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 3
  },
  description: {
    type: 'string',
    required: true,
    minLength: 10
  },
  requirements: {
    type: 'string',
    required: true,
    minLength: 10
  },
  salary_range: {
    type: 'string',
    required: false
  },
  location: {
    type: 'string',
    required: true
  },
  category_id: {
    type: 'string',
    required: true
  },
  company_id: {
    type: 'objectId',
    required: true
  },
  employment_type: {
    type: 'string',
    required: false,
    enum: ['full-time', 'part-time', 'contract', 'internship']
  },
  experience_level: {
    type: 'string',
    required: false,
    enum: ['entry', 'mid', 'senior', 'executive']
  },
  status: {
    type: 'string',
    default: 'active',
    enum: ['active', 'inactive', 'closed']
  },
  created_by: {
    type: 'objectId',
    required: true
  },
  created_at: {
    type: 'date',
    default: () => new Date()
  },
  updated_at: {
    type: 'date',
    default: () => new Date()
  }
};

// Validation helper functions
const validateJob = (jobData) => {
  const errors = [];

  if (!jobData.title) {
    errors.push('Job title is required');
  } else if (jobData.title.length < 3) {
    errors.push('Job title must be at least 3 characters long');
  }

  if (!jobData.description) {
    errors.push('Job description is required');
  } else if (jobData.description.length < 10) {
    errors.push('Job description must be at least 10 characters long');
  }

  if (!jobData.requirements) {
    errors.push('Job requirements are required');
  } else if (jobData.requirements.length < 10) {
    errors.push('Job requirements must be at least 10 characters long');
  }

  if (!jobData.location) {
    errors.push('Job location is required');
  }

  if (!jobData.category_id) {
    errors.push('Job category is required');
  }

  if (!jobData.company_id) {
    errors.push('Company ID is required');
  }

  if (jobData.employment_type && !['full-time', 'part-time', 'contract', 'internship'].includes(jobData.employment_type)) {
    errors.push('Employment type must be one of: full-time, part-time, contract, internship');
  }

  if (jobData.experience_level && !['entry', 'mid', 'senior', 'executive'].includes(jobData.experience_level)) {
    errors.push('Experience level must be one of: entry, mid, senior, executive');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateJobUpdate = (jobData) => {
  const errors = [];

  if (jobData.title && jobData.title.length < 3) {
    errors.push('Job title must be at least 3 characters long');
  }

  if (jobData.description && jobData.description.length < 10) {
    errors.push('Job description must be at least 10 characters long');
  }

  if (jobData.requirements && jobData.requirements.length < 10) {
    errors.push('Job requirements must be at least 10 characters long');
  }

  if (jobData.employment_type && !['full-time', 'part-time', 'contract', 'internship'].includes(jobData.employment_type)) {
    errors.push('Employment type must be one of: full-time, part-time, contract, internship');
  }

  if (jobData.experience_level && !['entry', 'mid', 'senior', 'executive'].includes(jobData.experience_level)) {
    errors.push('Experience level must be one of: entry, mid, senior, executive');
  }

  if (jobData.status && !['active', 'inactive', 'closed'].includes(jobData.status)) {
    errors.push('Status must be one of: active, inactive, closed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  jobSchema,
  validateJob,
  validateJobUpdate
};