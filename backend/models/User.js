// User model with validation schemas
const userSchema = {
  email: {
    type: 'string',
    required: true,
    format: 'email'
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6
  },
  full_name: {
    type: 'string',
    required: true,
    minLength: 2
  },
  user_type: {
    type: 'string',
    required: true,
    enum: ['job_seeker', 'employer']
  },
  phone: {
    type: 'string',
    required: false
  },
  address: {
    type: 'string',
    required: false
  },
  skills: {
    type: 'array',
    required: false
  },
  experience: {
    type: 'string',
    required: false
  },
  is_verified: {
    type: 'boolean',
    default: false
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
const validateUser = (userData) => {
  const errors = [];

  if (!userData.email) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push('Email format is invalid');
  }

  if (!userData.password) {
    errors.push('Password is required');
  } else if (userData.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!userData.full_name) {
    errors.push('Full name is required');
  } else if (userData.full_name.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!userData.user_type) {
    errors.push('User type is required');
  } else if (!['job_seeker', 'employer'].includes(userData.user_type)) {
    errors.push('User type must be either job_seeker or employer');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUserUpdate = (userData) => {
  const errors = [];

  if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push('Email format is invalid');
  }

  if (userData.full_name && userData.full_name.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (userData.user_type && !['job_seeker', 'employer'].includes(userData.user_type)) {
    errors.push('User type must be either job_seeker or employer');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  userSchema,
  validateUser,
  validateUserUpdate
};