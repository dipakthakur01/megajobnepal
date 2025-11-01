import { NewAdminPanel } from '@/components/SuperAdminPanel';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiClient } from '@/lib/api-client';

export default function AdminDashboard() {
  const { 
    jobs, 
    users, 
    applications, 
    companies, 
    currentUser,
    setJobs,
    setUsers,
    setCompanies
  } = useApp();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Gate by AuthContext: must be authenticated admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.user_type !== 'admin')) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    try {
      await logout();
    } catch {}
    navigate('/admin/login');
  };

  // Persist companies to local storage and update global state
  const handleCompanyUpdate = (nextCompanies: any[]) => {
    // Update global state only; backend persistence can be added per-company
    setCompanies(nextCompanies);
  };

  // Persist jobs to local storage and update global state
  const handleJobUpdate = async (nextJobs: any[]) => {
    const oldJobs = jobs;
    setJobs(nextJobs);
    try {
      const oldMap = new Map(oldJobs.map((j: any) => [j.id, j]));
      const nextMap = new Map(nextJobs.map((j: any) => [j.id, j]));

      const created = Array.from(nextMap.keys())
        .filter((id) => !oldMap.has(id))
        .map((id) => nextMap.get(id));
      const deleted = Array.from(oldMap.keys())
        .filter((id) => !nextMap.has(id))
        .map((id) => oldMap.get(id));
      const updated = Array.from(nextMap.keys())
        .filter((id) => oldMap.has(id) && JSON.stringify(oldMap.get(id)) !== JSON.stringify(nextMap.get(id)))
        .map((id) => ({ before: oldMap.get(id), after: nextMap.get(id) }));

      const calls: Promise<any>[] = [];

      for (const job of created) {
        const companyObj = companies.find((c: any) => c.name === job.company);
      const payload: any = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        category_id: job.category_id || undefined,
        company_id: companyObj?._id || companyObj?.id,
        company: job.company,
        employment_type: job.employment_type,
        experience_level: job.experience_level || job.experience,
        tier: job.tier || job.type,
        featured: job.featured,
        license_required: !!(job.license_required ?? job.licenseRequired),
        deadline: job.deadline,
        status: job.status || (job.approvalStatus === 'approved' ? 'active' : job.approvalStatus === 'rejected' ? 'rejected' : 'inactive')
      };
        calls.push(apiClient.createJobByAdmin(payload));
      }

      for (const job of deleted) {
        if (job.id) calls.push(apiClient.deleteJobByAdmin(job.id));
      }

      for (const change of updated) {
        const before = change.before;
        const after = change.after;
        const approvalChanged = before.approvalStatus !== after.approvalStatus;
        const statusChanged = before.status !== after.status;
        if (approvalChanged || statusChanged) {
          const action = (after.approvalStatus === 'approved' || after.status === 'active') ? 'approve' : 'reject';
          calls.push(apiClient.moderateJob(after.id, action));
          continue;
        }
        const companyObj = companies.find((c: any) => c.name === after.company);
        const updatePayload: any = {
          title: after.title,
          description: after.description,
          requirements: after.requirements,
          location: after.location,
          company_id: companyObj?._id || companyObj?.id,
          company: after.company,
          employment_type: after.employment_type,
          experience_level: after.experience_level || after.experience,
          tier: after.tier || after.type,
          featured: after.featured,
          license_required: !!(after.license_required ?? after.licenseRequired),
          deadline: after.deadline
        };
        calls.push(apiClient.updateJobByAdmin(after.id, updatePayload));
      }

      Promise.allSettled(calls).catch(() => {
        // Dev: keep UI responsive; persistence errors can be retried
      });
    } catch { /* noop */ }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.user_type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please login to access the admin panel.</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <NewAdminPanel
      jobs={jobs}
      users={users}
      applications={applications}
      companies={companies}
      onJobUpdate={handleJobUpdate}
      onUserUpdate={setUsers}
      onCompanyUpdate={handleCompanyUpdate}
      currentUser={currentUser}
      onBackToWebsite={handleBackToWebsite}
      onLogout={handleLogout}
    />
  );
}
