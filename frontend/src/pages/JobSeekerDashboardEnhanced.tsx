import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Upload, Edit, Heart, Clock, CheckCircle, XCircle, User, FileText, Bell, Eye, Download, 
  MapPin, Calendar as CalendarIcon, Briefcase, GraduationCap, Award, Plus, Trash2, 
  AlertCircle, Map, BookmarkPlus, Building2, Users, TrendingUp, DollarSign, Search,
  Star, Video, Camera, Play, MessageSquare, ThumbsUp, Share2, ExternalLink,
  Mail, Phone, Globe, Twitter, Linkedin, Github
} from 'lucide-react';
import { Job, Application, User as UserType } from '@/pages/providers/AppProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { confirmDelete } from '../utils/confirmDelete';

// Company logo utility function
const getCompanyLogo = (jobData: Job): string => {
  // Try multiple sources for company logo
  if (jobData.logo) return jobData.logo;
  if (jobData.coverImageUrl) return jobData.coverImageUrl;
  if ((jobData as any).companyLogo) return (jobData as any).companyLogo;
  
  // Generate a placeholder based on company name
  if (jobData.company) {
    const companyInitials = jobData.company
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.company)}&background=random&color=fff&size=128&font-size=0.6&format=svg`;
  }
  
  // Final fallback
  return 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=128&h=128&fit=crop&crop=face';
};

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

interface JobSeekerDashboardEnhancedProps {
  user: UserType;
  jobs: Job[];
  applications: Application[];
  onApplicationUpdate: (applications: Application[]) => void;
  onLogout: () => void;
}

export function JobSeekerDashboardEnhanced({ user, jobs, applications, onApplicationUpdate, onLogout }: JobSeekerDashboardEnhancedProps) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('applications');
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showJobAlertDialog, setShowJobAlertDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

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
    twitter: '',
    preferredJobTypes: ['full_time', 'remote'],
    preferredSalaryMin: 50000,
    preferredLocations: ['Kathmandu', 'Remote'],
    availabilityStatus: 'actively_looking', // actively_looking, open_to_offers, not_looking
    noticePeriod: '30_days'
  });

  // Sample data with actual content
  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      institution: 'Tribhuvan University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: new Date('2018-01-01'),
      endDate: new Date('2022-12-31'),
      grade: '3.7 GPA',
      isCurrentlyStudying: false
    },
    {
      id: '2',
      institution: 'Nepal College of Information Technology',
      degree: 'Certificate',
      field: 'Web Development',
      startDate: new Date('2021-06-01'),
      endDate: new Date('2021-12-31'),
      grade: 'Distinction',
      isCurrentlyStudying: false
    }
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'TechNepal Solutions',
      position: 'Junior Frontend Developer',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2023-12-31'),
      description: 'Developed responsive web applications using React.js and modern CSS frameworks. Collaborated with cross-functional teams to deliver high-quality user interfaces. Participated in code reviews and maintained coding standards.',
      isCurrentlyWorking: false
    },
    {
      id: '2',
      company: 'Digital Innovation Lab',
      position: 'Full Stack Developer',
      startDate: new Date('2024-01-01'),
      endDate: null,
      description: 'Working on full-stack web applications using MERN stack. Leading frontend development initiatives and mentoring junior developers. Implementing responsive designs and optimizing application performance.',
      isCurrentlyWorking: true
    }
  ]);

  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([
    {
      id: '1',
      title: 'Full Stack Developer Jobs',
      keywords: ['react', 'node.js', 'javascript', 'mongodb'],
      location: 'Kathmandu',
      jobType: 'full_time',
      salaryMin: 60000,
      emailNotifications: true,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Remote React Developer',
      keywords: ['react', 'remote', 'frontend'],
      location: 'Remote',
      jobType: 'remote',
      salaryMin: 80000,
      emailNotifications: true,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000)
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
    },
    {
      id: '2',
      jobId: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'Innovation Hub',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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

  // Sample job recommendations based on user profile
  const sampleRecommendedJobs = [
    {
      id: 'rec1',
      title: 'Senior React Developer',
      company: 'Tech Innovations Nepal',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=40&h=40&fit=crop&crop=face',
      location: 'Kathmandu',
      type: 'premium_job' as const,
      category: 'Technology',
      salary: 'NPR 80,000 - 120,000',
      experience: '3-5 years',
      description: 'Senior React Developer position',
      requirements: ['React', 'JavaScript', 'TypeScript'],
      benefits: ['Health Insurance', 'Flexible Hours'],
      postedDate: '2 days ago',
      deadline: '2024-01-15',
      featured: true,
      tier: 'premium' as const
    },
    {
      id: 'rec2',
      title: 'Full Stack Developer',
      company: 'Digital Solutions Pvt Ltd',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=40&h=40&fit=crop&crop=face',
      location: 'Remote',
      type: 'mega_job' as const,
      category: 'Technology',
      salary: 'NPR 70,000 - 100,000',
      experience: '2-4 years',
      description: 'Full Stack Developer position',
      requirements: ['React', 'Node.js', 'MongoDB'],
      benefits: ['Remote Work', 'Health Insurance'],
      postedDate: '1 day ago',
      deadline: '2024-01-20',
      featured: true,
      tier: 'megajob' as const
    },
    {
      id: 'rec3',
      title: 'Frontend Engineer',
      company: 'StartupNepal',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=40&h=40&fit=crop&crop=face',
      location: 'Pokhara',
      type: 'prime_job' as const,
      category: 'Technology',
      salary: 'NPR 60,000 - 85,000',
      experience: '1-3 years',
      description: 'Frontend Engineer position',
      requirements: ['HTML', 'CSS', 'JavaScript', 'React'],
      benefits: ['Learning Opportunities', 'Flexible Hours'],
      postedDate: '3 days ago',
      deadline: '2024-01-25',
      featured: false,
      tier: 'prime' as const
    }
  ];

  const getApplicationStatus = (status: Application['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
    };
    return statusConfig[status];
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
      toast.success('Skill added successfully!');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(skill => skill !== skillToRemove) });
    toast.success('Skill removed');
  };

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log('Saving profile:', profile);
    toast.success('Profile updated successfully!');
    setShowEditProfile(false);
  };

  const handleResumeUpload = (file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setProfile({ ...profile, resume: file });
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    }
  };

  const handleProfilePictureUpload = (file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setProfile({ ...profile, profilePicture: file });
      toast.success(`Profile picture "${file.name}" uploaded successfully!`);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerProfilePictureUpload = () => {
    profilePictureInputRef.current?.click();
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
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteEducation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this education record?')) {
      setEducation(education.filter(edu => edu.id !== id));
      toast.success('Education record deleted');
    }
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
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleDeleteExperience = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience record?')) {
      setExperiences(experiences.filter(exp => exp.id !== id));
      toast.success('Experience record deleted');
    }
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
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleToggleJobAlert = (id: string) => {
    setJobAlerts(jobAlerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
    toast.success('Job alert updated');
  };

  const handleDeleteJobAlert = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job alert?')) {
      setJobAlerts(jobAlerts.filter(alert => alert.id !== id));
      toast.success('Job alert deleted');
    }
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
    // Use sample jobs if real jobs are not available or empty
    if (!jobs || jobs.length === 0) {
      return sampleRecommendedJobs;
    }
    
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
    if (!applications || applications.length === 0) {
      // Return sample applications for demonstration
      return [
        {
          id: '1',
          jobId: '1',
          status: 'pending' as const,
          appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          job: {
            title: 'Senior React Developer',
            company: 'Tech Innovations Nepal',
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=40&h=40&fit=crop&crop=face',
            location: 'Kathmandu',
            salary: 'NPR 80,000 - 120,000'
          }
        },
        {
          id: '2',
          jobId: '2',
          status: 'accepted' as const,
          appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          job: {
            title: 'Full Stack Developer',
            company: 'Digital Solutions',
            logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=40&h=40&fit=crop&crop=face',
            location: 'Remote',
            salary: 'NPR 70,000 - 100,000'
          }
        }
      ];
    }
    
    return applications.slice(0, 5).map(app => ({
      ...app,
      job: jobs.find(job => job.id === app.jobId)
    }));
  }, [applications, jobs]);

  // Mock data for demonstration
  const savedJobs = React.useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return sampleRecommendedJobs.slice(0, 3);
    }
    return jobs.slice(0, 3);
  }, [jobs]);

  const onViewJob = (jobId: string) => {
    // Navigate to job detail or handle job view
    window.open(`/jobs/${jobId}`, '_blank');
    toast.success('Opening job details in new tab');
  };

  const onApplyForJob = (jobId: string) => {
    // Handle job application
    window.open(`/jobs/${jobId}`, '_blank');
    toast.success('Opening job application in new tab');
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome back, {profile.name}!</h2>
            <p className="text-muted-foreground mt-1">Manage your job search and applications</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information, skills, and resume to improve your job search experience.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="personal">Personal</TabsTrigger>
                      <TabsTrigger value="professional">Professional</TabsTrigger>
                      <TabsTrigger value="social">Social</TabsTrigger>
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+977 9841234567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            placeholder="Kathmandu, Nepal"
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
                          placeholder="Tell us about yourself and your career goals..."
                        />
                      </div>

                      <div>
                        <Label>Profile Picture</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">
                            {profile.profilePicture ? `Selected: ${profile.profilePicture.name}` : 'Upload your profile picture'}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">JPEG, PNG, GIF, WebP up to 5MB</p>
                          <Button 
                            type="button"
                            onClick={triggerProfilePictureUpload}
                            variant="outline"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                          <input
                            ref={profilePictureInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => handleProfilePictureUpload(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="professional" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience">Experience Level</Label>
                          <Select 
                            value={profile.experience} 
                            onValueChange={(value) => setProfile({ ...profile, experience: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-1 years">0-1 years</SelectItem>
                              <SelectItem value="1-3 years">1-3 years</SelectItem>
                              <SelectItem value="3-5 years">3-5 years</SelectItem>
                              <SelectItem value="5-10 years">5-10 years</SelectItem>
                              <SelectItem value="10+ years">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="education">Education</Label>
                          <Input
                            id="education"
                            value={profile.education}
                            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                            placeholder="Bachelor in Computer Science"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-2 text-gray-500 hover:text-gray-700 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a skill (e.g., JavaScript, React, Python)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                          />
                          <Button onClick={handleAddSkill} variant="outline">Add</Button>
                        </div>
                      </div>

                      <div>
                        <Label>Resume</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">
                            {profile.resume ? `Selected: ${profile.resume.name}` : 'Upload your resume'}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX up to 10MB</p>
                          <Button 
                            type="button"
                            onClick={triggerFileUpload}
                            variant="outline"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Personal Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="website"
                              value={profile.website}
                              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                              placeholder="https://yourwebsite.com"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="linkedIn"
                              value={profile.linkedIn}
                              onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="github">GitHub Profile</Label>
                          <div className="relative">
                            <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="github"
                              value={profile.github}
                              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                              placeholder="https://github.com/yourusername"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter Profile</Label>
                          <div className="relative">
                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="twitter"
                              value={profile.twitter}
                              onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                              placeholder="https://twitter.com/yourusername"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Preferred Job Types</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['full_time', 'part_time', 'contract', 'remote', 'freelance'].map((type) => (
                              <Badge
                                key={type}
                                variant={profile.preferredJobTypes.includes(type) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const updated = profile.preferredJobTypes.includes(type)
                                    ? profile.preferredJobTypes.filter(t => t !== type)
                                    : [...profile.preferredJobTypes, type];
                                  setProfile({ ...profile, preferredJobTypes: updated });
                                }}
                              >
                                {type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="salaryMin">Minimum Salary (NPR)</Label>
                          <Input
                            id="salaryMin"
                            type="number"
                            value={profile.preferredSalaryMin}
                            onChange={(e) => setProfile({ ...profile, preferredSalaryMin: parseInt(e.target.value) || 0 })}
                            placeholder="50000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="availabilityStatus">Availability Status</Label>
                          <Select 
                            value={profile.availabilityStatus} 
                            onValueChange={(value) => setProfile({ ...profile, availabilityStatus: value })}
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
                          <Label htmlFor="noticePeriod">Notice Period</Label>
                          <Select 
                            value={profile.noticePeriod} 
                            onValueChange={(value) => setProfile({ ...profile, noticePeriod: value })}
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
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowEditProfile(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto">
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
              <span className="text-2xl font-bold text-primary">{profileCompletionPercentage()}%</span>
            </div>
            <Progress value={profileCompletionPercentage()} className="w-full mb-2" />
            <p className="text-sm text-gray-600">
              Complete your profile to increase your chances of getting hired
            </p>
            {profileCompletionPercentage() < 100 && (
              <div className="mt-2 text-xs text-gray-500">
                💡 Tip: Add a resume, skills, and social links to improve your profile score
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 lg:w-8 h-6 lg:h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{recentApplications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 lg:w-8 h-6 lg:h-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{savedJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 lg:w-8 h-6 lg:h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">47</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="w-6 lg:w-8 h-6 lg:h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Job Alerts</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{jobAlerts.filter(alert => alert.isActive).length}</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {getRecommendedJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      <ImageWithFallback
                        src={getCompanyLogo(job)}
                        alt={job.company || 'Company'}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{job.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{job.company}</p>
                        <p className="text-xs text-gray-500">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {job.type ? job.type.replace('_', ' ') : 'Full-time'}
                      </Badge>
                      <Button size="sm" onClick={() => onViewJob(job.id)} className="text-xs">
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
                  <div key={reminder.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-3 bg-orange-50 rounded-lg gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.jobTitle}</p>
                      <p className="text-sm text-gray-600">{reminder.company}</p>
                      <p className="text-sm text-orange-600">
                        Deadline: {reminder.deadline.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onViewJob(reminder.jobId)} className="flex-1 lg:flex-none">
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
                        className="flex-1 lg:flex-none"
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
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 min-w-max">
              <TabsTrigger value="applications" className="text-xs lg:text-sm">Applications</TabsTrigger>
              <TabsTrigger value="saved" className="text-xs lg:text-sm">Saved Jobs</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs lg:text-sm">Profile</TabsTrigger>
              <TabsTrigger value="resume" className="text-xs lg:text-sm">Resume</TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs lg:text-sm">Job Alerts</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs lg:text-sm">Settings</TabsTrigger>
            </TabsList>
          </div>

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
                      <div key={application.id} className="border rounded-lg p-4 lg:p-6 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <ImageWithFallback
                              src={application.job?.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop&crop=face'}
                              alt={application.job?.company || 'Company'}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{application.job?.title}</h3>
                              <p className="text-gray-600 truncate">{application.job?.company}</p>
                              <p className="text-sm text-gray-500">Applied on {application.appliedDate}</p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                            <Badge className={`${status.color} flex items-center gap-1 w-full sm:w-auto justify-center`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onViewJob(application.jobId)}
                              className="w-full sm:w-auto"
                            >
                              View Job
                            </Button>
                          </div>
                        </div>
                        
                        {application.job?.salary && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{application.job.salary}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {recentApplications.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-4">Start applying to jobs that match your skills and interests</p>
                      <Button onClick={() => window.open('/jobs', '_blank')}>
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                    <div key={job.id} className="border rounded-lg p-4 lg:p-6 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <ImageWithFallback
                            src={getCompanyLogo(job)}
                            alt={job.company || 'Company'}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-gray-600 truncate">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {job.type || 'Full-time'}
                              </Badge>
                              {typeof job.location === 'string' ? (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location || 'Remote'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                          <Button 
                            size="sm" 
                            onClick={() => onViewJob(job.id)}
                            className="w-full sm:w-auto"
                          >
                            View Job
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onApplyForJob(job.id)}
                            className="w-full sm:w-auto"
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {savedJobs.length === 0 && (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                      <p className="text-gray-600 mb-4">Save jobs you're interested in to apply later</p>
                      <Button onClick={() => window.open('/jobs', '_blank')}>
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                    {profile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Social Links</h4>
                    <div className="flex gap-2">
                      {profile.linkedIn && (
                        <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {profile.twitter && (
                        <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Experience Level</h4>
                    <Badge variant="outline">{profile.experience}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Availability</h4>
                    <Badge variant="outline" className="capitalize">
                      {profile.availabilityStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Notice Period</h4>
                    <Badge variant="outline" className="capitalize">
                      {profile.noticePeriod.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">
                              {edu.startDate.getFullYear()} - {edu.isCurrentlyStudying ? 'Present' : edu.endDate?.getFullYear()}
                            </p>
                            {edu.grade && <p className="text-sm text-gray-500">Grade: {edu.grade}</p>}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {education.length === 0 && (
                      <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No education records added yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{exp.position}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">
                              {exp.startDate.getFullYear()} - {exp.isCurrentlyWorking ? 'Present' : exp.endDate?.getFullYear()}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {experiences.length === 0 && (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No work experience added yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary/50 transition-colors">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      {profile.resume ? `Current: ${profile.resume.name}` : 'No resume uploaded'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={triggerFileUpload}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {profile.resume ? 'Update Resume' : 'Upload Resume'}
                      </Button>
                      {profile.resume && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.success('Resume download started')}
                          className="w-full sm:w-auto"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleResumeUpload(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resume Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">📝 Writing Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Keep your resume to 1-2 pages</li>
                        <li>• Use a clean, professional format</li>
                        <li>• Include relevant keywords from job descriptions</li>
                        <li>• Quantify your achievements with numbers</li>
                        <li>• Use action verbs (managed, developed, implemented)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">✅ Essential Sections</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Contact information</li>
                        <li>• Professional summary</li>
                        <li>• Work experience</li>
                        <li>• Education</li>
                        <li>• Skills</li>
                        <li>• Certifications (if applicable)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-900 mb-2">⚠️ Common Mistakes</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Typos and grammatical errors</li>
                        <li>• Using outdated email addresses</li>
                        <li>• Including irrelevant information</li>
                        <li>• Using unprofessional fonts</li>
                        <li>• Making it too long or too short</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Job Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Job Alerts</CardTitle>
                  <Dialog open={showJobAlertDialog} onOpenChange={setShowJobAlertDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Job Alert</DialogTitle>
                        <DialogDescription>
                          Get notified when jobs matching your criteria are posted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="alertTitle">Alert Title *</Label>
                          <Input
                            id="alertTitle"
                            value={newJobAlert.title || ''}
                            onChange={(e) => setNewJobAlert({ ...newJobAlert, title: e.target.value })}
                            placeholder="Frontend Developer Jobs"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="alertLocation">Location *</Label>
                          <Input
                            id="alertLocation"
                            value={newJobAlert.location || ''}
                            onChange={(e) => setNewJobAlert({ ...newJobAlert, location: e.target.value })}
                            placeholder="Kathmandu, Remote"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="alertJobType">Job Type</Label>
                          <Select 
                            value={newJobAlert.jobType || 'full_time'} 
                            onValueChange={(value) => setNewJobAlert({ ...newJobAlert, jobType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_time">Full Time</SelectItem>
                              <SelectItem value="part_time">Part Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="freelance">Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Keywords</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-2">
                            {newJobAlert.keywords?.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {keyword}
                                <button
                                  onClick={() => removeKeywordFromAlert(keyword)}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add keyword"
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addKeywordToAlert()}
                            />
                            <Button onClick={addKeywordToAlert} variant="outline" size="sm">Add</Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="alertSalary">Minimum Salary (Optional)</Label>
                          <Input
                            id="alertSalary"
                            type="number"
                            value={newJobAlert.salaryMin || ''}
                            onChange={(e) => setNewJobAlert({ ...newJobAlert, salaryMin: parseInt(e.target.value) || undefined })}
                            placeholder="50000"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newJobAlert.emailNotifications || false}
                            onCheckedChange={(checked) => setNewJobAlert({ ...newJobAlert, emailNotifications: checked })}
                          />
                          <Label>Send email notifications</Label>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowJobAlertDialog(false)} className="w-full sm:w-auto">
                            Cancel
                          </Button>
                          <Button onClick={handleCreateJobAlert} className="w-full sm:w-auto">
                            Create Alert
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant={alert.isActive ? "default" : "secondary"}>
                              {alert.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📍 {alert.location}</p>
                            <p>💼 {alert.jobType.replace('_', ' ')}</p>
                            {alert.salaryMin && <p>💰 Min: NPR {alert.salaryMin.toLocaleString()}</p>}
                            {alert.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {alert.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleJobAlert(alert.id)}
                            className="flex-1 lg:flex-none"
                          >
                            {alert.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJobAlert(alert.id)}
                            className="text-red-600 hover:text-red-700 flex-1 lg:flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {jobAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No job alerts set</h3>
                      <p className="text-gray-600 mb-4">Create alerts to get notified about relevant job opportunities</p>
                      <Button onClick={() => setShowJobAlertDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Alert
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive job recommendations and updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-gray-500">Allow employers to find your profile</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Job Alert Notifications</Label>
                      <p className="text-sm text-gray-500">Get notified about matching jobs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Application Status Updates</Label>
                      <p className="text-sm text-gray-500">Receive updates on your applications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Salary Expectations</Label>
                      <p className="text-sm text-gray-500">Display your salary range to employers</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anonymous Profile Browsing</Label>
                      <p className="text-sm text-gray-500">Browse jobs without revealing your identity</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Contact Information Visibility</Label>
                      <p className="text-sm text-gray-500">Allow employers to see your contact details</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        if (!confirmDelete('Are you sure you want to delete your account? This cannot be undone.')) return;
                        toast.success('Account deletion confirmed');
                      }}
                    >
                      Delete Account
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
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
