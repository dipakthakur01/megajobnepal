import { NewAdminPanel } from '@/components/SuperAdminPanel';
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { apiClient } from '@/lib/api-client';

export default function AdminDashboard() {
  const { 
    users, 
    applications, 
    companies, 
    currentUser,
    setUsers,
    setCompanies
  } = useApp();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  // Local admin jobs state driven by backend (mirrors Super Admin behavior)
  const [adminJobs, setAdminJobs] = useState<any[]>([]);
  
  // Normalize user shape for UI consumption
  const normalizeUser = (u: any) => {
    const detectedType = (u?.user_type === 'job_seeker')
      ? 'jobseeker'
      : (u?.user_type === 'employer')
        ? 'employer'
        : (u?.user_type || u?.type || 'user');
    return {
      id: u?._id || u?.id || String(Date.now()),
      name: u?.full_name || u?.name || u?.email || '',
      email: u?.email || '',
      type: detectedType,
      user_type: detectedType,
      company: u?.company_name || u?.company || '',
      profile: u?.profile || {}
    };
  };

  // Normalize job shape for UI and diffing
  const normalizeJob = (j: any) => ({
    id: j.id || j._id,
    ...j,
    approvalStatus: j.approvalStatus || j.approval_status || (
      j.status === 'active' ? 'approved' : j.status === 'rejected' ? 'rejected' : 'pending'
    ),
  });

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

  // Initial load of admin jobs from backend (shows actual jobs listed)
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getAdminJobs();
        const list = Array.isArray((res as any)?.jobs) ? (res as any).jobs : (Array.isArray(res) ? res : []);
        setAdminJobs(list.map(normalizeJob));
      } catch (err) {
        // Fallback: keep empty list if fetch fails
        setAdminJobs([]);
        console.warn('Admin jobs fetch failed:', err);
      }
    })();
  }, []);

  // Initial load of users (job seekers + employers + admins) for management section
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getAllUsers({ page: 1, limit: 500 });
        const items = Array.isArray((res as any)?.users)
          ? (res as any).users
          : (Array.isArray(res) ? (res as any) : []);
        const mapped = items.map(normalizeUser);
        setUsers(mapped);
      } catch (err) {
        console.warn('Admin users fetch failed:', err);
        // Leave existing users state untouched on failure
      }
    })();
  }, []);

  // Persist companies to local storage and update global state
  const handleCompanyUpdate = (nextCompanies: any[]) => {
    // Update global state only; backend persistence can be added per-company
    setCompanies(nextCompanies);
  };

  // Persist jobs to local storage and update global state
  const handleJobUpdate = async (nextJobs: any[]) => {
    const oldJobs = adminJobs;
    setAdminJobs(nextJobs.map(normalizeJob));
    try {
      const oldMap = new Map(oldJobs.map((j: any) => [j.id || j._id, j]));
      const nextMap = new Map(nextJobs.map((j: any) => [j.id || j._id, j]));

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
        // Admin-created jobs default to pending unless explicitly set
        status: job.status || 'pending'
      };
        calls.push(apiClient.createJobByAdmin(payload));
      }

      for (const job of deleted) {
        const jid = job.id || job._id;
        if (jid) calls.push(apiClient.deleteJobByAdmin(jid));
      }

      for (const change of updated) {
        const before = change.before;
        const after = change.after;
        const approvalChanged = before.approvalStatus !== after.approvalStatus;
        const statusChanged = before.status !== after.status;
        const tierChanged = before.tier !== after.tier;
        if (approvalChanged || statusChanged) {
          // Use explicit admin approval/rejection endpoints
          if (after.approvalStatus === 'approved' || after.status === 'active') {
            const tierToSet = after.tier || after.type || 'megajob';
            calls.push(apiClient.approveAdminJob(after.id || after._id, tierToSet));
          } else if (after.approvalStatus === 'rejected' || after.status === 'rejected') {
            calls.push(apiClient.rejectAdminJob(after.id || after._id, 'Rejected by admin'));
          } else {
            const action = (after.status === 'active') ? 'approve' : 'reject';
            calls.push(apiClient.moderateJob(after.id || after._id, action));
          }
          continue;
        }
        if (tierChanged) {
          calls.push(apiClient.updateAdminJobTier(after.id || after._id, after.tier));
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
          deadline: after.deadline,
          cover_image_url: (after as any).cover_image_url || (after as any).coverImageUrl
        };
        calls.push(apiClient.updateJobByAdmin(after.id || after._id, updatePayload));
      }

      await Promise.allSettled(calls);
      // Refresh from server to ensure list reflects actual backend data
      try {
        const refreshed = await apiClient.getAdminJobs();
        const list = Array.isArray((refreshed as any)?.jobs) ? (refreshed as any).jobs : (Array.isArray(refreshed) ? refreshed : []);
        setAdminJobs(list.map(normalizeJob));
      } catch {
        // Keep optimistic state on refresh failures
      }
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
      jobs={adminJobs}
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
