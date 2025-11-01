'use client';

import { useEffect } from 'react';
import { JobSeekerDashboard } from '@/components/JobSeekerDashboard';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate } from 'react-router-dom';


export default function JobSeekerDashboardPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    jobs,
    applications,
    setApplications,
    savedJobs,
    handleSaveJob,
    handleApplyJob,
  } = useApp();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    navigate('/auth/login');
  };

  const handleApplicationUpdate = (updatedApplications: any[]) => {
    setApplications(updatedApplications);
  };

  if (!currentUser) return null;

  return (
    <JobSeekerDashboard
      user={currentUser}
      jobs={jobs}
      applications={applications}
      onApplicationUpdate={handleApplicationUpdate}
      onLogout={handleLogout}
      savedJobs={savedJobs}
      onToggleSaveJob={handleSaveJob}
      onApplyJob={handleApplyJob}
    />
  );
}
