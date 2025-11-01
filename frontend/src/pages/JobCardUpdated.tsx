import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Briefcase, Clock, Star, Bookmark, Eye, TrendingUp, Zap, Share2 } from 'lucide-react';
import { Job } from '../lib/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShareJobModal } from './ShareJobModal';
import { SimpleShareModal } from './SimpleShareModal';
import { toast } from 'sonner';
import { useApp } from '@/pages/providers/AppProvider';

interface JobCardProps {
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

export const JobCard = React.memo(function JobCard({ job, onViewJob, tierColor, tierBgColor, onSaveJob, onLoginRequired, isSaved = false, isUserLoggedIn = false, onViewCompany }: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(isSaved);
  const [showShareModal, setShowShareModal] = useState(false);
  const { siteSettings } = useApp();
  const badgeLabel = siteSettings?.jobBadgeLabel || 'mega_job';

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
        return { 
          label: badgeLabel, 
          icon: Zap, 
          bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50', 
          border: 'border-yellow-300/50',
          glow: 'shadow-yellow-200/50'
        };
      case 'premium':
        return { 
          label: badgeLabel, 
          icon: Star, 
          bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50', 
          border: 'border-blue-300/50',
          glow: 'shadow-blue-200/50'
        };
      case 'prime':
        return { 
          label: badgeLabel, 
          icon: TrendingUp, 
          bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50', 
          border: 'border-green-300/50',
          glow: 'shadow-green-200/50'
        };
      case 'newspaper':
        return { 
          label: badgeLabel, 
          icon: Briefcase, 
          bg: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50', 
          border: 'border-orange-300/50',
          glow: 'shadow-orange-200/50'
        };
      default:
        // Treat "latest" and unknown tiers as no special badge
        return {
          label: badgeLabel,
          icon: Clock,
          bg: 'bg-gradient-to-br from-white via-white to-white',
          border: 'border-transparent',
          glow: ''
        };
    }
  };



  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  // Get company job count from the extended job object
  const companyJobCount = (job as any).companyJobCount || 1;

  return (
    <Card
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${tierInfo.border} ${tierInfo.bg} relative overflow-hidden rounded-2xl h-[380px] flex flex-col backdrop-blur-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Tier indicator - hidden for 'latest' or unknown tiers */}
      {tierInfo.label && (
        <div className={`absolute top-3 right-3 ${tierColor} text-white text-xs px-2 py-1 rounded-xl flex items-center gap-1 z-20 shadow-lg ${isHovered ? 'animate-pulse' : ''}`}>
          <TierIcon className={`w-3 h-3 ${isHovered ? 'animate-spin' : ''} transition-transform duration-300`} />
          <span className="font-medium text-xs">{tierInfo.label}</span>
        </div>
      )}



      <CardContent className="p-5 flex flex-col h-full relative z-10">
        {/* Header with company logo and basic info - Fixed height */}
        <div className="flex items-start space-x-3 mb-3 h-[70px] flex-shrink-0">
          <div className="relative flex-shrink-0 group/logo">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ImageWithFallback
              src={job.coverImageUrl || job.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=56&h=56&fit=crop&crop=face'}
              fallbackSrc={'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=56&h=56&fit=crop&crop=face'}
              alt={job.title || job.company}
              className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-lg relative z-10 transition-transform duration-300"
            />
            {job.featured && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg z-20">
                <Star className="w-2.5 h-2.5 text-white fill-current" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
            <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 transition-colors duration-300 line-clamp-2 group-hover:text-orange-600">
              {job.title}
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewCompany) {
                    onViewCompany(job.company);
                  }
                }}
                className="text-xs text-gray-600 font-semibold truncate hover:text-blue-600 transition-colors cursor-pointer"
                title="View company profile"
              >
                {job.company}
              </button>
              {companyJobCount > 1 && (
                <Badge 
                  className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onViewCompany) {
                      onViewCompany(job.company);
                    }
                  }}
                  title={`${companyJobCount} jobs available at ${job.company}`}
                >
                  {companyJobCount - 1}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Job details with reduced spacing */}
        <div className="space-y-1.5 mb-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-gray-700">
            <div className="p-1 bg-white/60 rounded-lg">
              <MapPin className="w-3 h-3 text-gray-500 transition-colors duration-300 group-hover:text-orange-500" />
            </div>
            <span className="font-medium truncate">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-700">
            <div className="p-1 bg-white/60 rounded-lg">
              <Briefcase className="w-3 h-3 text-gray-500 transition-colors duration-300 group-hover:text-blue-500" />
            </div>
            <span className="font-medium truncate">
              {(() => {
                const key = (job.tier || job.type || 'latest').toLowerCase();
                if (key.includes('mega')) return 'mega_job';
                if (key.includes('premium')) return 'premium_job';
                if (key.includes('prime')) return 'prime_job';
                if (key.includes('newspaper')) return 'newspaper_job';
                return 'mega_job';
              })()}
            </span>
          </div>
        </div>
        
        {/* Enhanced tags and badges - Fixed height */}
        <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0 h-[24px] items-start">
          {job.skills?.slice(0, 2).map((skill, index) => (
            <Badge className="text-xs px-2 py-0.5 bg-white/80 text-gray-700 border border-gray-200 rounded-full font-medium transition-colors duration-300 hover:border-orange-300">
              {skill}
            </Badge>
          ))}
          {job.skills && job.skills.length > 2 && (
            <Badge className="text-xs px-2 py-0.5 bg-white/80 text-gray-700 border border-gray-200 rounded-full font-medium transition-colors duration-300 hover:border-blue-300">
              {job.skills.length - 2}
            </Badge>
          )}
        </div>

        {/* Flexible spacer to push salary and buttons to bottom */}
        <div className="flex-1"></div>

        {/* Salary and posted date - Fixed position from bottom with better spacing */}
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg transition-all duration-300 hover:shadow-md flex-1 max-w-[85%]">
              <p className="text-sm font-bold text-green-700 truncate">{job.salary}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{job.postedDate}</span>
          </div>
        </div>
        
        {/* Enhanced action buttons - Fixed position at bottom */}
        <div className="space-y-2 flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 border hover:bg-gray-50 transition-all duration-300 rounded-lg font-medium text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                onViewJob(job.id);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className={`border transition-all duration-300 rounded-lg font-medium text-xs h-8 px-2 ${
                isBookmarked ? 'bg-orange-50 border-orange-300 text-orange-600' : 'hover:bg-gray-50'
              }`}
              onClick={handleSaveJob}
              title={isUserLoggedIn ? (isBookmarked ? "Remove from saved jobs" : "Save this job") : "Login to save jobs"}
            >
              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="border hover:bg-gray-50 transition-all duration-300 rounded-lg font-medium text-xs h-8 px-2"
              onClick={handleShareJob}
              title="Share this job"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
          <Button 
            className={`w-full text-sm font-semibold transition-all duration-500 h-9 rounded-lg relative overflow-hidden group/btn ${
              job.tier === 'megajob' ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600' :
              job.tier === 'premium' ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600' :
              job.tier === 'prime' ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600' :
              job.tier === 'newspaper' ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600' :
              'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600'
            } hover:shadow-xl hover:scale-[1.02] text-white border-0`}
            onClick={() => onViewJob(job.id)}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              Apply Now
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          </Button>
        </div>
      </CardContent>
      
      {/* Share Job Modal - Only render when needed */}
      {showShareModal && (
        <SimpleShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          jobId={job.id}
          jobTitle={job.title}
        />
      )}
    </Card>
  );
});
