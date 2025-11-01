import React, { useEffect, useMemo, useState } from 'react';
import { NewAdminPanel } from '@/components/SuperAdminPanel';
import { useApp } from '@/pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dbService } from '@/lib/db-service';
import { apiClient } from '@/lib/api-client';

export function SuperAdminPanel() {
  const {
    jobs,
    users,
    applications,
    companies,
    currentUser,
    setUsers,
    setCompanies,
  } = useApp();

  // Local admin jobs state driven by server, independent from global site jobs
  const [adminJobs, setAdminJobs] = useState<any[]>([]);

  // Normalize jobs: ensure there's an `id` for diffing and UI
  const normalizeJob = (j: any) => ({
    id: j.id || j._id,
    ...j,
    // Bridge backend `approval_status` to frontend `approvalStatus`
    approvalStatus: j.approvalStatus || j.approval_status || (
      j.status === 'active' ? 'approved' : j.status === 'rejected' ? 'rejected' : 'pending'
    ),
  });

  // Initial load of admin jobs from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.getAdminJobs();
        const list = Array.isArray(res?.jobs) ? res.jobs : (Array.isArray(res) ? res : []);
        setAdminJobs(list.map(normalizeJob));
      } catch (err) {
        // Fallback: use global jobs if backend is unavailable
        setAdminJobs((jobs || []).map(normalizeJob));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    try {
      await logout();
    } catch (err) {
      // ignore errors in logout for now
    }
    navigate('/super-admin/login');
  };

  // Persist companies and update global state
  const handleCompanyUpdate = (nextCompanies: any[]) => {
    setCompanies(nextCompanies);
    dbService.saveCompanies(nextCompanies).catch(() => {
      // ignore persistence errors in dev
    });
  };

  // Persist admin jobs via backend and refresh from server
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
          // Super admin-created jobs should be live unless explicitly set otherwise
          status: job.status || 'active'
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
          // Use explicit admin approval APIs so backend sets `approval_status`
          if (after.approvalStatus === 'approved' || after.status === 'active') {
            const tierToSet = after.tier || after.type || 'megajob';
            calls.push(apiClient.approveAdminJob(after.id || after._id, tierToSet));
          } else if (after.approvalStatus === 'rejected' || after.status === 'rejected') {
            calls.push(apiClient.rejectAdminJob(after.id || after._id, 'Rejected by admin'));
          } else {
            // Fallback to moderation endpoint for other transitions
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
          // Persist cover image URL when present (support both cases)
          cover_image_url: (after as any).cover_image_url || (after as any).coverImageUrl
        };
        calls.push(apiClient.updateJobByAdmin(after.id || after._id, updatePayload));
      }

      await Promise.allSettled(calls);
      // Refresh from server to ensure IDs and statuses are up-to-date
      try {
        const refreshed = await apiClient.getAdminJobs();
        const list = Array.isArray(refreshed?.jobs) ? refreshed.jobs : (Array.isArray(refreshed) ? refreshed : []);
        setAdminJobs(list.map(normalizeJob));
      } catch {
        // If refresh fails, keep optimistic state
      }
    } catch { /* noop */ }
  };

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