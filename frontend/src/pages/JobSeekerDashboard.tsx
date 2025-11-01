import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';

import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import { Upload, Edit, Heart, Clock, CheckCircle, XCircle, User, FileText, Bell, Eye, Download, MapPin, Calendar as CalendarIcon, Briefcase, GraduationCap, Award, Plus, Trash2, AlertCircle, Map, BookmarkPlus, Search } from 'lucide-react';
import { Job, Application, User as UserType } from '@/pages/providers/AppProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate: Date | null;
  grade?: string;
  isCurrentlyStudying: boolean;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  isCurrentlyWorking: boolean;
}

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  jobType: string;
  salaryMin?: number;
  emailNotifications: boolean;
  isActive: boolean;
  createdAt: Date;
}

interface ApplicationReminder {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  deadline: Date;
  reminderDate: Date;
  isCompleted: boolean;
}

interface JobSeekerDashboardProps {
  user: UserType;
  jobs: Job[];
  applications: Application[];
  onApplicationUpdate: (applications: Application[]) => void;
  onLogout: () => void;
}

export function JobSeekerDashboard({ user, jobs, applications, onApplicationUpdate, onLogout }: JobSeekerDashboardProps) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showJobAlertDialog, setShowJobAlertDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+977 9841234567',
    location: 'Kathmandu, Nepal',
    bio: 'Experienced professional looking for new opportunities in technology sector.',
    experience: '3+ years',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    education: 'Bachelor in Computer Science',
    resume: null as File | null,
    profilePicture: null as File | null,
    website: '',
    linkedIn: '',
    github: '',
    preferredJobTypes: ['full_time', 'remote'],
    preferredSalaryMin: 50000,
    preferredLocations: ['Kathmandu', 'Remote'],
    availabilityStatus: 'actively_looking', // actively_looking, open_to_offers, not_looking
    noticePeriod: '30_days'
  });

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      institution: 'Tribhuvan University',
      degree: 'Bachelor',
      field: 'Computer Science',
      startDate: new Date('2018-01-01'),
      endDate: new Date('2022-12-31'),
      grade: '3.7 GPA',
      isCurrentlyStudying: false
    }
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'TechNepal Solutions',
      position: 'Junior Developer',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2023-12-31'),
      description: 'Developed web applications using React and Node.js. Collaborated with cross-functional teams.',
      isCurrentlyWorking: false
    }
  ]);

  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([
    {
      id: '1',
      title: 'Full Stack Developer Jobs',
      keywords: ['react', 'node.js', 'javascript'],
      location: 'Kathmandu',
      jobType: 'full_time',
      salaryMin: 60000,
      emailNotifications: true,
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [reminders, setReminders] = useState<ApplicationReminder[]>([
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Nepal',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      isCompleted: false
    }
  ]);

  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState<Partial<Education>>({});
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({});
  const [newJobAlert, setNewJobAlert] = useState<Partial<JobAlert>>({
    emailNotifications: true,
    isActive: true,
    keywords: []
  });
  const [newKeyword, setNewKeyword] = useState('');

  const getApplicationStatus = (status: Application['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Eye },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
    };
    return statusConfig[status];
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log('Saving profile:', profile);
    toast.success('Profile updated successfully!');
    setShowEditProfile(false);
  };

  const handleResumeUpload = (file: File | null) => {
    setProfile({ ...profile, resume: file });
    if (file) {
      toast.success('Resume uploaded successfully!');
    }
  };

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.field) {
      const edu: Education = {
        id: Date.now().toString(),
        institution: newEducation.institution,
        degree: newEducation.degree,
        field: newEducation.field,
        startDate: newEducation.startDate || new Date(),
        endDate: newEducation.isCurrentlyStudying ? null : (newEducation.endDate || new Date()),
        grade: newEducation.grade || '',
        isCurrentlyStudying: newEducation.isCurrentlyStudying || false
      };
      setEducation([...education, edu]);
      setNewEducation({});
      setShowAddEducation(false);
      toast.success('Education added successfully!');
    }
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
    toast.success('Education removed');
  };

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      const exp: Experience = {
        id: Date.now().toString(),
        company: newExperience.company,
        position: newExperience.position,
        startDate: newExperience.startDate || new Date(),
        endDate: newExperience.isCurrentlyWorking ? null : (newExperience.endDate || new Date()),
        description: newExperience.description || '',
        isCurrentlyWorking: newExperience.isCurrentlyWorking || false
      };
      setExperiences([...experiences, exp]);
      setNewExperience({});
      setShowAddExperience(false);
      toast.success('Experience added successfully!');
    }
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
    toast.success('Experience removed');
  };

  const handleCreateJobAlert = () => {
    if (newJobAlert.title && newJobAlert.location) {
      const alert: JobAlert = {
        id: Date.now().toString(),
        title: newJobAlert.title,
        keywords: newJobAlert.keywords || [],
        location: newJobAlert.location,
        jobType: newJobAlert.jobType || 'full_time',
        salaryMin: newJobAlert.salaryMin,
        emailNotifications: newJobAlert.emailNotifications || true,
        isActive: newJobAlert.isActive || true,
        createdAt: new Date()
      };
      setJobAlerts([...jobAlerts, alert]);
      setNewJobAlert({ emailNotifications: true, isActive: true, keywords: [] });
      setShowJobAlertDialog(false);
      toast.success('Job alert created successfully!');
    }
  };

  const handleToggleJobAlert = (id: string) => {
    setJobAlerts(jobAlerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleDeleteJobAlert = (id: string) => {
    setJobAlerts(jobAlerts.filter(alert => alert.id !== id));
    toast.success('Job alert deleted');
  };

  const addKeywordToAlert = () => {
    if (newKeyword.trim() && !newJobAlert.keywords?.includes(newKeyword.trim())) {
      setNewJobAlert({
        ...newJobAlert,
        keywords: [...(newJobAlert.keywords || []), newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeywordFromAlert = (keyword: string) => {
    setNewJobAlert({
      ...newJobAlert,
      keywords: newJobAlert.keywords?.filter(k => k !== keyword) || []
    });
  };

  const profileCompletionPercentage = () => {
    const fields = [
      profile.name, profile.email, profile.phone, profile.location, 
      profile.bio, profile.linkedIn
    ];
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    const skillsComplete = profile.skills.length > 0 ? 1 : 0;
    const resumeComplete = profile.resume ? 1 : 0;
    const educationComplete = education.length > 0 ? 1 : 0;
    const experienceComplete = experiences.length > 0 ? 1 : 0;
    const profilePictureComplete = profile.profilePicture ? 1 : 0;
    
    const totalFields = fields.length + 5; // +5 for skills, resume, education, experience, profile picture
    const completedCount = completedFields + skillsComplete + resumeComplete + educationComplete + experienceComplete + profilePictureComplete;
    
    return Math.round((completedCount / totalFields) * 100);
  };

  const getRecommendedJobs = React.useMemo(() => {
    // Simple recommendation based on user skills and preferences
    if (!jobs || jobs.length === 0) return [];
    
    return jobs.filter(job => {
      // Safe skill matching with null checks
      const matchesSkills = profile.skills.some(skill => 
        (job.title && job.title.toLowerCase().includes(skill.toLowerCase())) ||
        (job.description && job.description.toLowerCase().includes(skill.toLowerCase()))
      );
      
      // Safe job type matching
      const matchesJobType = job.type && profile.preferredJobTypes.includes(job.type);
      
      // Safe location matching with proper null checks
      const matchesLocation = profile.preferredLocations.some(loc => {
        if (loc.toLowerCase() === 'remote') {
          return true; // Always match remote preference
        }
        // Check if job has location information (location is a string)
        if (job.location && typeof job.location === 'string') {
          return job.location.toLowerCase().includes(loc.toLowerCase());
        }
        return false;
      });
      
      return matchesSkills || matchesJobType || matchesLocation;
    }).slice(0, 5);
  }, [jobs, profile.skills, profile.preferredJobTypes, profile.preferredLocations]);

  const getUpcomingReminders = React.useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reminders.filter(reminder => 
      !reminder.isCompleted && 
      reminder.reminderDate >= now && 
      reminder.reminderDate <= nextWeek
    );
  }, [reminders]);

  const recentApplications = React.useMemo(() => {
    if (!applications || applications.length === 0 || !jobs || jobs.length === 0) return [];
    
    return applications.slice(0, 5).map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId)
    }));
  }, [applications, jobs]);

  // Mock data for demonstration
  const savedJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return jobs.slice(0, 3);
  }, [jobs]);

  const onViewJob = (jobId: string) => {
    // Navigate to job detail or handle job view
    console.log('Viewing job:', jobId);
  };

  const onApplyForJob = (jobId: string) => {
    // Handle job application
    console.log('Applying for job:', jobId);
  };

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {profile.name}!</h2>
            <p className="text-muted-foreground mt-1">Manage your job search and applications</p>
          </div>
          <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information, skills, and resume to improve your job search experience.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill} variant="outline">Add</Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="resume">Resume</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PDF, DOC up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setProfile({ ...profile, resume: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
              <span className="text-2xl font-bold text-blue-600">{profileCompletionPercentage()}%</span>
            </div>
            <Progress value={profileCompletionPercentage()} className="w-full mb-2" />
            <p className="text-sm text-gray-600">
              Complete your profile to increase your chances of getting hired
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {getRecommendedJobs.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Recommended Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRecommendedJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      <ImageWithFallback
                        src={job.logo || ''}
                        alt={job.company || ''}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {job.type ? job.type.replace('_', ' ') : 'Not specified'}
                      </Badge>
                      <Button size="sm" onClick={() => onViewJob(job.id)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {getUpcomingReminders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Upcoming Application Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.jobTitle}</p>
                      <p className="text-sm text-gray-600">{reminder.company}</p>
                      <p className="text-sm text-orange-600">
                        Deadline: {reminder.deadline.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => onViewJob(reminder.jobId)}>
                        Apply Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReminders(reminders.map(r => 
                            r.id === reminder.id ? { ...r, isCompleted: true } : r
                          ));
                          toast.success('Reminder dismissed');
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="search">Job Search</TabsTrigger>
              <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="alerts">Job Alerts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => {
                    const status = getApplicationStatus(application.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={application.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <ImageWithFallback
                              src={application.job?.logo || ''}
                              alt={application.job?.company || ''}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{application.job?.title}</h3>
                              <p className="text-gray-600">{application.job?.company}</p>
                              <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
                            </div>
                          </div>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>{application.job?.location}</span>
                            <span>{application.job?.type}</span>
                            <span>{application.job?.salary}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => application.job && onViewJob(application.job.id)}
                          >
                            View Job
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Search Tab */}
          <TabsContent value="search">
            <div className="space-y-6">
              {/* Search Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Find Your Next Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input 
                        id="job-title"
                        placeholder="e.g. Software Engineer"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location"
                        placeholder="e.g. Kathmandu"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Button className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Jobs
                    </Button>
                    <Button variant="outline">Clear Filters</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Jobs ({jobs.length} found)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 10).map((job) => (
                      <div key={job.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start space-x-4">
                            <ImageWithFallback
                              src={job.logo}
                              alt={job.company}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <p className="text-gray-600">{job.company}</p>
                              <p className="text-sm text-gray-500">Posted {Math.floor(Math.random() * 7) + 1} days ago</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => onViewJob(job.id)}
                            >
                              Apply Now
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.type}
                            </span>
                            <span className="text-green-600 font-medium">{job.salary}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{job.type}</Badge>
                            <Badge variant="outline">{job.experience}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-4">
                          <ImageWithFallback
                            src={job.logo}
                            alt={job.company}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-sm text-gray-500">Saved 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => onViewJob(job.id)}
                          >
                            Apply Now
                          </Button>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>{job.location}</span>
                          <span>{job.type}</span>
                          <span className="text-green-600 font-medium">{job.salary}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.experience}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Profile Information
                    <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      {profile.profilePicture ? (
                        <img 
                          src={URL.createObjectURL(profile.profilePicture)} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center mt-2 space-x-4">
                        {profile.linkedIn && (
                          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            LinkedIn
                          </a>
                        )}
                        {profile.github && (
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline text-sm">
                            GitHub
                          </a>
                        )}
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline text-sm">
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        profile.availabilityStatus === 'actively_looking' ? 'bg-green-100 text-green-800' :
                        profile.availabilityStatus === 'open_to_offers' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {profile.availabilityStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Education</h4>
                      <Button variant="outline" size="sm" onClick={() => setShowAddEducation(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {education.map((edu) => (
                        <div key={edu.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                <h5 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h5>
                              </div>
                              <p className="text-gray-600 mb-1">{edu.institution}</p>
                              <p className="text-sm text-gray-500">
                                {edu.startDate.getFullYear()} - {edu.isCurrentlyStudying ? 'Present' : edu.endDate?.getFullYear()}
                                {edu.grade && ` • ${edu.grade}`}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEducation(edu.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Experience</h4>
                      <Button variant="outline" size="sm" onClick={() => setShowAddExperience(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Briefcase className="w-4 h-4 text-gray-500" />
                                <h5 className="font-medium text-gray-900">{exp.position}</h5>
                              </div>
                              <p className="text-gray-600 mb-1">{exp.company}</p>
                              <p className="text-sm text-gray-500 mb-2">
                                {exp.startDate.getFullYear()} - {exp.isCurrentlyWorking ? 'Present' : exp.endDate?.getFullYear()}
                              </p>
                              <p className="text-gray-700 text-sm">{exp.description}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteExperience(exp.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">
                        {profile.resume ? 'Resume uploaded' : 'No resume uploaded'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profile Views</span>
                        <span className="font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applications</span>
                        <span className="font-medium">{applications.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Rate</span>
                        <span className="font-medium">65%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Resume */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Current Resume</h4>
                      {profile.resume ? (
                        <div className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">{profile.resume.name}</p>
                                <p className="text-sm text-gray-600">
                                  {(profile.resume.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">No resume uploaded yet</p>
                          <Button>Upload Resume</Button>
                        </div>
                      )}
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Upload New Resume</h4>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX up to 10MB</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                          className="hidden"
                          id="resume-upload"
                        />
                        <Button 
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>

                    {/* Resume Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Resume Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Keep your resume to 1-2 pages</li>
                        <li>• Use a clean, professional format</li>
                        <li>• Include relevant keywords from job descriptions</li>
                        <li>• Quantify your achievements with numbers</li>
                        <li>• Update your resume regularly</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Job Alerts Tab */}
          <TabsContent value="alerts">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Job Alerts</CardTitle>
                    <Button onClick={() => setShowJobAlertDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Alert
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobAlerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{alert.title}</h4>
                              <Switch 
                                checked={alert.isActive}
                                onCheckedChange={() => handleToggleJobAlert(alert.id)}
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{alert.location}</Badge>
                              <Badge variant="outline">{alert.jobType.replace('_', ' ')}</Badge>
                              {alert.salaryMin && (
                                <Badge variant="outline">NPR {alert.salaryMin.toLocaleString()}+</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {alert.keywords.map((keyword, index) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              Created on {alert.createdAt.toLocaleDateString()}
                              {alert.emailNotifications && ' • Email notifications enabled'}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteJobAlert(alert.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {jobAlerts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No job alerts created yet</p>
                        <p className="text-sm">Create an alert to get notified about relevant jobs</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Availability Status</Label>
                      <Select 
                        value={profile.availabilityStatus} 
                        onValueChange={(value) => setProfile({...profile, availabilityStatus: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="actively_looking">Actively Looking</SelectItem>
                          <SelectItem value="open_to_offers">Open to Offers</SelectItem>
                          <SelectItem value="not_looking">Not Looking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notice Period</Label>
                      <Select 
                        value={profile.noticePeriod} 
                        onValueChange={(value) => setProfile({...profile, noticePeriod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="15_days">15 Days</SelectItem>
                          <SelectItem value="30_days">30 Days</SelectItem>
                          <SelectItem value="60_days">60 Days</SelectItem>
                          <SelectItem value="90_days">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Minimum Expected Salary (NPR)</Label>
                      <Input 
                        type="number" 
                        value={profile.preferredSalaryMin}
                        onChange={(e) => setProfile({...profile, preferredSalaryMin: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div>
                      <Label>Preferred Job Types</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['full_time', 'part_time', 'contract', 'internship', 'remote'].map((type) => (
                          <Badge
                            key={type}
                            variant={profile.preferredJobTypes.includes(type) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newTypes = profile.preferredJobTypes.includes(type)
                                ? profile.preferredJobTypes.filter(t => t !== type)
                                : [...profile.preferredJobTypes, type];
                              setProfile({...profile, preferredJobTypes: newTypes});
                            }}
                          >
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email alerts for new job matches</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Application Updates</p>
                        <p className="text-sm text-gray-600">Get notified when employers view your applications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-gray-600">Receive a summary of new jobs every week</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Education Dialog */}
        <Dialog open={showAddEducation} onOpenChange={setShowAddEducation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={newEducation.institution || ''}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={newEducation.degree || ''}
                    onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="field">Field of Study</Label>
                  <Input
                    id="field"
                    value={newEducation.field || ''}
                    onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEducation.startDate?.toLocaleDateString() || "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEducation.startDate}
                        onSelect={(date) => setNewEducation({...newEducation, startDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left" disabled={newEducation.isCurrentlyStudying}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEducation.isCurrentlyStudying ? "Present" : (newEducation.endDate?.toLocaleDateString() || "Select date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEducation.endDate || undefined}
                        onSelect={(date) => setNewEducation({...newEducation, endDate: date || null})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="currently-studying"
                  checked={newEducation.isCurrentlyStudying || false}
                  onCheckedChange={(checked) => setNewEducation({...newEducation, isCurrentlyStudying: checked})}
                />
                <Label htmlFor="currently-studying">Currently studying here</Label>
              </div>
              <div>
                <Label htmlFor="grade">Grade/GPA (optional)</Label>
                <Input
                  id="grade"
                  value={newEducation.grade || ''}
                  onChange={(e) => setNewEducation({...newEducation, grade: e.target.value})}
                  placeholder="e.g., 3.8 GPA, First Class"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEducation(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEducation}>
                  Add Education
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Experience Dialog */}
        <Dialog open={showAddExperience} onOpenChange={setShowAddExperience}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newExperience.company || ''}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newExperience.position || ''}
                    onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExperience.startDate?.toLocaleDateString() || "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExperience.startDate}
                        onSelect={(date) => setNewExperience({...newExperience, startDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left" disabled={newExperience.isCurrentlyWorking}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExperience.isCurrentlyWorking ? "Present" : (newExperience.endDate?.toLocaleDateString() || "Select date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExperience.endDate || undefined}
                        onSelect={(date) => setNewExperience({...newExperience, endDate: date || null})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="currently-working"
                  checked={newExperience.isCurrentlyWorking || false}
                  onCheckedChange={(checked) => setNewExperience({...newExperience, isCurrentlyWorking: checked})}
                />
                <Label htmlFor="currently-working">Currently working here</Label>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExperience.description || ''}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your role and achievements..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddExperience(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddExperience}>
                  Add Experience
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Job Alert Dialog */}
        <Dialog open={showJobAlertDialog} onOpenChange={setShowJobAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Job Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert-title">Alert Title</Label>
                <Input
                  id="alert-title"
                  value={newJobAlert.title || ''}
                  onChange={(e) => setNewJobAlert({...newJobAlert, title: e.target.value})}
                  placeholder="e.g., Frontend Developer Jobs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-location">Location</Label>
                  <Input
                    id="alert-location"
                    value={newJobAlert.location || ''}
                    onChange={(e) => setNewJobAlert({...newJobAlert, location: e.target.value})}
                    placeholder="e.g., Kathmandu"
                  />
                </div>
                <div>
                  <Label htmlFor="alert-job-type">Job Type</Label>
                  <Select value={newJobAlert.jobType || 'full_time'} onValueChange={(value) => setNewJobAlert({...newJobAlert, jobType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="alert-salary">Minimum Salary (NPR)</Label>
                <Input
                  id="alert-salary"
                  type="number"
                  value={newJobAlert.salaryMin || ''}
                  onChange={(e) => setNewJobAlert({...newJobAlert, salaryMin: parseInt(e.target.value) || undefined})}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newJobAlert.keywords?.map((keyword, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800">
                      {keyword}
                      <button
                        onClick={() => removeKeywordFromAlert(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => e.key === 'Enter' && addKeywordToAlert()}
                  />
                  <Button variant="outline" onClick={addKeywordToAlert}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={newJobAlert.emailNotifications || false}
                  onCheckedChange={(checked) => setNewJobAlert({...newJobAlert, emailNotifications: checked})}
                />
                <Label htmlFor="email-notifications">Enable email notifications</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowJobAlertDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateJobAlert}>
                  Create Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
