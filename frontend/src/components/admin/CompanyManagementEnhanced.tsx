import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Search, Building2, MapPin, Users, Upload, Camera, Briefcase, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { apiClient } from '../../lib/api-client';

interface CompanyManagementEnhancedProps {
  companies: any[];
  jobs: any[];
  onCompanyUpdate: (companies: any[]) => void;
}

export function CompanyManagementEnhanced({ companies, jobs, onCompanyUpdate }: CompanyManagementEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    location: '',
    mapLocation: '',
    size: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    founded: '',
    benefits: '',
    specialties: '',
    profileImage: null as File | null,
    logoUrl: '',
    culture: '',
    mission: '',
    vision: '',
    values: '',
    establishedYear: '',
    companyType: 'Private',
    headquarters: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    workingHours: '9:00 AM - 6:00 PM',
    totalEmployees: '',
    verified: false,
    featured: false,
    category: 'Technology'
  });

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetNewCompany = () => {
    setNewCompany({
      name: '',
      industry: '',
      location: '',
      mapLocation: '',
      size: '',
      description: '',
      website: '',
      email: '',
      phone: '',
      founded: '',
      benefits: '',
      specialties: '',
      profileImage: null,
      logoUrl: '',
      culture: '',
      mission: '',
      vision: '',
      values: '',
      establishedYear: '',
      companyType: 'Private',
      headquarters: '',
      linkedin: '',
      facebook: '',
      twitter: '',
      workingHours: '9:00 AM - 6:00 PM',
      totalEmployees: '',
      verified: false,
      featured: false,
      category: 'Technology'
    });
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.industry || !newCompany.location || !newCompany.description) {
      toast.error('Please fill in all required fields (Name, Industry, Location, Description)');
      return;
    }

    try {
      const payload: any = {
        name: newCompany.name,
        industry: newCompany.industry,
        location: newCompany.location,
        address: newCompany.headquarters || newCompany.location,
        website: newCompany.website,
        email: newCompany.email,
        phone: newCompany.phone,
        description: newCompany.description,
        company_size: newCompany.size,
        founded_year: newCompany.founded ? Number(newCompany.founded) : undefined,
        headquarters: newCompany.headquarters,
        mapLocation: newCompany.mapLocation,
        mission: newCompany.mission,
        vision: newCompany.vision,
        values: newCompany.values.split('\n').filter(v => v.trim()),
        benefits: newCompany.benefits.split('\n').filter(b => b.trim()),
        specialties: newCompany.specialties.split('\n').filter(s => s.trim()),
        linkedin: newCompany.linkedin,
        facebook: newCompany.facebook,
        twitter: newCompany.twitter,
        verified: newCompany.verified,
        featured: newCompany.featured,
        category: newCompany.category,
        status: 'active'
      };

      const created = await apiClient.createCompanyByAdmin(payload);

      if (newCompany.profileImage) {
        try {
          await apiClient.uploadCompanyLogoByAdmin(created._id || created.id, newCompany.profileImage);
        } catch (e) {
          console.warn('Logo upload failed:', e);
        }
      }

      onCompanyUpdate([...(companies || []), created]);
      setIsCreateModalOpen(false);
      resetNewCompany();
      toast.success('Company created successfully!');
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast.error(error?.message || 'Failed to create company');
    }
  };

  const handleEditCompany = async () => {
    if (!selectedCompany) return;

    try {
      const id = selectedCompany._id || selectedCompany.id;
      const payload: any = {
        name: selectedCompany.name,
        industry: selectedCompany.industry,
        location: selectedCompany.location,
        address: selectedCompany.headquarters || selectedCompany.location,
        website: selectedCompany.website,
        email: selectedCompany.email,
        phone: selectedCompany.phone,
        description: selectedCompany.description,
        company_size: selectedCompany.size,
        founded_year: selectedCompany.founded ? Number(selectedCompany.founded) : undefined,
        headquarters: selectedCompany.headquarters,
        mapLocation: selectedCompany.mapLocation,
        mission: selectedCompany.mission,
        vision: selectedCompany.vision,
        values: Array.isArray(selectedCompany.values) ? selectedCompany.values : selectedCompany.values.split('\n').filter((v: string) => v.trim()),
        benefits: Array.isArray(selectedCompany.benefits) ? selectedCompany.benefits : selectedCompany.benefits.split('\n').filter((b: string) => b.trim()),
        specialties: Array.isArray(selectedCompany.specialties) ? selectedCompany.specialties : selectedCompany.specialties.split('\n').filter((s: string) => s.trim()),
        linkedin: selectedCompany.linkedin,
        facebook: selectedCompany.facebook,
        twitter: selectedCompany.twitter,
        verified: !!selectedCompany.verified,
        featured: !!selectedCompany.featured,
        category: selectedCompany.category,
        status: selectedCompany.status || 'active'
      };

      const updated = await apiClient.updateCompanyByAdmin(id, payload);

      const updatedCompanies = companies.map(company =>
        (company._id || company.id) === id
          ? { ...company, ...updated, lastUpdated: new Date().toISOString().split('T')[0] }
          : company
      );

      onCompanyUpdate(updatedCompanies);
      setIsEditModalOpen(false);
      setSelectedCompany(null);
      toast.success('Company updated successfully!');
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error(error?.message || 'Failed to update company');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    const company = companies.find(c => (c.id || c._id || c.name) === companyId);
    const hasJobs = jobs.some(job => job.company === company?.name);

    if (hasJobs) {
      toast.error('Cannot delete company with active job postings!');
      return;
    }

    if (confirm('Are you sure you want to delete this company?')) {
      try {
        const id = company?._id || company?.id || companyId;
        await apiClient.deleteCompanyByAdmin(String(id));
        const updatedCompanies = companies.filter(c => (c._id || c.id || c.name) !== companyId);
        onCompanyUpdate(updatedCompanies);
        toast.success('Company deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting company:', error);
        toast.error(error?.message || 'Failed to delete company');
      }
    }
  };

  const handleVerifyCompany = async (companyId: string) => {
    try {
      const company = companies.find(c => (c._id || c.id || c.name) === companyId);
      if (!company) return;
      const id = company._id || company.id || companyId;
      const newVerified = !company.verified;

      let serverCompany: any;
      if (newVerified) {
        serverCompany = await apiClient.approveCompanyByAdmin(String(id));
      } else {
        serverCompany = await apiClient.updateCompanyByAdmin(String(id), { status: 'inactive', verified: false });
      }

      const updatedCompanies = companies.map(c =>
        (c._id || c.id || c.name) === companyId
          ? { ...c, ...serverCompany, verified: newVerified }
          : c
      );
      onCompanyUpdate(updatedCompanies);
      toast.success('Company verification status updated!');
    } catch (error: any) {
      console.error('Error verifying company:', error);
      toast.error(error?.message || 'Failed to update verification status');
    }
  };

  const getJobCount = (companyName: string) => {
    return jobs.filter(job => job.company === companyName).length;
  };

  const CompanyFormFields = ({ company, setCompany }: any) => (
    <div className="space-y-6">
      {/* Company Logo Upload */}
      <div className="space-y-2">
        <Label>Company Profile Picture/Logo</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {company.profileImage ? (
            <div className="space-y-2">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                <ImageWithFallback
                  src={URL.createObjectURL(company.profileImage)}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600">{company.profileImage.name}</p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setCompany({ ...company, profileImage: null })}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Upload company logo or profile picture</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompany({ ...company, profileImage: e.target.files?.[0] || null })}
                className="hidden"
                id="profile-image-upload"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('profile-image-upload')?.click()}
                className="mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
            placeholder="e.g. Himalayan Bank Limited"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Input
            id="industry"
            value={company.industry}
            onChange={(e) => setCompany({ ...company, industry: e.target.value })}
            placeholder="e.g. Banking & Finance"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={company.location}
            onChange={(e) => setCompany({ ...company, location: e.target.value })}
            placeholder="e.g. Kathmandu, Nepal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headquarters">Headquarters</Label>
          <Input
            id="headquarters"
            value={company.headquarters || ''}
            onChange={(e) => setCompany({ ...company, headquarters: e.target.value })}
            placeholder="e.g. Kathmandu, Nepal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Company Size</Label>
          <Select
            value={company.size}
            onValueChange={(value) => setCompany({ ...company, size: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyType">Company Type</Label>
          <Select
            value={company.companyType || 'Private'}
            onValueChange={(value) => setCompany({ ...company, companyType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="NGO">NGO</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Startup">Startup</SelectItem>
              <SelectItem value="Corporation">Corporation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="founded">Founded Year</Label>
          <Input
            id="founded"
            value={company.founded}
            onChange={(e) => setCompany({ ...company, founded: e.target.value })}
            placeholder="e.g. 1993"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Company Category</Label>
          <Select
            value={company.category || 'Technology'}
            onValueChange={(value) => setCompany({ ...company, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Banking">Banking</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="Tourism">Tourism</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={company.website}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
            placeholder="e.g. https://www.example.com"
            type="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            value={company.email}
            onChange={(e) => setCompany({ ...company, email: e.target.value })}
            placeholder="e.g. info@company.com"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Contact Phone</Label>
          <Input
            id="phone"
            value={company.phone}
            onChange={(e) => setCompany({ ...company, phone: e.target.value })}
            placeholder="e.g. +977-1-4123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workingHours">Working Hours</Label>
          <Input
            id="workingHours"
            value={company.workingHours || '9:00 AM - 6:00 PM'}
            onChange={(e) => setCompany({ ...company, workingHours: e.target.value })}
            placeholder="e.g. 9:00 AM - 6:00 PM"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            value={company.logoUrl || ''}
            onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            type="url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mapLocation">Map Location (Google Maps Link)</Label>
          <Input
            id="mapLocation"
            value={company.mapLocation || ''}
            onChange={(e) => setCompany({ ...company, mapLocation: e.target.value })}
            placeholder="https://goo.gl/maps/yourcompanylocation"
            type="url"
          />
        </div>

        {/* Company Details */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Company Description *</Label>
          <Textarea
            id="description"
            value={company.description}
            onChange={(e) => setCompany({ ...company, description: e.target.value })}
            placeholder="Describe the company, its mission, and values..."
            rows={4}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="mission">Company Mission</Label>
          <Textarea
            id="mission"
            value={company.mission || ''}
            onChange={(e) => setCompany({ ...company, mission: e.target.value })}
            placeholder="What is your company's mission?"
            rows={2}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="vision">Company Vision</Label>
          <Textarea
            id="vision"
            value={company.vision || ''}
            onChange={(e) => setCompany({ ...company, vision: e.target.value })}
            placeholder="What is your company's vision for the future?"
            rows={2}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="culture">Company Culture</Label>
          <Textarea
            id="culture"
            value={company.culture || ''}
            onChange={(e) => setCompany({ ...company, culture: e.target.value })}
            placeholder="Describe your company culture and work environment..."
            rows={3}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="specialties">Specialties (one per line)</Label>
          <Textarea
            id="specialties"
            value={Array.isArray(company.specialties) ? company.specialties.join('\n') : company.specialties}
            onChange={(e) => setCompany({ ...company, specialties: e.target.value })}
            placeholder="Specialty 1&#10;Specialty 2&#10;Specialty 3"
            rows={3}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="benefits">Employee Benefits (one per line)</Label>
          <Textarea
            id="benefits"
            value={Array.isArray(company.benefits) ? company.benefits.join('\n') : company.benefits}
            onChange={(e) => setCompany({ ...company, benefits: e.target.value })}
            placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
            rows={3}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="values">Company Values (one per line)</Label>
          <Textarea
            id="values"
            value={Array.isArray(company.values) ? company.values.join('\n') : (company.values || '')}
            onChange={(e) => setCompany({ ...company, values: e.target.value })}
            placeholder="Value 1&#10;Value 2&#10;Value 3"
            rows={3}
          />
        </div>

        {/* Social Media Links */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-medium mb-3">Social Media & Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={company.linkedin || ''}
                onChange={(e) => setCompany({ ...company, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/yourcompany"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={company.facebook || ''}
                onChange={(e) => setCompany({ ...company, facebook: e.target.value })}
                placeholder="https://facebook.com/yourcompany"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={company.twitter || ''}
                onChange={(e) => setCompany({ ...company, twitter: e.target.value })}
                placeholder="https://twitter.com/yourcompany"
                type="url"
              />
            </div>
          </div>
        </div>

        {/* Company Status */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-medium mb-3">Company Status</h4>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={company.verified || false}
                onChange={(e) => setCompany({ ...company, verified: e.target.checked })}
                className="rounded"
              />
              <span>Verified Company</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={company.featured || false}
                onChange={(e) => setCompany({ ...company, featured: e.target.checked })}
                className="rounded"
              />
              <span>Featured Company</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Company Management</h2>
          <p className="text-gray-600">Manage employer companies and profiles</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Company
            </Button>
          </DialogTrigger>
          <DialogContent dir="ltr" className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Add a new company to the platform with complete profile information.
              </DialogDescription>
            </DialogHeader>
            <CompanyFormFields company={newCompany} setCompany={setNewCompany} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompany}>
                Create Company
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search companies by name, industry, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-xl font-bold">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-xl font-bold">{companies.filter(c => c.verified).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id || company.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <ImageWithFallback
                      src={company.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop'}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {company.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {company.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {company.size} • {getJobCount(company.name)} active jobs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {company.category || company.industry}
                </div>
                {company.website && (
                  <div className="flex items-center text-sm text-blue-600">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCompany(company);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerifyCompany(company.id || company.name)}
                    className={company.verified ? "text-yellow-600" : "text-green-600"}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCompany(company.id || company.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-xs">
                  Created: {company.registrationDate || 'Unknown'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Company Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent dir="ltr" className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information and profile details.
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <CompanyFormFields company={selectedCompany} setCompany={setSelectedCompany} />
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCompany}>
              Update Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first company.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Company
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
