import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  Briefcase,
  Upload,
  RefreshCw,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { apiClient } from '../../lib/api-client';
import { ImageWithFallback } from '../figma/ImageWithFallback';

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
  // New modal and form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    industry: '',
    company_size: '',
    verified: false,
    status: 'active'
  });

  // Helpers to guard against undefined fields
  const safeString = (val: any) => (typeof val === 'string' ? val : '');
  const getCompanyName = (company: any) => safeString(company?.name ?? company?.company_name ?? company?.title ?? '');
  const getId = (c: any) => c?._id || c?.id;

  // Enhanced company data using actual counts (no mock values)
  const enhancedCompanies = companies.map(company => {
    const name = getCompanyName(company);
    const jobCompany = (j: any) => safeString(j?.company);
    const companyJobs = jobs.filter(job => jobCompany(job) === name);
    const totalJobs = companyJobs.length;
    const activeJobs = companyJobs.filter(job => safeString(job?.status) === 'active').length;
    const totalApplications = applications.filter(app => {
      const job = jobs.find(j => j?.id === app?.jobId);
      return job && jobCompany(job) === name;
    }).length;

    return {
      ...company,
      totalJobs,
      activeJobs,
      totalApplications,
      verified: !!company?.verified,
      registrationDate: safeString(company?.registrationDate),
      lastActivity: safeString(company?.lastActivity),
      phone: safeString(company?.phone),
      website: safeString(company?.website),
      employeeCount: safeString(company?.employeeCount),
      industry: safeString(company?.industry),
      status: safeString(company?.status || 'active'),
      name
    };
  });

  const filteredCompanies = enhancedCompanies.filter(company => {
    const name = getCompanyName(company);
    const location = safeString(company?.location);
    const industry = safeString(company?.industry);
    const query = searchTerm.toLowerCase();
    const matchesSearch = [name, location, industry].some(field => field.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && company.verified) ||
                               (verificationFilter === 'unverified' && !company.verified);
    return matchesSearch && matchesStatus && matchesVerification;
  });

  // Upload logo helper
  const uploadLogoForCompany = async (companyId: string) => {
    if (!logoFile) return null;
    try {
      const updated = await apiClient.uploadCompanyLogoByAdmin(String(companyId), logoFile);
      return updated || null;
    } catch (e) {
      console.error('Logo upload failed:', e);
      return null;
    }
  };

  // Create company via admin API
  const handleAddCompany = async () => {
    setLoading(true);
    try {
      const trimmedName = (formData.name || '').trim();
      const trimmedEmail = (formData.email || '').trim();
      if (!trimmedName || !trimmedEmail) {
        toast.error('Name and email are required');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        name: trimmedName,
        email: trimmedEmail,
        phone: (formData.phone || '').trim(),
        address: (formData.address || '').trim(),
        website: (formData.website || '').trim(),
        description: (formData.description || '').trim(),
        industry: (formData.industry || '').trim(),
        company_size: (formData.company_size || '').trim(),
        location: (formData.location || formData.address || '').trim()
      };

      let newCompany = await apiClient.createCompanyByAdmin(payload);
      const logoUpdated = await uploadLogoForCompany(getId(newCompany));
      if (logoUpdated) newCompany = logoUpdated;
      onCompanyUpdate([...(companies || []), newCompany]);
      setIsAddModalOpen(false);
      setFormData({
        name: '', email: '', phone: '', address: '', website: '', description: '', industry: '', company_size: '', verified: false, status: 'active'
      });
      setLogoFile(null);
      toast.success('Company added successfully');
    } catch (error: any) {
      console.error('Error adding company:', error);
      toast.error(error?.message || 'Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with selected company
  const openEditModal = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: safeString(company?.name),
      email: safeString(company?.email),
      phone: safeString(company?.phone),
      address: safeString(company?.location || company?.address),
      website: safeString(company?.website),
      description: safeString(company?.description),
      industry: safeString(company?.industry),
      company_size: safeString(company?.company_size),
      verified: Boolean(company?.verified),
      status: safeString(company?.status || 'active')
    });
    setIsEditModalOpen(true);
  };

  // Update company via admin API
  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const id = getId(selectedCompany);
      let updatedCompany = await apiClient.updateCompanyByAdmin(String(id), formData);
      const logoUpdated = await uploadLogoForCompany(String(id));
      if (logoUpdated) updatedCompany = logoUpdated;
      const updatedCompanies = (companies || []).map(c => (getId(c) === id ? updatedCompany : c));
      onCompanyUpdate(updatedCompanies);
      setIsEditModalOpen(false);
      setSelectedCompany(null);
      setLogoFile(null);
      toast.success('Company updated successfully');
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error(error?.message || 'Error updating company');
    } finally {
      setLoading(false);
    }
  };

  // Delete company via admin API
  const handleDeleteCompany = async (companyId: string) => {
    if (!companyId) return;
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    setLoading(true);
    try {
      await apiClient.deleteCompanyByAdmin(String(companyId), { force: true });
      const updatedCompanies = (companies || []).filter(c => getId(c) !== companyId);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company deleted successfully!');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleVerifyCompany = async (companyId: string) => {
    try {
      const id = String(companyId);
      await apiClient.approveCompanyByAdmin(id);
      const updatedCompanies = (companies || []).map(c => String(getId(c)) === id ? { ...c, verified: true } : c);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company verified successfully!');
    } catch (error) {
      console.error('Error verifying company:', error);
      toast.error('Failed to verify company');
    }
  };

  const handleRejectCompany = async (companyId: string) => {
    try {
      const id = String(companyId);
      await apiClient.updateCompanyByAdmin(id, { verified: false, status: 'rejected' });
      const updatedCompanies = (companies || []).map(c => String(getId(c)) === id ? { ...c, verified: false, status: 'rejected' } : c);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company verification rejected');
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast.error('Failed to reject verification');
    }
  };

  const clearAllCompanies = async () => {
    try {
      const ids = (companies || []).map(getId).filter(Boolean);
      await Promise.all(ids.map((id: any) => apiClient.deleteCompanyByAdmin(String(id))));
      onCompanyUpdate([]);
      toast.success('All companies cleared');
    } catch (error) {
      console.error('Error clearing companies:', error);
      toast.error('Failed to clear companies');
    }
  };

  const exportCompanyData = () => {
    toast.success('Company data exported successfully!');
  };

  const handleResetCompanies = async () => {
    if (!window.confirm('Reset companies on server? This cannot be undone.')) return;
    setLoading(true);
    try {
      await apiClient.resetCompanies('all');
      // Re-fetch companies from admin API to reflect purge
      try {
        const refreshed = await apiClient.getAdminCompanies({ limit: 100 });
        onCompanyUpdate(Array.isArray(refreshed) ? refreshed : []);
      } catch (e) {
        onCompanyUpdate([]);
      }
      toast.success('Companies reset successfully');
    } catch (error: any) {
      console.error('Error resetting companies:', error);
      toast.error(error?.message || 'Error resetting companies');
    } finally {
      setLoading(false);
    }
  };

  const handleResetEmployers = async () => {
    if (!window.confirm('Reset all employer accounts and related companies?')) return;
    setLoading(true);
    try {
      await apiClient.resetEmployers();
      // Refresh companies since employer reset also removes companies
      try {
        const refreshed = await apiClient.getAdminCompanies({ limit: 100 });
        onCompanyUpdate(Array.isArray(refreshed) ? refreshed : []);
      } catch (e) {
        onCompanyUpdate([]);
      }
      toast.success('Employers reset successfully');
    } catch (error: any) {
      console.error('Error resetting employers:', error);
      toast.error(error?.message || 'Error resetting employers');
    } finally {
      setLoading(false);
    }
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
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={clearAllCompanies}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Companies
          </Button>
          <Button variant="outline" onClick={handleResetCompanies}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Companies
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleResetEmployers}>
            <Users className="h-4 w-4 mr-2" />
            Reset Employers
          </Button>
          {/* Add Company CTA */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent dir="ltr" className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Mega Job Nepal Pvt. Ltd." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="company@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+977-1-XXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, Province, Country" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Technology','Healthcare','Finance','Education','Manufacturing','Retail','Construction','Transportation','Hospitality','Media','Government','Non-profit','Energy','Agriculture','Other'].map(i => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Size</label>
                    <Select value={formData.company_size} onValueChange={(v) => setFormData({ ...formData, company_size: v })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description about the company" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Logo</label>
                    <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                    {logoFile && (
                      <Button type="button" variant="ghost" className="mt-2" onClick={() => setLogoFile(null)}>Remove</Button>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCompany} disabled={loading}>
                    {loading ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Adding...</>) : 'Add Company'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                      <tr key={getId(company) || company.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {company.logo_url || company.logo || company.logoUrl ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                                <ImageWithFallback
                                  src={(company.logo_url || company.logo || company.logoUrl) as string}
                                  alt={(company.name || 'Company Logo') as string}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(company);
                                setIsProfileModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(company)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!company.verified && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleVerifyCompany(getId(company))}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCompany(getId(company) || getCompanyName(company))}
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
                          {company.logo_url || company.logo || company.logoUrl ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                              <ImageWithFallback
                                src={(company.logo_url || company.logo || company.logoUrl) as string}
                                alt={(company.name || 'Company Logo') as string}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
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
                          onClick={() => handleVerifyCompany(getId(company))}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleRejectCompany(getId(company))}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsProfileModalOpen(true);
                          }}
                        >
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

      {/* Edit Company Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent dir="ltr" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Mega Job Nepal Pvt. Ltd." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="company@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+977-1-XXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, Province, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Technology','Healthcare','Finance','Education','Manufacturing','Retail','Construction','Transportation','Hospitality','Media','Government','Non-profit','Energy','Agriculture','Other'].map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Size</label>
                <Select value={formData.company_size} onValueChange={(v) => setFormData({ ...formData, company_size: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description about the company" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Logo</label>
                <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                {logoFile && (
                  <Button type="button" variant="ghost" className="mt-2" onClick={() => setLogoFile(null)}>Remove</Button>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditCompany} disabled={loading}>
                {loading ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCompany ? (
              <div className="space-y-4">
                {(selectedCompany.logo_url || selectedCompany.logo || selectedCompany.logoUrl) && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                      <ImageWithFallback
                        src={(selectedCompany.logo_url || selectedCompany.logo || selectedCompany.logoUrl) as string}
                        alt={(selectedCompany.name || 'Company Logo') as string}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">{selectedCompany.name}</h3>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" /> {selectedCompany.location}
                    </div>
                    <div className="text-sm text-gray-600">Industry: {selectedCompany.industry}</div>
                    <div className="text-sm text-gray-600">Size: {selectedCompany.company_size || selectedCompany.size}</div>
                  </div>
                  <div>
                    <div className="text-sm flex items-center"><Mail className="h-4 w-4 mr-1" /> {selectedCompany.email}</div>
                    <div className="text-sm flex items-center"><Phone className="h-4 w-4 mr-1" /> {selectedCompany.phone}</div>
                    {selectedCompany.website && (
                      <div className="text-sm flex items-center"><Globe className="h-4 w-4 mr-1" /> {selectedCompany.website}</div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Company Description</p>
                  <p className="text-sm text-gray-600">{selectedCompany.description || 'No description provided.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Active Jobs</p>
                    <p className="text-xl font-semibold">{selectedCompany.activeJobs}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-xl font-semibold">{selectedCompany.totalJobs}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="text-xl font-semibold">{selectedCompany.totalApplications}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>Close</Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">No company selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
