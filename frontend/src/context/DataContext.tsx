import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Job } from '../pages/providers/AppProvider';
import { apiClient } from '../lib/api-client';

interface DataContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: {
    location: string;
    type: string;
    category: string;
    salary: string;
    experience: string;
  };
  setFilters: (filters: any) => void;
  refreshJobs: () => Promise<void>;
  savedJobs: string[];
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    category: '',
    salary: '',
    experience: ''
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res: any = await apiClient.getJobs({ limit: 100, status: 'active' });
      const dbJobs = Array.isArray(res?.jobs) ? res.jobs : Array.isArray(res) ? res : [];

      const transformedJobs: Job[] = dbJobs.map((dbJob: any) => ({
        id: dbJob.id || dbJob._id || Math.random().toString(36).substr(2, 9),
        title: dbJob.title || 'Untitled Job',
        company: dbJob.company?.name || dbJob.company || dbJob.company_id || 'Unknown Company',
        location: dbJob.location || 'Not specified',
        description: dbJob.description || 'No description available',
        requirements: Array.isArray(dbJob.requirements)
          ? dbJob.requirements
          : (typeof dbJob.requirements === 'string' ? [dbJob.requirements] : []),
        postedDate: dbJob.created_at ? new Date(dbJob.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        publishedDate: dbJob.created_at ? new Date(dbJob.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: dbJob.deadline
          ? new Date(dbJob.deadline).toISOString().split('T')[0]
          : dbJob.updated_at
            ? new Date(new Date(dbJob.updated_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        salary: dbJob.salary_min && dbJob.salary_max
          ? `${dbJob.salary_currency || 'NPR'} ${Number(dbJob.salary_min).toLocaleString()} - ${Number(dbJob.salary_max).toLocaleString()}`
          : (dbJob.salary || 'Negotiable'),
        type: dbJob.type || (dbJob.employment_type === 'full_time' ? 'premium_job' : 'latest_job'),
        tier: dbJob.tier || (dbJob.employment_type === 'full_time' ? 'premium' : 'latest'),
        category: dbJob.category?.name || dbJob.category_id || 'General',
        experience: dbJob.experience_level === 'senior' ? 'Senior Level' : dbJob.experience_level === 'mid' ? 'Mid Level' : (dbJob.experience_level || 'Entry Level'),
        tags: Array.isArray(dbJob.tags) && dbJob.tags.length > 0
          ? dbJob.tags
          : [dbJob.employment_type === 'full_time' ? 'Full-time' : dbJob.employment_type === 'part_time' ? 'Part-time' : 'Contract'],
        featured: !!dbJob.featured,
        urgent: !!dbJob.urgent,
        logo: dbJob.company?.logo_url || dbJob.logo || '',
        coverImageUrl: dbJob.cover_image_url || dbJob.coverImageUrl || dbJob.coverImage || null
      }));

      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error loading jobs from backend:', err);
      setJobs([]);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async () => {
    await loadJobs();
  };

  const saveJob = (jobId: string) => {
    setSavedJobs(prev => {
      if (!prev.includes(jobId)) {
        const updated = [...prev, jobId];
        localStorage.setItem('savedJobs', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const unsaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const updated = prev.filter(id => id !== jobId);
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved jobs:', e);
      }
    }

    // Load initial jobs
    loadJobs();
  }, []);

  const value: DataContextType = {
    jobs,
    loading,
    error,
    filters,
    setFilters,
    refreshJobs,
    savedJobs,
    saveJob,
    unsaveJob
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};