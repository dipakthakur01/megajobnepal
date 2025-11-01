import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, Briefcase } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  color: string;
  industry: string;
  openJobs: number;
}

interface CompanySectionProps {
  companies: Company[];
  title: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
  buttonColor: string;
  onNavigate: (page: string, filter?: { type: string; value: string }) => void;
  navigationType: string;
}

export const CompanySection = React.memo(function CompanySection({
  companies,
  title,
  description,
  icon,
  badgeColor,
  buttonColor,
  onNavigate,
  navigationType
}: CompanySectionProps) {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-3 mb-4">
        {icon}
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-lg text-gray-600">{description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                  style={{ backgroundColor: company.color }}
                >
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.industry}</p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" style={{ color: company.color }} />
                  <span className="text-sm font-medium" style={{ color: company.color }}>
                    {company.openJobs} Jobs
                  </span>
                </div>
                <Badge className={badgeColor}>{title.includes('Featured') ? 'Featured' : 'Top Hiring'}</Badge>
              </div>
              
              <Button 
                className={`w-full ${buttonColor} text-white`}
                onClick={() => onNavigate('employers', { type: navigationType, value: 'true' })}
              >
                View Company
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => onNavigate('employers', { type: navigationType, value: 'true' })}
          className={`border-2 hover:text-white ${buttonColor.includes('yellow') ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-500' : 'border-green-500 text-green-600 hover:bg-green-500'}`}
        >
          View All {title}
        </Button>
      </div>
    </div>
  );
});
