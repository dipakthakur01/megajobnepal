import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { X, Briefcase, Users, Eye, TrendingUp, Star, MapPin } from 'lucide-react';

interface RecruitmentPopupProps {
  onClose: () => void;
}

// Enhanced but lightweight recruitment popup with engaging content
export const RecruitmentPopup = React.memo(function RecruitmentPopup({ onClose }: RecruitmentPopupProps) {
  const handleAdvertiseClick = () => {
    window.open('/employer/dashboard', '_blank');
     onClose();
  };

  const handleLearnMoreClick = () => {
    window.open('/employers', '_blank');
    onClose();
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-72 animate-in slide-in-from-top-2 duration-300">
      <Card className="bg-white shadow-lg rounded-xl border border-gray-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-lg shadow-sm">
              <Briefcase className="w-3 h-3" />
              Recruiting?
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="p-1 h-6 w-6 hover:bg-gray-100 rounded-full"
            >
              <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Hire Top Talent in Nepal
              </h4>
              <p className="text-xs text-gray-600">
                Access 50,000+ qualified candidates across all industries
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-green-600" />
                  <div>
                    <div className="text-xs font-semibold text-green-700">50K+</div>
                    <div className="text-xs text-green-600">Candidates</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-blue-600" />
                  <div>
                    <div className="text-xs font-semibold text-blue-700">100K+</div>
                    <div className="text-xs text-blue-600">Monthly Views</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Star className="w-3 h-3 text-orange-500" />
                <span>5-Tier Job Classification</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>Nepal-wide Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>85% Success Rate</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-1.5">
              <Button 
                onClick={handleAdvertiseClick}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-sm hover:shadow-lg"
                size="sm"
              >
                <Briefcase className="w-3 h-3 mr-1.5" />
                <span className="text-xs">Post Job Now - FREE</span>
              </Button>
              <div className="grid grid-cols-2 gap-1.5">
                <Button 
                  onClick={handleLearnMoreClick}
                  variant="outline" 
                  className="text-xs border-primary/20 text-primary hover:bg-primary/5"
                  size="sm"
                >
                  Learn More
                </Button>
                <Button 
                  onClick={onClose}
                  variant="ghost" 
                  className="text-xs text-gray-600 hover:bg-gray-100"
                  size="sm"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
