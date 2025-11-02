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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Switch } from '../components/ui/switch';
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
  Settings,
  Eye,
  X,
  Filter,
  Download,
  History,
  AlertTriangle,
  User,
  ChevronDown,
  Activity,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { confirmDelete } from '../../utils/confirmDelete';
import { normalizeMediaUrl } from '@/utils/media';

interface EmployerManagementEnhancedProps {
  companies: any[];
  users: any[];
  jobs: any[];
  onCompanyUpdate: (companies: any[]) => void;
  onUserUpdate: (users: any[]) => void;
}

export function EmployerManagementEnhanced({ 
  companies, 
  users, 
  jobs, 
  onCompanyUpdate, 
  onUserUpdate 
}: EmployerManagementEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Activity log state (in real app, this would come from database)
  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Created', targetType: 'Employer', targetName: 'John Doe - ABC Tech', adminUser: 'Admin', timestamp: new Date().toISOString(), details: 'New employer account created with company profile' },
    { id: 2, action: 'Updated', targetType: 'Company', targetName: 'XYZ Solutions', adminUser: 'Admin', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Company logo and description updated' },
    { id: 3, action: 'Deactivated', targetType: 'Employer', targetName: 'Jane Smith - Tech Corp', adminUser: 'Admin', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Employer account temporarily deactivated' }
  ]);

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
    password: 'employer123',
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

  // Filter employers
  const filteredEmployers = employersWithCompanies.filter(employer => {
    const matchesSearch = 
      employer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && employer.isActive) ||
      (statusFilter === 'inactive' && !employer.isActive) ||
      (statusFilter === 'verified' && employer.isVerified) ||
      (statusFilter === 'unverified' && !employer.isVerified);

    const matchesLocation = locationFilter === 'all' || 
      employer.company?.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      employer.company?.state?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(companies.map(c => c.city).filter(Boolean)));

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
        password: newEmployerData.password,
        user_type: 'employer',
        role: 'employer',
        position: newEmployerData.position,
        department: newEmployerData.department,
        emailVerified: true,
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
        verified: true,
        allowDirectApplications: newEmployerData.allowDirectApplications,
        emailNotifications: newEmployerData.emailNotifications,
        profileVisibility: newEmployerData.profileVisibility,
        autoApproveJobs: newEmployerData.autoApproveJobs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop&crop=face'
      };

      // Update state
      onUserUpdate([...users, newEmployer]);
      onCompanyUpdate([...companies, newCompany]);

      // Add to activity log
      const newActivity = {
        id: Date.now(),
        action: 'Created',
        targetType: 'Employer',
        targetName: `${newEmployerData.firstName} ${newEmployerData.lastName} - ${newEmployerData.companyName}`,
        adminUser: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'New employer account created with company profile'
      };
      setActivityLog([newActivity, ...activityLog]);

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

  const handleEditEmployer = (employer: any) => {
    setSelectedEmployer(employer);
    setNewEmployerData({
      firstName: employer.firstName || '',
      lastName: employer.lastName || '',
      email: employer.email || '',
      phone: employer.phone || '',
      password: '',
      confirmPassword: '',
      position: employer.position || '',
      department: employer.department || '',
      companyName: employer.company?.name || '',
      industry: employer.company?.industry || '',
      companyType: employer.company?.type || 'Private',
      foundedYear: employer.company?.foundedYear || '',
      employeeCount: employer.company?.size || '',
      headquarters: employer.company?.headquarters || '',
      website: employer.company?.website || '',
      companyEmail: employer.company?.email || '',
      companyPhone: employer.company?.phone || '',
      description: employer.company?.description || '',
      mission: employer.company?.mission || '',
      vision: employer.company?.vision || '',
      values: employer.company?.values || '',
      benefits: employer.company?.benefits || '',
      culture: employer.company?.culture || '',
      workingHours: employer.company?.workingHours || '9:00 AM - 6:00 PM',
      address: employer.company?.address || '',
      city: employer.company?.city || '',
      state: employer.company?.state || '',
      country: employer.company?.country || 'Nepal',
      zipCode: employer.company?.zipCode || '',
      mapLocation: employer.company?.mapLocation || '',
      linkedin: employer.company?.linkedin || '',
      facebook: employer.company?.facebook || '',
      twitter: employer.company?.twitter || '',
      instagram: employer.company?.instagram || '',
      allowDirectApplications: employer.company?.allowDirectApplications ?? true,
      emailNotifications: employer.company?.emailNotifications ?? true,
      profileVisibility: employer.company?.profileVisibility || 'public',
      autoApproveJobs: employer.company?.autoApproveJobs ?? false
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployer = async () => {
    try {
      if (!selectedEmployer) return;

      // Update employer data
      const updatedUsers = users.map(user => 
        user.id === selectedEmployer.id 
          ? {
              ...user,
              firstName: newEmployerData.firstName,
              lastName: newEmployerData.lastName,
              email: newEmployerData.email,
              phone: newEmployerData.phone,
              position: newEmployerData.position,
              department: newEmployerData.department,
              updated_at: new Date().toISOString()
            }
          : user
      );

      // Update company data
      const updatedCompanies = companies.map(company => 
        company.employerId === selectedEmployer.id
          ? {
              ...company,
              name: newEmployerData.companyName,
              industry: newEmployerData.industry,
              type: newEmployerData.companyType,
              foundedYear: newEmployerData.foundedYear,
              size: newEmployerData.employeeCount,
              headquarters: newEmployerData.headquarters,
              website: newEmployerData.website,
              email: newEmployerData.companyEmail,
              phone: newEmployerData.companyPhone,
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
              allowDirectApplications: newEmployerData.allowDirectApplications,
              emailNotifications: newEmployerData.emailNotifications,
              profileVisibility: newEmployerData.profileVisibility,
              autoApproveJobs: newEmployerData.autoApproveJobs,
              updated_at: new Date().toISOString()
            }
          : company
      );

      onUserUpdate(updatedUsers);
      onCompanyUpdate(updatedCompanies);

      // Add to activity log
      const newActivity = {
        id: Date.now(),
        action: 'Updated',
        targetType: 'Employer',
        targetName: `${newEmployerData.firstName} ${newEmployerData.lastName} - ${newEmployerData.companyName}`,
        adminUser: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Employer and company profile updated'
      };
      setActivityLog([newActivity, ...activityLog]);

      setIsEditModalOpen(false);
      setSelectedEmployer(null);
      toast.success('Employer and company updated successfully!');

    } catch (error) {
      console.error('Error updating employer:', error);
      toast.error('Failed to update employer and company');
    }
  };

  const handleDeleteEmployer = (employerId: string, employerName: string, companyName: string) => {
    if (!confirmDelete(`Are you sure you want to delete employer "${employerName}" and company "${companyName}"? This action cannot be undone.`)) return;
      // Remove employer from users
      const updatedUsers = users.filter(user => user.id !== employerId);
      onUserUpdate(updatedUsers);
      
      // Remove associated company
      const updatedCompanies = companies.filter(company => company.employerId !== employerId);
      onCompanyUpdate(updatedCompanies);

      // Add to activity log
      const newActivity = {
        id: Date.now(),
        action: 'Deleted',
        targetType: 'Employer',
        targetName: `${employerName} - ${companyName}`,
        adminUser: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Employer account and company permanently deleted'
      };
      setActivityLog([newActivity, ...activityLog]);
      
      toast.success('Employer and company deleted successfully');
  };

  const toggleEmployerStatus = (employerId: string, currentStatus: boolean, employerName: string) => {
    const updatedUsers = users.map(user => 
      user.id === employerId ? { ...user, isActive: !user.isActive } : user
    );
    onUserUpdate(updatedUsers);

    // Add to activity log
    const newActivity = {
      id: Date.now(),
      action: currentStatus ? 'Deactivated' : 'Activated',
      targetType: 'Employer',
      targetName: employerName,
      adminUser: 'Admin',
      timestamp: new Date().toISOString(),
      details: `Employer account ${currentStatus ? 'deactivated' : 'activated'}`
    };
    setActivityLog([newActivity, ...activityLog]);

    toast.success(`Employer ${currentStatus ? 'deactivated' : 'activated'} successfully`);
  };

  const viewEmployerProfile = (employer: any) => {
    setSelectedEmployer(employer);
    setIsProfileModalOpen(true);
  };

  const exportEmployerData = () => {
    const exportData = employersWithCompanies.map(emp => ({
      Name: `${emp.firstName} ${emp.lastName}`,
      Email: emp.email,
      Phone: emp.phone,
      Company: emp.company?.name || 'N/A',
      Industry: emp.company?.industry || 'N/A',
      Location: emp.company?.location || 'N/A',
      Status: emp.isActive ? 'Active' : 'Inactive',
      Verified: emp.isVerified ? 'Yes' : 'No',
      'Total Jobs': emp.totalJobs,
      'Active Jobs': emp.activeJobs,
      'Joined Date': new Date(emp.joinedDate).toLocaleDateString()
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employers_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Employer data exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive employer and company management system</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportEmployerData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Button variant="outline" onClick={() => setIsActivityLogOpen(true)}>
            <History className="w-4 h-4 mr-2" />
            Activity Log
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Employer
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
                  
                  <Alert>
                    <Key className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Default Login Credentials:</strong><br />
                      Password: <code className="bg-gray-100 px-2 py-1 rounded">employer123</code><br />
                      The employer should change this password upon first login for security.
                    </AlertDescription>
                  </Alert>
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
                        <Switch
                          checked={newEmployerData.allowDirectApplications}
                          onCheckedChange={(checked) => setNewEmployerData(prev => ({ ...prev, allowDirectApplications: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications for applications</p>
                        </div>
                        <Switch
                          checked={newEmployerData.emailNotifications}
                          onCheckedChange={(checked) => setNewEmployerData(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-approve Job Posts</Label>
                          <p className="text-sm text-gray-500">Automatically approve job postings without admin review</p>
                        </div>
                        <Switch
                          checked={newEmployerData.autoApproveJobs}
                          onCheckedChange={(checked) => setNewEmployerData(prev => ({ ...prev, autoApproveJobs: checked }))}
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
      </div>

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
                <p className="text-sm font-medium text-gray-600">Active Employers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {employersWithCompanies.filter(emp => emp.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Verified Companies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {employersWithCompanies.filter(emp => emp.companyVerified).length}
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employers, companies, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employers & Companies ({filteredEmployers.length})</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <Activity className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployers.map((employer) => (
                    <TableRow key={employer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                            {employer.firstName?.charAt(0) || 'E'}{employer.lastName?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employer.firstName} {employer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employer.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {employer.company ? (
                            <img
                              src={
                                normalizeMediaUrl(
                                  (employer.company as any).logo_url ||
                                  (employer.company as any).logoUrl ||
                                  (employer.company as any).logo ||
                                  (employer.company as any).profileImage ||
                                  (employer.company as any).company_logo
                                ) || `https://ui-avatars.com/api/?name=${encodeURIComponent((employer.company as any).name || 'Company')}&background=random&color=fff&size=64&font-size=0.6&format=svg`
                              }
                              alt={(employer.company as any).name || 'Company'}
                              className="w-8 h-8 rounded object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200" />
                          )}
                          <div>
                            <div className="font-medium">{employer.company?.name || 'No company'}</div>
                            <div className="text-sm text-gray-500">{employer.company?.industry}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employer.email}
                          </div>
                          {employer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {employer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employer.company?.city && employer.company?.state 
                            ? `${employer.company.city}, ${employer.company.state}` 
                            : 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Total: {employer.totalJobs}</div>
                          <div className="text-green-600">Active: {employer.activeJobs}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={employer.isActive ? "default" : "destructive"}>
                            {employer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {employer.isVerified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewEmployerProfile(employer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEmployer(employer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEmployerStatus(employer.id, employer.isActive, `${employer.firstName} ${employer.lastName}`)}
                          >
                            {employer.isActive ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployer(employer.id, `${employer.firstName} ${employer.lastName}`, employer.company?.name || 'Unknown Company')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployers.map((employer) => (
                <Card key={employer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {employer.firstName?.charAt(0) || 'E'}{employer.lastName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {employer.firstName} {employer.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{employer.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {employer.isVerified && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant={employer.isActive ? "default" : "destructive"}>
                          {employer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {employer.email}
                      </div>
                      {employer.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-3 h-3" />
                          {employer.company.name}
                        </div>
                      )}
                      {employer.company?.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {employer.company.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-3 h-3" />
                        {employer.totalJobs} jobs posted ({employer.activeJobs} active)
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewEmployerProfile(employer)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployer(employer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEmployerStatus(employer.id, employer.isActive, `${employer.firstName} ${employer.lastName}`)}
                      >
                        {employer.isActive ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredEmployers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first employer account to get started.'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Employer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-employer-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Employer & Company
            </DialogTitle>
            <DialogDescription id="edit-employer-description">
              Update employer account and company information.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Same form structure as create modal, but with update functionality */}
            <TabsContent value="account" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={newEmployerData.firstName}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input
                    id="editLastName"
                    value={newEmployerData.lastName}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email Address *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={newEmployerData.email}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone Number</Label>
                  <Input
                    id="editPhone"
                    value={newEmployerData.phone}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCompanyName">Company Name *</Label>
                  <Input
                    id="editCompanyName"
                    value={newEmployerData.companyName}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIndustry">Industry</Label>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDescription">Company Description</Label>
                <Textarea
                  id="editDescription"
                  value={newEmployerData.description}
                  onChange={(e) => setNewEmployerData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    value={newEmployerData.city}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editState">State/Province</Label>
                  <Input
                    id="editState"
                    value={newEmployerData.state}
                    onChange={(e) => setNewEmployerData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Direct Applications</Label>
                    <p className="text-sm text-gray-500">Allow job seekers to apply directly</p>
                  </div>
                  <Switch
                    checked={newEmployerData.allowDirectApplications}
                    onCheckedChange={(checked) => setNewEmployerData(prev => ({ ...prev, allowDirectApplications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications for applications</p>
                  </div>
                  <Switch
                    checked={newEmployerData.emailNotifications}
                    onCheckedChange={(checked) => setNewEmployerData(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployer} className="bg-primary hover:bg-primary/90">
              Update Employer & Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employer Profile View Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="employer-profile-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Employer Profile
            </DialogTitle>
            <DialogDescription id="employer-profile-description">
              View complete employer account details and company information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployer && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-semibold">
                  {selectedEmployer.firstName?.charAt(0) || 'E'}{selectedEmployer.lastName?.charAt(0) || 'M'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {selectedEmployer.firstName} {selectedEmployer.lastName}
                    </h3>
                    {selectedEmployer.isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant={selectedEmployer.isActive ? "default" : "destructive"}>
                      {selectedEmployer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{selectedEmployer.position} at {selectedEmployer.company?.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(selectedEmployer.joinedDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {selectedEmployer.totalJobs} jobs posted
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedEmployer.email}</span>
                    </div>
                    {selectedEmployer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedEmployer.phone}</span>
                      </div>
                    )}
                    {selectedEmployer.company?.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={selectedEmployer.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedEmployer.company.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedEmployer.company ? (
                      <>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              normalizeMediaUrl(
                                (selectedEmployer.company as any).logo_url ||
                                (selectedEmployer.company as any).logoUrl ||
                                (selectedEmployer.company as any).logo ||
                                (selectedEmployer.company as any).profileImage ||
                                (selectedEmployer.company as any).company_logo
                              ) || `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedEmployer.company as any).name || 'Company')}&background=random&color=fff&size=64&font-size=0.6&format=svg`
                            }
                            alt={(selectedEmployer.company as any).name || 'Company'}
                            className="w-10 h-10 rounded object-cover border border-gray-200"
                          />
                          <span className="font-medium">{selectedEmployer.company.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedEmployer.company.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{selectedEmployer.company.size || 'Company size not specified'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">No company information available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Company Description */}
              {selectedEmployer.company?.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About the Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{selectedEmployer.company.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Job Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-semibold text-blue-600">{selectedEmployer.totalJobs}</div>
                      <div className="text-sm text-gray-600">Total Jobs</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-semibold text-green-600">{selectedEmployer.activeJobs}</div>
                      <div className="text-sm text-gray-600">Active Jobs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-semibold text-purple-600">
                        {selectedEmployer.totalJobs - selectedEmployer.activeJobs}
                      </div>
                      <div className="text-sm text-gray-600">Inactive Jobs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Log Modal */}
      <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="activity-log-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Activity Log / Audit Trail
            </DialogTitle>
            <DialogDescription id="activity-log-description">
              Complete history of employer management actions performed by administrators.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.action === 'Created' ? 'bg-green-100 text-green-600' :
                  activity.action === 'Updated' ? 'bg-blue-100 text-blue-600' :
                  activity.action === 'Deleted' ? 'bg-red-100 text-red-600' :
                  activity.action === 'Activated' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {activity.action === 'Created' && <UserPlus className="w-5 h-5" />}
                  {activity.action === 'Updated' && <Edit className="w-5 h-5" />}
                  {activity.action === 'Deleted' && <Trash2 className="w-5 h-5" />}
                  {activity.action === 'Activated' && <CheckCircle className="w-5 h-5" />}
                  {activity.action === 'Deactivated' && <X className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {activity.action} {activity.targetType}: {activity.targetName}
                    </h4>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">By: {activity.adminUser}</p>
                </div>
              </div>
            ))}
            
            {activityLog.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity recorded</h3>
                <p className="text-gray-600">Activity logs will appear here as actions are performed.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
