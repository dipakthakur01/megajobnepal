import React, { useState } from 'react';
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

interface ReportManagementProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
}

export function ReportManagement({ jobs, users, applications, companies }: ReportManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock analytics data
  const analytics = {
    jobAnalytics: {
      totalJobs: jobs.length + 245,
      activeJobs: jobs.filter(j => j.status === 'active').length + 189,
      expiredJobs: 56,
      pendingJobs: jobs.filter(j => j.status === 'pending').length + 12,
      byTier: {
        MegaJob: 23,
        PremiumJob: 45,
        PrimeJob: 67,
        LatestJobs: 134,
        NewspaperJobs: 76
      },
      byCategory: {
        'Information Technology': 89,
        'Banking & Finance': 67,
        'Healthcare': 45,
        'Education': 56,
        'Manufacturing': 34,
        'Others': 54
      }
    },
    userAnalytics: {
      totalUsers: users.length + 1245,
      activeUsers: 1089,
      newUsersThisMonth: 156,
      jobSeekers: 987,
      employers: companies.length + 89,
      verifiedUsers: 876,
      byLocation: {
        'Kathmandu': 456,
        'Pokhara': 234,
        'Lalitpur': 189,
        'Bhaktapur': 123,
        'Biratnagar': 98,
        'Others': 145
      }
    },
    applicationAnalytics: {
      totalApplications: applications.length + 3456,
      pendingApplications: 234,
      approvedApplications: 2134,
      rejectedApplications: 1088,
      averagePerJob: 14.2,
      conversionRate: 12.5
    },
    revenueAnalytics: {
      totalRevenue: 2456000,
      monthlyRevenue: 345000,
      yearlyGrowth: 23.5,
      byJobTier: {
        MegaJob: 575000,
        PremiumJob: 675000,
        PrimeJob: 468000,
        LatestJobs: 534000,
        NewspaperJobs: 204000
      }
    }
  };

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
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
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
