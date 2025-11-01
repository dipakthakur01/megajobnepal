import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { normalizeTier } from '../../utils/tier';
import { Progress } from '../components/ui/progress';
import { 
  Briefcase, 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';

import { dbService } from '../../lib/db-service';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    activeJobs: 0,
    pendingApplications: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    jobSeekers: 0,
    employers: 0
  });
  const [jobTiers, setJobTiers] = useState({
    megajob: 0,
    premium: 0,
    prime: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [
        usersResult,
        jobsResult,
        companiesResult,
        applicationsResult,
        paymentsResult
      ] = await Promise.all([
        dbService.getUsers(),
        dbService.getJobs(),
        dbService.getCompanies(),
        dbService.getApplications(),
        // Add payment query when implemented
        Promise.resolve([])
      ]);

      const totalRevenue = paymentsResult.reduce((sum: number, payment: any) => 
        payment.status === 'completed' ? sum + payment.amount : sum, 0) || 0;

      const jobSeekers = usersResult.filter((user: any) => user.user_type === 'jobseeker').length || 0;
      const employers = usersResult.filter((user: any) => user.user_type === 'employer').length || 0;

      // Calculate job tiers (normalized)
      const megajobCount = jobsResult.filter((job: any) => normalizeTier(job.tier) === 'megajob').length || 0;
      const premiumCount = jobsResult.filter((job: any) => normalizeTier(job.tier) === 'premium').length || 0;
      const primeCount = jobsResult.filter((job: any) => normalizeTier(job.tier) === 'prime').length || 0;

      setStats({
        totalUsers: usersResult.length || 0,
        totalJobs: jobsResult.length || 0,
        totalCompanies: companiesResult.length || 0,
        totalApplications: applicationsResult.length || 0,
        activeJobs: jobsResult.filter((job: any) => job.status === 'active').length || 0,
        pendingApplications: applicationsResult.filter((app: any) => app.status === 'pending').length || 0,
        totalRevenue,
        monthlyGrowth: 12.5, // Calculate this based on actual data
        jobSeekers,
        employers
      });

      setJobTiers({
        megajob: megajobCount,
        premium: premiumCount,
        prime: primeCount
      });

      // Set the data for other components
      setJobs(jobsResult);
      setUsers(usersResult);
      setRecentApplications(applicationsResult.slice(0, 5)); // Show only recent 5 applications
      
      // Calculate top companies by job count
      const companyJobCounts = companiesResult.map((company: any) => ({
        ...company,
        jobCount: jobsResult.filter((job: any) => job.company === company.name || job.company_id === company.id).length
      })).sort((a: any, b: any) => b.jobCount - a.jobCount).slice(0, 5);
      
      setTopCompanies(companyJobCounts);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.jobSeekers} job seekers, {stats.employers} employers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApplications} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Active employers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                    MegaJob
                  </Badge>
                  <span className="text-sm text-gray-600">{jobTiers.megajob} jobs</span>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((jobTiers.megajob / stats.totalJobs) * 100)}%
                </span>
              </div>
              <Progress 
                value={(jobTiers.megajob / stats.totalJobs) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    Premium
                  </Badge>
                  <span className="text-sm text-gray-600">{jobTiers.premium} jobs</span>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((jobTiers.premium / stats.totalJobs) * 100)}%
                </span>
              </div>
              <Progress 
                value={(jobTiers.premium / stats.totalJobs) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white">
                    Prime
                  </Badge>
                  <span className="text-sm text-gray-600">{jobTiers.prime} jobs</span>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((jobTiers.prime / stats.totalJobs) * 100)}%
                </span>
              </div>
              <Progress 
                value={(jobTiers.prime / stats.totalJobs) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => {
                  const job = jobs.find(j => j.id === application.jobId);
                  const user = users.find(u => u.id === application.userId);
                  
                  return (
                    <div key={application.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{job?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-gray-600">{user?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{application.appliedDate}</p>
                      </div>
                      <Badge 
                        variant={
                          application.status === 'pending' ? 'outline' :
                          application.status === 'accepted' ? 'default' : 'destructive'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No recent applications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies by Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.length > 0 ? (
                topCompanies.map((company, index) => (
                  <div key={company.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-gray-600">{company.industry}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{company.jobCount} jobs</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No companies found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Jobs posted today</span>
                </div>
                <span className="font-medium">
                  {jobs.filter(job => job.publishedDate === new Date().toISOString().split('T')[0]).length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Active applications</span>
                </div>
                <span className="font-medium">{stats.pendingApplications}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Top location</span>
                </div>
                <span className="font-medium">Kathmandu</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Avg. salary range</span>
                </div>
                <span className="font-medium">Rs. 45K-65K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
