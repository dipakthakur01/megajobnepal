// Database type definitions for MegaJobNepal
// These types are used throughout the application for type safety

export interface User {
  id: string
  email: string
  role: 'job_seeker' | 'employer' | 'admin' | 'hr'
  first_name?: string
  last_name?: string
  phone?: string
  profile_image?: string
  is_verified: boolean
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface JobSeeker {
  id: string
  user_id: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  country?: string
  resume_url?: string
  cover_letter?: string
  skills?: string[]
  experience_years?: number
  expected_salary_min?: number
  expected_salary_max?: number
  education_level?: string
  university?: string
  degree?: string
  graduation_year?: number
  linkedin_url?: string
  portfolio_url?: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  description?: string
  industry?: string
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  founded_year?: number
  website_url?: string
  logo_url?: string
  banner_url?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  linkedin_url?: string
  facebook_url?: string
  twitter_url?: string
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  slug: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  company_id: string
  category_id?: string
  location_id?: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
  experience_level?: 'entry_level' | 'mid_level' | 'senior_level' | 'executive'
  min_experience?: number
  max_experience?: number
  salary_min?: number
  salary_max?: number
  salary_negotiable: boolean
  job_tier: 'mega_job' | 'premium_job' | 'prime_job' | 'latest_job' | 'newspaper_job'
  status: 'active' | 'inactive' | 'expired' | 'draft'
  is_featured: boolean
  is_urgent: boolean
  application_deadline?: string
  posted_by?: string
  views_count: number
  applications_count: number
  published_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
  company?: Company
  category?: JobCategory
  location?: JobLocation
}

export interface JobCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface JobLocation {
  id: string
  city: string
  state?: string
  country: string
  is_active: boolean
  created_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  job_seeker_id: string
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected' | 'hired'
  cover_letter?: string
  resume_url?: string
  additional_documents?: string[]
  notes?: string
  viewed_at?: string
  created_at: string
  updated_at: string
  job?: Job
  job_seeker?: JobSeeker
}

export interface Payment {
  id: string
  user_id: string
  plan_id?: string
  job_id?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: string
  transaction_id?: string
  paid_at?: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  category_id?: string
  author_id?: string
  is_published: boolean
  is_featured: boolean
  views_count: number
  tags?: string[]
  meta_title?: string
  meta_description?: string
  published_at?: string
  created_at: string
  updated_at: string
  category?: BlogCategory
  author?: User
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value?: string
  type: string
  description?: string
  group_name?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// Helper function for timeout operations
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
