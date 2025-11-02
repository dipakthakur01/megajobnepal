import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

import { toast } from 'sonner';
import { MapPin, Briefcase, Calendar, DollarSign, Users, Heart, Share2, Building, Clock, Bell, Upload, FileText, Eye, AlertCircle, Send, BookmarkPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShareJobModal } from '../components/ShareJobModal';
import { slugify } from '@/utils/slug';

// Job interface matching our actual structure from mockData.js
// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location: string;
//   description: string;
//   requirements: string[];
//   postedDate: string;
//   deadline: string;
//   salary: string;
//   type: 'mega_job' | 'premium_job' | 'prime_job' | 'latest_job' | 'newspaper_job';
//   tier: 'mega_job' | 'premium_job' | 'prime_job' | 'latest_job' | 'newspaper_job' | 'megajob' | 'premium' | 'prime' | 'latest' | 'newspaper';
//   category: string;
//   experience: string;
//   tags: string[];
//   featured?: boolean;
//   urgent?: boolean;
//   companyLogo?: string;
//   logo?: string;
//   source?: 'online' | 'newspaper';
//   publishedDate: string;
//   approvalStatus?: 'pending' | 'approved' | 'rejected';
//   approvedBy?: string;
//   approvedDate?: string;
//   rejectedBy?: string;
//   rejectedDate?: string;
//   rejectionReason?: string;
//   submittedBy?: string;
//   submittedDate?: string;
// }

// interface JobDetailProps {
//   job?: Job;
//   relatedJobs: Job[];
// }

export function JobDetail({ job, companies, relatedJobs, onApply, onSave, isSaved, hasApplied, onViewJob, onViewCompany, currentUser }) {
  // Ensure arrays exist with default values
  const safeJob = job ? {
    ...job,
    requirements: job.requirements || [],
    tags: job.tags || []
  } : null;
  
  const safeRelatedJobs = Array.isArray(relatedJobs) ? relatedJobs : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];
  
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableFrom: '',
    resumeFile: null,
    agreeToTerms: false,
    contactPermission: true
  });
  const [reminderDate, setReminderDate] = useState('');

  // Helper function to get company logo
  const getCompanyLogo = (jobData: any): string => {
    // Primary sources on job itself
    if (jobData?.logo) return jobData.logo;
    if (jobData?.companyLogo) return jobData.companyLogo;
    
    // Try to find company in global state by name
    const nameFromJob = jobData?.company;
    if (nameFromJob && Array.isArray(safeCompanies) && safeCompanies.length > 0) {
      const target = String(nameFromJob).toLowerCase().trim();
      const found = safeCompanies.find(c => {
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
    const nm = jobData?.company || 'Company';
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

  const handleQuickApply = async (e?: React.MouseEvent) => {
    // Stop event propagation if event provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!safeJob) {
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
      toast.error('You have already applied for this job');
      return;
    }
    
    try {
      await onApply(safeJob.id);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleDetailedApply = async (e?: React.MouseEvent) => {
    // Stop event propagation if event provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!safeJob) {
      toast.error('Job not found');
      return;
    }
    if (!currentUser) {
      toast.error('Please log in to apply for jobs');
      return;
    }
    
    if (!applicationData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      await onApply(safeJob.id, applicationData);
      setShowApplicationModal(false);
      toast.success('Application submitted successfully!');
      // Reset form data
      setApplicationData({
        coverLetter: '',
        expectedSalary: '',
        availableFrom: '',
        resumeFile: null,
        agreeToTerms: false,
        contactPermission: true
      });
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setApplicationData(prev => ({ ...prev, resumeFile: file }));
    }
  };

  const formatSalary = (salary: string) => {
    return salary || 'Negotiable';
  };

  const getJobTierBadge = (tier: string) => {
    const tierConfig = {
      megajob: { label: 'MegaJob', className: 'bg-yellow-100 text-yellow-800' },
      mega_job: { label: 'MegaJob', className: 'bg-yellow-100 text-yellow-800' },
      premium: { label: 'Premium', className: 'bg-blue-100 text-blue-800' },
      premium_job: { label: 'Premium', className: 'bg-blue-100 text-blue-800' },
      prime: { label: 'Prime', className: 'bg-green-100 text-green-800' },
      prime_job: { label: 'Prime', className: 'bg-green-100 text-green-800' },
      latest: { label: 'Latest', className: 'bg-gray-100 text-gray-800' },
      latest_job: { label: 'Latest', className: 'bg-gray-100 text-gray-800' },
      newspaper: { label: 'Newspaper', className: 'bg-orange-100 text-orange-800' },
      newspaper_job: { label: 'Newspaper', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.latest;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!safeJob) {
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
                  src={getCompanyLogo(safeJob)}
                  alt={safeJob.company}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{safeJob.title}</h1>
                    {safeJob.featured && (
                      <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                    )}
                    {safeJob.urgent && (
                      <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                    )}
                    {getJobTierBadge(safeJob.tier)}
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-xl text-gray-700">{safeJob.company}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{safeJob.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{safeJob.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{formatSalary(safeJob.salary)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{safeJob.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickApply(e);
                    }}
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
                        <DialogTitle>Apply for {safeJob.title}</DialogTitle>
                        <DialogDescription id="application-form-description">
                          Fill out the application form below to apply for this position. All fields are optional unless marked as required.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="cover-letter">Cover Letter</Label>
                          <Textarea 
                            id="cover-letter"
                            placeholder="Tell us why you're the perfect fit for this role..."
                            value={applicationData.coverLetter}
                            onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                            className="min-h-[120px]"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expected-salary">Expected Salary</Label>
                            <Input 
                              id="expected-salary"
                              placeholder="e.g., NPR 50,000 - 70,000"
                              value={applicationData.expectedSalary}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="available-from">Available From</Label>
                            <Input 
                              id="available-from"
                              type="date"
                              value={applicationData.availableFrom}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, availableFrom: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="resume-upload">Resume Upload</Label>
                          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <div className="text-sm">
                              <label htmlFor="resume-upload" className="cursor-pointer text-primary hover:text-primary/80">
                                Upload your resume
                              </label>
                              <input 
                                id="resume-upload" 
                                type="file" 
                                className="sr-only" 
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                              />
                              <p className="text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
                            </div>
                            {applicationData.resumeFile && (
                              <p className="text-sm text-green-600 mt-2">
                                {applicationData.resumeFile.name} uploaded
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input 
                              id="agree-terms"
                              type="checkbox" 
                              checked={applicationData.agreeToTerms}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="agree-terms" className="text-sm">
                              I agree to the terms and conditions *
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              id="contact-permission"
                              type="checkbox" 
                              checked={applicationData.contactPermission}
                              onChange={(e) => setApplicationData(prev => ({ ...prev, contactPermission: e.target.checked }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="contact-permission" className="text-sm">
                              Allow employer to contact me for similar opportunities
                            </Label>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button 
                            variant="outline" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowApplicationModal(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDetailedApply(e);
                            }} 
                            disabled={!applicationData.agreeToTerms}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Application
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onSave(safeJob.id)}
                      variant="outline"
                      className={`flex-1 ${isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-primary/10 hover:text-primary'}`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    
                    <Button
                      onClick={() => setShowShareModal(true)}
                      variant="outline"
                      className="flex-1 hover:bg-primary/10 hover:text-primary"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <Dialog open={showReminderModal} onOpenChange={setShowReminderModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full hover:bg-yellow-50 hover:text-yellow-600 border-yellow-200">
                        <Bell className="w-4 h-4 mr-2" />
                        Set Reminder
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
                          <Label htmlFor="reminder-date">Reminder Date</Label>
                          <Input 
                            id="reminder-date"
                            type="date"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button variant="outline" onClick={() => setShowReminderModal(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (reminderDate) {
                                toast.success('Reminder set successfully!');
                                setShowReminderModal(false);
                              } else {
                                toast.error('Please select a date');
                              }
                            }}
                            disabled={!reminderDate}
                          >
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Job Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">{safeJob.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {safeJob.requirements && safeJob.requirements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {safeJob.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-600">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {safeJob.tags && safeJob.tags.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Skills & Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {safeJob.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Job Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted Date:</span>
                    <span className="font-medium">{formatDate(safeJob.postedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">{formatDate(safeJob.deadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Type:</span>
                    <span className="font-medium">{safeJob.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{safeJob.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{safeJob.experience}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About Company</h3>
                <div className="text-center">
                  <ImageWithFallback
                    src={getCompanyLogo(safeJob)}
                    alt={safeJob.company}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                  />
                  <h4 className="font-medium text-lg mb-2">{safeJob.company}</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Navigate to company detail page (SPA route: /company/:id)
                      const companyName = safeJob.company || '';
                      const encoded = encodeURIComponent(companyName);
                      window.open(`/company/${encoded}`, '_blank');
                    }}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Overview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Jobs */}
            {safeRelatedJobs && safeRelatedJobs.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Related Jobs</h3>
                  <div className="space-y-4">
                    {safeRelatedJobs.map((relatedJob) => (
                      <div 
                        key={relatedJob.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onViewJob(slugify(String(relatedJob.title)))}
                      >
                        <h4 className="font-medium text-sm mb-1">{relatedJob.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{relatedJob.company}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{relatedJob.location}</span>
                          {getJobTierBadge(relatedJob.tier)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal - Pass the complete safeJob object */}
      {showShareModal && safeJob && (
        <ShareJobModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          job={safeJob}
        />
      )}
    </div>
  );
}
