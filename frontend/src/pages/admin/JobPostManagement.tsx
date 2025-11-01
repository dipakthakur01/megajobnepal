import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  Briefcase, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Building2,
  Filter,
  Download,
  Upload,
  Star,
  Crown,
  Gem,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface JobPostManagementProps {
  jobs: any[];
  companies: any[];
  onJobUpdate: (jobs: any[]) => void;
}

export function JobPostManagement({ jobs, companies, onJobUpdate }: JobPostManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Enhanced job data with tiers
  const enhancedJobs = jobs.map(job => ({
    ...job,
    tier: job.tier || ['Latest Jobs', 'Premium Job', 'Prime Job', 'MegaJob', 'Newspaper Jobs'][Math.floor(Math.random() * 5)],
    applicationCount: job.applicationCount || Math.floor(Math.random() * 50) + 5,
    viewCount: job.viewCount || Math.floor(Math.random() * 200) + 20,
    featured: job.featured || Math.random() > 0.7,
    urgent: job.urgent || Math.random() > 0.8,
    postedDate: job.postedDate || `2024-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
    expiryDate: job.expiryDate || `2024-02-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    status: job.status || (Math.random() > 0.3 ? 'active' : 'pending')
  }));

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    tier: 'Latest Jobs',
    type: 'Full Time',
    category: '',
    experience: '',
    deadline: '',
    featured: false,
    urgent: false,
    coverImage: null as File | null
  });

  const jobTiers = [
    { 
      name: 'MegaJob', 
      price: 'Rs. 5,000', 
      color: 'bg-red-100 text-red-800',
      icon: Crown,
      description: 'Premium placement with maximum visibility'
    },
    { 
      name: 'Premium Job', 
      price: 'Rs. 3,000', 
      color: 'bg-blue-100 text-blue-800',
      icon: Star,
      description: 'Enhanced visibility and special highlighting'
    },
    { 
      name: 'Prime Job', 
      price: 'Rs. 2,000', 
      color: 'bg-purple-100 text-purple-800',
      icon: Gem,
      description: 'Featured placement with priority listing'
    },
    { 
      name: 'Latest Jobs', 
      price: 'Rs. 1,000', 
      color: 'bg-green-100 text-green-800',
      icon: Briefcase,
      description: 'Standard job posting'
    },
    { 
      name: 'Newspaper Jobs', 
      price: 'Rs. 500', 
      color: 'bg-gray-100 text-gray-800',
      icon: Briefcase,
      description: 'Basic listing for newspaper jobs'
    }
  ];

  const filteredJobs = enhancedJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesTier = tierFilter === 'all' || job.tier === tierFilter;
    const matchesCompany = companyFilter === 'all' || job.company === companyFilter;
    return matchesSearch && matchesStatus && matchesTier && matchesCompany;
  });

  const handleApproveJob = (jobId: string) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, status: 'active' } : job
    );
    onJobUpdate(updatedJobs);
    toast.success('Job approved successfully!');
  };

  const handleRejectJob = (jobId: string) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, status: 'rejected' } : job
    );
    onJobUpdate(updatedJobs);
    toast.success('Job rejected');
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    onJobUpdate(updatedJobs);
    toast.success('Job deleted successfully!');
  };

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.company || !newJob.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const job = {
      id: Date.now().toString(),
      ...newJob,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      applicationCount: 0,
      viewCount: 0,
      coverImageUrl: newJob.coverImage ? URL.createObjectURL(newJob.coverImage) : null
    };

    onJobUpdate([...jobs, job]);
    setNewJob({
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      salary: '',
      tier: 'Latest Jobs',
      type: 'Full Time',
      category: '',
      experience: '',
      deadline: '',
      featured: false,
      urgent: false,
      coverImage: null
    });
    setIsCreateJobOpen(false);
    toast.success('Job created successfully!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'bg-green-100 text-green-800', label: 'Active' },
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      rejected: { class: 'bg-red-100 text-red-800', label: 'Rejected' },
      expired: { class: 'bg-gray-100 text-gray-800', label: 'Expired' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = jobTiers.find(t => t.name === tier);
    if (!tierConfig) return <Badge variant="outline">{tier}</Badge>;
    
    const Icon = tierConfig.icon;
    return (
      <Badge className={tierConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {tier}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Post Management</h2>
          <p className="text-gray-600">Manage job postings, approval, and tier assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Jobs
          </Button>
          <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job Post</DialogTitle>
                <DialogDescription>
                  Create a new job posting and assign it to a tier.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={newJob.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="Enter job title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobCompany">Company</Label>
                    <select
                      id="jobCompany"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.name}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobLocation">Location</Label>
                    <Input
                      id="jobLocation"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobSalary">Salary</Label>
                    <Input
                      id="jobSalary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      placeholder="Enter salary range"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTier">Job Tier</Label>
                    <select
                      id="jobTier"
                      value={newJob.tier}
                      onChange={(e) => setNewJob({ ...newJob, tier: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {jobTiers.map(tier => (
                        <option key={tier.name} value={tier.name}>
                          {tier.name} - {tier.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <select
                      id="jobType"
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobExperience">Experience</Label>
                    <Input
                      id="jobExperience"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                      placeholder="e.g., 2-3 years"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Enter job description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobRequirements">Requirements</Label>
                  <Textarea
                    id="jobRequirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="Enter job requirements"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDeadline">Application Deadline</Label>
                  <Input
                    id="jobDeadline"
                    type="date"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  />
                </div>

                {/* Job Cover Image Upload */}
                <div className="space-y-2">
                  <Label>Job Cover Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {newJob.coverImage ? (
                      <div className="space-y-2">
                        <div className="w-full h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <ImageWithFallback
                            src={URL.createObjectURL(newJob.coverImage)}
                            alt="Job Cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-gray-600">{newJob.coverImage.name}</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setNewJob({ ...newJob, coverImage: null })}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload job cover image</p>
                        <p className="text-sm text-gray-500">JPG, PNG up to 5MB. Recommended size: 1200x600px</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewJob({ ...newJob, coverImage: e.target.files?.[0] || null })}
                          className="hidden"
                          id="job-cover-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('job-cover-upload')?.click()}
                          className="mt-2"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateJob}>Create Job</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {jobTiers.map((tier, index) => {
          const tierJobs = enhancedJobs.filter(job => job.tier === tier.name);
          const Icon = tier.icon;
          return (
            <Card key={tier.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{tier.name}</p>
                    <p className="text-2xl font-bold">{tierJobs.length}</p>
                    <p className="text-xs text-gray-500">{tier.price}</p>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="all-jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="tier-management">Tier Management</TabsTrigger>
        </TabsList>

        {/* All Jobs */}
        <TabsContent value="all-jobs" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs, companies, locations..."
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
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Tiers</option>
                    {jobTiers.map(tier => (
                      <option key={tier.name} value={tier.name}>{tier.name}</option>
                    ))}
                  </select>
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Companies</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Job</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Tier</th>
                      <th className="text-left py-3 px-4">Applications</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Posted</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-start space-x-3">
                            {job.coverImageUrl ? (
                              <ImageWithFallback
                                src={job.coverImageUrl}
                                alt={job.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {job.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                                )}
                                {job.urgent && (
                                  <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{job.company}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getTierBadge(job.tier)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{job.applicationCount}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{job.viewCount}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {job.postedDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {job.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleApproveJob(job.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
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

        {/* Pending Approval */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Job Approvals ({enhancedJobs.filter(j => j.status === 'pending').length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedJobs.filter(j => j.status === 'pending').map(job => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-600">{job.company} • {job.location}</p>
                          </div>
                          {getTierBadge(job.tier)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {job.description || "No description provided."}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Posted: {job.postedDate}</span>
                          <span>Expires: {job.expiryDate}</span>
                          <span>Salary: {job.salary || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          onClick={() => handleApproveJob(job.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleRejectJob(job.id)}
                          className="text-red-600 hover:text-red-700 border-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Management */}
        <TabsContent value="tier-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Tier Management</CardTitle>
              <p className="text-sm text-gray-600">Configure job posting tiers and pricing</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobTiers.map((tier, index) => {
                  const tierJobs = enhancedJobs.filter(job => job.tier === tier.name);
                  const Icon = tier.icon;
                  return (
                    <Card key={tier.name} className="relative">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Icon className="h-8 w-8 text-gray-600" />
                          <div>
                            <h3 className="font-semibold">{tier.name}</h3>
                            <p className="text-sm text-gray-600">{tier.price}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {tier.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Active Jobs:</span>
                            <span className="font-medium">{tierJobs.filter(j => j.status === 'active').length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Applications:</span>
                            <span className="font-medium">
                              {tierJobs.reduce((sum, job) => sum + job.applicationCount, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Revenue:</span>
                            <span className="font-medium">Rs. {(tierJobs.length * parseInt(tier.price.replace(/[^\d]/g, ''))).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          Configure Tier
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
