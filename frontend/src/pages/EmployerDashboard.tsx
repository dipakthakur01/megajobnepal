import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Users, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import { getJobParameters } from '../services/jobParametersService';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string;
  benefits: string;
  postedDate: string;
  deadline?: string;
  logo?: string;
  featured: boolean;
  tier?: string;
  source?: string;
  publishedDate?: string;
  tags?: string[];
}

interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: string;
  appliedDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  company?: string;
  profile?: any;
}

interface NewJobData {
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  salaryType: string;
  salaryMin: string;
  salaryMax: string;
  experience: string;
  description: string;
  requirements: string;
  expiryDate: string;
  benefits: string;
  skills: string[];
  languages: string[];
  jobLevel: string;
  employeeType: string;
}

interface EmployerDashboardProps {
  jobs: Job[];
  applications: Application[];
  currentUser: User;
}

export function EmployerDashboard({ jobs, applications, currentUser }: EmployerDashboardProps) {
  const [showAddJobModal, setShowAddJobModal] = useState<boolean>(false);
  const params = getJobParameters();
  const skillOptions = params.skills.filter(s => s.status === 'active').map(s => s.name);
  const languageOptions = params.languages.filter(l => l.status === 'active').map(l => l.name);
  const jobLevelOptions = params.jobLevels.filter(j => j.status === 'active').map(j => j.name);
  const employeeTypeOptions = params.employeeTypes.filter(e => e.status === 'active').map(e => e.name);
  const [newJob, setNewJob] = useState<NewJobData>({
    title: '',
    company: currentUser?.company || '',
    location: '',
    type: employeeTypeOptions[0] || 'Full Time',
    category: '',
    salary: '',
    salaryType: 'exact',
    salaryMin: '',
    salaryMax: '',
    experience: jobLevelOptions[0] || 'Entry Level',
    description: '',
    requirements: '',
    expiryDate: '',
    benefits: '',
    skills: [],
    languages: [],
    jobLevel: jobLevelOptions[0] || 'Entry Level',
    employeeType: employeeTypeOptions[0] || 'Full Time'
  });

  // Mock employer jobs (in real app, filter by currentUser.id)
  const employerJobs = jobs.slice(0, 3);
  const jobApplications = applications.slice(0, 8);

  const stats = {
    totalJobs: employerJobs.length,
    totalApplications: jobApplications.length,
    activeJobs: employerJobs.filter(job => job.featured).length,
    viewsThisMonth: 1250
  };

  const handleAddJob = (): void => {
    // Format salary based on selected type
    let formattedSalary = 'Not specified';
    const toNum = (v: string) => {
      const n = parseInt((v || '').toString().replace(/[^0-9]/g, '') || '');
      return isNaN(n) ? undefined : n;
    };
    switch (newJob.salaryType) {
      case 'range': {
        const min = toNum(newJob.salaryMin);
        const max = toNum(newJob.salaryMax);
        if (min && max) {
          formattedSalary = `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
        } else if (min) {
          formattedSalary = `NPR ${min.toLocaleString()}`;
        } else if (max) {
          formattedSalary = `NPR ${max.toLocaleString()}`;
        }
        break;
      }
      case 'exact': {
        const exact = toNum(newJob.salary) ?? toNum(newJob.salaryMin);
        if (exact) {
          formattedSalary = `NPR ${exact.toLocaleString()}`;
        }
        break;
      }
      case 'negotiable':
        formattedSalary = 'Negotiable';
        break;
      case 'competitive':
        formattedSalary = 'Competitive';
        break;
      default:
        break;
    }

    // Set expiry date if not provided (default to 30 days from now)
    let expiryDate = newJob.expiryDate;
    if (!expiryDate) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expiryDate = futureDate.toISOString().split('T')[0];
    }

    const jobData = {
      ...newJob,
      salary: formattedSalary,
      expiryDate,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    // In a real app, this would make an API call
    console.log('Adding new job:', jobData);
    setShowAddJobModal(false);
    setNewJob({
      title: '',
      company: currentUser?.company || '',
      location: '',
      type: 'Full Time',
      category: '',
      salary: '',
      salaryType: 'exact',
      salaryMin: '',
      salaryMax: '',
      experience: 'Entry Level',
      description: '',
      requirements: '',
      expiryDate: '',
      benefits: '',
      skills: [],
      languages: [],
      jobLevel: 'Entry Level',
      employeeType: 'Full Time'
    });
  };

  const getApplicationStatus = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Reviewed' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    return statusConfig[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
          </div>
          <Dialog open={showAddJobModal} onOpenChange={setShowAddJobModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="post-job-description">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
                <DialogDescription id="post-job-description">
                  Fill out the form below to create a new job posting for your company.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g. Kathmandu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Job Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newJob.expiryDate}
                      onChange={(e) => setNewJob({ ...newJob, expiryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Enhanced Salary Section */}
                <div className="space-y-4">
                  <Label>Salary Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaryType">Salary Type</Label>
                      <Select value={newJob.salaryType} onValueChange={(value) => setNewJob({ ...newJob, salaryType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="range">Salary Range</SelectItem>
                          <SelectItem value="exact">Fixed Salary</SelectItem>
                          <SelectItem value="negotiable">Negotiable</SelectItem>
                          <SelectItem value="competitive">Competitive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div></div>
                  </div>

                  {newJob.salaryType === 'range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaryMin">Minimum Salary (NPR)</Label>
                        <Input
                          id="salaryMin"
                          type="number"
                          value={newJob.salaryMin}
                          onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                          placeholder="e.g. 50000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryMax">Maximum Salary (NPR)</Label>
                        <Input
                          id="salaryMax"
                          type="number"
                          value={newJob.salaryMax}
                          onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                          placeholder="e.g. 70000"
                        />
                      </div>
                    </div>
                  )}

                  {newJob.salaryType === 'exact' && (
                    <div>
                      <Label htmlFor="salary">Salary Amount (NPR)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                        placeholder="e.g. 60000"
                      />
                    </div>
                  )}

                  {(newJob.salaryType === 'negotiable' || newJob.salaryType === 'competitive') && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        {newJob.salaryType === 'negotiable' 
                          ? 'Salary will be marked as "Negotiable" - candidates can discuss compensation during the interview process.'
                          : 'Salary will be marked as "Competitive" - indicating market-rate compensation based on experience.'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Job Parameters */}
                <div className="space-y-4">
                  <Label>Job Parameters</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="employeeType">Employee Type</Label>
                      <Select value={newJob.employeeType} onValueChange={(value) => setNewJob({ ...newJob, employeeType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeTypeOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="jobLevel">Job Level</Label>
                      <Select value={newJob.jobLevel} onValueChange={(value) => setNewJob({ ...newJob, jobLevel: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobLevelOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select value={newJob.experience} onValueChange={(value) => setNewJob({ ...newJob, experience: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                          <SelectItem value="Junior Level">Junior Level</SelectItem>
                          <SelectItem value="Mid Level">Mid Level</SelectItem>
                          <SelectItem value="Senior Level">Senior Level</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Skills (select one or more)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {skillOptions.map((skill) => {
                        const checked = newJob.skills.includes(skill);
                        return (
                          <label key={skill} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...newJob.skills, skill]
                                  : newJob.skills.filter(s => s !== skill);
                                setNewJob({ ...newJob, skills: next });
                              }}
                            />
                            <span>{skill}</span>
                          </label>
                        );
                      })}
                    </div>
                    {newJob.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newJob.skills.map((s) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Languages</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {languageOptions.map((lang) => {
                        const checked = newJob.languages.includes(lang);
                        return (
                          <label key={lang} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...newJob.languages, lang]
                                  : newJob.languages.filter(l => l !== lang);
                                setNewJob({ ...newJob, languages: next });
                              }}
                            />
                            <span>{lang}</span>
                          </label>
                        );
                      })}
                    </div>
                    {newJob.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newJob.languages.map((l) => (
                          <Badge key={l} variant="outline">{l}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Job Type</Label>
                    <Select value={newJob.type} onValueChange={(value) => setNewJob({ ...newJob, type: value })}>
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
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newJob.category}
                      onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                      placeholder="e.g. IT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={newJob.experience} onValueChange={(value) => setNewJob({ ...newJob, experience: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry Level">Entry Level</SelectItem>
                        <SelectItem value="Junior Level">Junior Level</SelectItem>
                        <SelectItem value="Mid Level">Mid Level</SelectItem>
                        <SelectItem value="Senior Level">Senior Level</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements (separate with commas)</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="e.g. Bachelor's degree, 2+ years experience, JavaScript knowledge"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits (separate with commas)</Label>
                  <Textarea
                    id="benefits"
                    value={newJob.benefits}
                    onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                    placeholder="e.g. Health insurance, Flexible hours, Professional development"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddJobModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddJob} className="bg-blue-600 hover:bg-blue-700">
                    Post Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.viewsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Job Postings Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Your Job Postings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employerJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.location} • {job.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Applications: {jobApplications.filter(app => app.jobId === job.id).length}</span>
                          <span>Views: 150</span>
                          <span>Posted: {job.postedDate}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{job.type}</Badge>
                          {job.featured && <Badge className="bg-blue-100 text-blue-800">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobApplications.map((application) => {
                    const job = jobs.find(j => j.id === application.jobId);
                    const status = getApplicationStatus(application.status);
                    
                    return (
                      <div key={application.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{job?.title}</h3>
                            <p className="text-gray-600">Applicant ID: {application.userId}</p>
                            <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
                          </div>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>{job?.location}</span>
                            <span>{job?.type}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Application
                            </Button>
                            <Button variant="outline" size="sm">
                              Contact Applicant
                            </Button>
                            {application.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Accept
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-medium">12 applications</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Week</span>
                      <span className="font-medium">8 applications</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium">45 applications</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Month</span>
                      <span className="font-medium">38 applications</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Job Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employerJobs.map((job, index) => (
                      <div key={job.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Math.floor(Math.random() * 20) + 5} views</p>
                          <p className="text-sm text-gray-600">{Math.floor(Math.random() * 8) + 1} applications</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default EmployerDashboard;
