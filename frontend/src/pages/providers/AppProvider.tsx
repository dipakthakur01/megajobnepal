'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from '../../components/ui/sonner';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { safeStorage } from '../../lib/safe-storage';
import { apiClient } from '../../lib/api-client';

type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'admin' | 'employer' | 'jobseeker' | 'super_admin';
  company?: string;
  profile?: {
    skills?: string[];
    experience?: string;
    resume?: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'mega_job' | 'premium_job' | 'prime_job' | 'latest_job' | 'newspaper_job';
  category: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  logo: string;
  // Optional cover image displayed on job cards
  coverImageUrl?: string | null;
  featured: boolean;
  tier: 'mega_job' | 'premium_job' | 'prime_job' | 'latest_job' | 'newspaper_job' | 'megajob' | 'premium' | 'prime' | 'latest' | 'newspaper';
  source?: 'online' | 'newspaper';
  publishedDate: string;
  tags: string[];
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: string;
  jobTitle?: string;
  company?: string;
  applicationData?: any;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  applications: Application[];
  setApplications: (applications: Application[]) => void;
  savedJobs: string[];
  setSavedJobs: (savedJobs: string[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  companies: any[];
  setCompanies: (companies: any[]) => void;
  filters: any;
  setFilters: (filters: any) => void;
  handleApplyJob: (jobId: string, applicationData?: any) => void;
  handleSaveJob: (jobId: string) => { requiresLogin?: boolean; removed?: boolean; added?: boolean };
  // Add followed companies support
  followedCompanies: string[];
  setFollowedCompanies: (companyIds: string[]) => void;
  handleFollowCompany: (companyId: string) => { requiresLogin?: boolean; removed?: boolean; added?: boolean };
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Component to sync AuthContext user with AppProvider currentUser
function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setCurrentUser } = useApp();

  useEffect(() => {
    const effectiveId = (user as any)?.id || (user as any)?._id;
    if (user && effectiveId) {
      // Convert AuthContext user to AppProvider user format
      const appUser: User = {
        id: effectiveId,
        name: user.full_name || user.email || 'User',
        email: user.email || '',
        type: user.user_type === 'job_seeker' ? 'jobseeker' : (user.user_type as 'admin' | 'employer' | 'jobseeker' | 'super_admin'),
        company: undefined,
        profile: {
          skills: user.profile?.skills || [],
          experience: user.profile?.experience,
          resume: user.profile?.resume_url
        }
      };
      setCurrentUser(appUser);
    } else {
      setCurrentUser(null);
    }
  }, [user, setCurrentUser]);

  return <>{children}</>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Helper function to check if we're on an authentication route
  const isAuthRoute = () => {
    const path = window.location.pathname;
    return path.includes('/auth/') || 
           path.includes('/login') || 
           path.includes('/register') || 
           path.includes('/signup') || 
           path.includes('/forgot-password') || 
           path.includes('/reset-password') ||
           path === '/admin/login' ||
           path === '/super-admin/login';
  };

  // State declarations
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  // Followed companies state
  const [followedCompanies, setFollowedCompanies] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    category: '',
    salary: '',
    experience: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'MegaJobNepal',
    siteUrl: 'https://megajobnepal.com.np',
    tagline: "Nepal's Premier Job Portal",
    description: 'Connect talented professionals with leading employers across Nepal. Find your dream job or hire the perfect candidate.',
    metaDescription: 'MegaJobNepal - Leading job portal in Nepal. Find jobs, post jobs, connect with employers and job seekers.',
    keywords: 'jobs nepal, employment, careers, hiring, job search, kathmandu jobs',
    email: 'info@megajobnepal.com.np',
    phone: '+977-1-4123456',
    address: 'Kathmandu, Nepal',
    supportEmail: 'support@megajobnepal.com.np',
    businessEmail: 'business@megajobnepal.com.np',
    companyLocation: 'Putalisadak, Kathmandu, Nepal',
    mapUrl: 'https://maps.google.com/maps?q=Putalisadak+Kathmandu&output=embed',
    googleMapsLink: 'https://goo.gl/maps/example',
    coordinates: { latitude: '27.7172', longitude: '85.3240' },
    facebook: 'https://facebook.com/megajobnepal',
    instagram: 'https://instagram.com/megajobnepal',
    twitter: 'https://twitter.com/megajobnepal',
    linkedin: 'https://linkedin.com/company/megajobnepal',
    youtube: 'https://youtube.com/megajobnepal',
    companyName: 'MegaJobNepal Pvt. Ltd.',
    registrationNumber: 'REG12345',
    taxNumber: 'TAX67890',
    establishedYear: '2020',
    jobBadgeLabel: 'mega_job'
  });

  // Load site settings from storage
  useEffect(() => {
    try {
      const raw = safeStorage.getItem('site_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setSiteSettings({
            ...siteSettings,
            ...parsed
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load site settings from storage');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist site settings to storage
  useEffect(() => {
    try {
      safeStorage.setItem('site_settings', JSON.stringify(siteSettings));
    } catch (e) {
      console.warn('Failed to persist site settings');
    }
  }, [siteSettings]);

  useEffect(() => {
    // Load saved jobs for the current user from storage
    const loadSavedJobs = () => {
      if (currentUser?.id) {
        try {
          const raw = safeStorage.getItem(`saved_jobs_${currentUser.id}`);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) setSavedJobs(parsed);
        } catch (e) {
          console.warn('Failed to load saved jobs from storage');
        }
      } else {
        setSavedJobs([]);
      }
    };
    loadSavedJobs();
  }, [currentUser?.id]);

  useEffect(() => {
    // Persist saved jobs for the current user
    if (currentUser?.id) {
      try {
        safeStorage.setItem(`saved_jobs_${currentUser.id}`, JSON.stringify(savedJobs));
      } catch (e) {
        console.warn('Failed to persist saved jobs');
      }
    }
  }, [currentUser?.id, savedJobs]);

  // Load followed companies for current user
  useEffect(() => {
    const loadFollowed = () => {
      if (currentUser?.id) {
        try {
          const raw = safeStorage.getItem(`followed_companies_${currentUser.id}`);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) setFollowedCompanies(parsed);
        } catch (e) {
          console.warn('Failed to load followed companies from storage');
        }
      } else {
        setFollowedCompanies([]);
      }
    };
    loadFollowed();
  }, [currentUser?.id]);

  // Persist followed companies
  useEffect(() => {
    if (currentUser?.id) {
      try {
        safeStorage.setItem(`followed_companies_${currentUser.id}`, JSON.stringify(followedCompanies));
      } catch (e) {
        console.warn('Failed to persist followed companies');
      }
    }
  }, [currentUser?.id, followedCompanies]);

  // Load companies from backend
  useEffect(() => {
    // Skip data fetching on authentication routes
    if (isAuthRoute()) {
      return;
    }

    let isMounted = true;

    const loadCompaniesFromBackend = async () => {
      try {
        const res: any = await apiClient.getCompanies({ limit: 100 });
        const companiesArr = Array.isArray(res?.companies)
          ? res.companies
          : Array.isArray(res)
            ? res
            : [];
        if (isMounted && Array.isArray(companiesArr)) {
          const normalized = companiesArr.map((c: any) => {
            const logoUrl = c?.logo_url || c?.logoUrl || c?.logo || null;
            return {
              ...c,
              id: c?._id || c?.id,
              // Normalize logo fields so all UIs can render consistently
              logo_url: logoUrl,
              logo: c?.logo || logoUrl || '',
              logoUrl: c?.logoUrl || logoUrl || '',
            };
          });
          setCompanies(normalized);
        }
      } catch (err) {
        console.warn('Failed to fetch companies from backend:', err);
      }
    };

    const fallbackEmployers = async () => {
      try {
        const res: any = await (apiClient as any).getEmployers?.({ limit: 100 });
        const employersArr = Array.isArray(res?.companies)
          ? res.companies
          : Array.isArray(res)
            ? res
            : [];
        if (isMounted && Array.isArray(employersArr) && employersArr.length && (!companies || companies.length === 0)) {
          const normalized = employersArr.map((c: any) => {
            const logoUrl = c?.logo_url || c?.logoUrl || c?.logo || null;
            return {
              ...c,
              id: c?._id || c?.id,
              logo_url: logoUrl,
              logo: c?.logo || logoUrl || '',
              logoUrl: c?.logoUrl || logoUrl || '',
            };
          });
          setCompanies(normalized);
        }
      } catch (_) {
        // no-op
      }
    };

    loadCompaniesFromBackend().then(fallbackEmployers);

    return () => { isMounted = false; };
  }, []);

  // NEW: Load jobs from backend (no mock fallback)
  useEffect(() => {
    // Skip data fetching on authentication routes
    if (isAuthRoute()) {
      return;
    }

    let isMounted = true;

    const loadJobsFromBackend = async () => {
      try {
        const res: any = await apiClient.getJobs({ limit: 100, status: 'active' });
        const items = Array.isArray(res?.jobs) ? res.jobs : Array.isArray(res) ? res : [];
        const mapped: Job[] = items.map((dbJob: any) => ({
          id: dbJob.id || dbJob._id || String(Math.random()),
          title: dbJob.title || 'Untitled Job',
          company: dbJob.company?.name || dbJob.company || dbJob.company_id || 'Unknown Company',
          location: dbJob.location || 'Not specified',
          type: dbJob.type || dbJob.tier || 'latest_job',
          category: dbJob.category?.name || dbJob.category_id || 'General',
          salary: dbJob.salary_min && dbJob.salary_max
            ? `${dbJob.salary_currency || 'NPR'} ${Number(dbJob.salary_min).toLocaleString()} - ${Number(dbJob.salary_max).toLocaleString()}`
            : (dbJob.salary || 'Negotiable'),
          experience: dbJob.experience_level || dbJob.experience || 'Entry Level',
          description: dbJob.description || '',
          requirements: Array.isArray(dbJob.requirements)
            ? dbJob.requirements
            : (typeof dbJob.requirements === 'string' ? [dbJob.requirements] : []),
          benefits: Array.isArray(dbJob.benefits) ? dbJob.benefits : [],
          postedDate: dbJob.created_at ? new Date(dbJob.created_at).toISOString() : new Date().toISOString(),
          deadline: dbJob.deadline ? new Date(dbJob.deadline).toISOString() : '',
          logo: dbJob.company?.logo_url || dbJob.logo || '',
          coverImageUrl:
            dbJob.cover_image_url ||
            dbJob.coverImageUrl ||
            dbJob.coverImage ||
            dbJob.company?.banner_url ||
            null,
          featured: !!dbJob.featured,
          tier: dbJob.tier || (dbJob.type || 'latest'),
          source: dbJob.source || 'online',
          publishedDate: dbJob.published_at ? new Date(dbJob.published_at).toISOString() : (dbJob.created_at ? new Date(dbJob.created_at).toISOString() : new Date().toISOString()),
          tags: Array.isArray(dbJob.tags) ? dbJob.tags : []
        }));
        if (isMounted) setJobs(mapped);
      } catch (err) {
        console.warn('Failed to fetch jobs from backend:', err);
        if (isMounted) setJobs([]);
      }
    };

    loadJobsFromBackend();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    // Skip data fetching on authentication routes
    if (isAuthRoute()) {
      return;
    }

    // Fetch applications for the current user from backend
    const fetchApplications = async () => {
      if (!currentUser?.id) {
        setApplications([]);
        return;
      }
      try {
        const res = await apiClient.getApplications();
        const items = Array.isArray(res?.applications) ? res.applications : [];
        const mapped: Application[] = items.map((a: any) => ({
          id: a._id || a.id || String(Date.now()),
          jobId: a.job_id || a.jobId,
          userId: a.job_seeker_id || a.userId,
          status: (a.status as Application['status']) || 'pending',
          appliedAt: a.applied_at ? new Date(a.applied_at).toISOString() : new Date().toISOString(),
          jobTitle: a.job?.title,
          company: a.job?.company,
        }));
        setApplications(mapped);
      } catch (error) {
        console.warn('Failed to load applications', error);
      }
    };
    fetchApplications();
  }, [currentUser?.id]);

  const handleApplyJob = async (jobId: string, applicationData?: any) => {
    try {
      console.log('📝 Applying for job:', jobId);
      
      if (!currentUser) {
        console.warn('No user logged in for job application');
        throw new Error('Please log in to apply for jobs');
      }
      
      if (!jobId) {
        console.error('No job ID provided for application');
        throw new Error('Invalid job ID');
      }
      
      // Check if job exists
      const jobExists = jobs.some(j => j.id === jobId);
      if (!jobExists) {
        console.error('Job not found:', jobId);
        throw new Error('Job not found or has been removed');
      }
      
      // Check if already applied
      const alreadyApplied = applications.some(
        app => app.jobId === jobId && app.userId === currentUser.id
      );
      
      if (alreadyApplied) {
        console.warn('Already applied to this job');
        throw new Error('You have already applied for this job');
      }
      
      // Call backend API to submit application
      const apiApplicationData = {
        jobId,
        coverLetter: applicationData?.coverLetter || '',
        resumeUrl: applicationData?.resumeUrl || currentUser.profile?.resume || ''
      };
      
      const result = await apiClient.applyForJob(apiApplicationData);
      console.log('✅ Backend API response:', result);
      
      // Find job details for application context
      const job = jobs.find(j => j.id === jobId);
      
      // Update local state with the new application
      const newApplication: Application = {
        id: result.application?.id || String(result.application?._id || Date.now()),
        jobId,
        userId: currentUser.id,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        jobTitle: job?.title,
        company: job?.company,
        ...(applicationData && { applicationData })
      };
      
      setApplications([...applications, newApplication]);
      console.log('✅ Job application submitted successfully:', newApplication);
      
      return result;
    } catch (error) {
      console.error('❌ Error applying for job:', error);
      throw error; // Re-throw to let UI handle it
    }
  };

  const handleSaveJob = (jobId: string) => {
    if (!currentUser) {
      // This will be handled in the JobCard component now
      return { requiresLogin: true };
    }
    
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      return { removed: true };
    } else {
      setSavedJobs([...savedJobs, jobId]);
      return { added: true };
    }
  };

  const handleFollowCompany = (companyId: string) => {
    if (!currentUser) {
      return { requiresLogin: true };
    }
    if (followedCompanies.includes(companyId)) {
      setFollowedCompanies(followedCompanies.filter(id => id !== companyId));
      return { removed: true };
    } else {
      setFollowedCompanies([...followedCompanies, companyId]);
      return { added: true };
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        jobs,
        setJobs,
        applications,
        setApplications,
        savedJobs,
        setSavedJobs,
        // expose followed companies
        followedCompanies,
        setFollowedCompanies,
        users,
        setUsers,
        companies,
        setCompanies,
        filters,
        setFilters,
        handleApplyJob,
        handleSaveJob,
        handleFollowCompany,
        siteSettings,
        setSiteSettings,
      }}
    >
      {/* Remove nested AuthProvider to avoid conflicting auth contexts */}
      <UserSyncWrapper>
        {children}
      </UserSyncWrapper>
      <Toaster position="top-right" />
      <SonnerToaster />
    </AppContext.Provider>
  );
}


export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string;
  description: string;
  metaDescription: string;
  keywords: string;
  email: string;
  phone: string;
  address: string;
  supportEmail: string;
  businessEmail: string;
  companyLocation: string;
  mapUrl: string;
  googleMapsLink: string;
  coordinates: { latitude: string; longitude: string };
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  companyName: string;
  registrationNumber: string;
  taxNumber: string;
  establishedYear: string;
  // New: override label shown on job cards
  jobBadgeLabel?: string;
}


