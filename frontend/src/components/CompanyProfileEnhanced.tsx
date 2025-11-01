import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Globe, 
  Star,
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  Award,
  TrendingUp,
  Heart,
  Share2,
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useApp } from '../pages/providers/AppProvider';
import { apiClient } from '../lib/api-client';

interface Company {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  website?: string;
  size?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface CompanyProfileEnhancedProps {
  companyId?: string;
  companyName?: string;
  jobs: any[];
  onViewJob: (jobId: string) => void;
  onSaveJob: (jobId: string) => void;
  savedJobs: string[];
  onNavigate: (page: string) => void;
}

export function CompanyProfileEnhanced({ 
  companyId,
  companyName, 
  jobs, 
  onViewJob, 
  onSaveJob, 
  savedJobs, 
  onNavigate 
}: CompanyProfileEnhancedProps) {
  const { handleApplyJob } = useApp();
  const [activeTab, setActiveTab] = useState('jobs');
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (companyId) {
          // Fetch by ID
          const response = await apiClient.getCompanyById(companyId);
          setCompany(response.company);
        } else if (companyName) {
          // Fetch by name - get all companies and find by name
          const response = await apiClient.getCompanies({ limit: 100 });
          const foundCompany = response.companies?.find(
            (c: Company) => c.name.toLowerCase() === companyName.toLowerCase()
          );
          setCompany(foundCompany || null);
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company information');
      } finally {
        setLoading(false);
      }
    };

    if (companyId || companyName) {
      fetchCompanyData();
    } else {
      setLoading(false);
    }
  }, [companyId, companyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The company you are looking for could not be found.'}
          </p>
          <Button onClick={() => onNavigate('home')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Filter jobs for this company
  const companyJobs = jobs.filter(job => 
    job.company?.toLowerCase() === company.name.toLowerCase()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('home')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Follow Company
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Company Header */}
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{companyJobs.length} Open Positions</span>
                </div>
                {company.industry && (
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{company.industry}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {company.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.location}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{company.size}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Founded {formatDate(company.created_at)}
                  </span>
                </div>
              </div>

              {company.description && (
                <p className="text-gray-700 leading-relaxed mb-4">
                  {company.description}
                </p>
              )}

              <div className="flex items-center space-x-4">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Contact</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Open Positions ({companyJobs.length})</TabsTrigger>
            <TabsTrigger value="about">About Company</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            {companyJobs.length > 0 ? (
              <div className="grid gap-6">
                {companyJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills?.slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills?.length > 3 && (
                              <Badge variant="outline">
                                {job.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button
                            onClick={() => onViewJob(job.id)}
                            variant="outline"
                            size="sm"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleApplyJob(job.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Apply Now
                          </Button>
                          <Button
                            onClick={() => onSaveJob(job.id)}
                            variant="ghost"
                            size="sm"
                            className={savedJobs.includes(job.id) ? 'text-red-600' : 'text-gray-600'}
                          >
                            <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Open Positions
                  </h3>
                  <p className="text-gray-600">
                    This company doesn't have any open positions at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {company.description ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Company Overview</h4>
                    <p className="text-gray-700 leading-relaxed">{company.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      Company information will be available soon.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.industry && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                      <p className="text-gray-700">{company.industry}</p>
                    </div>
                  )}
                  {company.size && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Company Size</h4>
                      <p className="text-gray-700">{company.size}</p>
                    </div>
                  )}
                  {company.location && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                      <p className="text-gray-700">{company.location}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Founded</h4>
                    <p className="text-gray-700">{formatDate(company.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a 
                        href={`mailto:${company.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {company.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a 
                        href={`tel:${company.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <span>{company.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {company.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-700">{company.location}</p>
                    </div>
                  </div>
                )}

                {!company.email && !company.phone && !company.website && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      Contact information will be available soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}