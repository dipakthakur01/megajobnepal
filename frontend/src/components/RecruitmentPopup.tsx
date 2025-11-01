import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Briefcase, Users, Eye, TrendingUp, Star, MapPin } from 'lucide-react';

interface RecruitmentContent {
  title?: string;
  subtitle?: string;
  description?: string;
  link_url?: string;
  image_url?: string;
}

interface RecruitmentPopupProps {
  onClose: () => void;
  onNavigate?: (page: string) => void;
  content?: RecruitmentContent;
}

// Enhanced but lightweight recruitment popup with engaging content
export const RecruitmentPopup = React.memo(function RecruitmentPopup({ onClose, onNavigate, content }: RecruitmentPopupProps) {
  const handleAdvertiseClick = () => {
    const link = content?.link_url || '/employer/dashboard';
    if (onNavigate) {
      onNavigate('employer/dashboard');
    } else {
      window.open(link, '_blank');
    }
    onClose();
  };

  const handleLearnMoreClick = () => {
    const link = content?.link_url || '/employers';
    if (onNavigate) {
      onNavigate('employers');
    } else {
      window.open(link, '_blank');
    }
    onClose();
  };

  const title = content?.title || 'Looking to Hire?';
  const headerTitle = content?.subtitle || '🚀 Hire Top Talent';
  const description = content?.description || '50K+ candidates. Post FREE & get applications in 24hrs!';

  return (
    <div className="fixed top-20 right-4 z-[60] w-64 animate-in slide-in-from-right-2 duration-500">
      <Card className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        <CardHeader className="pb-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5 font-semibold">
              <Briefcase className="w-3 h-3" />
              {title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="p-0.5 h-5 w-5 hover:bg-white/20 rounded-full text-white hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-2.5 rounded-md border border-blue-100">
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                {headerTitle}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-2 rounded-md border border-green-200">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-green-600" />
                  <div>
                    <div className="text-xs font-bold text-green-700">50K+</div>
                    <div className="text-xs text-green-600">Candidates</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-blue-700">100K+</div>
                    <div className="text-xs text-blue-600">Views</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key features */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Star className="w-3 h-3 text-orange-500" />
                <span className="font-medium">5-Tier Classification</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="font-medium">High Visibility</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span className="font-medium">Nepal-wide Coverage</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <Button onClick={handleAdvertiseClick} className="h-7 px-2 text-xs">Advertise Jobs</Button>
              <Button variant="outline" onClick={handleLearnMoreClick} className="h-7 px-2 text-xs">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
