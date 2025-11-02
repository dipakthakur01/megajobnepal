import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { normalizeTier } from '../../utils/tier';
import { Button } from '../ui/button';
import { 
  Briefcase, 
  Building2, 
  Users, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Globe,
  Eye,
  Settings,
  BarChart3,
  CreditCard,
  Shield
} from 'lucide-react';
import companyParameterService from '../../services/companyParameterService';

interface AdminDashboardNewProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
  stats: any;
  onNavigateToSection?: (section: string) => void;
}

export function AdminDashboardNew({ jobs, users, applications, companies, stats, onNavigateToSection }: AdminDashboardNewProps) {
  const [industryList, setIndustryList] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await companyParameterService.list('industry');
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        const names = items.map((it: any) => (typeof it === 'string' ? it : it?.name)).filter(Boolean);
        if (mounted) setIndustryList(names as string[]);
      } catch {
        // If parameters fail to load, keep list empty and allow graceful fallbacks
      }
    })();
    return () => { mounted = false; };
  }, []);
  // Derive dashboard statistics from live data with safe fallbacks
  const megaJobs = jobs.filter(j => normalizeTier(j?.tier) === 'megajob').length;
  const premiumJobs = jobs.filter(j => normalizeTier(j?.tier) === 'premium').length;
  const primeJobs = jobs.filter(j => normalizeTier(j?.tier) === 'prime').length;
  // Latest should reflect all newly posted jobs regardless of tier
  const latestJobs = jobs.length;
  const newspaperJobs = jobs.filter(j => normalizeTier(j?.tier) === 'newspaper' || j?.source === 'newspaper').length;

  const asLower = (v: any) => String(v || '').toLowerCase();
  const totalAdmins = users.filter(u => {
    const t1 = asLower((u as any)?.type);
    const t2 = asLower((u as any)?.user_type);
    const staff = ['super_admin','admin'];
    return staff.includes(t1) || staff.includes(t2);
  }).length;
  const jobSeekerCount = users.filter(u => u?.type === 'jobseeker' || u?.user_type === 'job_seeker').length;
  const employerCount = companies?.length ?? 0; // use companies for employer management
  // Users tile now shows HR, Content, and Support accounts
  const totalUsers = users.filter(u => {
    const t1 = asLower((u as any)?.type);
    const t2 = asLower((u as any)?.user_type);
    const nonAdminStaff = ['hr','content','content_manager','support','support_agent'];
    return nonAdminStaff.includes(t1) || nonAdminStaff.includes(t2);
  }).length;
  const totalJobSeekers = jobSeekerCount;
  const totalEmployers = employerCount;

  const verifiedEmployers = companies?.filter(c => !!c?.verified).length ?? 0;
  const unverifiedUsers = users.filter(u => (u as any)?.isVerified === false).length; // will be 0 if not present
  const verifiedJobSeekers = users.filter(u => u?.type === 'jobseeker' && (u as any)?.isVerified === true).length;
  const unverifiedJobSeekers = users.filter(u => u?.type === 'jobseeker' && (u as any)?.isVerified === false).length;

  const dashboardStats = {
    megaJobs,
    premiumJobs,
    primeJobs,
    latestJobs,
    newspaperJobs,
    totalAdmins,
    totalUsers,
    totalEmployers,
    totalJobSeekers,
    verifiedEmployers,
    unverifiedUsers,
    verifiedJobSeekers,
    unverifiedJobSeekers
  };

  // Build recent job requests from jobs data (latest 5)
  const jobRequests = jobs.slice(0, 5).map((j, idx) => ({
    id: j.id ?? idx,
    title: j.title ?? 'Job Title',
    companyName: j.company ?? 'Company',
    officeNumber: j.companyId ?? j.company_id ?? 'N/A',
    status: j.approvalStatus ?? 'pending',
    jobType: j.employment_type ?? 'Full Time'
  }));

  // Compute industry distribution (top 5 categories)
  const toLower = (s: any) => String(s || '').trim().toLowerCase();
  const industryMap: Record<string, number> = {};
  // Build company lookup by id and name -> industry
  const companyById: Record<string, string> = {};
  const companyByName: Record<string, string> = {};
  for (const c of (companies || [])) {
    const id = String((c as any)?._id || (c as any)?.id || '');
    const nm = toLower((c as any)?.name || (c as any)?.company_name || (c as any)?.title);
    const ind = (c as any)?.industry || (c as any)?.category || '';
    if (id) companyById[id] = ind;
    if (nm) companyByName[nm] = ind;
  }

  const isValidIndustry = (name: string) => {
    if (!name) return false;
    if (industryList.length === 0) return true; // no server list loaded, allow
    return industryList.some(v => toLower(v) === toLower(name));
  };

  for (const j of jobs) {
    const companyName = toLower((j as any)?.company?.name || (j as any)?.company);
    const companyId = String((j as any)?.company_id || (j as any)?.companyId || '');
    let key = '';
    if (companyName && companyByName[companyName]) key = companyByName[companyName];
    else if (companyId && companyById[companyId]) key = companyById[companyId];
    else if ((j as any)?.category && isValidIndustry((j as any)?.category)) key = (j as any)?.category;

    // Only count if we have a real industry name; skip generic/empty
    if (key && isValidIndustry(key)) {
      industryMap[key] = (industryMap[key] ?? 0) + 1;
    }
  }
  const industryJobs = Object.entries(industryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([industry, jobCount]) => ({ industry, jobCount }));

  // Admins by role counts
  // helper already defined above
  const roleCounts = {
    superAdmin: users.filter(u => asLower((u as any)?.user_type) === 'super_admin').length,
    admin: users.filter(u => asLower((u as any)?.user_type) === 'admin').length,
    hrManager: users.filter(u => ['hr', 'hr_manager'].includes(asLower((u as any)?.user_type))).length,
    contentManager: users.filter(u => ['content', 'content_manager'].includes(asLower((u as any)?.user_type))).length,
    supportAgent: users.filter(u => ['support', 'support_agent'].includes(asLower((u as any)?.user_type))).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const StatCard = ({ title, count, icon: Icon, gradient, textColor, onClick, section }: any) => (
    <Card 
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
      onClick={() => onClick && onClick(section)}
    >
      <div className={`absolute top-0 right-0 w-16 h-16 ${gradient} opacity-10 rounded-full -mr-4 -mt-4`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
          </div>
          <div className={`p-3 ${gradient} rounded-lg transition-transform hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Top Statistics Row - Job Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Mega Jobs"
          count={dashboardStats.megaJobs}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-red-600"
          onClick={onNavigateToSection}
          section="job-post-management"
        />
        <StatCard
          title="Premium Jobs"
          count={dashboardStats.premiumJobs}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-blue-600"
          onClick={onNavigateToSection}
          section="job-post-management"
        />
        <StatCard
          title="Prime Jobs"
          count={dashboardStats.primeJobs}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          textColor="text-orange-600"
          onClick={onNavigateToSection}
          section="job-post-management"
        />
        <StatCard
          title="Latest Jobs"
          count={dashboardStats.latestJobs}
          icon={Briefcase}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          textColor="text-yellow-600"
          onClick={onNavigateToSection}
          section="job-post-management"
        />
        <StatCard
          title="Newspaper Jobs"
          count={dashboardStats.newspaperJobs}
          icon={FileText}
          gradient="bg-gradient-to-br from-gray-500 to-gray-600"
          textColor="text-gray-600"
          onClick={onNavigateToSection}
          section="job-post-management"
        />
      </div>

      {/* User Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Admins"
          count={dashboardStats.totalAdmins}
          icon={Shield}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          textColor="text-indigo-600"
          onClick={onNavigateToSection}
          section="role-management"
        />
        <StatCard
          title="Users"
          count={dashboardStats.totalUsers}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          textColor="text-blue-600"
          onClick={onNavigateToSection}
          section="role-management"
        />
        <StatCard
          title="Employers"
          count={dashboardStats.totalEmployers}
          icon={Building2}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          textColor="text-purple-600"
          onClick={onNavigateToSection}
          section="employer-management"
        />
        <StatCard
          title="Job Seekers"
          count={dashboardStats.totalJobSeekers}
          icon={Users}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-green-600"
          onClick={onNavigateToSection}
          section="user-management"
        />
      </div>

      {/* Verification Statistics Row */}  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Employers"
          count={dashboardStats.verifiedEmployers}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-green-600"
          onClick={onNavigateToSection}
          section="employer-management"
        />
        <StatCard
          title="Unverified Users"
          count={dashboardStats.unverifiedUsers}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-red-600"
          onClick={onNavigateToSection}
          section="user-management"
        />
        <StatCard
          title="Verified Job Seekers"
          count={dashboardStats.verifiedJobSeekers}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          textColor="text-green-600"
          onClick={onNavigateToSection}
          section="user-management"
        />
        <StatCard
          title="Unverified Job Seekers"
          count={dashboardStats.unverifiedJobSeekers}
          icon={AlertCircle}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-red-600"
          onClick={onNavigateToSection}
          section="user-management"
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Requests Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Job Requests</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToSection && onNavigateToSection('job-post-management')}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b text-xs text-gray-500 uppercase">
                    <th className="text-left py-2 px-1 w-8">#</th>
                    <th className="text-left py-2 px-1">Title</th>
                    <th className="text-left py-2 px-1 hidden sm:table-cell">Company Name</th>
                    <th className="text-left py-2 px-1 hidden md:table-cell">Office Number</th>
                    <th className="text-left py-2 px-1">Status</th>
                    <th className="text-left py-2 px-1 hidden sm:table-cell">Job Type</th>
                    <th className="text-left py-2 px-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobRequests.map((request, index) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-1 text-sm">{index + 1}</td>
                      <td className="py-3 px-1 text-sm font-medium">
                        <div className="max-w-[150px] truncate" title={request.title}>{request.title}</div>
                        <div className="sm:hidden text-xs text-gray-500 mt-1">{request.companyName}</div>
                      </td>
                      <td className="py-3 px-1 text-sm hidden sm:table-cell">{request.companyName}</td>
                      <td className="py-3 px-1 text-sm hidden md:table-cell">{request.officeNumber}</td>
                      <td className="py-3 px-1">{getStatusBadge(request.status)}</td>
                      <td className="py-3 px-1 text-sm hidden sm:table-cell">{request.jobType}</td>
                      <td className="py-3 px-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          onClick={() => onNavigateToSection && onNavigateToSection('job-post-management')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Industry Jobs Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Industry Jobs</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToSection && onNavigateToSection('reports')}
                className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px]">
                <thead>
                  <tr className="border-b text-xs text-gray-500 uppercase">
                    <th className="text-left py-2 px-1 w-8">#</th>
                    <th className="text-left py-2 px-1">Industry</th>
                    <th className="text-left py-2 px-1 text-center">Job Count</th>
                  </tr>
                </thead>
                <tbody>
                  {industryJobs.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-1 text-sm">{index + 1}</td>
                      <td className="py-3 px-1 text-sm font-medium">{item.industry}</td>
                      <td className="py-3 px-1 text-center">
                        <Badge variant="outline" className="text-xs">
                          {item.jobCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Admins by Role</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigateToSection && onNavigateToSection('role-management')}
                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Super Admin</span>
                </div>
                <Badge variant="outline" className="text-xs">{roleCounts.superAdmin}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm">Admin</span>
                </div>
                <Badge variant="outline" className="text-xs">{roleCounts.admin}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">HR Manager</span>
                </div>
                <Badge variant="outline" className="text-xs">{roleCounts.hrManager}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Content Manager</span>
                </div>
                <Badge variant="outline" className="text-xs">{roleCounts.contentManager}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Support Agent</span>
                </div>
                <Badge variant="outline" className="text-xs">{roleCounts.supportAgent}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button 
              className="h-16 flex-col bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('job-post-management')}
            >
              <Briefcase className="h-5 w-5 mb-2" />
              <span className="text-sm">Approve Jobs</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('user-management')}
            >
              <Users className="h-5 w-5 mb-2" />
              <span className="text-sm">Verify Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('employer-management')}
            >
              <Building2 className="h-5 w-5 mb-2" />
              <span className="text-sm">Manage Companies</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('reports')}
            >
              <BarChart3 className="h-5 w-5 mb-2" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('payment-management')}
            >
              <CreditCard className="h-5 w-5 mb-2" />
              <span className="text-sm">Payments</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 hover:scale-105"
              onClick={() => onNavigateToSection && onNavigateToSection('role-management')}
            >
              <Shield className="h-5 w-5 mb-2" />
              <span className="text-sm">Role Management</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
