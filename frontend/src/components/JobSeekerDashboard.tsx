import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { 
  Upload, Edit, Heart, Clock, CheckCircle, XCircle, User, FileText, Bell, Eye, Download, 
  MapPin, Calendar as CalendarIcon, Briefcase, GraduationCap, Award, Plus, Trash2, 
  AlertCircle, Map, BookmarkPlus, Search, FileEdit, Home, Settings, LogOut, Menu, Camera, Building2
} from 'lucide-react';
import { Job, Application, User as UserType } from '../pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import ResumeList from './resume/ResumeList';
import { JobCardUpdated } from './JobCardUpdated';
import type { Job as CardJob } from '../lib/mockData';

// Define sidebar items to prevent runtime errors and enable navigation
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Search },
  { id: 'saved', label: 'Saved Jobs', icon: BookmarkPlus },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'following', label: 'Following', icon: Building2 },
] as const;

interface JobSeekerDashboardProps {
  user: UserType;
  jobs: Job[];
  applications: Application[];
  onApplicationUpdate: (applications: Application[]) => void;
  onLogout: () => void;
  // Make optional to tolerate layouts that don't pass these yet
  savedJobs?: string[];
  onToggleSaveJob?: (jobId: string) => void;
  onApplyJob?: (jobId: string, applicationData?: any) => void | Promise<void>;
  companies?: any[];
  followedCompanies?: string[];
  onToggleFollowCompany?: (companyId: string) => void;
}

export function JobSeekerDashboard({ user, jobs, applications, onApplicationUpdate, onLogout, savedJobs = [], onToggleSaveJob, onApplyJob, companies = [], followedCompanies = [], onToggleFollowCompany }: JobSeekerDashboardProps) {
  const navigate = useNavigate();
  const { uploadProfileImage, uploadResume, updateProfile, user: authUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Normalize asset URLs from backend so they render correctly in dev/prod
  const normalizeAssetUrl = (url: string): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
    const base = (import.meta.env?.VITE_API_URL as string) || '/api';
    if (url.startsWith('/api/')) return url; // already proxied
    // Do NOT prefix '/uploads' with '/api'; use same-origin '/uploads' so Vite proxy maps to backend
    if (url.startsWith('/uploads')) return url;
    if (url.startsWith('/')) return url; // same-origin absolute path
    return `${base}/${url}`;
  };

  const getUserProfileImageUrl = (u: any): string => {
    if (!u) return '';
    return (
      u?.profileImage ||
      u?.profile_image ||
      u?.profile_image_url ||
      u?.profile?.profileImage ||
      u?.profile?.profile_image ||
      u?.profile?.profile_image_url ||
      ''
    );
  };

  const [profile, setProfile] = useState({
    name: user?.name || (authUser as any)?.full_name || '',
    email: user?.email || (authUser as any)?.email || '',
    phone: (authUser as any)?.phone || (authUser as any)?.phone_number || '',
    location: (authUser as any)?.location || authUser?.profile?.location || '',
    bio: (authUser as any)?.bio || authUser?.profile?.bio || '',
    experience: (authUser as any)?.experience || authUser?.profile?.experience || '',
    skills: Array.isArray((authUser as any)?.skills)
      ? ((authUser as any)?.skills as string[])
      : (authUser?.profile?.skills || []),
    education: (authUser as any)?.education || authUser?.profile?.education || '',
    resume: null as File | null,
    // Seed resume from authenticated user if present
    resumeUrl: (authUser as any)?.resume || (authUser?.profile as any)?.resume_url || '',
    resumeFileName: (authUser as any)?.resumeFileName || '',
    profilePicture: null as File | null,
    profileImageUrl: normalizeAssetUrl(getUserProfileImageUrl(authUser)),
    website: (authUser as any)?.website || (authUser?.profile as any)?.website || '',
    linkedIn: (authUser as any)?.linkedin || authUser?.profile?.linkedIn || '',
    github: (authUser as any)?.github || authUser?.profile?.github || '',
    preferredJobTypes: authUser?.profile?.preferredJobTypes || ['full_time', 'remote'],
    preferredSalaryMin: authUser?.profile?.preferredSalaryMin || 0,
    preferredLocations: authUser?.profile?.preferredLocations || [],
    availabilityStatus: authUser?.profile?.availabilityStatus || 'actively_looking',
    noticePeriod: authUser?.profile?.noticePeriod || '30_days'
  });

  // Sync profile details from auth user when it changes
  useEffect(() => {
    if (authUser) {
      const imageUrl = getUserProfileImageUrl(authUser);
      const normalizedImageUrl = normalizeAssetUrl(imageUrl);
      const resumeUrlFromUser = (authUser as any)?.resume || '';
      const resumeFileNameFromUser = (authUser as any)?.resumeFileName || '';
      setProfile(prev => ({
        ...prev,
        profileImageUrl: normalizedImageUrl,
        resumeUrl: resumeUrlFromUser || prev.resumeUrl,
        resumeFileName: resumeFileNameFromUser || prev.resumeFileName
      }));
      console.log('JobSeekerDashboard: authUser avatar fields', {
        rawImageUrl: imageUrl,
        normalizedImageUrl
      });
    }
  }, [authUser]);

  useEffect(() => {
    console.log('JobSeekerDashboard: profile.profileImageUrl', profile.profileImageUrl);
  }, [profile.profileImageUrl]);

  const [newSkill, setNewSkill] = useState('');

  // Tier theming and helpers
  const tierTheme: Record<string, { color: string }> = {
    mega: { color: 'bg-yellow-500' },
    premium: { color: 'bg-blue-600' },
    prime: { color: 'bg-green-600' },
    newspaper: { color: 'bg-orange-600' },
    latest: { color: 'bg-purple-600' }
  };
  const normalizeTier = (tier?: string) => {
    const t = (tier || '').toLowerCase();
    if (t.includes('mega')) return 'mega';
    if (t.includes('premium')) return 'premium';
    if (t.includes('prime')) return 'prime';
    if (t.includes('news')) return 'newspaper';
    return 'latest';
  };
  // Helper: map tier to colors used by JobCardUpdated (reads from theme)
  const getTierColor = (tier?: string) => {
    const key = normalizeTier(tier);
    return tierTheme[key]?.color || tierTheme.latest.color;
  };

  const tierBgColor = 'border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white';

  // Helper: human-friendly tier label
  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'megajob':
      case 'mega_job':
        return 'Mega';
      case 'premium':
      case 'premium_job':
        return 'Premium';
      case 'prime':
      case 'prime_job':
        return 'Prime';
      case 'newspaper':
      case 'newspaper_job':
        return 'Newspaper';
      default:
        return 'Latest';
    }
  };

  // Convert AppProvider Job to JobCardUpdated Job format
  const convertJobForCard = (job: Job): CardJob => {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      requirements: job.requirements || [],
      postedDate: job.postedDate || '',
      deadline: job.deadline || job.postedDate || '',
      salary: job.salary || '',
      type: job.type as CardJob['type'],
      tier: (job.tier as CardJob['tier']) || 'latest',
      category: job.category || '',
      experience: job.experience || '',
      tags: job.tags || [],
      featured: job.featured,
      logo: job.logo,
      source: job.source,
      publishedDate: job.publishedDate || job.postedDate || '',
      approvalStatus: undefined,
      companyLogo: job.logo
    } as CardJob;
  };

  // Only show active jobs when status is present; otherwise include all
  const activeJobs = jobs.filter((j: any) => !('status' in j) || j.status === 'active');
  // Recommendation settings with localStorage override
  const defaultRecommendationSettings = {
    count: 3,
    weights: {
      skillTag: 3,
      titleToken: 2,
      savedCategory: 2,
      recencyMaxBonus: 6,
      tier: {
        mega: 2,
        premium: 1,
        prime: 0,
        newspaper: 0,
        latest: 0
      }
    }
  } as const;
  const loadRecommendationSettings = () => {
    try {
      if (typeof window === 'undefined') return defaultRecommendationSettings;
      const raw = localStorage.getItem('megajob-recommendation-settings');
      if (!raw) return defaultRecommendationSettings;
      const parsed = JSON.parse(raw);
      // Shallow merge with defaults for safety
      const merged = {
        count: parsed?.count ?? defaultRecommendationSettings.count,
        weights: {
          skillTag: parsed?.weights?.skillTag ?? defaultRecommendationSettings.weights.skillTag,
          titleToken: parsed?.weights?.titleToken ?? defaultRecommendationSettings.weights.titleToken,
          savedCategory: parsed?.weights?.savedCategory ?? defaultRecommendationSettings.weights.savedCategory,
          recencyMaxBonus: parsed?.weights?.recencyMaxBonus ?? defaultRecommendationSettings.weights.recencyMaxBonus,
          tier: {
            mega: parsed?.weights?.tier?.mega ?? defaultRecommendationSettings.weights.tier.mega,
            premium: parsed?.weights?.tier?.premium ?? defaultRecommendationSettings.weights.tier.premium,
            prime: parsed?.weights?.tier?.prime ?? defaultRecommendationSettings.weights.tier.prime,
            newspaper: parsed?.weights?.tier?.newspaper ?? defaultRecommendationSettings.weights.tier.newspaper,
            latest: parsed?.weights?.tier?.latest ?? defaultRecommendationSettings.weights.tier.latest,
          }
        }
      };
      return merged;
    } catch {
      return defaultRecommendationSettings;
    }
  };

  // Build smarter recommendations based on user skills, saved categories and recency
  const getRecommendedJobs = (jobsList: Job[], skills: string[], savedJobIds: string[], settings = defaultRecommendationSettings) => {
    const skillSet = new Set((skills || []).map(s => s.toLowerCase()));
    const savedCategories = new Set(
      (savedJobIds || [])
        .map(id => jobs.find(j => j.id === id)?.category)
        .filter(Boolean) as string[]
    );

    const scoreJob = (j: Job) => {
      const tags = (j.tags || []).map(t => t.toLowerCase());
      const titleTokens = (j.title || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      let score = 0;
      // Skill matches in tags or title
      tags.forEach(t => { if (skillSet.has(t)) score += settings.weights.skillTag; });
      titleTokens.forEach(tok => { if (skillSet.has(tok)) score += settings.weights.titleToken; });
      // Preferred categories from saved jobs
      if (j.category && savedCategories.has(j.category)) score += settings.weights.savedCategory;
      // Tier boost via normalized tier
      const tierKey = normalizeTier(j.tier);
      score += settings.weights.tier[tierKey] || 0;
      // Recency boost
      const posted = new Date(j.publishedDate || j.postedDate || Date.now()).getTime();
      const ageDays = (Date.now() - posted) / (1000 * 60 * 60 * 24);
      if (!Number.isNaN(ageDays)) score += Math.max(0, settings.weights.recencyMaxBonus - Math.min(ageDays, settings.weights.recencyMaxBonus));
      return score;
    };

    const ranked = [...jobsList].sort((a, b) => scoreJob(b) - scoreJob(a));
    return ranked;
  };

  const recommendationSettings = loadRecommendationSettings();
  const recommendedJobs = getRecommendedJobs(activeJobs, profile.skills || [], savedJobs || [], recommendationSettings).slice(0, recommendationSettings.count);

  const getApplicationStatus = (status: Application['status']) => {
    const statusConfig: Record<string, any> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Under Review', icon: Eye },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
    };
    return statusConfig[status as string] || statusConfig.pending;
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
    toast.success('Skill removed successfully!');
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
    toast.loading('Saving your profile...', { id: 'save-profile' });
    const performSave = async () => {
      try {
        // Persist core profile fields to backend
        const payload: any = {
          full_name: profile.name,
          phone: profile.phone,
          location: profile.location,
          bio: profile.bio,
          experience: profile.experience,
          education: profile.education,
          website: profile.website,
          linkedin: profile.linkedIn,
          github: profile.github,
          skills: profile.skills,
        };
  
        const resultUpdate = await updateProfile(payload);
        if (resultUpdate?.error) {
          toast.error(resultUpdate.error, { id: 'save-profile' });
          return; // Do not close dialog on error
        }
  
        // If a new resume file was selected, upload it now
        if (profile.resume) {
          const result = await uploadResume(profile.resume);
          if (result?.error) {
            toast.error(result.error, { id: 'save-profile' });
            return; // Keep dialog open on error
          }
          if (result?.resumeUrl) {
            setProfile(prev => ({
              ...prev,
              resumeUrl: result.resumeUrl,
              resumeFileName: result.fileName || prev.resumeFileName || (prev.resume?.name || '')
            }));
          }
        }
  
        // If a new profile picture was selected, upload it now
        if (profile.profilePicture) {
          const resultImg = await uploadProfileImage(profile.profilePicture);
          if (resultImg?.error) {
            toast.error(resultImg.error, { id: 'save-profile' });
            return; // Keep dialog open on error
          }
          if (resultImg?.imageUrl) {
            setProfile(prev => ({
              ...prev,
              profileImageUrl: normalizeAssetUrl(resultImg.imageUrl),
              profilePicture: null
            }));
          }
        }
  
        toast.success('Profile saved successfully!', { id: 'save-profile' });
        setShowEditProfile(false);
      } catch (e) {
        toast.error('Failed to save profile', { id: 'save-profile' });
      }
    };
    void performSave();
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
  
      // Instant local preview without persisting yet
      const localPreviewUrl = URL.createObjectURL(file);
      setProfile(prev => ({
        ...prev,
        profileImageUrl: localPreviewUrl,
        profilePicture: file
      }));
      toast.success(`Image "${file.name}" selected. Click Save to upload.`);
  
      // Defer revocation until after Save to keep preview active
    }
    // Clear the input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Resume size should be less than 10MB');
        return;
      }
      // Do not upload immediately. Wait for user to click Save.
      setProfile({
        ...profile,
        resume: file,
        resumeFileName: file.name
      });
      toast.success(`Resume "${file.name}" selected. Click Save to upload.`);
    }
    // Clear the input so selecting the same file again triggers onChange
    if (event.target) {
      event.target.value = '';
    }
  };

  const profileCompletionPercentage = () => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.location,
      profile.bio,
      profile.experience,
      profile.education,
      profile.skills.length > 0,
      profile.resumeUrl,
      profile.profileImageUrl
    ];
    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getJobInfo = (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    return {
      title: app.jobTitle || job?.title || 'Job Title',
      company: app.company || job?.company || 'Company',
      appliedDate: app.appliedAt || (app as any).appliedDate || '',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-sm fixed top-0 bottom-0 h-auto overflow-y-auto z-10`}>
          <div className={`${sidebarCollapsed ? 'px-2 py-2' : 'p-4'} border-b border-gray-200`}>
            <div className={`flex items-center ${sidebarCollapsed
            ? 'justify-center' : 'justify-between'}`}>
            {!sidebarCollapsed && (
            <div className="flex items-center justify-center">
            <img 
            src="/CompanyLogo.png" 
            alt="Company Logo" 
            className="w-16 h-16 object-contain"
            />
            </div>
            )}
            <Button
            variant={sidebarCollapsed ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={sidebarCollapsed ? 'p-2' : ''}
            >
            <Menu className="w-4 h-4" />
            </Button>
            </div>
          </div>

          <nav className="mt-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => item.id === 'resume' ? navigate('/resume-builder') : setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-4">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-6 transition-all duration-300`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Welcome, {profile.name || 'Job Seeker'}</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setActiveTab('jobs')} className="gap-2">
                  <Search className="w-4 h-4" />
                  Browse Jobs
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('saved')}>
                  Saved Jobs
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/resume-builder')}>
                  Resume
                </Button>
              </div>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                {/* Profile Section */}
                <div className="grid grid-cols-12 gap-4 lg:gap-6">
                  {/* Profile Overview */}
                  <div className="col-span-12 lg:col-span-9">
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                          <Dialog open={showEditProfile}>
                            <Button size="sm" onClick={() => setShowEditProfile(true)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  Edit Profile
                                </DialogTitle>
                                <DialogDescription>
                                  Update your personal information, skills, and resume to improve your job search experience.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-8 py-6">
                                {/* Profile Picture Section */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-blue-600" />
                                    Profile Picture
                                  </h3>
                                  <div className="flex items-center gap-6">
                                    <div className="relative">
                                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                        {profile.profileImageUrl ? (
                                          <img 
                                            src={profile.profileImageUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                            onError={() => setProfile(prev => ({ ...prev, profileImageUrl: '' }))}
                                          />
                                        ) : (
                                          <span className="text-white text-2xl font-semibold">
                                            {profile.name.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => profileImageInputRef.current?.click()}
                                        className="mb-2"
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Profile Picture
                                      </Button>
                                      <p className="text-sm text-gray-500">
                                        Recommended: Square image, at least 400x400px
                                      </p>
                                      <input
                                        ref={profileImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        className="hidden"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Personal Information */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                                      <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="Enter your full name"
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                                      <Input
                                        id="phone"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="Enter your phone number"
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                                      <Input
                                        id="location"
                                        value={profile.location}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        placeholder="Enter your location"
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                                      <Textarea
                                        id="bio"
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        rows={3}
                                        placeholder="Write a brief professional summary"
                                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Professional Information */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-green-600" />
                                    Professional Information
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience</Label>
                                      <Input
                                        id="experience"
                                        value={profile.experience}
                                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                                        placeholder="Enter your experience"
                                        className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education</Label>
                                      <Input
                                        id="education"
                                        value={profile.education}
                                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                                        placeholder="Enter your education"
                                        className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                                      <Input
                                        id="website"
                                        value={profile.website}
                                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                        placeholder="https://yourwebsite.com"
                                        className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn</Label>
                                      <Input
                                        id="linkedin"
                                        value={profile.linkedIn}
                                        onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                        className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Skills Section */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    Skills
                                  </h3>
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                      {profile.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                          <span>{skill}</span>
                                          <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-1 text-purple-600 hover:text-purple-800"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add a skill"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                        className="flex-1 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                      />
                                      <Button 
                                        onClick={handleAddSkill}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Resume Upload */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-600" />
                                    Resume
                                  </h3>
                                  <div 
                                    className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                                    <p className="text-lg font-medium text-gray-700 mb-2">
                                      {profile.resumeFileName || (profile.resume ? profile.resume.name : 'Click to upload or drag and drop')}
                                    </p>
                                    <p className="text-sm text-gray-500">PDF, DOC up to 10MB</p>
                                  </div>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setShowEditProfile(false)}
                                    className="px-6 py-2 rounded-lg border-gray-300 hover-border-gray-400 transition-colors"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleSaveProfile} 
                                    className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="flex items-start space-x-6">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            {profile.profileImageUrl ? (
                              <img 
                                src={profile.profileImageUrl} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={() => setProfile(prev => ({ ...prev, profileImageUrl: '' }))}
                              />
                            ) : (
                              <span className="text-white text-xl font-semibold">
                                {profile.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
                            <p className="text-gray-600 mb-3 text-sm">{profile.bio}</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{profile.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span>
                                  {(() => {
                                    const expText = (profile.experience || '').toString();
                                    const expNum = expText.replace(/[^0-9]/g, '');
                                    if (expNum) {
                                      const years = parseInt(expNum, 10);
                                      return `${expNum} ${years === 1 ? 'year' : 'years'}`;
                                    }
                                    return expText || 'Experience not set';
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.slice(0, 6).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1 text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 6 && (
                              <Badge variant="outline" className="px-2 py-1 text-xs">
                                {profile.skills.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Profile Stats */}
                  <div className="col-span-12 lg:col-span-3 space-y-4">
                    <Card className="bg-white border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Profile Strength</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {profileCompletionPercentage()}%
                          </div>
                          <Progress value={profileCompletionPercentage()} className="mb-3" />
                          <p className="text-xs text-gray-600">
                            Complete your profile to attract more employers
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-0 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => {
                            const resumeUrl = (profile as any).resumeUrl;
                            const fileName = profile.resumeFileName || 'resume';
                            if (resumeUrl) {
                              const a = document.createElement('a');
                              a.href = resumeUrl;
                              a.target = '_blank';
                              a.download = fileName;
                              a.click();
                              toast.success('Resume download started');
                            } else {
                              toast.error('No resume uploaded yet');
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FileEdit className="w-4 h-4 mr-2" />
                          Update Resume
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Applications</p>
                          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                          <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Profile Views</p>
                          <p className="text-2xl font-bold text-gray-900">{Number((authUser as any)?.profileViews ?? (authUser as any)?.views ?? 0)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Job Alerts</p>
                          <p className="text-2xl font-bold text-gray-900">{Array.isArray((authUser as any)?.jobAlerts) ? ((authUser as any).jobAlerts.filter((a: any) => a?.isActive).length) : 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Bell className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Applications and Recommended Jobs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {applications.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No applications yet</p>
                          <Button 
                            className="mt-4" 
                            onClick={() => setActiveTab('search')}
                          >
                            Browse Jobs
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications.slice(0, 3).map((application) => {
                            const status = getApplicationStatus(application.status);
                            const StatusIcon = status.icon;
                            return (
                              <div key={application.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                  <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                                  <p className="text-sm text-gray-600">{application.company}</p>
                                </div>
                                <Badge className={status.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                            );
                          })}
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('applications')}
                          >
                            View All Applications
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Recommended Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recommendedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No recommendations yet</p>
                          <Button 
                            className="mt-4"
                            onClick={() => setActiveTab('search')}
                          >
                            Browse All Jobs
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {recommendedJobs.map((job) => {
                            const cardJob = convertJobForCard(job);
                            const isSaved = savedJobs?.includes(job.id) || false;
                            return (
                              <div key={job.id} className="relative" onClick={() => navigate(`/jobs/${job.id}`)}>
                                <span className={`absolute top-2 right-2 text-xs font-semibold text-white px-2 py-1 rounded-full shadow ${getTierColor(job.tier)}`}>
                                  {getTierLabel(job.tier)}
                                </span>
                                <JobCardUpdated
                                  job={cardJob}
                                  onViewJob={(id: string) => navigate(`/jobs/${id}`)}
                                  onApply={(id: string) => onApplyJob(id)}
                                  tierColor={getTierColor(job.tier)}
                                  tierBgColor={tierBgColor}
                                  onSaveJob={(id: string) => onToggleSaveJob(id)}
                                  isSaved={isSaved}
                                  isUserLoggedIn={!!authUser}
                                  onLoginRequired={() => navigate('/auth')}
                                />
                              </div>
                            );
                          })}
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab('search')}
                          >
                            Browse All Jobs
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}



            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                  <Button onClick={() => setActiveTab('search')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Apply to New Jobs
                  </Button>
                </div>

                {applications.length === 0 ? (
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Start your job search journey by applying to positions that match your skills and interests.
                      </p>
                      <Button onClick={() => setActiveTab('search')}>
                        <Search className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => {
                      const status = getApplicationStatus(application.status);
                      const StatusIcon = status.icon;
                      return (
                        <Card key={application.id} className="bg-white border-0 shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
                                <p className="text-gray-600 mb-2">{application.company}</p>
                                <p className="text-sm text-gray-500">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <Badge className={status.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                                <div className="mt-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Job Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
                  <Button onClick={() => toast.info('Advanced search coming soon!')}>
                    <Search className="w-4 h-4 mr-2" />
                    Advanced Search
                  </Button>
                </div>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input placeholder="Job title or keywords" />
                      <Input placeholder="Location" />
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Search Jobs
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</h3>
                        <p className="text-gray-600">Check back later for new opportunities.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    jobs.map((job) => (
                      <Card key={job.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                              <p className="text-gray-600 mb-2">{job.company}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {job.type}
                                </span>
                                {job.salary && (
                                  <span className="text-green-600 font-medium">
                                    NPR {job.salary.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm">{job.description}</p>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button onClick={() => {
                                toast.success('Application submitted successfully!');
                                // Add application logic here
                              }}
                              >
                                Apply Now
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onApplyJob(job.id)}
                              >
                                Apply Now
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onToggleSaveJob(job.id)}
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="w-4 h-4 mr-2" />
                    Find More Jobs
                  </Button>
                </div>

                {savedJobs && savedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.filter(job => savedJobs.includes(job.id)).map(job => (
                      <Card key={job.id} className="bg-white border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-gray-900">{job.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                              <Briefcase className="w-4 h-4 mr-2" />
                              {job.company}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {job.location}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Apply before {job.deadline}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <Button size="sm" onClick={() => onApplyJob(job.id)}>Apply Now</Button>
                              <Button variant="outline" size="sm" onClick={() => onToggleSaveJob(job.id)}>
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Jobs</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Save interesting job opportunities to review them later.
                      </p>
                      <Button onClick={() => setActiveTab('search')}>
                        <Search className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Following Companies</h1>
                </div>

                {followedCompanies && followedCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.filter(c => {
                      const cid = (c._id || c.id || '').toString() || (c.name || c.companyName || '');
                      return followedCompanies.includes(cid);
                    }).map((c) => {
                      const cid = (c._id || c.id || '').toString() || (c.name || c.companyName || '');
                      const cname = c.name || c.companyName || 'Company';
                      const logo = c.logo_url || c.logoUrl || c.logo || '/CompanyLogo.png';
                      const industry = c.industry || 'Industry';
                      const location = c.location || c.address || 'Nepal';
                      return (
                        <Card key={cid} className="bg-white border-0 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">{cname}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 mb-3">
                              <img src={logo} alt={cname} className="w-10 h-10 rounded border" />
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center"><Building2 className="w-4 h-4 mr-2" />{industry}</div>
                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{location}</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Button size="sm" onClick={() => navigate(`/company/${encodeURIComponent(cname)}`)}>View Jobs</Button>
                              <Button variant="outline" size="sm" onClick={() => onToggleFollowCompany(cid)}>
                                Unfollow
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Followed Companies</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Follow companies to get quick access to their latest jobs.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Resume Builder Tab */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                    </div>
                    <div>
                      {/* Embed Resume List for create/manage/edit/download */}
                      <ResumeList />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
                  <Button onClick={() => toast.info('Job alerts feature coming soon!')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Job Alerts</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Set up job alerts to get notified when new opportunities match your preferences.
                    </p>
                    <Button onClick={() => toast.info('Job alerts feature coming soon!')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Alert
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-gray-600">Allow employers to find your profile</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Resume Visibility</p>
                          <p className="text-sm text-gray-600">Allow employers to view your resume</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Contact Information</p>
                          <p className="text-sm text-gray-600">Show contact details to employers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Export</p>
                          <p className="text-sm text-gray-600">Download your data</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info('Data export feature coming soon!')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-gray-600">Permanently delete your account</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => toast.error('Account deletion feature coming soon!')}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

