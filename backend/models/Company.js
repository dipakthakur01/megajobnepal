const Joi = require('joi');

// Company schema definition
const companySchema = {
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200
  },
  logo_url: {
    type: String,
    trim: true,
    maxlength: 500
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  company_size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  founded_year: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  contact_email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  contact_phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  employer_id: {
    type: String, // ObjectId as string
    required: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_top_hiring: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
};

// Validation functions using Joi
const validateCompany = (company) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    description: Joi.string().min(10).max(2000).required().trim(),
    industry: Joi.string().max(100).required().trim(),
    website: Joi.string().uri().max(200).optional().allow(''),
    logo_url: Joi.string().uri().max(500).optional().allow(''),
    location: Joi.string().max(100).required().trim(),
    company_size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').required(),
    founded_year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    contact_email: Joi.string().email().max(100).optional().allow(''),
    contact_phone: Joi.string().max(20).optional().allow(''),
    employer_id: Joi.string().required(),
    is_featured: Joi.boolean().optional(),
    is_top_hiring: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'pending').optional()
  });

  return schema.validate(company);
};

const validateCompanyUpdate = (company) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional().trim(),
    description: Joi.string().min(10).max(2000).optional().trim(),
    industry: Joi.string().max(100).optional().trim(),
    website: Joi.string().uri().max(200).optional().allow(''),
    logo_url: Joi.string().uri().max(500).optional().allow(''),
    location: Joi.string().max(100).optional().trim(),
    company_size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').optional(),
    founded_year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
    contact_email: Joi.string().email().max(100).optional().allow(''),
    contact_phone: Joi.string().max(20).optional().allow(''),
    is_featured: Joi.boolean().optional(),
    is_top_hiring: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive', 'pending').optional()
  });

  return schema.validate(company);
};

module.exports = {
  companySchema,
  validateCompany,
  validateCompanyUpdate
};