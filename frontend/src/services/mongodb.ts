import { env } from './env';

// MongoDB connection simulation
let dbConnected = false;
let dbInstance: BrowserMongoDB | null = null;

// Browser-compatible MongoDB database simulation
class BrowserMongoDB {
  private collections: Map<string, any[]> = new Map();

  constructor() {
    this.loadCollections();
  }

  private getStorageKey(collection: string): string {
    return `mysql_${env.MYSQL_DB_NAME}_${collection}`;
  }

  private loadCollections(): void {
    try {
      // Load existing collections from localStorage
      const collections = ['users', 'companies', 'jobs', 'job_categories', 'applications'];
      collections.forEach(collectionName => {
        const data = localStorage.getItem(this.getStorageKey(collectionName));
        this.collections.set(collectionName, data ? JSON.parse(data) : []);
      });
    } catch (error) {
      console.error('Failed to load collections from localStorage:', error);
    }
  }

  private saveCollection(name: string): void {
    try {
      const data = this.collections.get(name) || [];
      localStorage.setItem(this.getStorageKey(name), JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save collection ${name}:`, error);
    }
  }

  collection<T>(name: string): BrowserCollection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
    return new BrowserCollection<T>(name, this);
  }

  admin() {
    return {
      ping: async () => {
        // Simulate ping test
        return { ok: 1 };
      }
    };
  }

  getCollectionData(name: string): any[] {
    return this.collections.get(name) || [];
  }

  setCollectionData(name: string, data: any[]): void {
    this.collections.set(name, data);
    this.saveCollection(name);
  }
}

// Browser-compatible collection simulation
class BrowserCollection<T> {
  constructor(private name: string, private db: BrowserMongoDB) {}

  async insertOne(doc: T): Promise<{ insertedId: string }> {
    const data = this.db.getCollectionData(this.name);
    const id = this.generateId();
    const newDoc = { ...doc, _id: id };
    data.push(newDoc);
    this.db.setCollectionData(this.name, data);
    return { insertedId: id };
  }

  async findOne(filter: any): Promise<T | null> {
    const data = this.db.getCollectionData(this.name);
    return this.findInArray(data, filter) || null;
  }

  find(filter: any = {}): BrowserCursor<T> {
    const data = this.db.getCollectionData(this.name);
    const filtered = filter && Object.keys(filter).length > 0 
      ? data.filter(item => this.matchesFilter(item, filter))
      : data;
    return new BrowserCursor<T>(filtered);
  }

  async findOneAndUpdate(
    filter: any, 
    update: any, 
    options: { returnDocument?: 'before' | 'after' } = {}
  ): Promise<T | null> {
    const data = this.db.getCollectionData(this.name);
    const index = data.findIndex(item => this.matchesFilter(item, filter));
    
    if (index === -1) return null;
    
    const oldDoc = data[index];
    const updatedDoc = this.applyUpdate(oldDoc, update);
    data[index] = updatedDoc;
    this.db.setCollectionData(this.name, data);
    
    return options.returnDocument === 'before' ? oldDoc : updatedDoc;
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const data = this.db.getCollectionData(this.name);
    const index = data.findIndex(item => this.matchesFilter(item, filter));
    
    if (index === -1) return { deletedCount: 0 };
    
    data.splice(index, 1);
    this.db.setCollectionData(this.name, data);
    return { deletedCount: 1 };
  }

  async createIndex(indexSpec: any, options?: any): Promise<void> {
    // Simulate index creation (no-op in localStorage)
    console.log(`Created index on ${this.name}:`, indexSpec);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private findInArray(data: any[], filter: any): any {
    return data.find(item => this.matchesFilter(item, filter));
  }

  private matchesFilter(item: any, filter: any): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        // Handle $or operator
        const orConditions = value as any[];
        const matches = orConditions.some(condition => this.matchesFilter(item, condition));
        if (!matches) return false;
      } else if (item[key] !== value) {
        return false;
      }
    }
    
    return true;
  }

  private applyUpdate(doc: any, update: any): any {
    const result = { ...doc };
    
    if (update.$set) {
      Object.assign(result, update.$set);
    }
    
    return result;
  }
}

// Browser-compatible cursor simulation
class BrowserCursor<T> {
  private data: T[];
  private skipCount = 0;
  private limitCount?: number;

  constructor(data: T[]) {
    this.data = [...data];
  }

  skip(count: number): BrowserCursor<T> {
    this.skipCount = count;
    return this;
  }

  limit(count: number): BrowserCursor<T> {
    this.limitCount = count;
    return this;
  }

  async toArray(): Promise<T[]> {
    try {
      let result = [...this.data];
      
      // Apply skip
      if (this.skipCount > 0) {
        result = result.slice(this.skipCount);
      }
      
      // Apply limit
      if (this.limitCount && this.limitCount > 0) {
        result = result.slice(0, this.limitCount);
      }
      
      return result;
    } catch (error) {
      console.error('Error in cursor toArray:', error);
      return [];
    }
  }
}

export async function connectToMongoDB(): Promise<BrowserMongoDB> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    console.log('Connecting to browser database (localStorage mode)...');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    dbInstance = new BrowserMongoDB();
    dbConnected = true;
    
    console.log('Connected to browser database successfully');
    return dbInstance;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDB(): Promise<BrowserMongoDB> {
  if (!dbInstance) {
    return await connectToMongoDB();
  }
  return dbInstance;
}

export async function closeConnection(): Promise<void> {
  if (dbInstance) {
    dbInstance = null;
    dbConnected = false;
    console.log('Browser database connection closed');
  }
}

// Collection interfaces
export interface User {
  _id?: string;
  id?: string;
  email: string;
  password_hash: string;
  user_type: 'job_seeker' | 'employer' | 'admin';
  full_name: string;
  phone_number?: string;
  is_verified: boolean;
  otp_code?: string;
  otp_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
  profile?: {
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    location?: string;
    resume_url?: string;
    profile_image_url?: string;
  };
}

export interface Company {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  location?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  is_featured: boolean;
  is_top_hiring: boolean;
  is_trusted: boolean;
  employer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Job {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  employment_type: string;
  experience_level: string;
  location: string;
  is_remote: boolean;
  company_id: string;
  category_id: string;
  status: 'active' | 'inactive' | 'expired';
  posted_by: string;
  expires_at?: Date;
  cover_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JobCategory {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  tier: number;
  parent_id?: string;
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Application {
  _id?: string;
  id?: string;
  job_id: string;
  job_seeker_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: Date;
  updated_at: Date;
}

// Database service class
export class DatabaseService {
  private db: BrowserMongoDB | null = null;

  async init(): Promise<void> {
    this.db = await getDB();
  }

  private async getCollection<T>(name: string): Promise<BrowserCollection<T>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!.collection<T>(name);
  }

  // User operations
  async createUser(user: Omit<User, '_id' | 'created_at' | 'updated_at'>): Promise<User> {
    const collection = await this.getCollection<User>('users');
    const now = new Date();
    const newUser = {
      ...user,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };
    
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection<User>('users');
    return await collection.findOne({ email });
  }

  async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection<User>('users');
    return await collection.findOne({ $or: [{ id }, { _id: id }] });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const collection = await this.getCollection<User>('users');
    const result = await collection.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Company operations
  async createCompany(company: Omit<Company, '_id' | 'created_at' | 'updated_at'>): Promise<Company> {
    const collection = await this.getCollection<Company>('companies');
    const now = new Date();
    const newCompany = {
      ...company,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };
    
    const result = await collection.insertOne(newCompany);
    return { ...newCompany, _id: result.insertedId.toString() };
  }

  async getCompanies(filter: any = {}): Promise<Company[]> {
    const collection = await this.getCollection<Company>('companies');
    return await collection.find(filter).toArray();
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const collection = await this.getCollection<Company>('companies');
    return await collection.findOne({ $or: [{ id }, { _id: id }] });
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const collection = await this.getCollection<Company>('companies');
    const result = await collection.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Job operations
  async createJob(job: Omit<Job, '_id' | 'created_at' | 'updated_at'>): Promise<Job> {
    const collection = await this.getCollection<Job>('jobs');
    const now = new Date();
    const newJob = {
      ...job,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };
    
    const result = await collection.insertOne(newJob);
    return { ...newJob, _id: result.insertedId.toString() };
  }

  async getJobs(filter: any = {}, limit?: number, skip?: number): Promise<Job[]> {
    const collection = await this.getCollection<Job>('jobs');
    let query = collection.find(filter);
    
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    
    return await query.toArray();
  }

  async getJobById(id: string): Promise<Job | null> {
    const collection = await this.getCollection<Job>('jobs');
    return await collection.findOne({ $or: [{ id }, { _id: id }] });
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const collection = await this.getCollection<Job>('jobs');
    const result = await collection.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deleteJob(id: string): Promise<boolean> {
    const collection = await this.getCollection<Job>('jobs');
    const result = await collection.deleteOne({ $or: [{ id }, { _id: id }] });
    return result.deletedCount > 0;
  }

  // Job Category operations
  async createJobCategory(category: Omit<JobCategory, '_id' | 'created_at' | 'updated_at'>): Promise<JobCategory> {
    const collection = await this.getCollection<JobCategory>('job_categories');
    const now = new Date();
    const newCategory = {
      ...category,
      id: this.generateId(),
      created_at: now,
      updated_at: now,
    };
    
    const result = await collection.insertOne(newCategory);
    return { ...newCategory, _id: result.insertedId.toString() };
  }

  async getJobCategories(filter: any = {}): Promise<JobCategory[]> {
    try {
      const collection = await this.getCollection<JobCategory>('job_categories');
      console.log('Collection obtained:', collection);
      
      const cursor = collection.find(filter);
      console.log('Cursor obtained:', cursor);
      console.log('Cursor has toArray method:', typeof cursor.toArray === 'function');
      
      const result = await cursor.toArray();
      console.log('toArray result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in getJobCategories:', error);
      throw error;
    }
  }

  async getJobCategoryById(id: string): Promise<JobCategory | null> {
    const collection = await this.getCollection<JobCategory>('job_categories');
    return await collection.findOne({ $or: [{ id }, { _id: id }] });
  }

  // Application operations
  async createApplication(application: Omit<Application, '_id' | 'applied_at' | 'updated_at'>): Promise<Application> {
    const collection = await this.getCollection<Application>('applications');
    const now = new Date();
    const newApplication = {
      ...application,
      id: this.generateId(),
      applied_at: now,
      updated_at: now,
    };
    
    const result = await collection.insertOne(newApplication);
    return { ...newApplication, _id: result.insertedId.toString() };
  }

  async getApplications(filter: any = {}): Promise<Application[]> {
    const collection = await this.getCollection<Application>('applications');
    return await collection.find(filter).toArray();
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
    const collection = await this.getCollection<Application>('applications');
    const result = await collection.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.db) {
        await this.init();
      }
      await this.db!.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection check failed:', error);
      return false;
    }
  }

  async setupDatabase(): Promise<void> {
    try {
      await this.init();
      
      // Create indexes for better performance
      const usersCollection = await this.getCollection<User>('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ user_type: 1 });

      const jobsCollection = await this.getCollection<Job>('jobs');
      await jobsCollection.createIndex({ company_id: 1 });
      await jobsCollection.createIndex({ category_id: 1 });
      await jobsCollection.createIndex({ status: 1 });
      await jobsCollection.createIndex({ location: 1 });

      const companiesCollection = await this.getCollection<Company>('companies');
      await companiesCollection.createIndex({ name: 1 });
      await companiesCollection.createIndex({ is_featured: 1 });
      await companiesCollection.createIndex({ is_top_hiring: 1 });

      const applicationsCollection = await this.getCollection<Application>('applications');
      await applicationsCollection.createIndex({ job_id: 1 });
      await applicationsCollection.createIndex({ job_seeker_id: 1 });
      await applicationsCollection.createIndex({ status: 1 });

      console.log('MongoDB database setup completed');
    } catch (error) {
      console.error('Failed to setup MongoDB database:', error);
      throw error;
    }
  }
}

// Global database service instance
export const dbService = new DatabaseService();

// Timeout wrapper for MongoDB operations
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}
