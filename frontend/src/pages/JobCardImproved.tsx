import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Briefcase, Clock, Star, Bookmark, Eye, Share2, Building2, Calendar, DollarSign } from 'lucide-react';
import { Job } from '../lib/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleShareModal } from './SimpleShareModal';
import { toast } from 'sonner';

interface JobCardImprovedProps {
  job: Job;
  onViewJob: (jobId: string) => void;
  tierColor: string;
  tierBgColor: string;
  onSaveJob?: (jobId: string) => void;
  onLoginRequired?: () => void;
  isSaved?: boolean;
  isUserLoggedIn?: boolean;
  onViewCompany?: (companyName: string) => void;
}

export const JobCardImproved = React.memo(function JobCardImproved({ 
  job, 
  onViewJob, 
  tierColor, 
  tierBgColor, 
  onSaveJob, 
  onLoginRequired, 
  isSaved = false, 
  isUserLoggedIn = false, 
  onViewCompany 
}: JobCardImprovedProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(isSaved);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      toast.error("Please login to save jobs");
      onLoginRequired?.();
      return;
    }
    if (onSaveJob) {
      onSaveJob(job.id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? "Job removed from saved jobs" : "Job saved successfully");
    }
  };

  const handleShareJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const getTierInfo = () => {
    switch (job.tier) {
      case 'megajob':
        return { label: 'MegaJob', icon: Star, color: 'bg-gradient-to-r from-yellow-500 to-orange-500' };
      case 'premium':
        return { label: 'Premium', icon: Briefcase, color: 'bg-gradient-to-r from-blue-500 to-indigo-500' };
      case 'prime':
        return { label: 'Prime', icon: Building2, color: 'bg-gradient-to-r from-green-500 to-emerald-500' };
      case 'newspaper':
        return { label: 'Newspaper', icon: Clock, color: 'bg-gradient-to-r from-orange-500 to-red-500' };
      default:
        return { label: 'Latest', icon: Clock, color: 'bg-gradient-to-r from-purple-500 to-pink-500' };
    }
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  // Format salary with enhanced options
  const formatSalary = (job: any) => {
    // Handle new salary format
    if (job.salaryType) {
      switch (job.salaryType) {
        case 'negotiable':
          return 'Salary Negotiable';
        case 'competitive':
          return 'Competitive Salary';
        case 'range':
          if (job.salaryMin && job.salaryMax) {
            return `NPR ${parseInt(job.salaryMin).toLocaleString()} - ${parseInt(job.salaryMax).toLocaleString()}`;
          }
          break;
        case 'exact':
          if (job.salary) {
            return `NPR ${parseInt(job.salary).toLocaleString()}`;
          }
          break;
      }
    }
    
    // Handle legacy salary format
    const salary = job.salary;
    if (!salary) return null;
    
    // Check for negotiable/competitive keywords
    const salaryLower = salary.toLowerCase();
    if (salaryLower.includes('negotiable')) return 'Salary Negotiable';
    if (salaryLower.includes('competitive')) return 'Competitive Salary';
    
    // Format existing salary
    if (salary.includes('NPR') || salary.includes('Rs')) return salary;
    
    // Try to parse as number and format
    const numSalary = parseInt(salary.replace(/[^\d]/g, ''));
    if (!isNaN(numSalary)) {
      return `NPR ${numSalary.toLocaleString()}`;
    }
    
    return salary;
  };

  // Format posting date - relative to now
  const formatPostingDate = (date: string) => {
    if (!date) return 'Recently posted';
    try {
      const jobDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - jobDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return 'Recently posted';
    }
  };

  // Format expiry date - show actual date
  const formatExpiryDate = (date: string) => {
    if (!date) {
      // If no expiry date, calculate 30 days from posting date
      const postingDate = job.publishedDate || job.postedDate;
      if (postingDate) {
        const expiryDate = new Date(postingDate);
        expiryDate.setDate(expiryDate.getDate() + 30);
        return `Expires on ${expiryDate.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}`;
      }
      return 'No expiry date';
    }
    
    try {
      const expiryDate = new Date(date);
      const now = new Date();
      
      if (expiryDate < now) {
        return 'Expired';
      }
      
      return `Expires on ${expiryDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}`;
    } catch {
      return 'No expiry date';
    }
  };

  return (
    <>
      <Card 
        className={`
          h-full cursor-pointer transition-all duration-300 group 
          hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] 
          border border-gray-200 bg-white overflow-hidden rounded-xl
          ${isHovered ? 'border-primary/20' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewJob(job.id)}
      >
        <CardContent className="p-0 h-full">
          {/* Header with tier badge */}
          <div className="relative p-4 pb-3">
            {/* Tier Badge */}
            <div className={`absolute top-3 right-3 ${tierInfo.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10`}>
              <TierIcon className="w-3 h-3" />
              <span className="font-medium hidden sm:inline">{tierInfo.label}</span>
            </div>

            {/* Company Logo and Info */}
            <div className="flex items-start space-x-3 pr-16">
              <div className="relative flex-shrink-0">
                <ImageWithFallback
                  src={job.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop&crop=face'}
                  alt={job.company || 'Company'}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                />
                {job.featured && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <button 
                  className="text-gray-600 text-sm hover:text-primary transition-colors font-medium truncate block w-full text-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCompany?.(job.company || '');
                  }}
                >
                  {job.company}
                </button>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="px-4 pb-3 space-y-2">
            {/* Location */}
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="truncate">
                {job.location || 'Remote'}
              </span>
            </div>

            {/* Employment Type */}
            {job.type && (
              <div className="flex items-center text-gray-600 text-sm">
                <Briefcase className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                <span className="capitalize">{job.type.replace('_', ' ')}</span>
              </div>
            )}

            {/* Posted Date */}
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span>{formatPostingDate(job.publishedDate || job.postedDate || '')}</span>
            </div>

            {/* Expiry Date */}
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span className="text-orange-600 font-medium">{formatExpiryDate(job.deadline || '')}</span>
            </div>

            {/* Salary if available */}
            {formatSalary(job) && (
              <div className="flex items-center text-green-600 text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">{formatSalary(job)}</span>
              </div>
            )}

            {/* Employment Type Badge */}
            {job.type && (
              <div className="pt-1">
                <Badge variant="outline" className="text-xs">
                  {job.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="p-4 pt-2 mt-auto space-y-3">
            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="h-9 text-xs font-medium border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewJob(job.id);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">View</span>
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className={`h-9 text-xs font-medium transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={handleSaveJob}
                title={isUserLoggedIn ? (isBookmarked ? "Remove from saved jobs" : "Save this job") : "Login to save jobs"}
              >
                <Bookmark className={`w-3.5 h-3.5 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="h-9 text-xs font-medium border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                onClick={handleShareJob}
                title="Share this job"
              >
                <Share2 className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>

            {/* Primary Action */}
            <Button 
              className={`w-full h-11 font-semibold ${tierInfo.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg`}
              onClick={() => onViewJob(job.id)}
            >
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {showShareModal && (
        <SimpleShareModal
          jobId={job.id}
          jobTitle={job.title}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
});
