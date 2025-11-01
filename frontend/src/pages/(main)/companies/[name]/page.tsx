'use client';

import { CompanyDetailPage } from '@/components/CompanyDetailPage';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate, useParams } from 'react-router-dom';

export default function CompanyDetail() {
  const { name } = useParams<{ name: string }>();
  const { jobs, savedJobs, handleSaveJob } = useApp();
  const navigate = useNavigate();

  if (!name) {
    navigate('/companies');
    return null;
  }

  const companyName = decodeURIComponent(name);

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleNavigation = (page: string) => {
    switch (page) {
      case 'employers':
        navigate('/employers');
        break;
      default:
        navigate(`/${page}`);
        break;
    }
  };

  return (
    <CompanyDetailPage 
      companyName={companyName}
      jobs={jobs}
      onViewJob={handleViewJob}
      onSaveJob={handleSaveJob}
      savedJobs={savedJobs}
      onNavigate={handleNavigation}
    />
  );
}