const Joi = require('joi');

// Application schema definition
const applicationSchema = {
  job_id: {
    type: String, // ObjectId as string
    required: true
  },
  job_seeker_id: {
    type: String, // ObjectId as string
    required: true
  },
  cover_letter: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  resume_url: {
    type: String,
    trim: true,
    maxlength: 500
  },
  portfolio_url: {
    type: String,
    trim: true,
    maxlength: 500
  },
  expected_salary: {
    type: Number,
    min: 0
  },
  availability: {
    type: String,
    enum: ['immediate', '2_weeks', '1_month', '2_months', 'negotiable'],
    default: 'negotiable'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  interview_date: {
    type: Date
  },
  applied_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  reviewed_by: {
    type: String // ObjectId as string
  },
  reviewed_at: {
    type: Date
  }
};

// Validation functions using Joi
const validateApplication = (application) => {
  const schema = Joi.object({
    job_id: Joi.string().required(),
    job_seeker_id: Joi.string().required(),
    cover_letter: Joi.string().max(2000).optional().allow(''),
    resume_url: Joi.string().uri().max(500).optional().allow(''),
    portfolio_url: Joi.string().uri().max(500).optional().allow(''),
    expected_salary: Joi.number().min(0).optional(),
    availability: Joi.string().valid('immediate', '2_weeks', '1_month', '2_months', 'negotiable').optional(),
    status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired').optional(),
    notes: Joi.string().max(1000).optional().allow(''),
    interview_date: Joi.date().optional()
  });

  return schema.validate(application);
};

const validateApplicationUpdate = (application) => {
  const schema = Joi.object({
    cover_letter: Joi.string().max(2000).optional().allow(''),
    resume_url: Joi.string().uri().max(500).optional().allow(''),
    portfolio_url: Joi.string().uri().max(500).optional().allow(''),
    expected_salary: Joi.number().min(0).optional(),
    availability: Joi.string().valid('immediate', '2_weeks', '1_month', '2_months', 'negotiable').optional(),
    status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired').optional(),
    notes: Joi.string().max(1000).optional().allow(''),
    interview_date: Joi.date().optional(),
    reviewed_by: Joi.string().optional(),
    reviewed_at: Joi.date().optional()
  });

  return schema.validate(application);
};

const validateApplicationStatusUpdate = (statusUpdate) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired').required(),
    notes: Joi.string().max(1000).optional().allow(''),
    interview_date: Joi.date().optional()
  });

  return schema.validate(statusUpdate);
};

module.exports = {
  applicationSchema,
  validateApplication,
  validateApplicationUpdate,
  validateApplicationStatusUpdate
};