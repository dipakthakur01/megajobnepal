import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, DollarSign, Eye, Bookmark, Share2 } from 'lucide-react';
import { Job } from '../lib/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { normalizeMediaUrl } from '@/utils/media';
import { SimpleShareModal } from './SimpleShareModal';
import { toast } from 'sonner';

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

  const getTierLabel = () => {
    switch (job.tier) {
      case 'megajob':
        return 'MegaJob';
      case 'premium':
        return 'Premium';
      case 'prime':
        return 'Prime';
      case 'newspaper':
        return 'Newspaper';
      default:
        return '';
    }
  };

  // Calculate expiry date (example: 30 days from posted date)
  const getExpiryDate = () => {
    const posted = new Date();
    const expiry = new Date(posted);
    expiry.setDate(expiry.getDate() + 30);
    return expiry.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="job-card-compact bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer relative h-full flex flex-col">
      {/* Tier Badge - hidden for 'latest' or unknown tiers */}
      {getTierLabel() && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-purple-500 text-white text-xs px-2 py-1 rounded-md font-medium">
            {getTierLabel()}
          </Badge>
        </div>
      )}

      <CardContent className="p-4 flex flex-col h-full">
        {/* Company Logo and Job Title - Fixed Height */}
        <div className="flex items-start space-x-3 mb-3 h-16">
          <div className="flex-shrink-0">
            {(() => {
              const v =
                (job as any).company_logo ||
                (job as any).companyLogo ||
                (job as any).logo ||
                (job as any).coverImageUrl ||
                (job as any).cover_image_url ||
                '';
              const src = v ? (normalizeMediaUrl(String(v)) || String(v)) : `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'Job')}&size=48&background=f3f4f6&color=374151&bold=true`;
              return (
                <ImageWithFallback
                  src={src}
                  fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'Job')}&size=48&background=f3f4f6&color=374151&bold=true`}
                  alt={job.company}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                />
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
              {job.title}
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {job.company}
            </p>
          </div>
        </div>

        {/* Job Details - Fixed Height */}
        <div className="space-y-2 mb-3 h-20">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{job.postedDate}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-orange-600 truncate">Expires on {getExpiryDate()}</span>
          </div>
        </div>

        {/* Skills/Tags row - show up to two; hide 'General' category */}
        {(Array.isArray(job.tags) && job.tags.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-3 h-6">
            {job.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Salary - Fixed Height */}
        <div className="mb-4 h-6">
          <div className="flex items-center text-green-600 font-semibold">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="truncate">{job.salary}</span>
          </div>
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons - Fixed Position at Bottom */}
        <div className="space-y-2 mt-auto">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1 text-xs h-8 border-gray-300 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                onViewJob(job.id);
              }}
            >
              <Eye className="w-3 h-3" />
              View
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className={`flex items-center justify-center gap-1 text-xs h-8 border-gray-300 hover:bg-gray-50 ${
                isBookmarked ? 'bg-orange-50 border-orange-300 text-orange-600' : ''
              }`}
              onClick={handleSaveJob}
            >
              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
              Save
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1 text-xs h-8 border-gray-300 hover:bg-gray-50"
              onClick={handleShareJob}
            >
              <Share2 className="w-3 h-3" />
              Share
            </Button>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 h-10 rounded-lg transition-all duration-200"
            onClick={() => onViewJob(job.id)}
          >
            Apply Now
          </Button>
        </div>
      </CardContent>
      
      {/* Share Job Modal */}
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
