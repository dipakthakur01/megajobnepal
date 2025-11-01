import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';

import { toast } from 'sonner';
import { MapPin, Briefcase, Calendar, DollarSign, Users, Heart, Share2, Building, Clock, Bell, Upload, FileText, Eye, AlertCircle, Send, BookmarkPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShareJobModal } from '../components/ShareJobModal';
import { useApp } from '@/pages/providers/AppProvider';

// Job object structure matching our actual structure from mockData.js
// Job properties: id, title, company, location, description, requirements, postedDate, deadline, salary, type, tier, category, experience, tags, featured, urgent, companyLogo, logo, source, publishedDate, approvalStatus, approvedBy, approvedDate, rejectedBy, rejectedDate, rejectionReason, submittedBy, submittedDate

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  postedDate: string;
  deadline: string;
  salary: string;
  type: string;
  tier: string;
  category: string;
  experience: string;
  tags: string[];
  featured: boolean;
  urgent: boolean;
  companyLogo?: string;
  logo?: string;
  source: string;
  publishedDate: string;
  approvalStatus: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  submittedBy: string;
  submittedDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ApplicationData {
  coverLetter: string;
  expectedSalary: string;
  availableFrom: string;
  resumeFile: File | null;
  agreeToTerms: boolean;
  contactPermission: boolean;
}

interface JobDetailProps {
  job: Job;
  relatedJobs: Job[];
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isSaved: boolean;
  hasApplied: boolean;
  onViewJob: (jobId: string) => void;
  onViewCompany: (companyName: string) => void;
  currentUser: User | null;
}

export function JobDetail({ job, relatedJobs, onApply, onSave, isSaved, hasApplied, onViewJob, onViewCompany, currentUser }: JobDetailProps) {
  const { companies: globalCompanies = [] } = useApp();
  const [showApplicationModal, setShowApplicationModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: '',
    resumeFile: null,
    agreeToTerms: false,
    contactPermission: true
  });
  const [reminderDate, setReminderDate] = useState<string>('');

  // Helper function to get company name - now simplified for our structure
  const getCompanyName = (job: Job): string => {
    return job.company;
  };

  // Helper function to get company logo
  const getCompanyLogo = (job: Job): string => {
    // Primary sources on job itself
    if ((job as any).logo) return (job as any).logo;
    if ((job as any).coverImageUrl) return (job as any).coverImageUrl;
    if ((job as any).companyLogo) return (job as any).companyLogo;

    // Try to find company in global state by name
    const nameFromJob = (job as any).company;
    if (nameFromJob && Array.isArray(globalCompanies) && globalCompanies.length > 0) {
      const target = String(nameFromJob).toLowerCase().trim();
      const found = (globalCompanies as any[]).find(c => {
        const nm = String(c.name || c.companyName || c.company_name || '').toLowerCase().trim();
        return nm === target;
      });
      
      if (found) {
        // Check all possible logo field variations
        const logoCandidate = found.logo_url || found.logoUrl || found.logo || found.profileImage;
        if (logoCandidate) return logoCandidate;
      }
    }

    // Generate a placeholder based on company name
    const nm = job.company || 'Company';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=random&color=fff&size=128&font-size=0.6&format=svg`;
  };

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      // Reset form data on unmount
      setApplicationData({
        coverLetter: '',
        expectedSalary: '',
        availableFrom: '',
        resumeFile: null,
        agreeToTerms: false,
        contactPermission: true
      });
      setReminderDate('');
    };
  }, []);

  const handleQuickApply = async (): Promise<void> => {
    if (!job) {
      toast.error('Job not found');
      return;
    }
    if (!currentUser) {
      toast.error('Please log in to apply for jobs', {
        action: {
          label: 'Login',
          onClick: () => {
            // This would trigger the login modal in a real app
            window.location.href = '/auth';
          }
        }
      });
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied for this job');
      return;
    }
    
    try {
      await onApply(job.id);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleDetailedApply = async (): Promise<void> => {
    if (!job) {
      toast.error('Job not found');
      return;
    }
    if (!currentUser) {
      toast.error('Please log in to apply for jobs');
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied for this job');
      return;
    }
    
    if (!applicationData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      await onApply(job.id, applicationData);
      setShowApplicationModal(false);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleSetReminder = (): void => {
    if (!reminderDate) {
      toast.error('Please select a reminder date');
      return;
    }
    
    // In a real app, this would save the reminder
    console.log('Setting reminder for', reminderDate);
    setShowReminderModal(false);
    toast.success('Application reminder set successfully!');
  };

  const handleShareJob = (): void => {
    if (!job) {
      toast.error('Job not found');
      return;
    }
    
    setShowShareModal(true);
  };



  const formatSalary = (min, max, negotiable) => {
    if (negotiable) return 'Negotiable';
    if (min && max) return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `NPR ${min.toLocaleString()}+`;
    return 'Competitive Salary';
  };

  const getJobTierBadge = (tier) => {
    const tierConfig = {
      mega_job: { label: 'MegaJob', className: 'bg-purple-100 text-purple-800' },
      premium_job: { label: 'Premium', className: 'bg-blue-100 text-blue-800' },
      prime_job: { label: 'Prime', className: 'bg-green-100 text-green-800' },
      latest_job: { label: 'Latest', className: 'bg-gray-100 text-gray-800' },
      newspaper_job: { label: 'Newspaper', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = tierConfig[tier] || tierConfig.latest_job;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Job Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <ImageWithFallback
                  src={getCompanyLogo(job)}
                  alt={getCompanyName(job) || 'Company'}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    {job.featured && (
                      <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                    )}
                    {getJobTierBadge(job.tier)}
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-xl text-gray-700">{getCompanyName(job)}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{job.type?.replace('_', ' ') || 'Full Time'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{job.salary || 'Negotiable'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{job.experience || 'Entry Level'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleQuickApply}
                    disabled={hasApplied || !currentUser}
                    className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-semibold"
                  >
                    {hasApplied ? 'Applied' : !currentUser ? 'Login to Apply' : 'Quick Apply'}
                  </Button>
                  
                  <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={hasApplied || !currentUser}
                        className="w-full hover:bg-primary/10 hover:text-primary border-primary/20"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {!currentUser ? 'Login for Detailed Apply' : 'Detailed Apply'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="application-form-description">
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription id="application-form-description">
                          Fill out the application form below to apply for this position. All fields are optional unless marked as required.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cover-letter">Cover Letter</Label>
                          <Textarea
                            id="cover-letter"
                            placeholder="Tell us why you're perfect for this role..."
                            value={applicationData.coverLetter}
                            onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expected-salary">Expected Salary (NPR)</Label>
                            <Input
                              id="expected-salary"
                              type="number"
                              placeholder="e.g. 60000"
                              value={applicationData.expectedSalary}
                              onChange={(e) => setApplicationData({...applicationData, expectedSalary: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="available-from">Available From</Label>
                            <Input
                              id="available-from"
                              type="date"
                              value={applicationData.availableFrom}
                              onChange={(e) => setApplicationData({...applicationData, availableFrom: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="resume-upload">Resume (Optional)</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Upload a different resume for this application</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setApplicationData({...applicationData, resumeFile: e.target.files?.[0] || null})}
                              className="hidden"
                              id="resume-upload-input"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('resume-upload-input')?.click()}
                            >
                              Choose File
                            </Button>
                            {applicationData.resumeFile && (
                              <p className="text-sm text-green-600 mt-2">{applicationData.resumeFile.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="agree-terms"
                              checked={applicationData.agreeToTerms}
                              onCheckedChange={(checked) => setApplicationData({...applicationData, agreeToTerms: checked})}
                            />
                            <Label htmlFor="agree-terms" className="text-sm">
                              I agree to the terms and conditions and privacy policy
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contact-permission"
                              checked={applicationData.contactPermission}
                              onCheckedChange={(checked) => setApplicationData({...applicationData, contactPermission: checked})}
                            />
                            <Label htmlFor="contact-permission" className="text-sm">
                              Allow the employer to contact me about this position
                            </Label>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleDetailedApply}>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Application
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!currentUser) {
                        toast.error('Please log in to save jobs');
                        return;
                      }
                      onSave(job.id);
                      toast.success(isSaved ? 'Job removed from saved list' : 'Job saved successfully!');
                    }}
                    className="flex-1 lg:w-full hover:bg-red-50 hover:border-red-200"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    {isSaved ? 'Saved' : 'Save Job'}
                  </Button>
                  
                  <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Bell className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby="reminder-form-description">
                      <DialogHeader>
                        <DialogTitle>Set Application Reminder</DialogTitle>
                        <DialogDescription id="reminder-form-description">
                          Choose a date when you want to be reminded to apply for this job.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reminder-date">Remind me on</Label>
                          <Input
                            id="reminder-date"
                            type="date"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowReminderModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSetReminder}>
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="icon" onClick={handleShareJob}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {formatDate(job.publishedDate || job.postedDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>0 views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>0 applicants</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{job.type?.replace('_', ' ') || 'Full Time'}</Badge>
                {job.experience && (
                  <Badge variant="outline">{job.experience}</Badge>
                )}
                {job.category && (
                  <Badge variant="outline">{job.category}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Job Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line space-y-3">
                    {job.description || 'We are looking for a motivated professional to join our team. This position offers excellent opportunities for growth and development in a dynamic work environment.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line space-y-3">
                    {job.requirements || `• Bachelor's degree in relevant field or equivalent experience
• Strong communication and interpersonal skills
• Ability to work independently and as part of a team
• Proficiency in relevant software and tools
• Willingness to learn and adapt to new challenges`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">About {getCompanyName(job) || 'the Company'}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                    onClick={() => {
                      const companyName = getCompanyName(job);
                      if (companyName && onViewCompany) {
                        onViewCompany(companyName);
                      } else {
                        toast.info('Company profile will be available soon');
                      }
                    }}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    View Company
                  </Button>
                </div>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    {`${getCompanyName(job) || 'This company'} is a leading organization committed to excellence and innovation. We provide a collaborative work environment where employees can grow professionally and make meaningful contributions to our mission.`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Company Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Company</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <ImageWithFallback
                    src={getCompanyLogo(job)}
                    alt={getCompanyName(job) || 'Company'}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{getCompanyName(job)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                  onClick={() => {
                    const companyName = getCompanyName(job);
                    if (companyName && onViewCompany) {
                      onViewCompany(companyName);
                    } else {
                      toast.info('Company profile will be available soon');
                    }
                  }}
                >
                  <Building className="w-4 h-4 mr-2" />
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Job Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published On:</span>
                    <span className="font-medium">{formatDate(job.publishedDate || job.postedDate)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span className="font-medium">{job.type?.replace('_', ' ') || 'Full Time'}</span>
                  </div>
                  <Separator />
                  {job.experience && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{job.experience}</span>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{job.location || 'Remote'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-green-600">{job.salary || 'Negotiable'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-medium">0 applicants</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Apply */}
            <Card className="bg-primary/5 border-primary/20 shadow-lg">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasApplied ? 'Application Status' : 'Quick Apply'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {hasApplied 
                    ? 'Your application has been submitted successfully' 
                    : currentUser 
                      ? 'Apply now with your saved profile' 
                      : 'Sign in to apply for this position'
                  }
                </p>
                {hasApplied ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Application Submitted</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleQuickApply}
                    disabled={!currentUser}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {!currentUser ? 'Sign In to Apply' : 'Apply Now'}
                  </Button>
                )}
                {!hasApplied && currentUser && (
                  <p className="text-xs text-gray-500 mt-2">
                    Or use detailed apply for a custom application
                  </p>
                )}
                {!currentUser && (
                  <p className="text-xs text-gray-500 mt-2">
                    Create an account to save your applications
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relatedJob) => (
                <Card key={relatedJob.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <ImageWithFallback
                        src={getCompanyLogo(relatedJob)}
                        alt={relatedJob.company || 'Company'}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{relatedJob.title}</h4>
                        <p className="text-sm text-gray-600">{relatedJob.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{relatedJob.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{relatedJob.salary || 'Negotiable'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">{relatedJob.type?.replace('_', ' ') || 'Full Time'}</Badge>
                      {relatedJob.experience && (
                        <Badge variant="outline" className="text-xs">{relatedJob.experience}</Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onViewJob(relatedJob.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Share Job Modal - Only render when needed */}
      {showShareModal && job && (
        <ShareJobModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          job={job}
        />
      )}
    </div>
  );
}

export default JobDetail;
