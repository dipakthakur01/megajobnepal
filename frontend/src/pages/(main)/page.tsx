import { useApp } from '@/pages/providers/AppProvider';
import { HomePage } from '@/components/HomePage';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { jobs, filters, setFilters, savedJobs, handleSaveJob, currentUser } = useApp();
  const navigate = useNavigate();



  const handleNavigation = (page: string, param?: string) => {
    switch (page) {
      case 'job-detail':
        navigate(`/jobs/${param}`);
        break;
      case 'company-detail':
        navigate(`/companies/${param}`);
        break;
      default:
        navigate(`/${page}`);
        break;
    }
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleLoginRequired = () => {
    navigate('/auth/login');
  };

  const handleViewCompany = (companyName: string) => {
    navigate(`/companies/${encodeURIComponent(companyName)}`);
  };

  return (
    <HomePage 
      jobs={jobs}
      onNavigate={handleNavigation}
      onViewJob={handleViewJob}
      onViewCompany={handleViewCompany}
      filters={filters}
      onFilterChange={setFilters}
      onSaveJob={handleSaveJob}
      savedJobs={savedJobs}
      isUserLoggedIn={!!currentUser}
      onLoginRequired={handleLoginRequired}
    />
  );
}
