import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, Edit, Trash2, Search, Filter, Eye, CheckCircle, X, Clock, 
  AlertTriangle, TrendingUp, Users, Briefcase 
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface JobManagementEnhancedProps {
  jobs: any[];
  companies: any[];
  onJobUpdate: (jobs: any[]) => void;
}

export function JobManagementEnhanced({ jobs, companies, onJobUpdate }: JobManagementEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('all');
  
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    category: '',
    salary: '',
    experience: 'Mid Level',
    description: '',
    requirements: '',
    benefits: '',
    tier: 'latest' as 'megajob' | 'premium' | 'prime' | 'newspaper' | 'latest',
    featured: false,
    deadline: '',
    urgent: false
  });

  // Filter jobs based on search, filters, and approval status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || job.tier === filterTier;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && new Date(job.publishedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                         (filterStatus === 'expired' && new Date(job.publishedDate) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const matchesApproval = filterApproval === 'all' ||
                           (filterApproval === 'pending' && job.approvalStatus === 'pending') ||
                           (filterApproval === 'approved' && job.approvalStatus === 'approved') ||
                           (filterApproval === 'rejected' && job.approvalStatus === 'rejected');

    const matchesTab = currentTab === 'all' ||
                      (currentTab === 'pending' && job.approvalStatus === 'pending') ||
                      (currentTab === 'approved' && job.approvalStatus === 'approved') ||
                      (currentTab === 'rejected' && job.approvalStatus === 'rejected');

    return matchesSearch && matchesTier && matchesStatus && matchesApproval && matchesTab;
  });

  const resetNewJob = () => {
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'Full Time',
      category: '',
      salary: '',
      experience: 'Mid Level',
      description: '',
      requirements: '',
      benefits: '',
      tier: 'latest',
      featured: false,
      deadline: '',
      urgent: false
    });
  };

  const handleCreateJob = () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const job = {
      id: Date.now().toString(),
      ...newJob,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      benefits: newJob.benefits.split('\n').filter(b => b.trim()),
      postedDate: 'Just posted',
      publishedDate: new Date().toISOString().split('T')[0],
      deadline: newJob.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      source: 'online' as const,
      approvalStatus: 'approved', // Admin-created jobs are auto-approved
      approvedBy: 'admin',
      approvedDate: new Date().toISOString().split('T')[0],
      tags: newJob.urgent ? ['Urgent'] : []
    };

    onJobUpdate([...jobs, job]);
    setIsCreateModalOpen(false);
    resetNewJob();
    toast.success('Job created and approved successfully!');
  };

  const handleApproveJob = (jobId: string) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId
        ? {
            ...job,
            approvalStatus: 'approved',
            approvedBy: 'admin',
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : job
    );
    onJobUpdate(updatedJobs);
    toast.success('Job approved successfully!');
  };

  const handleRejectJob = (jobId: string, reason?: string) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId
        ? {
            ...job,
            approvalStatus: 'rejected',
            rejectedBy: 'admin',
            rejectedDate: new Date().toISOString().split('T')[0],
            rejectionReason: reason || 'Does not meet posting guidelines'
          }
        : job
    );
    onJobUpdate(updatedJobs);
    toast.success('Job rejected successfully!');
  };

  const handleBulkApproval = (action: 'approve' | 'reject') => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs first');
      return;
    }

    const updatedJobs = jobs.map(job =>
      selectedJobs.includes(job.id)
        ? {
            ...job,
            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
            [`${action === 'approve' ? 'approved' : 'rejected'}By`]: 'admin',
            [`${action === 'approve' ? 'approved' : 'rejected'}Date`]: new Date().toISOString().split('T')[0],
            ...(action === 'reject' && { rejectionReason: 'Bulk rejection' })
          }
        : job
    );

    onJobUpdate(updatedJobs);
    setSelectedJobs([]);
    toast.success(`${selectedJobs.length} jobs ${action}d successfully!`);
  };

  const handleEditJob = () => {
    if (!selectedJob) return;

    const updatedJobs = jobs.map(job => 
      job.id === selectedJob.id 
        ? {
            ...selectedJob,
            requirements: Array.isArray(selectedJob.requirements) 
              ? selectedJob.requirements 
              : selectedJob.requirements.split('\n').filter((r: string) => r.trim()),
            benefits: Array.isArray(selectedJob.benefits) 
              ? selectedJob.benefits 
              : selectedJob.benefits.split('\n').filter((b: string) => b.trim()),
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : job
    );

    onJobUpdate(updatedJobs);
    setIsEditModalOpen(false);
    setSelectedJob(null);
    toast.success('Job updated successfully!');
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      onJobUpdate(updatedJobs);
      toast.success('Job deleted successfully!');
    }
  };

  const getApprovalBadge = (job: any) => {
    switch (job.approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      megajob: { color: 'bg-yellow-100 text-yellow-800', label: 'MegaJob' },
      premium: { color: 'bg-blue-100 text-blue-800', label: 'Premium' },
      prime: { color: 'bg-green-100 text-green-800', label: 'Prime' },
      newspaper: { color: 'bg-orange-100 text-orange-800', label: 'Newspaper' },
      latest: { color: 'bg-purple-100 text-purple-800', label: 'Latest' }
    };
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.latest;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const pendingJobs = jobs.filter(job => job.approvalStatus === 'pending' || !job.approvalStatus);
  const approvedJobs = jobs.filter(job => job.approvalStatus === 'approved');
  const rejectedJobs = jobs.filter(job => job.approvalStatus === 'rejected');

  const JobFormFields = ({ job, setJob }: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={job.title}
            onChange={(e) => setJob({ ...job, title: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Select value={job.company} onValueChange={(value) => setJob({ ...job, company: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id || company.name} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={job.location}
            onChange={(e) => setJob({ ...job, location: e.target.value })}
            placeholder="e.g. Kathmandu, Nepal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Job Type</Label>
          <Select value={job.type} onValueChange={(value) => setJob({ ...job, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full Time">Full Time</SelectItem>
              <SelectItem value="Part Time">Part Time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={job.category}
            onChange={(e) => setJob({ ...job, category: e.target.value })}
            placeholder="e.g. Information Technology"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience Level</Label>
          <Select value={job.experience} onValueChange={(value) => setJob({ ...job, experience: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry Level">Entry Level</SelectItem>
              <SelectItem value="Mid Level">Mid Level</SelectItem>
              <SelectItem value="Senior Level">Senior Level</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary Range</Label>
          <Input
            id="salary"
            value={job.salary}
            onChange={(e) => setJob({ ...job, salary: e.target.value })}
            placeholder="e.g. NPR 80,000 - 120,000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Application Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={job.deadline}
            onChange={(e) => setJob({ ...job, deadline: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier">Job Tier</Label>
          <Select value={job.tier} onValueChange={(value) => setJob({ ...job, tier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="megajob">MegaJob (Premium Tier)</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="prime">Prime</SelectItem>
              <SelectItem value="newspaper">Newspaper</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Job Settings</Label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.featured || false}
                onChange={(e) => setJob({ ...job, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Featured Job</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={job.urgent || false}
                onChange={(e) => setJob({ ...job, urgent: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Urgent Hiring</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={job.description}
          onChange={(e) => setJob({ ...job, description: e.target.value })}
          placeholder="Describe the job role, responsibilities, and requirements..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements (one per line)</Label>
        <Textarea
          id="requirements"
          value={Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements}
          onChange={(e) => setJob({ ...job, requirements: e.target.value })}
          placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits (one per line)</Label>
        <Textarea
          id="benefits"
          value={Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits}
          onChange={(e) => setJob({ ...job, benefits: e.target.value })}
          placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Management & Approval</h2>
          <p className="text-gray-600">Manage job postings and approve pending submissions</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Create a new job posting. Admin-created jobs are automatically approved.
              </DialogDescription>
            </DialogHeader>
            <JobFormFields job={newJob} setJob={setNewJob} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>
                Create & Approve Job
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-xl font-bold">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-xl font-bold text-yellow-600">{pendingJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold text-green-600">{approvedJobs.length}</p>
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
                <p className="text-xl font-bold text-red-600">{rejectedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="megajob">MegaJob</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="prime">Prime</SelectItem>
                <SelectItem value="newspaper">Newspaper</SelectItem>
                <SelectItem value="latest">Latest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterApproval} onValueChange={setFilterApproval}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approval</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedJobs.length} job(s) selected
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkApproval('approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkApproval('reject')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-yellow-600">
            Pending ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-green-600">
            Approved ({approvedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-red-600">
            Rejected ({rejectedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobs([...selectedJobs, job.id]);
                          } else {
                            setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getApprovalBadge(job)}
                      {getTierBadge(job.tier)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{job.location} • {job.type}</span>
                    </div>
                    {job.salary && (
                      <div className="text-sm font-medium text-green-600">
                        {job.salary}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      Posted: {job.publishedDate}
                    </div>
                    {job.urgent && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      {job.approvalStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveJob(job.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectJob(job.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {job.approvalStatus === 'approved' && (
                      <Badge variant="outline" className="text-xs">
                        Live on Site
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search or filters.' : 'No jobs match the current filter criteria.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Job Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <JobFormFields job={selectedJob} setJob={setSelectedJob} />
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditJob}>
              Update Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
