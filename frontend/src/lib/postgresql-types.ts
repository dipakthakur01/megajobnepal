// MongoDB type definitions (browser-compatible)

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
