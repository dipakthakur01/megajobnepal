import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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

interface AdminDashboardNewProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
  stats: any;
  onNavigateToSection?: (section: string) => void;
}

export function AdminDashboardNew({ jobs, users, applications, companies, stats, onNavigateToSection }: AdminDashboardNewProps) {
  // Mock data to match the interface
  const dashboardStats = {
    megaJobs: 2,
    premiumJobs: 0, 
    primeJobs: 0,
    latestJobs: 0,
    newspaperJobs: 0,
    totalAdmins: 3,
    totalUsers: 1,
    totalEmployers: 67,
    totalJobSeekers: 162,
    verifiedEmployers: 45,
    unverifiedUsers: 22,
    verifiedJobSeekers: 80,
    unverifiedJobSeekers: 82
  };

  // Recent job requests
  const jobRequests = [
    {
      id: 1,
      title: 'Senior Software Developer',
      companyName: 'Tech Solutions Pvt Ltd',
      officeNumber: 'TS001',
      status: 'pending',
      jobType: 'Full Time'
    },
    {
      id: 2,
      title: 'Marketing Manager',
      companyName: 'Digital Marketing Hub',
      officeNumber: 'DMH002', 
      status: 'approved',
      jobType: 'Full Time'
    },
    {
      id: 3,
      title: 'Data Analyst',
      companyName: 'Analytics Corp',
      officeNumber: 'AC003',
      status: 'rejected',
      jobType: 'Contract'
    }
  ];

  // Industry jobs data
  const industryJobs = [
    { industry: 'Technology', jobCount: 125 },
    { industry: 'Banking & Finance', jobCount: 89 },
    { industry: 'Healthcare', jobCount: 67 },
    { industry: 'Education', jobCount: 45 },
    { industry: 'Manufacturing', jobCount: 34 }
  ];

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
          title="Admin"
          count={dashboardStats.totalAdmins}
          icon={Users}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
          textColor="text-red-600"
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
          section="user-management"
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
