import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import companyParameterService from '../../services/companyParameterService';

interface Company {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  industry?: string;
  company_size?: string;
  logo_url?: string;
  verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  job_count?: number;
  employee_count?: number;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  industry: string;
  company_size: string;
  verified: boolean;
  status: 'active' | 'inactive' | 'suspended';
}

interface CompanyManagementNewProps {
  companies: Company[];
  onCompanyUpdate: (companies: Company[]) => void;
}

export function CompanyManagementNew({ companies, onCompanyUpdate }: CompanyManagementNewProps) {
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState<string>('list');
  // Inline tabs replace the old add modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
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

  const DEFAULT_INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Government', 'Non-profit', 'Energy', 'Agriculture', 'Other'
  ];
  const [industryOptions, setIndustryOptions] = useState<string[]>(DEFAULT_INDUSTRIES);

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  // Load industry options from service
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await companyParameterService.list('industry');
        // Normalize to array of names, supporting either objects or strings
        const names = Array.isArray(items)
          ? items.map((it) => (typeof it === 'string' ? it : it?.name)).filter(Boolean)
          : [];
        if (mounted && names.length) {
          setIndustryOptions(names as string[]);
        }
      } catch (err) {
        // keep defaults on error
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Reset Add Company form when switching to the add tab
  useEffect(() => {
    if (activeTab === 'add') {
      setFormData({
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
      setLogoFile(null);
    }
  }, [activeTab]);

  // Filter and sort companies
  useEffect(() => {
    let filtered = [...companies];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }
    
    // Verification filter
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter(company => company.verified === isVerified);
    }
    
    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'jobs':
          return (b.job_count || 0) - (a.job_count || 0);
        case 'employees':
          return (b.employee_count || 0) - (a.employee_count || 0);
        default:
          return 0;
      }
    });
    
    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter, verificationFilter, industryFilter, sortBy]);

  // Reset form
  const resetForm = () => {
    setFormData({
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
  };

  const uploadLogoForCompany = async (companyId: string) => {
    if (!logoFile) return null;
    try {
      const fd = new FormData();
      fd.append('logo', logoFile);
      const token = localStorage.getItem('megajobnepal_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const resp = await fetch(`/api/admin/companies/${companyId}/upload-logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (resp.ok) {
        const updated = await resp.json();
        return (updated?.company) ? updated.company : updated;
      }
    } catch (e) {
      console.error('Logo upload failed:', e);
    }
    return null;
  };

  // Handle add company
  const handleAddCompany = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('megajobnepal_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        let newCompany = await response.json();
        // If backend wraps company in { company }, unwrap
        if (newCompany?.company) newCompany = newCompany.company;
        // Upload logo if selected
        const logoUpdated = await uploadLogoForCompany(newCompany._id);
        if (logoUpdated) {
          newCompany = logoUpdated;
        }
        const updatedCompanies = [...companies, newCompany];
        onCompanyUpdate(updatedCompanies);
        setActiveTab('list');
        resetForm();
        setLogoFile(null);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Add company failed:', err);
      }
    } catch (error) {
      console.error('Error adding company:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit company
  const handleEditCompany = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('megajobnepal_auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const response = await fetch(`/api/admin/companies/${selectedCompany._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        let updatedCompany = await response.json();
        if (updatedCompany?.company) updatedCompany = updatedCompany.company;
        // Upload logo if a new file is selected
        const logoUpdated = await uploadLogoForCompany(selectedCompany._id);
        if (logoUpdated) {
          updatedCompany = logoUpdated;
        }
        const updatedCompanies = companies.map(company =>
          company._id === selectedCompany._id ? updatedCompany : company
        );
        onCompanyUpdate(updatedCompanies);
        setIsEditModalOpen(false);
        setSelectedCompany(null);
        resetForm();
        setLogoFile(null);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Update company failed:', err);
      }
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete company
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${selectedCompany._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const updatedCompanies = companies.filter(company => company._id !== selectedCompany._id);
        onCompanyUpdate(updatedCompanies);
        setIsDeleteModalOpen(false);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      website: company.website || '',
      description: company.description || '',
      industry: company.industry || '',
      company_size: company.company_size || '',
      verified: company.verified,
      status: company.status
    });
    setActiveTab('edit');
  };

  // Open delete modal
  const openDeleteModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'inactive': return <XCircle className="h-3 w-3" />;
      case 'suspended': return <AlertCircle className="h-3 w-3" />;
      default: return <XCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600">Manage company profiles and information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Building2 className="h-3 w-3 mr-1" />
            {companies.length} Companies
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab('add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold">{companies.length}</p>
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
                  {companies.filter(c => c.verified).length}
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
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {companies.filter(c => c.status === 'suspended').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inline Tabs for list and add */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Company List</TabsTrigger>
          <TabsTrigger value="add">+ Add Company</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search companies by name, email, or industry..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industryOptions.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="jobs">Job Count</SelectItem>
                <SelectItem value="employees">Employees</SelectItem>
              </SelectContent>
            </Select>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <div className="space-y-4">
            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                    <p className="text-gray-600">Try adjusting your filters or add a new company.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredCompanies.map((company) => (
                <Card key={company._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={`${company.name} logo`} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {company.verified && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge className={getStatusColor(company.status)}>
                            {getStatusIcon(company.status)}
                            <span className="ml-1 capitalize">{company.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {company.email}
                          </div>
                          {company.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {company.phone}
                            </div>
                          )}
                          {company.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <a href={company.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline">
                                {company.website}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {company.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {company.address}
                            </div>
                          )}
                          {company.industry && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {company.industry}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            Joined: {new Date(company.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {company.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {company.job_count !== undefined && (
                            <span>{company.job_count} Jobs</span>
                          )}
                          {company.employee_count !== undefined && (
                            <span>{company.employee_count} Employees</span>
                          )}
                          {company.company_size && (
                            <span>Size: {company.company_size}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(company)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(company)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

      {/* Inline Add Company Tab */}
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle>Add New Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter company address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Size</label>
                  <Select value={formData.company_size} onValueChange={(value) => setFormData({...formData, company_size: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div dir="ltr" className="text-left">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({...formData, description: value})}
                    placeholder="Enter company description"
                    showImageUpload={false}
                    showLinkInsert={true}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="verified-add"
                    checked={formData.verified}
                    onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                  />
                  <label htmlFor="verified-add" className="text-sm font-medium">Verified Company</label>
                </div>
              </div>
              
              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md border bg-gray-50 overflow-hidden flex items-center justify-center">
                    {logoFile ? (
                      <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLogoFile(file);
                      }}
                    />
                    {logoFile && (
                      <Button type="button" variant="ghost" className="mt-2" onClick={() => setLogoFile(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  Cancel
                </Button>
                <Button onClick={handleAddCompany} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Company'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      {/* Edit Company Tab */}
      <TabsContent value="edit">
        <Card>
          <CardHeader>
            <CardTitle>Edit Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="company@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="Enter website URL" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter company address" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Size</label>
                  <Select value={formData.company_size} onValueChange={(value) => setFormData({ ...formData, company_size: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div dir="ltr" className="text-left">
                  <RichTextEditor value={formData.description} onChange={(value) => setFormData({ ...formData, description: value })} placeholder="Enter company description" showImageUpload={false} showLinkInsert={true} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input type="checkbox" id="verified-edit" checked={formData.verified} onChange={(e) => setFormData({ ...formData, verified: e.target.checked })} />
                  <label htmlFor="verified-edit" className="text-sm font-medium">Verified Company</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab('list')}>Cancel</Button>
                <Button onClick={handleEditCompany} disabled={loading || !formData.name || !formData.email}>{loading ? (<><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Updating...</>) : ('Update Company')}</Button>
              </div>
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
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter company address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Size</label>
                <Select value={formData.company_size} onValueChange={(value) => setFormData({...formData, company_size: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <div dir="ltr" className="text-left">
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({...formData, description: value})}
                  placeholder="Enter company description"
                  showImageUpload={false}
                  showLinkInsert={true}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="verified-edit"
                  checked={formData.verified}
                  onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                />
                <label htmlFor="verified-edit" className="text-sm font-medium">Verified Company</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCompany} disabled={loading || !formData.name || !formData.email}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Company'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedCompany?.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCompany}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Company'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}