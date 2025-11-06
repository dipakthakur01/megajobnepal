import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
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
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { apiClient } from '../lib/api-client';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { normalizeMediaUrl } from '@/utils/media';

interface CompanyDetailPageProps {
  companyName: string;
  jobs: any[];
  onViewJob: (jobId: string) => void;
  onSaveJob: (jobId: string) => void;
  savedJobs: string[];
  onNavigate: (page: string) => void;
}

interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  logo?: string;
  founded?: string;
  employees?: string;
  rating?: number;
  benefits?: string[];
  culture?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

export function CompanyDetailPage({ 
  jobs, 
  onViewJob, 
  onSaveJob, 
  savedJobs, 
  onNavigate 
}: CompanyDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('jobs');
  
  const { isAuthenticated, user } = useAuth();
  const { followedCompanies = [], handleFollowCompany } = useApp();
  const companyKey = (company?._id || id || company?.name || '').toString();
  const isFollowing = companyKey ? followedCompanies.includes(companyKey) : false;

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError('No company identifier provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const raw = decodeURIComponent(id);
        const looksLikeObjectId = /^[0-9a-fA-F]{24}$/.test(raw);
        const looksLikeUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(raw);

        let companyResponse: any = null;
        if (looksLikeObjectId || looksLikeUUID) {
          companyResponse = await apiClient.getCompanyById(raw);
        } else {
          // Treat as company name/slug; backend now supports hyphenated slugs
          companyResponse = await apiClient.getCompanyByName(raw);
        }

        const foundCompany = (companyResponse as any)?.company || companyResponse;
        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError('Company not found');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  // Filter jobs for this company
  const companyJobs = jobs.filter(job => {
    if (job.company?.name) {
      return job.company.name === company?.name;
    }
    // Fallback for legacy structure where company is a string
    return (job as any).company === company?.name;
  });

  // Handle Follow button click
  const handleFollowClick = () => {
    if (!companyKey) return;
    const result = handleFollowCompany(companyKey);
    if (result.requiresLogin) {
      toast.info('Please sign in to follow companies');
      onNavigate('auth');
      return;
    }
    if (result.added) {
      toast.success('Company followed successfully!');
    } else if (result.removed) {
      toast.success('Company unfollowed');
    }
  };

  // Handle Share button click
  const handleShareClick = async () => {
    if (navigator.share && company) {
      try {
        await navigator.share({
          title: `${company.name} - Company Profile`,
          text: `Check out ${company.name} on MegaJob Nepal`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyToClipboard();
      }
    } else {
      handleCopyToClipboard();
    }
  };

  // Fallback share function - copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Company link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // Handle Back to Companies button
  const handleBackToCompanies = () => {
    onNavigate('employers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load company data'}</p>
          <Button 
            onClick={handleBackToCompanies}
            className="inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToCompanies}
              className="mb-4 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFollowClick}
                className={`transition-all duration-200 ${
                  isFollowing 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[220px]">
                  <DropdownMenuLabel>Share Company</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleCopyToClipboard()}>
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    const text = `Check out ${company?.name} on MegaJob Nepal`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                  }}>
                    Share via WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  }}>
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    const text = `${company?.name} - Company Profile`;
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}>
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    const title = `${company?.name} - Company Profile`;
                    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                  }}>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    const subject = `${company?.name} - Company Profile`;
                    const body = `Check out ${company?.name} on MegaJob Nepal: ${url}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}>
                    Share via Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleShareClick()}>
                    Use Native Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <span className="font-medium">{company.rating || '4.0'}</span>
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
                  <span className="text-sm text-gray-600">{company.industry || 'Technology'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.size || company.employees || '50-100 employees'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.location || 'Kathmandu, Nepal'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{company.website || 'www.company.com'}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">{company.description}</p>
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
                      {/* Top cover image area for the job/company */}
                      <div className="mb-4">
                        <ImageWithFallback
                          src={normalizeMediaUrl(
                            job.coverImageUrl ||
                            job.cover_image_url ||
                            (job.heroImage ?? job.thumbnail) ||
                            (company?.coverImageUrl as any) ||
                            (company as any)?.cover_image_url ||
                            company?.logo ||
                            job.logo
                          )}
                          alt={`${job.title} cover`}
                          className="w-full h-32 sm:h-36 object-cover rounded-md border border-gray-200 bg-gray-50"
                          fallbackSrc="/CompanyCover.png"
                        />
                      </div>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span>Mission</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{company.mission || 'To deliver exceptional value to our clients and contribute to the growth of the technology sector.'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>Vision</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{company.vision || 'To be a leading company in our industry, known for innovation and excellence.'}</p>
                  </CardContent>
                </Card>

                {(company.benefits && company.benefits.length > 0) && (
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
                )}
              </div>
            </TabsContent>

            {/* Culture Tab */}
            <TabsContent value="culture" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Culture & Values</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.values && company.values.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {company.values.map((value: string, index: number) => (
                        <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="font-medium text-gray-900">{value}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">{company.culture || 'Information about company culture will be available soon.'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Offices Tab */}
            <TabsContent value="offices" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Main Office</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{company.location || 'Kathmandu, Nepal'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{company.employees || company.size || '50+ employees'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

