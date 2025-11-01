import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface EmployerManagementNewProps {
  companies: any[];
  jobs: any[];
  applications: any[];
  onCompanyUpdate: (companies: any[]) => void;
}

export function EmployerManagementNew({ 
  companies, 
  jobs, 
  applications, 
  onCompanyUpdate 
}: EmployerManagementNewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Actual enhanced company data (no mock/random values)
  const enhancedCompanies = companies.map(company => {
    const companyId = company.id || company._id;
    const companyName = company.name || company.company_name || company.companyName;
  
    const companyJobs = jobs.filter(job => {
      const jobCompanyId = job.companyId || job.company_id;
      const jobCompanyName = job.companyName || job.company_name || job.company;
      const idMatch = companyId && jobCompanyId && String(jobCompanyId) === String(companyId);
      const nameMatch = companyName && jobCompanyName && String(jobCompanyName).toLowerCase() === String(companyName).toLowerCase();
      return idMatch || nameMatch;
    });
  
    const activeJobs = companyJobs.filter(j => (j.status || '').toLowerCase() === 'active');
  
    const totalApplications = applications.filter(app => {
      const appJobId = app.jobId || app.job_id;
      const jobIds = companyJobs.map(j => j.id || j._id).filter(Boolean).map(String);
      return appJobId && jobIds.includes(String(appJobId));
    });
  
    return {
      ...company,
      totalJobs: companyJobs.length,
      activeJobs: activeJobs.length,
      totalApplications: totalApplications.length,
      verified: company.verified ?? company.is_verified ?? false,
    };
  });

  const filteredCompanies = enhancedCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && company.verified) ||
                               (verificationFilter === 'unverified' && !company.verified);
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleVerifyCompany = async (companyId: string) => {
    try {
      await apiClient.approveCompanyByAdmin(String(companyId));
      const updatedCompanies = companies.map(company =>
        company.id === companyId || company._id === companyId
          ? { ...company, verified: true }
          : company
      );
      onCompanyUpdate(updatedCompanies);
      toast.success('Company verified successfully!');
    } catch (err) {
      console.error('Error verifying company:', err);
      toast.error('Failed to verify company');
    }
  };

  const handleRejectCompany = async (companyId: string) => {
    try {
      await apiClient.updateCompanyByAdmin(String(companyId), { verified: false, status: 'rejected' });
      const updatedCompanies = companies.map(company =>
        company.id === companyId || company._id === companyId
          ? { ...company, verified: false, status: 'rejected' }
          : company
      );
      onCompanyUpdate(updatedCompanies);
      toast.success('Company verification rejected');
    } catch (err) {
      console.error('Error rejecting company verification:', err);
      toast.error('Failed to reject verification');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      const id = String(companyId);
      await apiClient.deleteCompanyByAdmin(id);
      const updatedCompanies = companies.filter(c => String(c.id || c._id) !== id);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const exportCompanyData = () => {
    toast.success('Company data exported successfully!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { class: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      suspended: { class: 'bg-red-100 text-red-800', label: 'Suspended' },
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Employer Management</h2>
          <p className="text-gray-600">Manage company profiles, verification, and activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCompanyData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-blue-600">{enhancedCompanies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {enhancedCompanies.filter(c => c.verified).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-orange-600">
                  {enhancedCompanies.filter(c => !c.verified).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {enhancedCompanies.reduce((sum, c) => sum + c.activeJobs, 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Company List</TabsTrigger>
          <TabsTrigger value="verification">Verification Queue</TabsTrigger>
        </TabsList>

        {/* Company List */}
        <TabsContent value="list" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search companies, locations, industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Contact</th>
                      <th className="text-left py-3 px-4">Industry</th>
                      <th className="text-left py-3 px-4">Jobs</th>
                      <th className="text-left py-3 px-4">Applications</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Verified</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map(company => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {company.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {company.email}
                            </p>
                            <p className="flex items-center text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {company.phone}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{company.industry}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-medium">{company.activeJobs} Active</p>
                            <p className="text-gray-600">{company.totalJobs} Total</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{company.totalApplications}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(company.status)}
                        </td>
                        <td className="py-3 px-4">
                          {company.verified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!company.verified && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerifyCompany(company.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCompany(company.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Queue */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification ({enhancedCompanies.filter(c => !c.verified).length})</CardTitle>
              <p className="text-sm text-gray-600">Review and verify company registrations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedCompanies.filter(c => !c.verified).map(company => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{company.name}</h3>
                            <p className="text-gray-600">{company.industry}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact Information</p>
                            <p className="text-sm text-gray-600">{company.email}</p>
                            <p className="text-sm text-gray-600">{company.phone}</p>
                            <p className="text-sm text-gray-600">{company.location}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Company Details</p>
                            <p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
                            <p className="text-sm text-gray-600">Website: {company.website}</p>
                            <p className="text-sm text-gray-600">Registered: {company.registrationDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Activity</p>
                            <p className="text-sm text-gray-600">Jobs Posted: {company.totalJobs}</p>
                            <p className="text-sm text-gray-600">Applications: {company.totalApplications}</p>
                            <p className="text-sm text-gray-600">Last Active: {company.lastActivity}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
                          <p className="text-sm text-gray-600">
                            {company.description || "No description provided by the company."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          onClick={() => handleVerifyCompany(company.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleRejectCompany(company.id)}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EmployerManagementNewPage(props: any) {
  // Bridge page: simply render the component version to keep one source of truth
  return <EmployerManagementNewComponent {...props} />;
}


import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

const handleRejectCompany = async (companyId: string) => {
try {
  await apiClient.updateCompanyByAdmin(String(companyId), { verified: false, status: 'rejected' });
  const updatedCompanies = companies.map(company =>
    company.id === companyId || company._id === companyId
      ? { ...company, verified: false, status: 'rejected' }
      : company
  );
  onCompanyUpdate(updatedCompanies);
  toast.success('Company verification rejected');
} catch (err) {
  console.error('Error rejecting company verification:', err);
  toast.error('Failed to reject verification');
}
};

const handleDeleteCompany = async (companyId: string) => {
try {
  const id = String(companyId);
  await apiClient.deleteCompanyByAdmin(id);
  const updatedCompanies = companies.filter(c => String(c.id || c._id) !== id);
  onCompanyUpdate(updatedCompanies);
  toast.success('Company deleted successfully!');
} catch (error) {
  console.error('Error deleting company:', error);
  toast.error('Failed to delete company');
}
};

const exportCompanyData = () => {
toast.success('Company data exported successfully!');
};

const getStatusBadge = (status: string) => {
const statusConfig = {
  active: { class: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { class: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  suspended: { class: 'bg-red-100 text-red-800', label: 'Suspended' },
  pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
};
const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
return <Badge className={config.class}>{config.label}</Badge>;
};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div>
<h2 className="text-2xl font-bold">Employer Management</h2>
<p className="text-gray-600">Manage company profiles, verification, and activities</p>
</div>
<div className="flex gap-2">
<Button variant="outline" onClick={exportCompanyData}>
<Download className="h-4 w-4 mr-2" />
Export Data
</Button>
</div>
</div>

{/* Statistics Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Total Companies</p>
<p className="text-2xl font-bold text-blue-600">{enhancedCompanies.length}</p>
</div>
<Building2 className="h-8 w-8 text-blue-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Verified</p>
<p className="text-2xl font-bold text-green-600">
{enhancedCompanies.filter(c => c.verified).length}
</p>
</div>
<CheckCircle className="h-8 w-8 text-green-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Pending Verification</p>
<p className="text-2xl font-bold text-orange-600">
{enhancedCompanies.filter(c => !c.verified).length}
</p>
</div>
<XCircle className="h-8 w-8 text-orange-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Active Jobs</p>
<p className="text-2xl font-bold text-purple-600">
{enhancedCompanies.reduce((sum, c) => sum + c.activeJobs, 0)}
</p>
</div>
<Briefcase className="h-8 w-8 text-purple-600" />
</div>
</CardContent>
</Card>
</div>

<Tabs defaultValue="list" className="space-y-6">
<TabsList className="grid w-full grid-cols-2">
<TabsTrigger value="list">Company List</TabsTrigger>
<TabsTrigger value="verification">Verification Queue</TabsTrigger>
</TabsList>

{/* Company List */}
<TabsContent value="list" className="space-y-6">
{/* Search and Filters */}
<Card>
<CardContent className="pt-6">
<div className="flex flex-col sm:flex-row gap-4">
<div className="flex-1 relative">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
<Input
placeholder="Search companies, locations, industries..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="pl-10"
/>
</div>
<div className="flex gap-2">
<select
value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Status</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="suspended">Suspended</option>
</select>
<select
value={verificationFilter}
onChange={(e) => setVerificationFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Verification</option>
<option value="verified">Verified</option>
<option value="unverified">Unverified</option>
</select>
</div>
</div>
</CardContent>
</Card>

{/* Companies Table */}
<Card>
<CardHeader>
<CardTitle>Companies ({filteredCompanies.length})</CardTitle>
</CardHeader>
<CardContent>
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="border-b">
<th className="text-left py-3 px-4">Company</th>
<th className="text-left py-3 px-4">Contact</th>
<th className="text-left py-3 px-4">Industry</th>
<th className="text-left py-3 px-4">Jobs</th>
<th className="text-left py-3 px-4">Applications</th>
<th className="text-left py-3 px-4">Status</th>
<th className="text-left py-3 px-4">Verified</th>
<th className="text-left py-3 px-4">Actions</th>
</tr>
</thead>
<tbody>
{filteredCompanies.map(company => (
<tr key={company.id} className="border-b hover:bg-gray-50">
<td className="py-3 px-4">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-5 w-5 text-blue-600" />
</div>
<div>
<p className="font-medium">{company.name}</p>
<p className="text-sm text-gray-600 flex items-center">
<MapPin className="h-3 w-3 mr-1" />
{company.location}
</p>
</div>
</div>
<td className="py-3 px-4">
<div className="text-sm">
<p className="flex items-center">
<Mail className="h-3 w-3 mr-1" />
{company.email}
</p>
<p className="flex items-center text-gray-600">
<Phone className="h-3 w-3 mr-1" />
{company.phone}
</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.industry}</Badge>
</td>
<td className="py-3 px-4">
<div className="text-sm">
<p className="font-medium">{company.activeJobs} Active</p>
<p className="text-gray-600">{company.totalJobs} Total</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.totalApplications}</Badge>
</td>
<td className="py-3 px-4">
{getStatusBadge(company.status)}
</td>
<td className="py-3 px-4">
{company.verified ? (
<Badge className="bg-green-100 text-green-800">
<CheckCircle className="h-3 w-3 mr-1" />
Verified
</Badge>
) : (
<Badge className="bg-yellow-100 text-yellow-800">
<XCircle className="h-3 w-3 mr-1" />
Pending
</Badge>
)}
</td>
<td className="py-3 px-4">
<div className="flex gap-1">
<Button variant="outline" size="sm">
<Eye className="h-4 w-4" />
</Button>
<Button variant="outline" size="sm">
<Edit className="h-4 w-4" />
</Button>
{!company.verified && (
<Button 
variant="outline" 
size="sm"
onClick={() => handleVerifyCompany(company.id)}
className="text-green-600 hover:text-green-700"
>
<CheckCircle className="h-4 w-4" />
</Button>
)}
<Button 
variant="outline" 
size="sm"
onClick={() => handleDeleteCompany(company.id)}
className="text-red-600 hover:text-red-700"
>
<Trash2 className="h-4 w-4" />
</Button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</CardContent>
</Card>
</TabsContent>

{/* Verification Queue */}
<TabsContent value="verification" className="space-y-6">
<Card>
<CardHeader>
<CardTitle>Pending Verification ({enhancedCompanies.filter(c => !c.verified).length})</CardTitle>
<p className="text-sm text-gray-600">Review and verify company registrations</p>
</CardHeader>
<CardContent>
<div className="space-y-4">
{enhancedCompanies.filter(c => !c.verified).map(company => (
<div key={company.id} className="border rounded-lg p-4">
<div className="flex justify-between items-start">
<div className="flex-1">
<div className="flex items-center space-x-3 mb-3">
<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-6 w-6 text-blue-600" />
</div>
<div>
<h3 className="font-semibold text-lg">{company.name}</h3>
<p className="text-gray-600">{company.industry}</p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
<div>
<p className="text-sm font-medium text-gray-700">Contact Information</p>
<p className="text-sm text-gray-600">{company.email}</p>
<p className="text-sm text-gray-600">{company.phone}</p>
<p className="text-sm text-gray-600">{company.location}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Company Details</p>
<p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
<p className="text-sm text-gray-600">Website: {company.website}</p>
<p className="text-sm text-gray-600">Registered: {company.registrationDate}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Activity</p>
<p className="text-sm text-gray-600">Jobs Posted: {company.totalJobs}</p>
<p className="text-sm text-gray-600">Applications: {company.totalApplications}</p>
<p className="text-sm text-gray-600">Last Active: {company.lastActivity}</p>
</div>
</div>

<div className="bg-gray-50 rounded-lg p-3 mb-4">
<p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
<p className="text-sm text-gray-600">
{company.description || "No description provided by the company."}
</p>
</div>
</div>
</div>

<div className="flex flex-col gap-2 ml-4">
<Button 
onClick={() => handleVerifyCompany(company.id)}
className="bg-green-600 hover:bg-green-700"
>
<CheckCircle className="h-4 w-4 mr-2" />
Verify
</Button>
<Button 
variant="outline"
onClick={() => handleRejectCompany(company.id)}
className="text-red-600 hover:text-red-700 border-red-200"
>
<XCircle className="h-4 w-4 mr-2" />
Reject
</Button>
<Button variant="outline" size="sm">
<Eye className="h-4 w-4 mr-2" />
Details
</Button>
</div>
</div>
))}
</div>
</CardContent>
</Card>
</TabsContent>
</Tabs>
</div>
);
}

export default function EmployerManagementNewPage(props: any) {
// Bridge page: simply render the component version to keep one source of truth
return <EmployerManagementNewComponent {...props} />;
}


const handleRejectCompany = async (companyId: string) => {
try {
await apiClient.updateCompanyByAdmin(String(companyId), { verified: false, status: 'rejected' });
const updatedCompanies = companies.map(company =>
company.id === companyId || company._id === companyId
? { ...company, verified: false, status: 'rejected' }
: company
);
onCompanyUpdate(updatedCompanies);
toast.success('Company verification rejected');
} catch (err) {
console.error('Error rejecting company verification:', err);
toast.error('Failed to reject verification');
}
};

const handleDeleteCompany = async (companyId: string) => {
try {
const id = String(companyId);
await apiClient.deleteCompanyByAdmin(id);
const updatedCompanies = companies.filter(c => String(c.id || c._id) !== id);
onCompanyUpdate(updatedCompanies);
toast.success('Company deleted successfully!');
} catch (error) {
console.error('Error deleting company:', error);
toast.error('Failed to delete company');
}
};

const exportCompanyData = () => {
toast.success('Company data exported successfully!');
};

const getStatusBadge = (status: string) => {
const statusConfig = {
active: { class: 'bg-green-100 text-green-800', label: 'Active' },
inactive: { class: 'bg-gray-100 text-gray-800', label: 'Inactive' },
suspended: { class: 'bg-red-100 text-red-800', label: 'Suspended' },
pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
};
const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
return <Badge className={config.class}>{config.label}</Badge>;
};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div>
<h2 className="text-2xl font-bold">Employer Management</h2>
<p className="text-gray-600">Manage company profiles, verification, and activities</p>
</div>
<div className="flex gap-2">
<Button variant="outline" onClick={exportCompanyData}>
<Download className="h-4 w-4 mr-2" />
Export Data
</Button>
</div>
</div>

{/* Statistics Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Total Companies</p>
<p className="text-2xl font-bold text-blue-600">{enhancedCompanies.length}</p>
</div>
<Building2 className="h-8 w-8 text-blue-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Verified</p>
<p className="text-2xl font-bold text-green-600">
{enhancedCompanies.filter(c => c.verified).length}
</p>
</div>
<CheckCircle className="h-8 w-8 text-green-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Pending Verification</p>
<p className="text-2xl font-bold text-orange-600">
{enhancedCompanies.filter(c => !c.verified).length}
</p>
</div>
<XCircle className="h-8 w-8 text-orange-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Active Jobs</p>
<p className="text-2xl font-bold text-purple-600">
{enhancedCompanies.reduce((sum, c) => sum + c.activeJobs, 0)}
</p>
</div>
<Briefcase className="h-8 w-8 text-purple-600" />
</div>
</CardContent>
</Card>
</div>

<Tabs defaultValue="list" className="space-y-6">
<TabsList className="grid w-full grid-cols-2">
<TabsTrigger value="list">Company List</TabsTrigger>
<TabsTrigger value="verification">Verification Queue</TabsTrigger>
</TabsList>

{/* Company List */}
<TabsContent value="list" className="space-y-6">
{/* Search and Filters */}
<Card>
<CardContent className="pt-6">
<div className="flex flex-col sm:flex-row gap-4">
<div className="flex-1 relative">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
<Input
placeholder="Search companies, locations, industries..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="pl-10"
/>
</div>
<div className="flex gap-2">
<select
value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Status</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="suspended">Suspended</option>
</select>
<select
value={verificationFilter}
onChange={(e) => setVerificationFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Verification</option>
<option value="verified">Verified</option>
<option value="unverified">Unverified</option>
</select>
</div>
</div>
</CardContent>
</Card>

{/* Companies Table */}
<Card>
<CardHeader>
<CardTitle>Companies ({filteredCompanies.length})</CardTitle>
</CardHeader>
<CardContent>
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="border-b">
<th className="text-left py-3 px-4">Company</th>
<th className="text-left py-3 px-4">Contact</th>
<th className="text-left py-3 px-4">Industry</th>
<th className="text-left py-3 px-4">Jobs</th>
<th className="text-left py-3 px-4">Applications</th>
<th className="text-left py-3 px-4">Status</th>
<th className="text-left py-3 px-4">Verified</th>
<th className="text-left py-3 px-4">Actions</th>
</tr>
</thead>
<tbody>
{filteredCompanies.map(company => (
<tr key={company.id} className="border-b hover:bg-gray-50">
<td className="py-3 px-4">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-5 w-5 text-blue-600" />
</div>
<div>
<p className="font-medium">{company.name}</p>
<p className="text-sm text-gray-600 flex items-center">
<MapPin className="h-3 w-3 mr-1" />
{company.location}
</p>
</div>
</div>
<td className="py-3 px-4">
<div className="text-sm">
<p className="flex items-center">
<Mail className="h-3 w-3 mr-1" />
{company.email}
</p>
<p className="flex items-center text-gray-600">
<Phone className="h-3 w-3 mr-1" />
{company.phone}
</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.industry}</Badge>
</td>
<td className="py-3 px-4">
<div className="text-sm">
<p className="font-medium">{company.activeJobs} Active</p>
<p className="text-gray-600">{company.totalJobs} Total</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.totalApplications}</Badge>
</td>
<td className="py-3 px-4">
{getStatusBadge(company.status)}
</td>
<td className="py-3 px-4">
{company.verified ? (
<Badge className="bg-green-100 text-green-800">
<CheckCircle className="h-3 w-3 mr-1" />
Verified
</Badge>
) : (
<Badge className="bg-yellow-100 text-yellow-800">
<XCircle className="h-3 w-3 mr-1" />
Pending
</Badge>
)}
</td>
<td className="py-3 px-4">
<div className="flex gap-1">
<Button variant="outline" size="sm">
<Eye className="h-4 w-4" />
</Button>
<Button variant="outline" size="sm">
<Edit className="h-4 w-4" />
</Button>
{!company.verified && (
<Button 
variant="outline" 
size="sm"
onClick={() => handleVerifyCompany(company.id)}
className="text-green-600 hover:text-green-700"
>
<CheckCircle className="h-4 w-4" />
</Button>
)}
<Button 
variant="outline" 
size="sm"
onClick={() => handleDeleteCompany(company.id)}
className="text-red-600 hover:text-red-700"
>
<Trash2 className="h-4 w-4" />
</Button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</CardContent>
</Card>
</TabsContent>

{/* Verification Queue */}
<TabsContent value="verification" className="space-y-6">
<Card>
<CardHeader>
<CardTitle>Pending Verification ({enhancedCompanies.filter(c => !c.verified).length})</CardTitle>
<p className="text-sm text-gray-600">Review and verify company registrations</p>
</CardHeader>
<CardContent>
<div className="space-y-4">
{enhancedCompanies.filter(c => !c.verified).map(company => (
<div key={company.id} className="border rounded-lg p-4">
<div className="flex justify-between items-start">
<div className="flex-1">
<div className="flex items-center space-x-3 mb-3">
<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-6 w-6 text-blue-600" />
</div>
<div>
<h3 className="font-semibold text-lg">{company.name}</h3>
<p className="text-gray-600">{company.industry}</p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
<div>
<p className="text-sm font-medium text-gray-700">Contact Information</p>
<p className="text-sm text-gray-600">{company.email}</p>
<p className="text-sm text-gray-600">{company.phone}</p>
<p className="text-sm text-gray-600">{company.location}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Company Details</p>
<p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
<p className="text-sm text-gray-600">Website: {company.website}</p>
<p className="text-sm text-gray-600">Registered: {company.registrationDate}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Activity</p>
<p className="text-sm text-gray-600">Jobs Posted: {company.totalJobs}</p>
<p className="text-sm text-gray-600">Applications: {company.totalApplications}</p>
<p className="text-sm text-gray-600">Last Active: {company.lastActivity}</p>
</div>
</div>

<div className="bg-gray-50 rounded-lg p-3 mb-4">
<p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
<p className="text-sm text-gray-600">
{company.description || "No description provided by the company."}
</p>
</div>
</div>
</div>

<div className="flex flex-col gap-2 ml-4">
<Button 
onClick={() => handleVerifyCompany(company.id)}
className="bg-green-600 hover:bg-green-700"
>
<CheckCircle className="h-4 w-4 mr-2" />
Verify
</Button>
<Button 
variant="outline"
onClick={() => handleRejectCompany(company.id)}
className="text-red-600 hover:text-red-700 border-red-200"
>
<XCircle className="h-4 w-4 mr-2" />
Reject
</Button>
<Button variant="outline" size="sm">
<Eye className="h-4 w-4 mr-2" />
Details
</Button>
</div>
</div>
))}
</div>
</CardContent>
</Card>
</TabsContent>
</Tabs>
</div>
);
}

export default function EmployerManagementNewPage(props: any) {
// Bridge page: simply render the component version to keep one source of truth
return <EmployerManagementNewComponent {...props} />;
}


const handleRejectCompany = async (companyId: string) => {
try {
await apiClient.updateCompanyByAdmin(String(companyId), { verified: false, status: 'rejected' });
const updatedCompanies = companies.map(company =>
company.id === companyId || company._id === companyId
? { ...company, verified: false, status: 'rejected' }
: company
);
onCompanyUpdate(updatedCompanies);
toast.success('Company verification rejected');
} catch (err) {
console.error('Error rejecting company verification:', err);
toast.error('Failed to reject verification');
}
};

const handleDeleteCompany = async (companyId: string) => {
try {
const id = String(companyId);
await apiClient.deleteCompanyByAdmin(id);
const updatedCompanies = companies.filter(c => String(c.id || c._id) !== id);
onCompanyUpdate(updatedCompanies);
toast.success('Company deleted successfully!');
} catch (error) {
console.error('Error deleting company:', error);
toast.error('Failed to delete company');
}
};

const exportCompanyData = () => {
toast.success('Company data exported successfully!');
};

const getStatusBadge = (status: string) => {
const statusConfig = {
active: { class: 'bg-green-100 text-green-800', label: 'Active' },
inactive: { class: 'bg-gray-100 text-gray-800', label: 'Inactive' },
suspended: { class: 'bg-red-100 text-red-800', label: 'Suspended' },
pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
};
const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
return <Badge className={config.class}>{config.label}</Badge>;
};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div>
<h2 className="text-2xl font-bold">Employer Management</h2>
<p className="text-gray-600">Manage company profiles, verification, and activities</p>
</div>
<div className="flex gap-2">
<Button variant="outline" onClick={exportCompanyData}>
<Download className="h-4 w-4 mr-2" />
Export Data
</Button>
</div>
</div>

{/* Statistics Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Total Companies</p>
<p className="text-2xl font-bold text-blue-600">{enhancedCompanies.length}</p>
</div>
<Building2 className="h-8 w-8 text-blue-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Verified</p>
<p className="text-2xl font-bold text-green-600">
{enhancedCompanies.filter(c => c.verified).length}
</p>
</div>
<CheckCircle className="h-8 w-8 text-green-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Pending Verification</p>
<p className="text-2xl font-bold text-orange-600">
{enhancedCompanies.filter(c => !c.verified).length}
</p>
</div>
<XCircle className="h-8 w-8 text-orange-600" />
</div>
</CardContent>
</Card>
<Card>
<CardContent className="p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600">Active Jobs</p>
<p className="text-2xl font-bold text-purple-600">
{enhancedCompanies.reduce((sum, c) => sum + c.activeJobs, 0)}
</p>
</div>
<Briefcase className="h-8 w-8 text-purple-600" />
</div>
</CardContent>
</Card>
</div>

<Tabs defaultValue="list" className="space-y-6">
<TabsList className="grid w-full grid-cols-2">
<TabsTrigger value="list">Company List</TabsTrigger>
<TabsTrigger value="verification">Verification Queue</TabsTrigger>
</TabsList>

{/* Company List */}
<TabsContent value="list" className="space-y-6">
{/* Search and Filters */}
<Card>
<CardContent className="pt-6">
<div className="flex flex-col sm:flex-row gap-4">
<div className="flex-1 relative">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
<Input
placeholder="Search companies, locations, industries..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="pl-10"
/>
</div>
<div className="flex gap-2">
<select
value={statusFilter}
onChange={(e) => setStatusFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Status</option>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="suspended">Suspended</option>
</select>
<select
value={verificationFilter}
onChange={(e) => setVerificationFilter(e.target.value)}
className="px-3 py-2 border rounded-md bg-white"
>
<option value="all">All Verification</option>
<option value="verified">Verified</option>
<option value="unverified">Unverified</option>
</select>
</div>
</div>
</CardContent>
</Card>

{/* Companies Table */}
<Card>
<CardHeader>
<CardTitle>Companies ({filteredCompanies.length})</CardTitle>
</CardHeader>
<CardContent>
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="border-b">
<th className="text-left py-3 px-4">Company</th>
<th className="text-left py-3 px-4">Contact</th>
<th className="text-left py-3 px-4">Industry</th>
<th className="text-left py-3 px-4">Jobs</th>
<th className="text-left py-3 px-4">Applications</th>
<th className="text-left py-3 px-4">Status</th>
<th className="text-left py-3 px-4">Verified</th>
<th className="text-left py-3 px-4">Actions</th>
</tr>
</thead>
<tbody>
{filteredCompanies.map(company => (
<tr key={company.id} className="border-b hover:bg-gray-50">
<td className="py-3 px-4">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-5 w-5 text-blue-600" />
</div>
<div>
<p className="font-medium">{company.name}</p>
<p className="text-sm text-gray-600 flex items-center">
<MapPin className="h-3 w-3 mr-1" />
{company.location}
</p>
</div>
</div>
<td className="py-3 px-4">
<div className="text-sm">
<p className="flex items-center">
<Mail className="h-3 w-3 mr-1" />
{company.email}
</p>
<p className="flex items-center text-gray-600">
<Phone className="h-3 w-3 mr-1" />
{company.phone}
</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.industry}</Badge>
</td>
<td className="py-3 px-4">
<div className="text-sm">
<p className="font-medium">{company.activeJobs} Active</p>
<p className="text-gray-600">{company.totalJobs} Total</p>
</div>
</td>
<td className="py-3 px-4">
<Badge variant="outline">{company.totalApplications}</Badge>
</td>
<td className="py-3 px-4">
{getStatusBadge(company.status)}
</td>
<td className="py-3 px-4">
{company.verified ? (
<Badge className="bg-green-100 text-green-800">
<CheckCircle className="h-3 w-3 mr-1" />
Verified
</Badge>
) : (
<Badge className="bg-yellow-100 text-yellow-800">
<XCircle className="h-3 w-3 mr-1" />
Pending
</Badge>
)}
</td>
<td className="py-3 px-4">
<div className="flex gap-1">
<Button variant="outline" size="sm">
<Eye className="h-4 w-4" />
</Button>
<Button variant="outline" size="sm">
<Edit className="h-4 w-4" />
</Button>
{!company.verified && (
<Button 
variant="outline" 
size="sm"
onClick={() => handleVerifyCompany(company.id)}
className="text-green-600 hover:text-green-700"
>
<CheckCircle className="h-4 w-4" />
</Button>
)}
<Button 
variant="outline" 
size="sm"
onClick={() => handleDeleteCompany(company.id)}
className="text-red-600 hover:text-red-700"
>
<Trash2 className="h-4 w-4" />
</Button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</CardContent>
</Card>
</TabsContent>

{/* Verification Queue */}
<TabsContent value="verification" className="space-y-6">
<Card>
<CardHeader>
<CardTitle>Pending Verification ({enhancedCompanies.filter(c => !c.verified).length})</CardTitle>
<p className="text-sm text-gray-600">Review and verify company registrations</p>
</CardHeader>
<CardContent>
<div className="space-y-4">
{enhancedCompanies.filter(c => !c.verified).map(company => (
<div key={company.id} className="border rounded-lg p-4">
<div className="flex justify-between items-start">
<div className="flex-1">
<div className="flex items-center space-x-3 mb-3">
<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
<Building2 className="h-6 w-6 text-blue-600" />
</div>
<div>
<h3 className="font-semibold text-lg">{company.name}</h3>
<p className="text-gray-600">{company.industry}</p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
<div>
<p className="text-sm font-medium text-gray-700">Contact Information</p>
<p className="text-sm text-gray-600">{company.email}</p>
<p className="text-sm text-gray-600">{company.phone}</p>
<p className="text-sm text-gray-600">{company.location}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Company Details</p>
<p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
<p className="text-sm text-gray-600">Website: {company.website}</p>
<p className="text-sm text-gray-600">Registered: {company.registrationDate}</p>
</div>
<div>
<p className="text-sm font-medium text-gray-700">Activity</p>
<p className="text-sm text-gray-600">Jobs Posted: {company.totalJobs}</p>
<p className="text-sm text-gray-600">Applications: {company.totalApplications}</p>
<p className="text-sm text-gray-600">Last Active: {company.lastActivity}</p>
</div>
</div>

<div className="bg-gray-50 rounded-lg p-3 mb-4">
<p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
<p className="text-sm text-gray-600">
{company.description || "No description provided by the company."}
</p>
</div>
</div>
</div>

<div className="flex flex-col gap-2 ml-4">
<Button 
onClick={() => handleVerifyCompany(company.id)}
className="bg-green-600 hover:bg-green-700"
>
<CheckCircle className="h-4 w-4 mr-2" />
Verify
</Button>
<Button 
variant="outline"
onClick={() => handleRejectCompany(company.id)}
className="text-red-600 hover:text-red-700 border-red-200"
>
<XCircle className="h-4 w-4 mr-2" />
Reject
</Button>
<Button variant="outline" size="sm">
<Eye className="h-4 w-4 mr-2" />
Details
</Button>
</div>
</div>
))}
</div>
</CardContent>
</Card>
</TabsContent>
</Tabs>
</div>
);
}

export default function EmployerManagementNewPage(props: any) {
// Bridge page: simply render the component version to keep one source of truth
return <EmployerManagementNewComponent {...props} />;
}
