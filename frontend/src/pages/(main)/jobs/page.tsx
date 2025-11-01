'use client';

import { JobListings } from '@/components/JobListings';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate } from 'react-router-dom';

export default function JobsPage() {
  const { savedJobs, handleSaveJob, currentUser } = useApp();
  const navigate = useNavigate();

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleLoginRequired = () => {
    navigate('/auth/login');
  };

  return (
    <JobListings 
      onViewJob={handleViewJob}
      onSaveJob={handleSaveJob}
      savedJobs={savedJobs}
      isUserLoggedIn={!!currentUser}
      onLoginRequired={handleLoginRequired}
    />
  );
}
