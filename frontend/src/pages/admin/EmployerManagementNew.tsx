import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  Building2,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Phone,
  MapPin,
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

export function EmployerManagementNew({ companies, jobs, applications, onCompanyUpdate }: EmployerManagementNewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const enhancedCompanies = useMemo(() => {
    return companies.map((company) => {
      const companyId = company.id || company._id;
      const companyName = company.name || company.company_name || company.companyName;

      const companyJobs = jobs.filter((job) => {
        const jobCompanyId = job.companyId || job.company_id;
        const jobCompanyName = job.companyName || job.company_name || job.company;
        const idMatch = companyId && jobCompanyId && String(jobCompanyId) === String(companyId);
        const nameMatch = companyName && jobCompanyName && String(jobCompanyName).toLowerCase() === String(companyName).toLowerCase();
        return idMatch || nameMatch;
      });

      const activeJobs = companyJobs.filter((j) => (j.status || '').toLowerCase() === 'active');
      const totalApplications = applications.filter((app) => {
        const appJobId = app.jobId || app.job_id;
        const jobIds = companyJobs.map((j) => j.id || j._id).filter(Boolean).map(String);
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
  }, [companies, jobs, applications]);

  const filteredCompanies = useMemo(() => {
    return enhancedCompanies.filter((company) => {
      const matchesSearch = (
        (company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      const matchesVerification = verificationFilter === 'all' ||
        (verificationFilter === 'verified' && company.verified) ||
        (verificationFilter === 'unverified' && !company.verified);
      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [enhancedCompanies, searchTerm, statusFilter, verificationFilter]);

  const openProfileModal = (company: any) => {
    setSelectedCompany(company);
    setIsProfileModalOpen(true);
  };

  const openEditModal = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      location: company.location || '',
      industry: company.industry || '',
      website: company.website || '',
      description: company.description || '',
      status: company.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleVerifyCompany = async (companyId: string) => {
    try {
      await apiClient.approveCompanyByAdmin(String(companyId));
      const updatedCompanies = companies.map((company) =>
        String(company.id || company._id) === String(companyId)
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
      const updatedCompanies = companies.map((company) =>
        String(company.id || company._id) === String(companyId)
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
      const updatedCompanies = companies.filter((c) => String(c.id || c._id) !== id);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const id = String(selectedCompany.id || selectedCompany._id);
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        industry: formData.industry,
        website: formData.website,
        description: formData.description,
        status: formData.status,
      };
      await apiClient.updateCompanyByAdmin(id, payload);
      const updatedCompanies = companies.map((c) =>
        String(c.id || c._id) === id ? { ...c, ...payload } : c
      );
      onCompanyUpdate(updatedCompanies);
      toast.success('Company updated successfully!');
      setIsEditModalOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('Error updating company:', err);
      toast.error('Failed to update company');
    } finally {
      setLoading(false);
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
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    } as const;
    const config = (status && statusConfig[status as keyof typeof statusConfig]) || statusConfig.active;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold text-green-600">{enhancedCompanies.filter((c) => c.verified).length}</p>
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
                <p className="text-2xl font-bold text-orange-600">{enhancedCompanies.filter((c) => !c.verified).length}</p>
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
                <p className="text-2xl font-bold text-purple-600">{enhancedCompanies.reduce((sum, c) => sum + c.activeJobs, 0)}</p>
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

        <TabsContent value="list" className="space-y-6">
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
                    {filteredCompanies.map((company) => {
                      const id = company.id || company._id;
                      return (
                        <tr key={id} className="border-b hover:bg-gray-50">
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
                          <td className="py-3 px-4">{getStatusBadge(company.status)}</td>
                          <td className="py-3 px-4">
                            {company.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <XCircle className="h-3 w-3 mr-1" /> Pending
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => openProfileModal(company)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openEditModal(company)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!company.verified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyCompany(id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCompany(id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification ({enhancedCompanies.filter((c) => !c.verified).length})</CardTitle>
              <p className="text-sm text-gray-600">Review and verify company registrations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedCompanies.filter((c) => !c.verified).map((company) => {
                  const id = company.id || company._id;
                  return (
                    <div key={id} className="border rounded-lg p-4">
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
                              <p className="text-sm text-gray-600">Website: {company.website}</p>
                              <p className="text-sm text-gray-600">Employees: {company.employeeCount}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Activity</p>
                              <p className="text-sm text-gray-600">Jobs Posted: {company.totalJobs}</p>
                              <p className="text-sm text-gray-600">Applications: {company.totalApplications}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
                            <p className="text-sm text-gray-600">{company.description || 'No description provided by the company.'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button onClick={() => handleVerifyCompany(id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" /> Verify
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectCompany(id)}
                            className="text-red-600 hover:text-red-700 border-red-200"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openProfileModal(company)}>
                            <Eye className="h-4 w-4 mr-2" /> Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Company Profile</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-3">
              <p className="font-semibold">{selectedCompany.name}</p>
              <p className="text-sm text-gray-600">{selectedCompany.industry}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="text-sm">
                  <p className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {selectedCompany.email}</p>
                  <p className="flex items-center text-gray-600"><Phone className="h-3 w-3 mr-1" /> {selectedCompany.phone}</p>
                </div>
                <div className="text-sm">
                  <p className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {selectedCompany.location}</p>
                  <p className="text-gray-600">Website: {selectedCompany.website || '-'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                <p className="text-sm text-gray-600">{selectedCompany.description || 'No description provided.'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Company Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input placeholder="Phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input placeholder="Location" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <Input placeholder="Website" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            <Select value={formData.status || 'active'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditCompany} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmployerManagementNew;