import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ReportManagementProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
}

export function ReportManagement({ jobs, users, applications, companies }: ReportManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [jobStats, setJobStats] = useState<any>(null);

  const normalizeTier = (tier: any) => {
    const t = String(tier || '').toLowerCase();
    if (t === 'mega_job' || t === 'megajob') return 'megajob';
    if (t === 'premium' || t === 'premium_job') return 'premium';
    if (t === 'prime' || t === 'prime_job') return 'prime';
    if (t === 'newspaper' || t === 'newspaper_job') return 'newspaper';
    return t || 'latest';
  };

  const expiredJobsCount = useMemo(() => {
    const now = Date.now();
    return jobs.filter((j: any) => {
      const deadline = j?.deadline || j?.application_deadline || j?.expires_at;
      if (!deadline) return false;
      const ts = new Date(deadline).getTime();
      return Number.isFinite(ts) && ts < now;
    }).length;
  }, [jobs]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [dashRes, jobRes] = await Promise.all([
        apiClient.getAdminDashboardStats().catch(() => null),
        apiClient.getAdminJobStats().catch(() => null)
      ]);
      setDashboardStats(dashRes);
      setJobStats(jobRes?.data || jobRes);
    } catch (err) {
      console.warn('Failed to load reports stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const analytics = useMemo(() => {
    const totalJobs = jobStats?.total ?? dashboardStats?.totalJobs ?? jobs.length;
    const pendingJobs = jobStats?.pending ?? jobs.filter((j: any) => String(j?.status || '').toLowerCase() === 'pending').length;
    const activeJobs = jobs.filter((j: any) => String(j?.status || '').toLowerCase() === 'active').length;

    const byTierRaw = jobStats?.by_tier || {};
    const megajob = byTierRaw?.megajob ?? jobs.filter((j: any) => normalizeTier(j?.tier) === 'megajob').length;
    const premium = byTierRaw?.premium ?? jobs.filter((j: any) => normalizeTier(j?.tier) === 'premium').length;
    const prime = byTierRaw?.prime ?? jobs.filter((j: any) => normalizeTier(j?.tier) === 'prime').length;
    const newspaper = byTierRaw?.newspaper ?? jobs.filter((j: any) => normalizeTier(j?.tier) === 'newspaper').length;
    const latest = jobs.length;

    const totalUsers = dashboardStats?.totalUsers ?? users.length;
    const activeUsers = dashboardStats?.activeUsers ?? users.filter((u: any) => String(u?.status || '').toLowerCase() === 'active').length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = users.filter((u: any) => {
      const d = new Date(u?.created_at || u?.joinedDate || u?.joined_date);
      return Number.isFinite(d.getTime()) && d >= thirtyDaysAgo;
    }).length;
    const jobSeekers = users.filter((u: any) => {
      const t = String((u as any)?.user_type || (u as any)?.type || '').toLowerCase();
      return t === 'job_seeker' || t === 'jobseeker';
    }).length;
    const employers = dashboardStats?.totalCompanies ?? companies.length;
    const verifiedUsers = users.filter((u: any) => (u as any)?.isVerified === true).length;

    const totalApplications = dashboardStats?.totalApplications ?? applications.length;
    const pendingApplications = applications.filter((a: any) => String(a?.status || '').toLowerCase() === 'pending').length;
    const approvedApplications = applications.filter((a: any) => String(a?.status || '').toLowerCase() === 'accepted').length;
    const rejectedApplications = applications.filter((a: any) => String(a?.status || '').toLowerCase() === 'rejected').length;
    const averagePerJob = totalJobs > 0 ? Number((totalApplications / totalJobs).toFixed(1)) : 0;
    const conversionRate = totalApplications > 0 ? Number(((approvedApplications / totalApplications) * 100).toFixed(1)) : 0;

    return {
      jobAnalytics: {
        totalJobs,
        activeJobs,
        expiredJobs: expiredJobsCount,
        pendingJobs,
        byTier: {
          MegaJob: megajob,
          PremiumJob: premium,
          PrimeJob: prime,
          LatestJobs: latest,
          NewspaperJobs: newspaper
        }
      },
      userAnalytics: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        jobSeekers,
        employers,
        verifiedUsers
      },
      applicationAnalytics: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        averagePerJob,
        conversionRate
      },
      revenueAnalytics: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        yearlyGrowth: 0,
        byJobTier: {
          MegaJob: 0,
          PremiumJob: 0,
          PrimeJob: 0,
          LatestJobs: 0,
          NewspaperJobs: 0
        }
      }
    };
  }, [jobs, users, applications, companies, dashboardStats, jobStats, expiredJobsCount]);

  const reportTemplates = [
    {
      id: 'jobs-summary',
      title: 'Jobs Summary Report',
      description: 'Complete overview of job postings, applications, and performance',
      category: 'Jobs',
      icon: Briefcase,
      formats: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'user-analytics',
      title: 'User Analytics Report',
      description: 'User registration, activity, and demographic analysis',
      category: 'Users',
      icon: Users,
      formats: ['PDF', 'Excel']
    },
    {
      id: 'company-performance',
      title: 'Company Performance Report',
      description: 'Company engagement, job posting activity, and hiring success',
      category: 'Companies',
      icon: Building2,
      formats: ['PDF', 'Excel']
    },
    {
      id: 'revenue-analysis',
      title: 'Revenue Analysis Report',
      description: 'Financial performance, revenue streams, and growth metrics',
      category: 'Financial',
      icon: TrendingUp,
      formats: ['PDF', 'Excel']
    },
    {
      id: 'application-trends',
      title: 'Application Trends Report',
      description: 'Job application patterns, success rates, and market trends',
      category: 'Applications',
      icon: FileText,
      formats: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'platform-overview',
      title: 'Platform Overview Report',
      description: 'Comprehensive platform metrics and KPI dashboard',
      category: 'Overview',
      icon: BarChart3,
      formats: ['PDF', 'PowerPoint']
    }
  ];

  const handleGenerateReport = async (reportId: string, format: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real app, this would trigger report generation and download
      console.log(`Generating ${reportId} in ${format} format`);
    } finally {
      setIsGenerating(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {change && (
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {change}% vs last month
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Report Management</h2>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
          <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Analytics Overview */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Job Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Jobs"
                value={analytics.jobAnalytics.totalJobs.toLocaleString()}
                change={8.5}
                icon={Briefcase}
                color="text-blue-600"
              />
              <StatCard
                title="Active Jobs"
                value={analytics.jobAnalytics.activeJobs.toLocaleString()}
                change={12.3}
                icon={Briefcase}
                color="text-green-600"
              />
              <StatCard
                title="Pending Jobs"
                value={analytics.jobAnalytics.pendingJobs.toLocaleString()}
                change={-5.2}
                icon={Briefcase}
                color="text-yellow-600"
              />
              <StatCard
                title="Expired Jobs"
                value={analytics.jobAnalytics.expiredJobs.toLocaleString()}
                change={-15.7}
                icon={Briefcase}
                color="text-red-600"
              />
            </div>

            {/* Job Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Jobs by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.jobAnalytics.byTier).map(([tier, count]) => (
                    <div key={tier} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tier}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.jobAnalytics.byTier))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={analytics.userAnalytics.totalUsers.toLocaleString()}
                change={15.2}
                icon={Users}
                color="text-purple-600"
              />
              <StatCard
                title="Active Users"
                value={analytics.userAnalytics.activeUsers.toLocaleString()}
                change={18.7}
                icon={Users}
                color="text-green-600"
              />
              <StatCard
                title="New Users"
                value={analytics.userAnalytics.newUsersThisMonth.toLocaleString()}
                change={22.1}
                icon={Users}
                color="text-blue-600"
              />
              <StatCard
                title="Verified Users"
                value={analytics.userAnalytics.verifiedUsers.toLocaleString()}
                change={7.8}
                icon={Users}
                color="text-orange-600"
              />
            </div>
          </div>

          {/* Application Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Applications"
                value={analytics.applicationAnalytics.totalApplications.toLocaleString()}
                change={25.4}
                icon={FileText}
                color="text-indigo-600"
              />
              <StatCard
                title="Pending"
                value={analytics.applicationAnalytics.pendingApplications.toLocaleString()}
                change={-8.3}
                icon={FileText}
                color="text-yellow-600"
              />
              <StatCard
                title="Approved"
                value={analytics.applicationAnalytics.approvedApplications.toLocaleString()}
                change={31.2}
                icon={FileText}
                color="text-green-600"
              />
              <StatCard
                title="Conversion Rate"
                value={`${analytics.applicationAnalytics.conversionRate}%`}
                change={5.7}
                icon={TrendingUp}
                color="text-purple-600"
              />
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Revenue"
                value={`NPR ${(analytics.revenueAnalytics.totalRevenue / 1000000).toFixed(1)}M`}
                change={23.5}
                icon={TrendingUp}
                color="text-green-600"
              />
              <StatCard
                title="Monthly Revenue"
                value={`NPR ${(analytics.revenueAnalytics.monthlyRevenue / 1000).toLocaleString()}K`}
                change={18.2}
                icon={TrendingUp}
                color="text-blue-600"
              />
              <StatCard
                title="Yearly Growth"
                value={`${analytics.revenueAnalytics.yearlyGrowth}%`}
                change={12.8}
                icon={TrendingUp}
                color="text-purple-600"
              />
            </div>
          </div>
        </TabsContent>

        {/* Generate Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map(template => {
              const Icon = template.icon;
              return (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{template.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{template.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Available formats:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.formats.map(format => (
                            <Button
                              key={format}
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateReport(template.id, format)}
                              disabled={isGenerating}
                              className="text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {format}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <p className="text-sm text-gray-600">Manage automated report generation and delivery</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Monthly Platform Summary</h4>
                      <p className="text-sm text-gray-600">Comprehensive monthly overview sent to executives</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>• Next run: 1st of every month</span>
                        <span>• Format: PDF</span>
                        <span>• Recipients: 3</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Weekly Revenue Report</h4>
                      <p className="text-sm text-gray-600">Weekly financial performance and payment summaries</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>• Next run: Every Monday</span>
                        <span>• Format: Excel</span>
                        <span>• Recipients: 2</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Daily Job Analytics</h4>
                      <p className="text-sm text-gray-600">Daily job posting and application metrics</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>• Next run: Daily at 9:00 AM</span>
                        <span>• Format: CSV</span>
                        <span>• Recipients: 1</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
