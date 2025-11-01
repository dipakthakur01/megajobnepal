// Browser-compatible database service for development
// Removed TypeScript imports - using plain JavaScript objects

class BrowserDBService {
  getStorageKey(collection) {
    return `mysql_megajob_db_${collection}`;
  }

  getData(collection) {
    try {
      const data = localStorage.getItem(this.getStorageKey(collection));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setData(collection, data) {
    try {
      localStorage.setItem(this.getStorageKey(collection), JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${collection}:`, error);
    }
  }

  // New: get/set helpers for object collections with defaults
  getObject(collection, defaultValue) {
    try {
      const data = localStorage.getItem(this.getStorageKey(collection));
      if (!data) return defaultValue;
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setObject(collection, obj) {
    try {
      localStorage.setItem(this.getStorageKey(collection), JSON.stringify(obj));
      return true;
    } catch (error) {
      console.error(`Failed to save ${collection}:`, error);
      return false;
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Connection check
  async checkConnection() {
    try {
      // Test localStorage access
      const testKey = 'mysql_megajob_db_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // User operations
  async createUser(userData) {
    const users = this.getData('users');
    const newUser = {
      ...userData,
      _id: this.generateId(),
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    users.push(newUser);
    this.setData('users', users);
    return newUser;
  }

  async getUserByEmail(email) {
    const users = this.getData('users');
    return users.find(user => user.email === email) || null;
  }

  async getUserById(id) {
    const users = this.getData('users');
    return users.find(user => user.id === id || user._id === id) || null;
  }

  async updateUser(id, updates) {
    const users = this.getData('users');
    const userIndex = users.findIndex(user => user.id === id || user._id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date()
    };
    this.setData('users', users);
    return users[userIndex];
  }

  async getUsers(filter = {}) {
    const users = this.getData('users');
    if (Object.keys(filter).length === 0) return users;
    
    return users.filter(user => {
      return Object.entries(filter).every(([key, value]) => user[key] === value);
    });
  }

  // Company operations
  async createCompany(companyData) {
    const companies = this.getData('companies');
    const newCompany = {
      ...companyData,
      _id: this.generateId(),
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    companies.push(newCompany);
    this.setData('companies', companies);
    return newCompany;
  }

  async getCompanies(filter = {}) {
    const companies = this.getData('companies');
    if (Object.keys(filter).length === 0) return companies;
    
    return companies.filter(company => {
      return Object.entries(filter).every(([key, value]) => company[key] === value);
    });
  }

  async getCompanyById(id) {
    const companies = this.getData('companies');
    return companies.find(company => company.id === id || company._id === id) || null;
  }

  async updateCompany(id, updates) {
    const companies = this.getData('companies');
    const companyIndex = companies.findIndex(company => company.id === id || company._id === id);
    if (companyIndex === -1) return null;
    
    companies[companyIndex] = {
      ...companies[companyIndex],
      ...updates,
      updated_at: new Date()
    };
    this.setData('companies', companies);
    return companies[companyIndex];
  }

  // New: save entire companies array (used to persist admin updates)
  async saveCompanies(companies) {
    if (!Array.isArray(companies)) return false;
    this.setData('companies', companies);
    return true;
  }

  // New: save entire jobs array (used to persist admin updates)
  async saveJobs(jobs) {
    if (!Array.isArray(jobs)) return false;
    this.setData('jobs', jobs);
    return true;
  }

  // Content: About page info
  getAboutInfo() {
    const defaultInfo = {
      mission: 'To connect talented professionals with leading employers across Nepal, fostering career growth and business success.',
      vision: "To be Nepal's premier job portal, empowering careers and transforming the employment landscape.",
      story: 'Founded in 2020, MegaJobNepal emerged from a vision to revolutionize the job market in Nepal. Our founders recognized the gap between talented job seekers and quality employers, and set out to bridge this divide through innovative technology and dedicated service.',
      values: [
        { title: 'Innovation', description: 'We continuously evolve our platform to meet changing market needs.' },
        { title: 'Integrity', description: 'We maintain transparency and honesty in all our interactions.' },
        { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' },
        { title: 'Community', description: 'We are committed to building a strong professional community in Nepal.' }
      ],
      statistics: {
        totalJobs: '10,000+',
        happyClients: '5,000+',
        successfulPlacements: '15,000+',
        companiesServed: '2,500+'
      }
    };
    return this.getObject('about_info', defaultInfo);
  }

  saveAboutInfo(info) {
    return this.setObject('about_info', info);
  }

  getTeamMembers() {
    // Return stored members; do NOT seed defaults to avoid auto-restore
    const data = this.getData('team_members');
    return Array.isArray(data) ? data : [];
  }

  saveTeamMembers(members) {
    if (!Array.isArray(members)) return false;
    this.setData('team_members', members);
    return true;
  }

  // Content: Blogs & News
  getBlogs() {
    const data = this.getData('blogs');
    return Array.isArray(data) ? data : [];
  }

  saveBlogs(blogs) {
    if (!Array.isArray(blogs)) return false;
    this.setData('blogs', blogs);
    return true;
  }

  getNews() {
    const data = this.getData('news');
    return Array.isArray(data) ? data : [];
  }

  saveNews(news) {
    if (!Array.isArray(news)) return false;
    this.setData('news', news);
    return true;
  }

  // Job operations
  async createJob(jobData) {
    const jobs = this.getData('jobs');
    const newJob = {
      ...jobData,
      _id: this.generateId(),
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    jobs.push(newJob);
    this.setData('jobs', jobs);
    return newJob;
  }

  async getJobs(filter = {}, limit, skip) {
    let jobs = this.getData('jobs');
    if (Object.keys(filter).length > 0) {
      jobs = jobs.filter(job => {
        return Object.entries(filter).every(([key, value]) => job[key] === value);
      });
    }
    
    if (skip) {
      jobs = jobs.slice(skip);
    }
    if (limit) {
      jobs = jobs.slice(0, limit);
    }
    return jobs;
  }

  async getJobById(id) {
    const jobs = this.getData('jobs');
    return jobs.find(job => job.id === id || job._id === id) || null;
  }

  async updateJob(id, updates) {
    const jobs = this.getData('jobs');
    const jobIndex = jobs.findIndex(job => job.id === id || job._id === id);
    if (jobIndex === -1) return null;
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
      updated_at: new Date()
    };
    this.setData('jobs', jobs);
    return jobs[jobIndex];
  }

  async deleteJob(id) {
    const jobs = this.getData('jobs');
    const jobIndex = jobs.findIndex(job => job.id === id || job._id === id);
    if (jobIndex === -1) return false;
    
    jobs.splice(jobIndex, 1);
    this.setData('jobs', jobs);
    return true;
  }

  // Job Category operations
  async createJobCategory(categoryData) {
    const categories = this.getData('job_categories');
    const newCategory = {
      ...categoryData,
      _id: this.generateId(),
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    categories.push(newCategory);
    this.setData('job_categories', categories);
    return newCategory;
  }

  async getJobCategories(filter = {}) {
    const categories = this.getData('job_categories');
    if (Object.keys(filter).length === 0) return categories;
    
    return categories.filter(category => {
      return Object.entries(filter).every(([key, value]) => category[key] === value);
    });
  }

  async getJobCategoryById(id) {
    const categories = this.getData('job_categories');
    return categories.find(category => category.id === id || category._id === id) || null;
  }

  // Application operations
  async createApplication(applicationData) {
    const applications = this.getData('applications');
    const newApplication = {
      ...applicationData,
      _id: this.generateId(),
      id: this.generateId(),
      applied_at: new Date(),
      updated_at: new Date()
    };
    applications.push(newApplication);
    this.setData('applications', applications);
    return newApplication;
  }

  async getApplications(filter = {}) {
    const applications = this.getData('applications');
    if (Object.keys(filter).length === 0) return applications;
    
    return applications.filter(application => {
      return Object.entries(filter).every(([key, value]) => application[key] === value);
    });
  }

  async updateApplication(id, updates) {
    const applications = this.getData('applications');
    const applicationIndex = applications.findIndex(application => application.id === id || application._id === id);
    if (applicationIndex === -1) return null;
    
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      ...updates,
      updated_at: new Date()
    };
    this.setData('applications', applications);
    return applications[applicationIndex];
  }

  // Setup methods for development
  async setupDatabase() {
    // Initialize collections if not present
    const collections = ['users', 'companies', 'jobs', 'job_categories', 'applications'];
    collections.forEach(col => {
      const data = this.getData(col);
      if (!Array.isArray(data)) {
        this.setData(col, []);
      }
    });
    return true;
  }

  async initializeWithDefaultData() {
    // Optionally seed with mock data in development
    // Keep empty to respect real admin-created data
    return true;
  }
}

export const browserDBService = new BrowserDBService();

export async function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
  ]);
}
