import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { useData } from '../context/DataContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, loading, error, filters, setFilters, savedJobs, saveJob } = useData();
  const { user, isAuthenticated } = useAuth();

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <HomePage
      jobs={jobs}
      onNavigate={handleNavigate}
      onViewJob={handleViewJob}
      filters={filters}
      onFilterChange={setFilters}
      onSaveJob={handleSaveJob}
      savedJobs={savedJobs}
      isUserLoggedIn={isAuthenticated}
      onLoginRequired={handleLoginRequired}
    />
  );
};

export default Home;
