import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete } from '../../utils/confirmDelete';

interface JobManagementProps {
  jobs: any[];
  companies: any[];
  onJobUpdate: (jobs: any[]) => void;
}

export function JobManagement({ jobs, companies, onJobUpdate }: JobManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
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
    featured: false
  });

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || job.tier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && new Date(job.publishedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                         (filterStatus === 'expired' && new Date(job.publishedDate) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleCreateJob = () => {
    const job = {
      id: Date.now().toString(),
      ...newJob,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      benefits: newJob.benefits.split('\n').filter(b => b.trim()),
      postedDate: 'Just posted',
      publishedDate: new Date().toISOString().split('T')[0],
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      source: 'online' as const
    };

    onJobUpdate([...jobs, job]);
    setIsCreateModalOpen(false);
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
      featured: false
    });
    toast.success('Job created successfully!');
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
              : selectedJob.benefits.split('\n').filter((b: string) => b.trim())
          }
        : job
    );

    onJobUpdate(updatedJobs);
    setIsEditModalOpen(false);
    setSelectedJob(null);
    toast.success('Job updated successfully!');
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirmDelete('Are you sure you want to delete this job?')) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      onJobUpdate(updatedJobs);
      toast.success('Job deleted successfully!');
    }
  };

  const handleBulkTierChange = (newTier: string) => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs first');
      return;
    }

    const updatedJobs = jobs.map(job => 
      selectedJobs.includes(job.id) ? { ...job, tier: newTier } : job
    );
    onJobUpdate(updatedJobs);
    setSelectedJobs([]);
    toast.success(`${selectedJobs.length} jobs moved to ${newTier} tier!`);
  };

  const handleBulkDelete = () => {
    if (selectedJobs.length === 0) {
      toast.error('Please select jobs first');
      return;
    }

    if (confirmDelete(`Are you sure you want to delete ${selectedJobs.length} selected jobs?`)) {
      const updatedJobs = jobs.filter(job => !selectedJobs.includes(job.id));
      onJobUpdate(updatedJobs);
      setSelectedJobs([]);
      toast.success(`${selectedJobs.length} jobs deleted successfully!`);
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'megajob':
        return <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">MegaJob</Badge>;
      case 'premium':
        return <Badge className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">Premium</Badge>;
      case 'prime':
        return <Badge className="bg-gradient-to-r from-green-600 to-green-800 text-white">Prime</Badge>;
      case 'newspaper':
        return <Badge className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">Newspaper</Badge>;
      case 'latest':
        return <Badge className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">Latest</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const JobFormFields = ({ job, setJob, isEdit = false }: any) => (
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
            {companies.map(company => (
              <SelectItem key={company.name} value={company.name}>
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
          placeholder="e.g. Kathmandu"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Job Type *</Label>
        <Select value={job.type} onValueChange={(value) => setJob({ ...job, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Full Time">Full Time</SelectItem>
            <SelectItem value="Part Time">Part Time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={job.category}
          onChange={(e) => setJob({ ...job, category: e.target.value })}
          placeholder="e.g. Technology"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">Salary *</Label>
        <Input
          id="salary"
          value={job.salary}
          onChange={(e) => setJob({ ...job, salary: e.target.value })}
          placeholder="e.g. Rs. 50,000 - 80,000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience Level *</Label>
        <Select value={job.experience} onValueChange={(value) => setJob({ ...job, experience: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Entry Level">Entry Level</SelectItem>
            <SelectItem value="Junior Level">Junior Level</SelectItem>
            <SelectItem value="Mid Level">Mid Level</SelectItem>
            <SelectItem value="Senior Level">Senior Level</SelectItem>
            <SelectItem value="Executive Level">Executive Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tier">Job Tier *</Label>
        <Select value={job.tier} onValueChange={(value) => setJob({ ...job, tier: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest - Free</SelectItem>
            <SelectItem value="newspaper">Newspaper - Free</SelectItem>
            <SelectItem value="prime">Prime - Free</SelectItem>
            <SelectItem value="premium">Premium - Free</SelectItem>
            <SelectItem value="megajob">MegaJob - Free</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">All job postings are now free! Tiers are for visibility and priority.</p>
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={job.description}
          onChange={(e) => setJob({ ...job, description: e.target.value })}
          placeholder="Describe the job role and responsibilities..."
          rows={4}
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="requirements">Requirements (one per line) *</Label>
        <Textarea
          id="requirements"
          value={Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements}
          onChange={(e) => setJob({ ...job, requirements: e.target.value })}
          placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
          rows={4}
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="benefits">Benefits (one per line) *</Label>
        <Textarea
          id="benefits"
          value={Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits}
          onChange={(e) => setJob({ ...job, benefits: e.target.value })}
          placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
          rows={4}
        />
      </div>

      <div className="md:col-span-2 flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={job.featured}
          onChange={(e) => setJob({ ...job, featured: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="featured">Featured Job (appears prominently)</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-gray-600">Manage all job postings</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job posting to the platform.
              </DialogDescription>
            </DialogHeader>
            <JobFormFields job={newJob} setJob={setNewJob} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>
                Create Job
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs by title, company, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <p className="font-medium text-blue-900">
                  {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJobs([])}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select onValueChange={handleBulkTierChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Move to tier..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="newspaper">Newspaper</SelectItem>
                    <SelectItem value="prime">Prime</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="megajob">MegaJob</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
            {filteredJobs.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <Label htmlFor="select-all" className="text-sm">
                  Select All
                </Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className={`border rounded-lg p-4 transition-colors ${selectedJobs.includes(job.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
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
                      className="rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        {getTierBadge(job.tier)}
                        {job.featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Location:</strong> {job.location} • <strong>Type:</strong> {job.type}</p>
                        <p><strong>Category:</strong> {job.category} • <strong>Salary:</strong> {job.salary}</p>
                        <p><strong>Posted:</strong> {job.publishedDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={job.tier}
                      onValueChange={(newTier) => {
                        const updatedJobs = jobs.map(j => 
                          j.id === job.id ? { ...j, tier: newTier } : j
                        );
                        onJobUpdate(updatedJobs);
                        toast.success(`Job moved to ${newTier} tier!`);
                      }}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="newspaper">Newspaper</SelectItem>
                        <SelectItem value="prime">Prime</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="megajob">MegaJob</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJob({
                          ...job,
                          requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements.join('\n'),
                          benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits.join('\n')
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No jobs found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Job Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update the job posting details.
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <JobFormFields job={selectedJob} setJob={setSelectedJob} isEdit={true} />
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
