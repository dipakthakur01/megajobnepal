// Resume model with validation schemas

const resumeSchema = {
  userId: {
    type: 'string',
    required: true
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100
  },
  personalInfo: {
    type: 'object',
    required: true,
    properties: {
      fullName: { type: 'string', required: true, minLength: 2 },
      email: { type: 'string', required: true, format: 'email' },
      phone: { type: 'string', required: false },
      address: { type: 'string', required: false },
      city: { type: 'string', required: false },
      state: { type: 'string', required: false },
      zipCode: { type: 'string', required: false },
      country: { type: 'string', required: false },
      linkedin: { type: 'string', required: false },
      website: { type: 'string', required: false },
      github: { type: 'string', required: false }
    }
  },
  summary: {
    type: 'string',
    required: false,
    maxLength: 1000
  },
  education: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        institution: { type: 'string', required: true },
        degree: { type: 'string', required: true },
        fieldOfStudy: { type: 'string', required: false },
        startDate: { type: 'string', required: true },
        endDate: { type: 'string', required: false },
        isCurrentlyStudying: { type: 'boolean', default: false },
        gpa: { type: 'string', required: false },
        description: { type: 'string', required: false }
      }
    }
  },
  experience: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        company: { type: 'string', required: true },
        position: { type: 'string', required: true },
        location: { type: 'string', required: false },
        startDate: { type: 'string', required: true },
        endDate: { type: 'string', required: false },
        isCurrentlyWorking: { type: 'boolean', default: false },
        description: { type: 'string', required: false },
        achievements: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  skills: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
        category: { type: 'string', required: false }
      }
    }
  },
  projects: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        technologies: { type: 'array', items: { type: 'string' } },
        startDate: { type: 'string', required: false },
        endDate: { type: 'string', required: false },
        url: { type: 'string', required: false },
        githubUrl: { type: 'string', required: false }
      }
    }
  },
  certifications: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        issuer: { type: 'string', required: true },
        issueDate: { type: 'string', required: false },
        expiryDate: { type: 'string', required: false },
        credentialId: { type: 'string', required: false },
        url: { type: 'string', required: false }
      }
    }
  },
  languages: {
    type: 'array',
    required: false,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
        proficiency: { type: 'string', enum: ['Basic', 'Conversational', 'Fluent', 'Native'] }
      }
    }
  },
  template: {
    type: 'string',
    required: true,
    enum: ['modern', 'classic', 'creative'],
    default: 'modern'
  },
  isPublic: {
    type: 'boolean',
    default: false
  },
  shareToken: {
    type: 'string',
    required: false
  },
  createdAt: {
    type: 'date',
    default: () => new Date()
  },
  updatedAt: {
    type: 'date',
    default: () => new Date()
  }
};

// Validation helper functions
const validateResume = (resumeData) => {
  const errors = [];

  if (!resumeData.userId) {
    errors.push('User ID is required');
  }

  if (!resumeData.title) {
    errors.push('Resume title is required');
  } else if (resumeData.title.length < 1 || resumeData.title.length > 100) {
    errors.push('Resume title must be between 1 and 100 characters');
  }

  if (!resumeData.personalInfo) {
    errors.push('Personal information is required');
  } else {
    const { personalInfo } = resumeData;
    
    if (!personalInfo.fullName) {
      errors.push('Full name is required');
    } else if (personalInfo.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (!personalInfo.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      errors.push('Email format is invalid');
    }
  }

  if (resumeData.template && !['modern', 'classic', 'creative'].includes(resumeData.template)) {
    errors.push('Template must be one of: modern, classic, creative');
  }

  if (resumeData.summary && resumeData.summary.length > 1000) {
    errors.push('Summary must not exceed 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateResumeUpdate = (resumeData) => {
  const errors = [];

  if (resumeData.title && (resumeData.title.length < 1 || resumeData.title.length > 100)) {
    errors.push('Resume title must be between 1 and 100 characters');
  }

  if (resumeData.personalInfo) {
    const { personalInfo } = resumeData;
    
    if (personalInfo.fullName && personalInfo.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (personalInfo.email && !/\S+@\S+\.\S+/.test(personalInfo.email)) {
      errors.push('Email format is invalid');
    }
  }

  if (resumeData.template && !['modern', 'classic', 'creative'].includes(resumeData.template)) {
    errors.push('Template must be one of: modern, classic, creative');
  }

  if (resumeData.summary && resumeData.summary.length > 1000) {
    errors.push('Summary must not exceed 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to generate unique share token
const generateShareToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to create default resume structure
const createDefaultResume = (userId, userProfile = {}) => {
  return {
    userId: userId,
    title: 'My Resume',
    personalInfo: {
      fullName: userProfile.full_name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      address: userProfile.address || '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      linkedin: '',
      website: '',
      github: ''
    },
    summary: '',
    education: [],
    experience: [],
    skills: userProfile.skills ? userProfile.skills.map((skill, index) => ({
      id: `skill_${index}`,
      name: skill,
      level: 'Intermediate',
      category: ''
    })) : [],
    projects: [],
    certifications: [],
    languages: [],
    template: 'modern',
    isPublic: false,
    shareToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

module.exports = {
  resumeSchema,
  validateResume,
  validateResumeUpdate,
  generateShareToken,
  createDefaultResume
};