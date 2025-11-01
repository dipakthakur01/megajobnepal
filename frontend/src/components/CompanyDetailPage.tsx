import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useApp } from '@/pages/providers/AppProvider';

interface CompanyDetailPageProps {
  companyName?: string;
  jobs?: any[];
  onViewJob?: (jobId: string) => void;
  onSaveJob?: (jobId: string) => void;
  savedJobs?: string[];
  onNavigate?: (page: string) => void;
}

export function CompanyDetailPage({ 
  companyName: propCompanyName, 
  jobs: propJobs = [], 
  onViewJob = () => {}, 
  onSaveJob = () => {}, 
  savedJobs = [], 
  onNavigate = () => {} 
}: CompanyDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('jobs');
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>(propJobs);
  const { companies: globalCompanies, jobs: globalJobs } = useApp();

  useEffect(() => {
    if ((!propJobs || propJobs.length === 0) && Array.isArray(globalJobs) && globalJobs.length > 0) {
      setJobs(globalJobs);
    }
  }, [globalJobs, propJobs]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        let company = null;
        const searchName = propCompanyName || (id ? decodeURIComponent(id) : '');
        const normalizedSearchName = (searchName || '').replace(/[-_]+/g, ' ').trim();

        // Prefer global state first if available
        if (Array.isArray(globalCompanies) && globalCompanies.length > 0) {
          company = globalCompanies.find((c: any) => {
            const nm = (c.name || c.companyName || '').toLowerCase();
            return nm === searchName.toLowerCase() || c.id === id || c._id === id;
          }) || null;
        }

        // If not found in global state, try API calls
        if (!company && searchName) {
          try {
            // First, try to determine if the parameter is an ID or name
            // If it looks like a MongoDB ObjectId (24 hex chars) or UUID, treat as ID
            const isId = /^[0-9a-fA-F]{24}$/.test(searchName) || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(searchName);
            
            if (isId) {
              // Try to fetch by ID
              const response = await apiClient.getCompanyById(searchName);
              company = response.company || response;
            } else {
              // Try to fetch by name using the new API
              const response = await apiClient.getCompanyByName(searchName);
              company = response.company || response;
            }
          } catch (err) {
            console.log('Failed to fetch company:', err);
            // If API fails, try searching through all companies as fallback
            try {
              const companiesResponse = await apiClient.getCompanies();
              const companies = companiesResponse.companies || companiesResponse || [];
              if (Array.isArray(companies)) {
                company = companies.find((c: any) => 
                  c.name?.toLowerCase() === searchName.toLowerCase() ||
                  c.companyName?.toLowerCase() === searchName.toLowerCase() ||
                  c.name?.toLowerCase() === normalizedSearchName.toLowerCase() ||
                  c.companyName?.toLowerCase() === normalizedSearchName.toLowerCase()
                );
              }
            } catch (fallbackErr) {
              console.error('Fallback company search failed:', fallbackErr);
            }

            // Final fallback: derive a virtual company from jobs list using normalized name
            if (!company && normalizedSearchName && Array.isArray(jobs) && jobs.length > 0) {
              const fromJobs = jobs.find((j: any) => {
                const nm = (typeof j.company === 'string' ? j.company : j.company?.name) || '';
                return nm.toLowerCase() === normalizedSearchName.toLowerCase();
              });
              if (fromJobs) {
                const logoCandidate = (fromJobs as any).logo || (fromJobs as any).companyLogo || '';
                company = {
                  _id: normalizedSearchName,
                  name: typeof fromJobs.company === 'string' ? fromJobs.company : (fromJobs.company?.name || normalizedSearchName),
                  description: '',
                  industry: (fromJobs as any).category || 'General',
                  size: (fromJobs as any).companySize || 'N/A',
                  location: (fromJobs as any).location || 'Nepal',
                  website: (fromJobs as any).website || '',
                  logo: logoCandidate || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedSearchName)}&background=random&color=fff&size=128&font-size=0.6&format=svg`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as any;
              }
            }
          }
        }
 
        if (company) {
          setCompanyData(company);
        } else {
          setError('Company not found');
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id, propCompanyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading company details...</span>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested company could not be found.'}</p>
          <Button onClick={() => onNavigate('employers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to get company field with fallback
  const getCompanyField = (field: string, fallback: any = '') => {
    return companyData[field] || companyData[field.toLowerCase()] || fallback;
  };

  // Prefer logo_url or logoUrl, fallback to logo, else ui-avatars
  const getCompanyLogo = (): string => {
    const explicitLogo = (companyData as any).logo_url || (companyData as any).logoUrl || (companyData as any).logo;
    if (explicitLogo) return explicitLogo;
    const nm = (companyData as any).name || (companyData as any).companyName || 'Company';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nm)}&background=random&color=fff&size=200&font-size=0.6&format=svg`;
  };

  // Normalize asset URLs to avoid hardcoded dev ports
  const normalizeAssetUrl = (url: string): string => {
    if (!url) return '';
    const u = String(url);
    // Rewrite localhost:3001 uploads to same-origin proxied path
    const rewritten = u
      .replace(/^https?:\/\/localhost:3001(\/uploads\/.*)$/i, '$1')
      .replace(/^https?:\/\/127\.0\.0\.1:3001(\/uploads\/.*)$/i, '$1');
    if (rewritten.startsWith('/uploads')) return rewritten;
    return u;
  };

  // Extract company information with fallbacks
  const company = {
    name: getCompanyField('name') || getCompanyField('companyName', 'Company Name'),
    logo: getCompanyLogo(),
    industry: getCompanyField('industry', 'Technology'),
    size: getCompanyField('size') || getCompanyField('companySize', '1-50 employees'),
    location: getCompanyField('location') || getCompanyField('address', 'Nepal'),
    founded: getCompanyField('founded') || getCompanyField('establishedYear', 'N/A'),
    website: getCompanyField('website') || getCompanyField('websiteUrl', ''),
    rating: getCompanyField('rating', 4.5),
    description: getCompanyField('description', ''),
    mission: getCompanyField('mission', 'To deliver exceptional services and solutions.'),
    vision: getCompanyField('vision', 'To be a leader in our industry.'),
    specialties: getCompanyField('specialties') || getCompanyField('services', ['Technology Solutions']),
    benefits: getCompanyField('benefits', [
      'Competitive Salary',
      'Health Insurance',
      'Professional Development',
      'Flexible Working Hours'
    ]),
    culture: getCompanyField('culture') || getCompanyField('values', [
      'Innovation',
      'Excellence',
      'Teamwork',
      'Integrity'
    ]),
    offices: getCompanyField('offices', [
      { location: 'Main Office', address: getCompanyField('location', 'Nepal'), employees: getCompanyField('size', 'N/A') }
    ])
  };
  // Handle both new and legacy job structure for company filtering
  const companyJobs = Array.isArray(jobs) ? jobs.filter(job => {
    if (!job || !company?.name) return false;
    
    if (job.company?.name) {
      return job.company.name === company.name;
    }
    // Fallback for legacy structure where company is a string
    return (job as any).company === company.name;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('employers')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Follow
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <img
              src={normalizeAssetUrl(company.logo)}
              alt={company.name}
              className="w-24 h-24 rounded-lg object-cover border border-gray-200 bg-gray-50 mr-6"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = '/CompanyLogo.png';
              }}
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{company.rating}</span>
                  <span className="text-gray-500">• Company Rating</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{companyJobs.length} Open Positions</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.industry}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.website}</span>
                </div>
              </div>
              {/* Description removed from header; shown in About tab */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="jobs">Jobs ({companyJobs.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="culture">Culture</TabsTrigger>
              <TabsTrigger value="offices">Offices</TabsTrigger>
            </TabsList>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {companyJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{job.location?.city || job.location || 'Remote'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{job.employment_type?.replace('_', ' ') || job.type || 'Full Time'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <Badge variant="secondary">{job.category?.name || job.category}</Badge>
                            <Badge variant="outline">{job.experience_level?.replace('_', ' ') || job.experience}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {job.salary_negotiable ? 'Negotiable' : 
                               job.salary_min && job.salary_max ? `NPR ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` :
                               job.salary || 'Competitive Salary'}
                            </span>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(job.published_at || job.created_at || job.postedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onSaveJob(job.id)}
                          className={`ml-4 p-2 rounded-full transition-colors ${
                            savedJobs.includes(job.id)
                              ? 'text-red-500 bg-red-50 hover:bg-red-100'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button 
                          onClick={() => onViewJob(job.id)}
                          className="flex-1"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {companyJobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Open Positions</h3>
                  <p className="text-gray-500">This company doesn't have any open positions at the moment.</p>
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Description */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {company.description ? (
                      <p className="text-gray-700 leading-relaxed">{company.description}</p>
                    ) : (
                      <p className="text-gray-500">Company description will be available soon.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Employee Benefits (kept as-is) */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Employee Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {company.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Culture Tab */}
            <TabsContent value="culture" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Culture & Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.culture.map((value: string, index: number) => (
                      <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">{value}</h4>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Offices Tab */}
            <TabsContent value="offices" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.offices.map((office: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{office.location}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{office.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{office.employees} employees</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
