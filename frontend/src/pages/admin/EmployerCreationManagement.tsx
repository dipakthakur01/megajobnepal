import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  Upload, 
  Camera, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  UserPlus,
  Shield,
  Key,
  Globe,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { confirmDelete } from '../../utils/confirmDelete';

interface EmployerCreationManagementProps {
  companies: any[];
  users: any[];
  jobs: any[];
  onCompanyUpdate: (companies: any[]) => void;
  onUserUpdate: (users: any[]) => void;
}

export function EmployerCreationManagement({ 
  companies, 
  users, 
  jobs, 
  onCompanyUpdate, 
  onUserUpdate 
}: EmployerCreationManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Combined employer data with company details
  const employersWithCompanies = users
    .filter(user => user.user_type === 'employer' || user.role === 'employer')
    .map(employer => {
      const company = companies.find(comp => comp.employerId === employer.id || comp.email === employer.email);
      const companyJobs = jobs.filter(job => job.company === company?.name || job.employerId === employer.id);
      
      return {
        ...employer,
        company: company || null,
        totalJobs: companyJobs.length,
        activeJobs: companyJobs.filter(job => job.status === 'active').length,
        joinedDate: employer.created_at || new Date().toISOString(),
        lastLogin: employer.last_login || 'Never',
        isVerified: employer.emailVerified || false,
        companyVerified: company?.verified || false
      };
    });

  const [newEmployerData, setNewEmployerData] = useState({
    // Employer Account Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'employer123', // Default password, should be changed by employer
    confirmPassword: 'employer123',
    position: '',
    department: '',
    
    // Company Details
    companyName: '',
    industry: '',
    companyType: 'Private',
    foundedYear: '',
    employeeCount: '',
    headquarters: '',
    website: '',
    companyEmail: '',
    companyPhone: '',
    description: '',
    mission: '',
    vision: '',
    values: '',
    benefits: '',
    culture: '',
    workingHours: '9:00 AM - 6:00 PM',
    
    // Location & Contact
    address: '',
    city: '',
    state: '',
    country: 'Nepal',
    zipCode: '',
    mapLocation: '',
    
    // Social Media
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: '',
    
    // Additional Settings
    allowDirectApplications: true,
    emailNotifications: true,
    profileVisibility: 'public',
    autoApproveJobs: false
  });

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Hospitality', 'Transportation', 'Media',
    'Non-Profit', 'Government', 'Agriculture', 'Energy', 'Real Estate',
    'Consulting', 'Banking', 'Insurance', 'Telecommunications', 'Other'
  ];

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const companyTypeOptions = [
    'Private', 'Public', 'Non-Profit', 'Government', 'Startup', 'Enterprise'
  ];

  const filteredEmployers = employersWithCompanies.filter(employer => 
    employer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employer.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEmployer = async () => {
    try {
      // Validate required fields
      if (!newEmployerData.email || !newEmployerData.firstName || !newEmployerData.companyName) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (newEmployerData.password !== newEmployerData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Check if email already exists
      if (users.some(user => user.email === newEmployerData.email)) {
        toast.error('An account with this email already exists');
        return;
      }

      // Create employer account
      const newEmployer = {
        id: Date.now().toString(),
        firstName: newEmployerData.firstName,
        lastName: newEmployerData.lastName,
        email: newEmployerData.email,
        phone: newEmployerData.phone,
        password: newEmployerData.password, // In production, this should be hashed
        user_type: 'employer',
        role: 'employer',
        position: newEmployerData.position,
        department: newEmployerData.department,
        emailVerified: true, // Auto-verify admin-created accounts
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isActive: true,
        profileComplete: true
      };

      // Create company profile
      const newCompany = {
        id: Date.now().toString() + '_company',
        employerId: newEmployer.id,
        name: newEmployerData.companyName,
        industry: newEmployerData.industry,
        type: newEmployerData.companyType,
        foundedYear: newEmployerData.foundedYear,
        size: newEmployerData.employeeCount,
        headquarters: newEmployerData.headquarters,
        website: newEmployerData.website,
        email: newEmployerData.companyEmail || newEmployerData.email,
        phone: newEmployerData.companyPhone || newEmployerData.phone,
        description: newEmployerData.description,
        mission: newEmployerData.mission,
        vision: newEmployerData.vision,
        values: newEmployerData.values,
        benefits: newEmployerData.benefits,
        culture: newEmployerData.culture,
        workingHours: newEmployerData.workingHours,
        address: newEmployerData.address,
        city: newEmployerData.city,
        state: newEmployerData.state,
        country: newEmployerData.country,
        zipCode: newEmployerData.zipCode,
        location: `${newEmployerData.city}, ${newEmployerData.state}, ${newEmployerData.country}`,
        mapLocation: newEmployerData.mapLocation,
        linkedin: newEmployerData.linkedin,
        facebook: newEmployerData.facebook,
        twitter: newEmployerData.twitter,
        instagram: newEmployerData.instagram,
        verified: true, // Auto-verify admin-created companies
        allowDirectApplications: newEmployerData.allowDirectApplications,
        emailNotifications: newEmployerData.emailNotifications,
        profileVisibility: newEmployerData.profileVisibility,
        autoApproveJobs: newEmployerData.autoApproveJobs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // No default logo; employers must upload their own
        logoUrl: ''
      };

      // Update state
      onUserUpdate([...users, newEmployer]);
      onCompanyUpdate([...companies, newCompany]);

      // Reset form
      setNewEmployerData({
        firstName: '', lastName: '', email: '', phone: '', password: 'employer123', 
        confirmPassword: 'employer123', position: '', department: '', companyName: '', 
        industry: '', companyType: 'Private', foundedYear: '', employeeCount: '', 
        headquarters: '', website: '', companyEmail: '', companyPhone: '', description: '', 
        mission: '', vision: '', values: '', benefits: '', culture: '', workingHours: '9:00 AM - 6:00 PM',
        address: '', city: '', state: '', country: 'Nepal', zipCode: '', mapLocation: '',
        linkedin: '', facebook: '', twitter: '', instagram: '', allowDirectApplications: true,
        emailNotifications: true, profileVisibility: 'public', autoApproveJobs: false
      });

      setIsCreateModalOpen(false);
      toast.success(`Employer "${newEmployerData.firstName} ${newEmployerData.lastName}" and company "${newEmployerData.companyName}" created successfully!`);

    } catch (error) {
      console.error('Error creating employer:', error);
      toast.error('Failed to create employer and company');
    }
  };

  const handleDeleteEmployer = (employerId: string) => {
    if (!confirmDelete('Are you sure you want to delete this employer and their company? This action cannot be undone.')) return;
      // Remove employer from users
      const updatedUsers = users.filter(user => user.id !== employerId);
      onUserUpdate(updatedUsers);
      
      // Remove associated company
      const updatedCompanies = companies.filter(company => company.employerId !== employerId);
      onCompanyUpdate(updatedCompanies);
      
      toast.success('Employer and company deleted successfully');
  };

  const toggleEmployerStatus = (employerId: string) => {
    const updatedUsers = users.map(user => 
      user.id === employerId ? { ...user, isActive: !user.isActive } : user
    );
    onUserUpdate(updatedUsers);
    toast.success('Employer status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employer Management</h1>
          <p className="text-gray-600 mt-1">Create and manage employer accounts with company details</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Employer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="create-employer-description">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Create New Employer & Company
              </DialogTitle>
              <DialogDescription id="create-employer-description">
                Create a complete employer account with company profile. Default password is 'employer123' - employer should change this upon first login.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newEmployerData.firstName}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newEmployerData.lastName}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployerData.email}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newEmployerData.phone}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+977-9800000000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Job Title</Label>
                    <Input
                      id="position"
                      value={newEmployerData.position}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="HR Manager, Recruitment Head, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newEmployerData.department}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Human Resources, Talent Acquisition, etc."
                    />
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Default Login Credentials</span>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Password: <code className="bg-yellow-100 px-2 py-1 rounded">employer123</code>
                    <br />
                    The employer should change this password upon first login for security.
                  </p>
                </div>
              </TabsContent>
              
              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newEmployerData.companyName}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="ABC Technologies Pvt. Ltd."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={newEmployerData.industry} 
                      onValueChange={(value) => setNewEmployerData(prev => ({ ...prev, industry: value }))}
                    >
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select 
                      value={newEmployerData.companyType} 
                      onValueChange={(value) => setNewEmployerData(prev => ({ ...prev, companyType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {companyTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      value={newEmployerData.foundedYear}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, foundedYear: e.target.value }))}
                      placeholder="2020"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Select 
                      value={newEmployerData.employeeCount} 
                      onValueChange={(value) => setNewEmployerData(prev => ({ ...prev, employeeCount: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizeOptions.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newEmployerData.website}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={newEmployerData.description}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description about the company, what they do, their vision, etc."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      value={newEmployerData.mission}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, mission: e.target.value }))}
                      placeholder="Company's mission statement"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vision">Vision Statement</Label>
                    <Textarea
                      id="vision"
                      value={newEmployerData.vision}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, vision: e.target.value }))}
                      placeholder="Company's vision statement"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={newEmployerData.companyEmail}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, companyEmail: e.target.value }))}
                      placeholder="contact@company.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={newEmployerData.companyPhone}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, companyPhone: e.target.value }))}
                      placeholder="+977-01-4000000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={newEmployerData.address}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Business Street"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newEmployerData.city}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Kathmandu"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={newEmployerData.state}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Bagmati Province"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={newEmployerData.zipCode}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="44600"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Social Media Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={newEmployerData.linkedin}
                        onChange={(e) => setNewEmployerData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/company/your-company"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={newEmployerData.facebook}
                        onChange={(e) => setNewEmployerData(prev => ({ ...prev, facebook: e.target.value }))}
                        placeholder="https://facebook.com/your-company"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Company Settings</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Direct Applications</Label>
                        <p className="text-sm text-gray-500">Allow job seekers to apply directly</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newEmployerData.allowDirectApplications}
                        onChange={(e) => setNewEmployerData(prev => ({ ...prev, allowDirectApplications: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications for applications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newEmployerData.emailNotifications}
                        onChange={(e) => setNewEmployerData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Job Posts</Label>
                        <p className="text-sm text-gray-500">Automatically approve job postings without admin review</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newEmployerData.autoApproveJobs}
                        onChange={(e) => setNewEmployerData(prev => ({ ...prev, autoApproveJobs: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select 
                      value={newEmployerData.profileVisibility} 
                      onValueChange={(value) => setNewEmployerData(prev => ({ ...prev, profileVisibility: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="verified-only">Verified Users Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Input
                      id="workingHours"
                      value={newEmployerData.workingHours}
                      onChange={(e) => setNewEmployerData(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEmployer} className="bg-primary hover:bg-primary/90">
                Create Employer & Company
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employers or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employers</p>
                <p className="text-2xl font-semibold text-gray-900">{employersWithCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Employers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {employersWithCompanies.filter(emp => emp.isVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {employersWithCompanies.filter(emp => emp.company).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs Posted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {employersWithCompanies.reduce((sum, emp) => sum + emp.totalJobs, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employers List */}
      <Card>
        <CardHeader>
          <CardTitle>Employers & Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployers.map((employer) => (
              <div key={employer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {employer.firstName?.charAt(0) || 'E'}{employer.lastName?.charAt(0) || 'M'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {employer.firstName} {employer.lastName}
                        </h3>
                        {employer.isVerified && (
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!employer.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employer.email}
                          </span>
                          {employer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {employer.phone}
                            </span>
                          )}
                        </div>
                        
                        {employer.company && (
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {employer.company.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {employer.company.location}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(employer.joinedDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {employer.totalJobs} jobs posted
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEmployerStatus(employer.id)}
                    >
                      {employer.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteEmployer(employer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEmployers.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Create your first employer account to get started.'}
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New Employer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
