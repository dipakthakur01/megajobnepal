import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Search, Building2, MapPin, Users, Upload, Camera, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CompanyManagementProps {
  companies: any[];
  jobs: any[];
  onCompanyUpdate: (companies: any[]) => void;
}

export function CompanyManagement({ companies, jobs, onCompanyUpdate }: CompanyManagementProps) {
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

  // Pagination for Companies list
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleCreateCompany = () => {
    const company = {
      ...newCompany,
      id: Date.now().toString(),
      benefits: newCompany.benefits.split('\n').filter(b => b.trim()),
      specialties: newCompany.specialties.split('\n').filter(s => s.trim()),
      values: newCompany.values.split('\n').filter(v => v.trim()),
      logo: newCompany.profileImage ? URL.createObjectURL(newCompany.profileImage) : 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      verified: false,
      status: 'active',
      registrationDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0]
    };

    onCompanyUpdate([...companies, company]);
    setIsCreateModalOpen(false);
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
    toast.success('Company created successfully!');
  };

  const handleEditCompany = () => {
    if (!selectedCompany) return;

    const updatedCompanies = companies.map(company =>
      company.name === selectedCompany.name
        ? {
            ...selectedCompany,
            benefits: Array.isArray(selectedCompany.benefits)
              ? selectedCompany.benefits
              : selectedCompany.benefits.split('\n').filter((b: string) => b.trim()),
            specialties: Array.isArray(selectedCompany.specialties)
              ? selectedCompany.specialties
              : selectedCompany.specialties.split('\n').filter((s: string) => s.trim())
          }
        : company
    );

    onCompanyUpdate(updatedCompanies);
    setIsEditModalOpen(false);
    setSelectedCompany(null);
    toast.success('Company updated successfully!');
  };

  const handleDeleteCompany = (companyName: string) => {
    const hasJobs = jobs.some(job => job.company === companyName);
    if (hasJobs) {
      toast.error('Cannot delete company with active job postings!');
      return;
    }

    if (confirm('Are you sure you want to delete this company?')) {
      const updatedCompanies = companies.filter(company => company.name !== companyName);
      onCompanyUpdate(updatedCompanies);
      toast.success('Company deleted successfully!');
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
        <Label htmlFor="mapLocation">Map Location (for directions)</Label>
        <Input
          id="mapLocation"
          value={company.mapLocation || ''}
          onChange={(e) => setCompany({ ...company, mapLocation: e.target.value })}
          placeholder="e.g. https://goo.gl/maps/yourcompanylocation"
        />
        <p className="text-xs text-gray-500">Google Maps link for "Get Directions" functionality</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Company Size</Label>
        <Input
          id="size"
          value={company.size}
          onChange={(e) => setCompany({ ...company, size: e.target.value })}
          placeholder="e.g. 1000+ employees"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={company.website}
          onChange={(e) => setCompany({ ...company, website: e.target.value })}
          placeholder="e.g. https://www.example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="founded">Founded Year</Label>
        <Input
          id="founded"
          value={company.founded}
          onChange={(e) => setCompany({ ...company, founded: e.target.value })}
          placeholder="e.g. 1993"
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

        {/* Additional Company Branding Fields */}
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
          <Label htmlFor="values">Company Values (one per line)</Label>
          <Textarea
            id="values"
            value={Array.isArray(company.values) ? company.values.join('\n') : (company.values || '')}
            onChange={(e) => setCompany({ ...company, values: e.target.value })}
            placeholder="Value 1&#10;Value 2&#10;Value 3"
            rows={3}
          />
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

      {/* Search */}
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

      {/* Companies Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Recruiters</p>
                <p className="text-xl font-bold">{companies.filter(c => getJobCount(c.name) > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Top Location</p>
                <p className="text-xl font-bold">Kathmandu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedCompanies.map((company, idx) => {
              const jobCount = getJobCount(company.name);
              return (
                <div key={company.name} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-sm text-gray-600 w-6 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {company.logo ? (
                            <ImageWithFallback
                              src={company.logo}
                              alt={company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.industry}</p>
                          {company.verified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600"><strong>Location:</strong></p>
                          <p>{company.location}</p>
                        </div>
                        {company.size && (
                          <div>
                            <p className="text-gray-600"><strong>Size:</strong></p>
                            <p>{company.size}</p>
                          </div>
                        )}
                        {company.founded && (
                          <div>
                            <p className="text-gray-600"><strong>Founded:</strong></p>
                            <p>{company.founded}</p>
                          </div>
                        )}
                        {company.website && (
                          <div>
                            <p className="text-gray-600"><strong>Website:</strong></p>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              {company.website}
                            </a>
                          </div>
                        )}
                        {company.email && (
                          <div>
                            <p className="text-gray-600"><strong>Email:</strong></p>
                            <p>{company.email}</p>
                          </div>
                        )}
                        {company.phone && (
                          <div>
                            <p className="text-gray-600"><strong>Phone:</strong></p>
                            <p>{company.phone}</p>
                          </div>
                        )}
                        {company.mapLocation && (
                          <div>
                            <p className="text-gray-600"><strong>Map Location:</strong></p>
                            <a 
                              href={company.mapLocation.startsWith('http') ? company.mapLocation : `https://www.google.com/maps/search/${encodeURIComponent(company.mapLocation)}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              View on Map
                            </a>
                          </div>
                        )}
                      </div>

                      {company.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 line-clamp-2">{company.description}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">
                          {jobCount} Active Jobs
                        </Badge>
                        {jobCount > 0 && (
                          <Badge variant="secondary">
                            Actively Recruiting
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany({
                            ...company,
                            benefits: Array.isArray(company.benefits) 
                              ? company.benefits.join('\n') 
                              : (company.benefits || ''),
                            specialties: Array.isArray(company.specialties) 
                              ? company.specialties.join('\n') 
                              : (company.specialties || '')
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.name)}
                        disabled={jobCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCompanies.length > 0 && (
              <div className="flex items-center justify-between px-2 py-3 border-t mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2 py-1 border rounded-md bg-white"
                  >
                    {[10, 25, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span>entries</span>
                </div>
                <p className="text-sm text-gray-600">
                  Showing {filteredCompanies.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}
                  {" "}to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 7 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <Button
                        variant={totalPages === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {filteredCompanies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No companies found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Company Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent dir="ltr" className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company profile information and settings.
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
    </div>
  );
}
