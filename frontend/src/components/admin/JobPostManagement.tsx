import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
import { apiClient } from '../../lib/api-client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { normalizeMediaUrl } from '../../utils/media';
import { getJobParameters } from '../../services/jobParametersService';
import { normalizeTier, getTierLabel } from '../../utils/tier';

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
  const [activeTab, setActiveTab] = useState<'all-jobs' | 'add-job' | 'pending' | 'tier-management'>('all-jobs');
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editingCoverFile, setEditingCoverFile] = useState<File | null>(null);
  const [viewingJob, setViewingJob] = useState<any>(null);
  const [parameters] = useState(getJobParameters());
  const [newCoverDims, setNewCoverDims] = useState<{w:number;h:number}|null>(null);

  // Enhanced job data with normalized tier
  const enhancedJobs = jobs.map(job => ({
    ...job,
    tier: normalizeTier(job.tier) || 'latest',
    applicationCount: typeof job.applicationCount === 'number' ? job.applicationCount : 0,
    viewCount: typeof job.viewCount === 'number' ? job.viewCount : 0,
    featured: !!job.featured,
    urgent: !!job.urgent,
    licenseRequired: typeof job.license_required === 'boolean' ? job.license_required : !!job.licenseRequired,
    postedDate: job.postedDate || new Date().toISOString().split('T')[0],
    expiryDate: job.expiryDate || job.deadline || '',
    status: job.status || 'active'
  }));

  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: '',
    // structured salary fields
    salaryType: 'exact',
    salaryMin: '',
    salaryMax: '',
    payType: 'Monthly',
    tier: 'latest',
    type: 'Full Time',
    category: '',
    experience: '',
    jobLevel: '',
    skillCategory: '',
    skillName: '',
    tagsInput: '',
    licenseRequired: false,
    deadline: '',
    featured: false,
    urgent: false,
    coverImage: null as File | null
  });

  const jobTiers = [
    { key: 'megajob', label: 'MegaJob', price: 'Free', color: 'bg-red-100 text-red-800', icon: Crown, description: 'Premium placement with maximum visibility' },
    { key: 'premium', label: 'Premium Job', price: 'Free', color: 'bg-blue-100 text-blue-800', icon: Star, description: 'Enhanced visibility and special highlighting' },
    { key: 'prime', label: 'Prime Job', price: 'Free', color: 'bg-purple-100 text-purple-800', icon: Gem, description: 'Featured placement with priority listing' },
    { key: 'latest', label: 'Latest Jobs', price: 'Free', color: 'bg-green-100 text-green-800', icon: Briefcase, description: 'Standard job posting' },
    { key: 'newspaper', label: 'Newspaper Jobs', price: 'Free', color: 'bg-gray-100 text-gray-800', icon: Briefcase, description: 'Basic listing for newspaper jobs' }
  ];

  const filteredJobs = enhancedJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesTier = tierFilter === 'all' || normalizeTier(job.tier) === tierFilter;
    const matchesCompany = companyFilter === 'all' || job.company === companyFilter;
    return matchesSearch && matchesStatus && matchesTier && matchesCompany;
  });

  // Pagination state for Jobs table
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tierFilter, companyFilter, itemsPerPage]);

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

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    let updatedCoverUrl = editingJob.coverImageUrl || (editingJob as any).cover_image_url;
    try {
      if (editingCoverFile) {
        const jobId = editingJob.id || editingJob._id;
        const res = await apiClient.uploadAdminJobCover(String(jobId), editingCoverFile);
        const uploadedUrl = res?.job?.cover_image_url || res?.upload?.secure_url || res?.upload?.url || res?.url;
        if (uploadedUrl) {
          updatedCoverUrl = uploadedUrl;
        }
      }
    } catch (err: any) {
      console.warn('Cover upload failed:', err?.message || err);
      toast.error('Cover image upload failed');
    }
    const updatedJobs = jobs.map(job => {
      const matches = job.id === editingJob.id || job._id === (editingJob as any)._id;
      if (!matches) return job;
      const next = {
        ...editingJob,
        tier: normalizeTier(editingJob.tier) || 'latest',
        coverImageUrl: updatedCoverUrl,
        // Also set snake_case for backend persistence and other mappers
        cover_image_url: updatedCoverUrl
      } as any;
      return next;
    });
    onJobUpdate(updatedJobs);
    setEditingJob(null);
    setEditingCoverFile(null);
    toast.success('Job updated successfully!');
  };

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formatNumber = (val: string) => {
        const num = Number(val);
        if (Number.isNaN(num)) return val;
        return num.toLocaleString();
      };

      const typeMap: Record<string, string> = {
        'Full Time': 'full_time',
        'Part Time': 'part_time',
        'Contract': 'contract',
        'Internship': 'internship'
      };
      const expMap: Record<string, string> = {
        'Entry Level': 'entry',
        'Mid Level': 'mid',
        'Senior Level': 'senior',
        'Executive': 'executive'
      };

      let salaryFormatted = '';
      if (newJob.salaryType === 'negotiable') {
        salaryFormatted = `Negotiable (${newJob.payType})`;
      } else if (newJob.salaryType === 'range' && newJob.salaryMin && newJob.salaryMax) {
        salaryFormatted = `NPR ${formatNumber(newJob.salaryMin)} - ${formatNumber(newJob.salaryMax)} (${newJob.payType})`;
      } else if (newJob.salary) {
        salaryFormatted = `NPR ${formatNumber(newJob.salary)} (${newJob.payType})`;
      }

      const payload: any = {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements
          ? newJob.requirements.split('\n').map(r => r.trim()).filter(Boolean)
          : [],
        location: newJob.location,
        company: newJob.company,
        employment_type: typeMap[newJob.type] || 'full_time',
        experience_level: expMap[newJob.experience] || (newJob.experience?.toLowerCase() || 'entry'),
        tier: normalizeTier(newJob.tier) || 'latest',
        featured: !!newJob.featured,
        license_required: !!newJob.licenseRequired,
        deadline: newJob.deadline || undefined,
        skills: newJob.skillName ? [newJob.skillName] : [],
        tags: newJob.tagsInput
          ? newJob.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        // send formatted salary string for backend persistence/display
        salary_range: salaryFormatted || undefined
      };

      const res = await apiClient.createJobByAdmin(payload);
      const createdJob = (res?.job || res);
      let coverUrl: string | null = null;

      if (newJob.coverImage && createdJob?._id) {
        try {
          const uploadRes = await apiClient.uploadAdminJobCover(String(createdJob._id), newJob.coverImage);
          coverUrl = uploadRes?.job?.cover_image_url || uploadRes?.upload?.secure_url || uploadRes?.upload?.url || null;
        } catch (e: any) {
          console.warn('Cover upload failed:', e?.message || e);
          toast.error('Cover image upload failed');
        }
      }

      const uiJob = {
        id: createdJob?._id || Date.now().toString(),
        title: createdJob?.title || newJob.title,
        company: createdJob?.company || newJob.company,
        location: createdJob?.location || newJob.location,
        description: createdJob?.description || newJob.description,
        requirements: Array.isArray(createdJob?.requirements) ? createdJob.requirements : payload.requirements,
        tier: normalizeTier(createdJob?.tier || newJob.tier) || 'latest',
        featured: !!(createdJob?.featured ?? newJob.featured),
        urgent: !!newJob.urgent,
        licenseRequired: !!(createdJob?.license_required ?? newJob.licenseRequired),
        deadline: createdJob?.deadline || newJob.deadline,
        status: createdJob?.status || 'active',
        applicationCount: 0,
        viewCount: 0,
        coverImageUrl: coverUrl || createdJob?.cover_image_url || null,
        tags: Array.isArray(createdJob?.tags) ? createdJob.tags : payload.tags,
        skillName: newJob.skillName,
        jobLevel: newJob.jobLevel,
        // reflect salary on UI list
        salary: createdJob?.salary || createdJob?.salary_range || salaryFormatted
      } as any;

      onJobUpdate([...jobs, uiJob]);

      // reset form
      setNewJob({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary: '',
        salaryType: 'exact',
        salaryMin: '',
        salaryMax: '',
        payType: 'Monthly',
        tier: 'latest',
        type: 'Full Time',
        category: '',
        experience: '',
        jobLevel: '',
        skillCategory: '',
        skillName: '',
        tagsInput: '',
        licenseRequired: false,
        deadline: '',
        featured: false,
        urgent: false,
        coverImage: null
      });
      setNewCoverDims(null);
      setActiveTab('all-jobs');
      toast.success('Job created successfully!');
    } catch (err: any) {
      console.error('Create job failed:', err?.message || err);
      toast.error('Failed to create job');
    }
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
    const canonical = normalizeTier(tier) || 'latest';
    const tierConfig = jobTiers.find(t => t.key === canonical);
    if (!tierConfig) return <Badge variant="outline">{getTierLabel(canonical)}</Badge>;
    const Icon = tierConfig.icon;
    return (
      <Badge className={tierConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {tierConfig.label}
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
          <Button onClick={() => setActiveTab('add-job')}>
            <Upload className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {jobTiers.map((tier) => {
          const tierJobs = tier.key === 'latest'
            ? enhancedJobs
            : enhancedJobs.filter(job => normalizeTier(job.tier) === tier.key);
          const Icon = tier.icon;
          return (
            <Card key={tier.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{tier.label}</p>
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="add-job">+ Add Job</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="tier-management">Tier Management</TabsTrigger>
        </TabsList>

        {/* Add Job */}
        <TabsContent value="add-job" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Job Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
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
                    <Label>Offered Salary</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="payType">Pay Type</Label>
                        <select
                          id="payType"
                          value={newJob.payType}
                          onChange={(e) => setNewJob({ ...newJob, payType: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="salaryRange">Salary Range</Label>
                        <select
                          id="salaryRange"
                          value={newJob.salaryType === 'range' ? `${newJob.salaryMin}-${newJob.salaryMax}` : newJob.salaryType}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'negotiable') {
                              setNewJob({ ...newJob, salaryType: 'negotiable', salaryMin: '', salaryMax: '', salary: '' });
                            } else if (val.includes('-')) {
                              const [min, max] = val.split('-');
                              setNewJob({ ...newJob, salaryType: 'range', salaryMin: min, salaryMax: max, salary: '' });
                            } else {
                              setNewJob({ ...newJob, salaryType: 'exact', salaryMin: '', salaryMax: '' });
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select range or negotiable</option>
                          <option value="negotiable">Negotiable</option>
                          <option value="20000-30000">20,000-30,000</option>
                          <option value="30000-40000">30,000-40,000</option>
                          <option value="40000-50000">40,000-50,000</option>
                          <option value="50000-60000">50,000-60,000</option>
                          <option value="60000-70000">60,000-70,000</option>
                          <option value="70000-80000">70,000-80,000</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="jobSalary">Salary Amount (NPR)</Label>
                      <Input
                        id="jobSalary"
                        type="number"
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value, salaryType: 'exact', salaryMin: '', salaryMax: '' })}
                        placeholder="e.g. 60000"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTier">Job Tier</Label>
                    <select
                      id="jobTier"
                      value={newJob.tier}
                      onChange={(e) => setNewJob({ ...newJob, tier: normalizeTier(e.target.value) || 'latest' })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {jobTiers.map(tier => (
                        <option key={tier.key} value={tier.key}>
                          {tier.label} - {tier.price}
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
                    <select
                      id="jobExperience"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select experience</option>
                      {parameters.experience.map((exp) => (
                        <option key={exp.id} value={exp.name}>{exp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobLevel">Job Level</Label>
                    <select
                      id="jobLevel"
                      value={newJob.jobLevel}
                      onChange={(e) => setNewJob({ ...newJob, jobLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select job level</option>
                      {parameters.jobLevels.map((lvl) => (
                        <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseRequired">License Required</Label>
                    <div className="flex items-center h-[38px] border rounded-md px-3">
                      <input
                        id="licenseRequired"
                        type="checkbox"
                        checked={newJob.licenseRequired}
                        onChange={(e) => setNewJob({ ...newJob, licenseRequired: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Check if a license is required</span>
                    </div>
                  </div>
                </div>

                {/* Skill Category and Skill */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skillCategory">Skill Category</Label>
                    <select
                      id="skillCategory"
                      value={newJob.skillCategory}
                      onChange={(e) => setNewJob({ ...newJob, skillCategory: e.target.value, skillName: '' })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select category</option>
                      {Array.from(new Set(parameters.skills.map(s => s.category))).sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skillName">Skill</Label>
                    <select
                      id="skillName"
                      value={newJob.skillName}
                      onChange={(e) => setNewJob({ ...newJob, skillName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select skill</option>
                      {(newJob.skillCategory ? parameters.skills.filter(s => s.category === newJob.skillCategory) : parameters.skills).map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
                  <Input
                    id="tagsInput"
                    value={newJob.tagsInput}
                    onChange={(e) => setNewJob({ ...newJob, tagsInput: e.target.value })}
                    placeholder="e.g. React, Remote, Senior"
                  />
                  <p className="text-xs text-gray-500">Used for filtering and search. Keep them short.</p>
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
                        {newCoverDims && (
                          <p className="text-xs text-gray-500">Selected size: {newCoverDims.w}x{newCoverDims.h}px • Recommended: 1200x600px • Max: 5MB</p>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setNewJob({ ...newJob, coverImage: null }); setNewCoverDims(null); }}
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
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setNewJob({ ...newJob, coverImage: file });
                            setNewCoverDims(null);
                            if (file) {
                              const img = new Image();
                              img.onload = () => setNewCoverDims({ w: img.naturalWidth, h: img.naturalHeight });
                              img.src = URL.createObjectURL(file);
                            }
                          }}
                          className="hidden"
                          id="job-cover-upload-inline"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('job-cover-upload-inline')?.click()}
                          className="mt-2"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setNewJob({
                      title: '',
                      company: '',
                      location: '',
                      description: '',
                      requirements: '',
                      salary: '',
                      salaryType: 'exact',
                      salaryMin: '',
                      salaryMax: '',
                      payType: 'Monthly',
                      tier: 'latest',
                      type: 'Full Time',
                      category: '',
                      experience: '',
                      jobLevel: '',
                      skillCategory: '',
                      skillName: '',
                      tagsInput: '',
                      licenseRequired: false,
                      deadline: '',
                      featured: false,
                      urgent: false,
                      coverImage: null
                    });
                    setNewCoverDims(null);
                  }}>Reset</Button>
                  <Button onClick={handleCreateJob}>Create Job</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                      <option key={tier.key} value={tier.key}>{tier.label}</option>
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
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Job</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Tier</th>
                      <th className="text-left py-3 px-4">Applications</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">License</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Posted</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedJobs.map((job, idx) => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-start space-x-3">
                            {job.coverImageUrl || (job as any).cover_image_url ? (
                              <ImageWithFallback
                                src={normalizeMediaUrl(job.coverImageUrl || (job as any).cover_image_url) || (job.coverImageUrl || (job as any).cover_image_url)}
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
                                {job.licenseRequired && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">License Required</Badge>
                                )}
                              </div>
                              {(job.jobLevel || job.skillName) && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {job.jobLevel ? `Job Level: ${job.jobLevel}` : ''}
                                  {job.jobLevel && job.skillName ? ' • ' : ''}
                                  {job.skillName ? `Skill: ${job.skillName}${job.skillCategory ? ` (${job.skillCategory})` : ''}` : ''}
                                </p>
                              )}
                              {Array.isArray(job.tags) && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {job.tags.slice(0, 6).map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px]">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
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
                          <Badge variant="outline" className={job.licenseRequired ? 'bg-blue-50' : ''}>
                            {job.licenseRequired ? 'Required' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {job.postedDate}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => setViewingJob(job)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingJob({ ...job })}>
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
              {/* Pagination Controls */}
              {filteredJobs.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t mt-2">
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
                    Showing {filteredJobs.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}
                    {" "}to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} entries
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
                {jobTiers.map((tier) => {
                  const tierJobs = tier.key === 'latest'
                    ? enhancedJobs
                    : enhancedJobs.filter(job => normalizeTier(job.tier) === tier.key);
                  const Icon = tier.icon;
                  return (
                    <Card key={tier.key} className="relative">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Icon className="h-8 w-8 text-gray-600" />
                          <div>
                            <h3 className="font-semibold">{tier.label}</h3>
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
                            <span className="font-medium">
                              {typeof tier.price === 'string' && tier.price.toLowerCase().includes('free') 
                                ? 'Free' 
                                : `Rs. ${(tierJobs.length * (parseInt(String(tier.price).replace(/[^\d]/g, '')) || 0)).toLocaleString()}`}
                            </span>
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
        {/* View Job Modal */}
        <Dialog open={!!viewingJob} onOpenChange={(open) => { if (!open) setViewingJob(null); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{viewingJob?.title || 'Job Details'}</DialogTitle>
              <DialogDescription>Quick view of job posting.</DialogDescription>
            </DialogHeader>
            {viewingJob && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">{getTierBadge(viewingJob.tier)}</div>
                <p className="text-sm text-gray-600">{viewingJob.company} • {viewingJob.location}</p>
                <p className="text-sm">{viewingJob.description || 'No description provided.'}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Applications: {viewingJob.applicationCount}</span>
                  <span>Views: {viewingJob.viewCount}</span>
                  <span>Status: {viewingJob.status}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Job Modal */}
        <Dialog open={!!editingJob} onOpenChange={(open) => { if (!open) setEditingJob(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update the job posting details.</DialogDescription>
            </DialogHeader>
            {editingJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Job Title</Label>
                    <Input id="edit-title" value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company</Label>
                    <Input id="edit-company" value={editingJob.company} onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input id="edit-location" value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tier">Tier</Label>
                    <select
                      id="edit-tier"
                      className="w-full px-3 py-2 border rounded-md bg-white"
                      value={editingJob.tier}
                      onChange={(e) => setEditingJob({ ...editingJob, tier: normalizeTier(e.target.value) || 'latest' })}
                    >
                      {jobTiers.map(tier => (
                        <option key={tier.key} value={tier.key}>{tier.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" value={editingJob.description || ''} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-license">License Required</Label>
                    <div className="flex items-center gap-2">
                      <input id="edit-license" type="checkbox" checked={!!editingJob.licenseRequired} onChange={(e) => setEditingJob({ ...editingJob, licenseRequired: e.target.checked })} />
                      <span className="text-sm text-gray-600">Required</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-cover">Cover Image</Label>
                    <div className="flex items-center gap-4">
                      {(editingJob as any).coverImageUrl || (editingJob as any).cover_image_url ? (
                        <img 
                          src={normalizeMediaUrl((editingJob as any).coverImageUrl || (editingJob as any).cover_image_url) || ((editingJob as any).coverImageUrl || (editingJob as any).cover_image_url)} 
                          alt="Current cover" 
                          className="h-20 w-auto rounded" 
                        />
                      ) : null}
                      <input
                        id="edit-cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingCoverFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Use a wide image (~1600x600) for best results.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
              <Button onClick={handleUpdateJob}>Update Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}
