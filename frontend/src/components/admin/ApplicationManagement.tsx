import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Eye, Check, X, Clock, FileText, Calendar, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationManagementProps {
  applications: any[];
  jobs: any[];
  users: any[];
}

export function ApplicationManagement({ applications, jobs, users }: ApplicationManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(application => {
    const job = jobs.find(j => j.id === application.jobId);
    const user = users.find(u => u.id === application.userId);
    
    const matchesSearch = 
      (job && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job && job.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const appDate = new Date(application.appliedDate);
      const now = new Date();
      switch (filterDate) {
        case 'today':
          matchesDate = appDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = appDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = appDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'accepted':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  // Top companies by applications
  const topCompanies = jobs.reduce((acc: any, job) => {
    const appCount = applications.filter(app => app.jobId === job.id).length;
    if (appCount > 0) {
      acc[job.company] = (acc[job.company] || 0) + appCount;
    }
    return acc;
  }, {});

  const topCompaniesList = Object.entries(topCompanies)
    .map(([company, count]) => ({ company, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  // Recent applications
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Application Management</h2>
          <p className="text-gray-600">Track and manage job applications</p>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{applicationStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold">{applicationStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-xl font-bold">{applicationStats.reviewed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-xl font-bold">{applicationStats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold">{applicationStats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Applications List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by job title, applicant name, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const job = jobs.find(j => j.id === application.jobId);
                  const user = users.find(u => u.id === application.userId);

                  return (
                    <div 
                      key={application.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{job?.title || 'Unknown Job'}</h3>
                            <Badge className={getStatusColor(application.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(application.status)}
                                {application.status}
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span><strong>Applicant:</strong> {user?.name || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span><strong>Company:</strong> {job?.company || 'Unknown Company'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span><strong>Applied:</strong> {application.appliedDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span><strong>Type:</strong> {job?.type || 'Unknown'}</span>
                            </div>
                          </div>

                          {user?.email && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Email:</strong> {user.email}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplication(application);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredApplications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No applications found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Companies by Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCompaniesList.map((item: any, index) => (
                  <div key={item.company} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium">{item.company}</span>
                    </div>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
                {topCompaniesList.length === 0 && (
                  <p className="text-sm text-gray-500">No applications yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          {selectedApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Title</p>
                    <p>{jobs.find(j => j.id === selectedApplication.jobId)?.title || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applicant</p>
                    <p>{users.find(u => u.id === selectedApplication.userId)?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applied Date</p>
                    <p>{selectedApplication.appliedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Application ID</p>
                    <p className="text-xs text-gray-500">{selectedApplication.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.slice(0, 5).map((application) => {
                  const job = jobs.find(j => j.id === application.jobId);
                  const user = users.find(u => u.id === application.userId);
                  
                  return (
                    <div key={application.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user?.name || 'Unknown'}</p>
                          <p className="text-gray-600">{job?.title || 'Unknown Job'}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {application.appliedDate}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
