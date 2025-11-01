'use client';

import { JobDetail } from '@/components/JobDetailFixed';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate, useParams } from 'react-router-dom';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { 
    jobs, 
    companies,
    applications, 
    savedJobs, 
    currentUser, 
    handleApplyJob, 
    handleSaveJob 
  } = useApp();
  const navigate = useNavigate();

  if (!id) {
    navigate('/jobs');
    return null;
  }

  const job = jobs.find(j => j.id === id);
  const relatedJobs = jobs.filter(j => j.id !== id).slice(0, 3);
  const isSaved = savedJobs.includes(id);
  const hasApplied = applications.some(app => 
    app.jobId === id && app.userId === currentUser?.id
  );

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <JobDetail 
      job={job}
      companies={companies}
      relatedJobs={relatedJobs}
      onApply={handleApplyJob}
      onSave={handleSaveJob}
      isSaved={isSaved}
      hasApplied={hasApplied}
      onViewJob={handleViewJob}
      currentUser={currentUser}
    />
  );
}