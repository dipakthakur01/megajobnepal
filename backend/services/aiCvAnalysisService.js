const { getDB } = require('../config/db');

class AICVAnalysisService {
  constructor() {
    this.skillKeywords = {
      'Information Technology': [
        'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue.js',
        'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'git', 'docker',
        'kubernetes', 'aws', 'azure', 'gcp', 'microservices', 'api', 'rest',
        'graphql', 'typescript', 'php', 'laravel', 'spring', 'django', 'flask'
      ],
      'Engineering': [
        'autocad', 'solidworks', 'matlab', 'project management', 'quality control',
        'lean manufacturing', 'six sigma', 'cad', 'design', 'analysis', 'testing',
        'troubleshooting', 'maintenance', 'safety', 'compliance'
      ],
      'Finance': [
        'accounting', 'financial analysis', 'budgeting', 'forecasting', 'excel',
        'quickbooks', 'sap', 'financial modeling', 'risk management', 'audit',
        'taxation', 'compliance', 'investment', 'banking', 'insurance'
      ],
      'Marketing': [
        'digital marketing', 'seo', 'sem', 'social media', 'content marketing',
        'email marketing', 'analytics', 'google analytics', 'facebook ads',
        'google ads', 'brand management', 'market research', 'copywriting'
      ],
      'Healthcare': [
        'patient care', 'medical records', 'hipaa', 'clinical', 'diagnosis',
        'treatment', 'pharmacy', 'nursing', 'surgery', 'emergency care',
        'medical equipment', 'healthcare management'
      ]
    };

    this.experienceLevels = {
      'entry': { min: 0, max: 2 },
      'mid': { min: 2, max: 5 },
      'senior': { min: 5, max: 10 },
      'lead': { min: 8, max: 15 },
      'executive': { min: 10, max: 30 }
    };
  }

  // Extract skills from text using keyword matching
  extractSkills(text, category) {
    if (!text) return [];
    
    const textLower = text.toLowerCase();
    const categorySkills = this.skillKeywords[category] || [];
    
    return categorySkills.filter(skill => 
      textLower.includes(skill.toLowerCase())
    );
  }

  // Calculate experience years from text
  calculateExperienceYears(experienceText) {
    if (!experienceText) return 0;
    
    const yearMatches = experienceText.match(/(\d+)\s*(?:years?|yrs?)/gi);
    if (yearMatches) {
      const years = yearMatches.map(match => parseInt(match.match(/\d+/)[0]));
      return Math.max(...years);
    }
    
    return 0;
  }

  // Score candidate based on job requirements
  scoreCandidate(candidate, job) {
    let score = 0;
    const factors = [];

    // Skills matching (40% weight)
    const candidateSkills = [
      ...this.extractSkills(candidate.skills?.join(' ') || '', job.category),
      ...this.extractSkills(candidate.experience || '', job.category),
      ...this.extractSkills(candidate.cover_letter || '', job.category)
    ];

    const jobRequiredSkills = this.extractSkills(
      job.requirements?.join(' ') + ' ' + job.description, 
      job.category
    );

    const skillsMatch = candidateSkills.filter(skill => 
      jobRequiredSkills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );

    const skillScore = jobRequiredSkills.length > 0 
      ? (skillsMatch.length / jobRequiredSkills.length) * 40 
      : 20;
    
    score += skillScore;
    factors.push({
      factor: 'Skills Match',
      score: skillScore,
      details: `${skillsMatch.length}/${jobRequiredSkills.length} skills matched`
    });

    // Experience level matching (30% weight)
    const candidateYears = this.calculateExperienceYears(candidate.experience);
    const requiredLevel = this.experienceLevels[job.experience_level] || { min: 0, max: 5 };
    
    let experienceScore = 0;
    if (candidateYears >= requiredLevel.min && candidateYears <= requiredLevel.max) {
      experienceScore = 30;
    } else if (candidateYears > requiredLevel.max) {
      experienceScore = 25; // Overqualified
    } else {
      experienceScore = Math.max(0, (candidateYears / requiredLevel.min) * 20);
    }
    
    score += experienceScore;
    factors.push({
      factor: 'Experience Level',
      score: experienceScore,
      details: `${candidateYears} years (required: ${requiredLevel.min}-${requiredLevel.max})`
    });

    // Salary expectations (15% weight)
    let salaryScore = 15;
    if (candidate.expected_salary && job.salary_max) {
      if (candidate.expected_salary <= job.salary_max) {
        salaryScore = 15;
      } else if (candidate.expected_salary <= job.salary_max * 1.2) {
        salaryScore = 10;
      } else {
        salaryScore = 5;
      }
    }
    
    score += salaryScore;
    factors.push({
      factor: 'Salary Expectations',
      score: salaryScore,
      details: candidate.expected_salary 
        ? `Expected: ${candidate.expected_salary}, Max: ${job.salary_max || 'Not specified'}`
        : 'Not specified'
    });

    // Availability (10% weight)
    let availabilityScore = 10;
    const urgentAvailability = ['immediate', '2_weeks'];
    if (urgentAvailability.includes(candidate.availability)) {
      availabilityScore = 10;
    } else if (candidate.availability === '1_month') {
      availabilityScore = 8;
    } else {
      availabilityScore = 5;
    }
    
    score += availabilityScore;
    factors.push({
      factor: 'Availability',
      score: availabilityScore,
      details: candidate.availability || 'Not specified'
    });

    // Cover letter quality (5% weight)
    let coverLetterScore = 0;
    if (candidate.cover_letter) {
      const length = candidate.cover_letter.length;
      if (length > 200 && length < 1000) {
        coverLetterScore = 5;
      } else if (length >= 100) {
        coverLetterScore = 3;
      } else {
        coverLetterScore = 1;
      }
    }
    
    score += coverLetterScore;
    factors.push({
      factor: 'Cover Letter',
      score: coverLetterScore,
      details: candidate.cover_letter ? `${candidate.cover_letter.length} characters` : 'Not provided'
    });

    return {
      totalScore: Math.round(score),
      factors,
      recommendation: this.getRecommendation(score)
    };
  }

  getRecommendation(score) {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 65) return 'Recommended';
    if (score >= 50) return 'Consider';
    if (score >= 35) return 'Weak Match';
    return 'Not Recommended';
  }

  // Main function to analyze and rank candidates for a job
  async analyzeAndRankCandidates(jobId) {
    try {
      const db = getDB();
      
      // Get job details
      const job = await db.collection('jobs').findOne({ _id: jobId });
      if (!job) {
        throw new Error('Job not found');
      }

      // Get all applications for this job
      const applications = await db.collection('applications').find({ 
        job_id: jobId 
      }).toArray();

      if (applications.length === 0) {
        return {
          jobId,
          jobTitle: job.title,
          totalApplications: 0,
          rankedCandidates: []
        };
      }

      // Get candidate details for each application
      const candidateIds = applications.map(app => app.job_seeker_id);
      const candidates = await db.collection('users').find({
        _id: { $in: candidateIds }
      }).toArray();

      // Create candidate map for easy lookup
      const candidateMap = {};
      candidates.forEach(candidate => {
        candidateMap[candidate._id.toString()] = candidate;
      });

      // Analyze and score each application
      const scoredApplications = applications.map(application => {
        const candidate = candidateMap[application.job_seeker_id];
        if (!candidate) return null;

        const combinedCandidate = {
          ...candidate,
          ...application,
          id: application._id
        };

        const analysis = this.scoreCandidate(combinedCandidate, job);
        
        return {
          applicationId: application._id,
          candidateId: candidate._id,
          candidateName: candidate.full_name,
          candidateEmail: candidate.email,
          appliedAt: application.applied_at,
          currentStatus: application.status,
          resumeUrl: application.resume_url,
          coverLetter: application.cover_letter,
          expectedSalary: application.expected_salary,
          availability: application.availability,
          ...analysis
        };
      }).filter(Boolean);

      // Sort by score (highest first)
      const rankedCandidates = scoredApplications.sort((a, b) => b.totalScore - a.totalScore);

      return {
        jobId,
        jobTitle: job.title,
        jobCategory: job.category,
        totalApplications: applications.length,
        rankedCandidates,
        analysisDate: new Date()
      };

    } catch (error) {
      console.error('Error in AI CV analysis:', error);
      throw error;
    }
  }

  // Bulk analysis for multiple jobs
  async bulkAnalyzeJobs(jobIds) {
    const results = [];
    
    for (const jobId of jobIds) {
      try {
        const analysis = await this.analyzeAndRankCandidates(jobId);
        results.push(analysis);
      } catch (error) {
        results.push({
          jobId,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get shortlisted candidates based on threshold
  async getShortlistedCandidates(jobId, threshold = 65) {
    const analysis = await this.analyzeAndRankCandidates(jobId);
    
    return {
      ...analysis,
      shortlistedCandidates: analysis.rankedCandidates.filter(
        candidate => candidate.totalScore >= threshold
      ),
      threshold
    };
  }
}

module.exports = new AICVAnalysisService();