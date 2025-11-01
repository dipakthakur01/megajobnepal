import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JobListings } from './JobListings';
import { DataContext, useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { HeroCarousel } from '../components/HeroCarousel';
import { Button } from '../components/ui/button';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { jobs, loading, error, filters, setFilters, savedJobs, saveJob } = useData();
  const { isAuthenticated } = useAuth();

  // Get filter from URL params if any
  const filterType = searchParams.get('filter');
  const filterValue = searchParams.get('value');
  const urlFilter = filterType && filterValue ? { type: filterType, value: filterValue } : undefined;

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveJob = (jobId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    saveJob(jobId);
  };

  const handleLoginRequired = () => {
    navigate('/login');
  };

  const handleViewCompany = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Opportunities</h1>
          <p className="text-gray-600">
            Discover {jobs.length} amazing job opportunities in Nepal
          </p>
        </div>
        
        <JobListings
          onViewJob={handleViewJob}
          onSaveJob={handleSaveJob}
          savedJobs={savedJobs}
          filter={urlFilter}
          isUserLoggedIn={isAuthenticated}
          onLoginRequired={handleLoginRequired}
          onViewCompany={handleViewCompany}
        />
      </div>
    </div>
  );
};

export default Jobs;
