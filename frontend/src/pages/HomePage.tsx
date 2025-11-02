import React, { useMemo, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, MapPin, Briefcase, Users, Star, ChevronRight, ChevronLeft, Clock, TrendingUp, Building2, ArrowRight, Filter, Globe, Award, Target, Crown, Gem, X } from 'lucide-react';
import { Job } from '@/pages/providers/AppProvider';
import { normalizeTier } from '../utils/tier';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { JobCardUpdated as JobCard } from '../components/JobCardUpdated';
import { useData } from '../context/DataContext';
import { useApp } from "@/pages/providers/AppProvider";
import { Container, Section, Grid, Input } from '../components/ui/shared';
import { SearchIcon, BriefcaseIcon, TrendingUpIcon, UsersIcon, BuildingIcon } from '../components/ui/icons';
import { HeroCarousel } from '../components/HeroCarousel';
import { NewsAnnouncementEnhanced as NewsAnnouncement } from '../components/NewsAnnouncementEnhanced';

import { CompanySection } from '../components/CompanySection';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onViewJob: (jobId: string) => void;
  onViewCompany?: (companyName: string) => void;
  filters: {
    location: string;
    type: string;
    category: string;
    salary: string;
    experience: string;
  };
  onFilterChange: (filters: any) => void;
  onSaveJob?: (jobId: string) => void;
  savedJobs?: string[];
  isUserLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export const HomePage = React.memo(function HomePage({ 
  onNavigate, 
  onViewJob, 
  onViewCompany,
  filters, 
  onFilterChange, 
  onSaveJob, 
  savedJobs = [], 
  isUserLoggedIn = false, 
  onLoginRequired 
}: HomePageProps) {
  const { jobs, loading, error } = useData();
  const { handleApplyJob, siteSettings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);





  // Get tier colors
  const getTierColor = (tier: string) => {
    const t = normalizeTier(tier) || 'latest';
    const cfg = siteSettings?.tierConfig?.[t];
    return cfg?.textClass || (
      t === 'megajob' ? 'text-yellow-600' :
      t === 'premium' ? 'text-blue-600' :
      t === 'prime' ? 'text-green-600' :
      t === 'newspaper' ? 'text-orange-600' :
      'text-gray-600'
    );
  };

  const getTierBgColor = (tier: string) => {
    const t = normalizeTier(tier) || 'latest';
    const cfg = siteSettings?.tierConfig?.[t];
    return cfg?.bgClass || (
      t === 'megajob' ? 'bg-yellow-50' :
      t === 'premium' ? 'bg-blue-50' :
      t === 'prime' ? 'bg-green-50' :
      t === 'newspaper' ? 'bg-orange-50' :
      'bg-gray-50'
    );
  };

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = !location || 
        job.location.toLowerCase().includes(location.toLowerCase());
      
      const matchesCategory = !category || 
        job.category.toLowerCase().includes(category.toLowerCase());
      
      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [jobs, searchQuery, location, category]);

  // Categorize filtered jobs by tier
  const jobsByTier = useMemo(() => {
    const categorized = {
      megajob: [] as Job[],
      premium: [] as Job[],
      prime: [] as Job[],
      newspaper: [] as Job[],
      latest: [] as Job[]
    };

    filteredJobs.forEach(job => {
      const tier = normalizeTier(job.tier);
      if (tier === 'megajob') {
        categorized.megajob.push(job);
      } else if (tier === 'premium') {
        categorized.premium.push(job);
      } else if (tier === 'prime') {
        categorized.prime.push(job);
      } else if (tier === 'newspaper') {
        categorized.newspaper.push(job);
      } else {
        categorized.latest.push(job);
      }
    });

    return categorized;
  }, [filteredJobs]);

  // Memoize categories for better performance
  const categories = useMemo(() => [
    { name: 'Sales & Marketing', count: 25, icon: '📈' },
    { name: 'Accounting/Finance', count: 15, icon: '💼' },
    { name: 'Information Technology', count: 30, icon: '💻' },
    { name: 'Engineering', count: 20, icon: '⚙️' },
    { name: 'Healthcare', count: 18, icon: '⚕️' },
    { name: 'Education', count: 22, icon: '📚' }
  ], []);

  // Memoize trusted companies for the scrolling section
  const trustedCompanies = useMemo(() => [
    { id: 1, name: 'Tesla', color: '#007ACC', logo: null, isActive: true },
    { id: 2, name: 'Uber', color: '#FF6600', logo: null, isActive: true },
    { id: 3, name: 'Airbnb', color: '#FF5A5F', logo: null, isActive: true },
    { id: 4, name: 'Zoom', color: '#007ACC', logo: null, isActive: true },
    { id: 5, name: 'Adobe', color: '#FF0000', logo: null, isActive: true },
    { id: 6, name: 'Netflix', color: '#E50914', logo: null, isActive: true },
    { id: 7, name: 'Meta', color: '#1877F2', logo: null, isActive: true },
    { id: 8, name: 'Microsoft', color: '#00A1F1', logo: null, isActive: true },
    { id: 9, name: 'Pinterest', color: '#E60023', logo: null, isActive: true },
    { id: 10, name: 'Slack', color: '#4A154B', logo: null, isActive: true },
    { id: 11, name: 'Spotify', color: '#1DB954', logo: null, isActive: true },
    { id: 12, name: 'Google', color: '#4285F4', logo: null, isActive: true },
    { id: 13, name: 'Apple', color: '#FF6600', logo: null, isActive: true },
    { id: 14, name: 'Amazon', color: '#FF9900', logo: null, isActive: true }
  ], []);

  // Filter active companies for display
  const activeCompanies = useMemo(() => 
    trustedCompanies.filter(company => company.isActive), 
    [trustedCompanies]
  );

  // Memoize testimonials for better performance
  const testimonials = useMemo(() => [
    {
      name: 'Rajesh Sharma',
      role: 'Software Engineer',
      company: 'TechCorp Nepal',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      content: 'MegaJob helped me find my dream job in the tech industry. The platform is user-friendly and has great job opportunities.'
    },
    {
      name: 'Sunita Patel',
      role: 'Marketing Manager',
      company: 'Brand Solutions Pvt. Ltd.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b820?w=100&h=100&fit=crop&crop=face',
      content: 'As an employer, MegaJob has been instrumental in finding qualified candidates. Highly recommended!'
    },
    {
      name: 'Amit Gurung',
      role: 'Financial Analyst',
      company: 'Nepal Investment Bank',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: 'The job search process was smooth and efficient. I found multiple opportunities that matched my skills perfectly.'
    }
  ], []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };





  const handleSearch = () => {
    onFilterChange({ ...filters, search: searchQuery, location, category });
    onNavigate('jobs');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLocation('');
    setCategory('');
  };

  const hasActiveFilters = searchQuery || location || category;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel Section */}
      <HeroCarousel>
        <div className="responsive-container text-center">
          <h1 className="hero-title text-gray-900 mb-4 sm:mb-6">
            Find Your Dream Job In Nepal With <span className="text-blue-600">MegaJob</span>
          </h1>
          <p className="hero-subtitle max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Search and Apply for the Best Jobs in Nepal Today
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="mobile-search">
              <div className="flex-1 relative mb-3 sm:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Search jobs in Nepal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 mobile-input"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input 
                    placeholder="Location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9 sm:pl-10 w-full sm:w-40 mobile-input" 
                  />
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input 
                    placeholder="Category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="pl-9 sm:pl-10 w-full sm:w-40 mobile-input" 
                  />
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 btn-responsive touch-button">
                    <Search className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                  {hasActiveFilters && (
                    <Button onClick={clearSearch} variant="outline" className="border-gray-300 btn-responsive touch-button">
                      <X className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 btn-responsive touch-button"
              onClick={() => onNavigate('auth')}
            >
              <Briefcase className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Post a Job
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="btn-responsive touch-button"
              onClick={() => onNavigate('auth')}
            >
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Register/Login
            </Button>
          </div>
        </div>
      </HeroCarousel>
            

      




      {/* Job Tiers Section with News Sidebar */}
      <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="full-width-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading text-gray-900 mb-4 sm:mb-6">Job Opportunities by Tier</h2>
            <p className="responsive-subheading max-w-3xl mx-auto px-4">Discover premium job listings from top employers across Nepal</p>
            {(searchQuery || location || category) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 mx-4">
                <p className="text-blue-800 font-medium text-sm sm:text-base">
                  Showing {filteredJobs.length} jobs
                  {searchQuery && ` matching "${searchQuery}"`}
                  {location && ` in ${location}`}
                  {category && ` in ${category} category`}
                </p>
              </div>
            )}
          </div>

          {/* Main Content with Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start">
            {/* Main Content Area */}
            <div className="flex-1 w-full lg:w-5/6 space-y-6 sm:space-y-8">

              {/* MegaJob Section (always visible) */}
              <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-2 sm:px-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-3xl font-bold text-gray-900">MegaJob</h3>
                        <p className="text-gray-600 text-sm sm:text-lg">Premium positions from top companies</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate('jobs')} className="btn-responsive touch-button text-xs sm:text-sm">
                      View All MegaJobs
                    </Button>
                  </div>
                  
                  <div className="job-grid-full-width">
                    {jobsByTier.megajob.length === 0 ? (
                      <div className="w-full py-8 text-center text-gray-600 border rounded-lg bg-yellow-50/50">
                        No MegaJob listings available at the moment.
                      </div>
                    ) : (
                      jobsByTier.megajob.slice(0, 10).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onViewJob={onViewJob}
                          onViewCompany={onViewCompany}
                          tierColor="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                          tierBgColor="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white"
                          onSaveJob={onSaveJob}
                          onApply={handleApplyJob}
                          onLoginRequired={onLoginRequired}
                          isSaved={savedJobs.includes(job.id)}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))
                    )}
                  </div>
                </div>

              {/* Premium Jobs (always visible) */}
              <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-2 sm:px-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <Star className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-3xl font-bold text-gray-900">Premium Jobs</h3>
                        <p className="text-gray-600 text-sm sm:text-lg">Enhanced visibility and special highlighting</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate('jobs')} className="btn-responsive touch-button text-xs sm:text-sm">
                      View All Premium Jobs
                    </Button>
                  </div>
                  
                  <div className="job-grid-full-width">
                    {jobsByTier.premium.length === 0 ? (
                      <div className="w-full py-8 text-center text-gray-600 border rounded-lg bg-blue-50/50">
                        No Premium listings available at the moment.
                      </div>
                    ) : (
                      jobsByTier.premium.slice(0, 10).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onViewJob={onViewJob}
                          onViewCompany={onViewCompany}
                          tierColor="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                          tierBgColor="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white"
                          onSaveJob={onSaveJob}
                          onApply={handleApplyJob}
                          onLoginRequired={onLoginRequired}
                          isSaved={savedJobs.includes(job.id)}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))
                    )}
                  </div>
                </div>

              {/* Prime Jobs (always visible) */}
              <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-2 sm:px-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <Gem className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-3xl font-bold text-gray-900">Prime Jobs</h3>
                        <p className="text-gray-600 text-sm sm:text-lg">Featured placement with priority listing</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate('jobs')} className="btn-responsive touch-button text-xs sm:text-sm">
                      View All Prime Jobs
                    </Button>
                  </div>
                  
                  <div className="job-grid-full-width">
                    {jobsByTier.prime.length === 0 ? (
                      <div className="w-full py-8 text-center text-gray-600 border rounded-lg bg-green-50/50">
                        No Prime listings available at the moment.
                      </div>
                    ) : (
                      jobsByTier.prime.slice(0, 10).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onViewJob={onViewJob}
                          onViewCompany={onViewCompany}
                          tierColor="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          tierBgColor="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white"
                          onSaveJob={onSaveJob}
                          onApply={handleApplyJob}
                          onLoginRequired={onLoginRequired}
                          isSaved={savedJobs.includes(job.id)}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))
                    )}
                  </div>
                </div>

              {/* Newspaper Jobs (always visible) */}
              <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-2 sm:px-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-3xl font-bold text-gray-900">Newspaper Jobs</h3>
                        <p className="text-gray-600 text-sm sm:text-lg">Basic listing for newspaper jobs</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => onNavigate('jobs')} className="btn-responsive touch-button text-xs sm:text-sm">
                      View All Newspaper Jobs
                    </Button>
                  </div>
                  
                  <div className="job-grid-full-width">
                    {jobsByTier.newspaper.length === 0 ? (
                      <div className="w-full py-8 text-center text-gray-600 border rounded-lg bg-orange-50/50">
                        No Newspaper listings available at the moment.
                      </div>
                    ) : (
                      jobsByTier.newspaper.slice(0, 10).map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onViewJob={onViewJob}
                          onViewCompany={onViewCompany}
                          tierColor="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          tierBgColor="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white"
                          onSaveJob={onSaveJob}
                          onApply={handleApplyJob}
                          onLoginRequired={onLoginRequired}
                          isSaved={savedJobs.includes(job.id)}
                          isUserLoggedIn={isUserLoggedIn}
                        />
                      ))
                    )}
                  </div>
                </div>

              {/* View All Jobs CTA */}
              <div className="text-center mt-8 sm:mt-12">
                <Button size="lg" variant="default" onClick={() => onNavigate('jobs')} className="btn-responsive touch-button">
                  <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  View All Job Opportunities
                </Button>
              </div>
            </div>

            {/* News & Announcement Sidebar */}
            <div className="hidden lg:block w-1/6 flex-shrink-0 sticky top-6 ml-2">
              <NewsAnnouncement />
            </div>
            
            {/* Mobile News Section */}
            <div className="lg:hidden mt-8">
              <NewsAnnouncement />
            </div>
          </div>
        </div>
      </section>





      {/* Latest Jobs */}
      <Section background="white" padding="lg">
        <div className="full-width-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4 px-2 sm:px-4">
            <div>
              <h2 className="responsive-heading text-gray-900 mb-2 sm:mb-4">Latest Job Opportunities</h2>
              <p className="responsive-subheading">Fresh opportunities posted today</p>
            </div>
            <Button 
              onClick={() => onNavigate('jobs')}
              variant="outline"
              className="btn-responsive touch-button flex items-center gap-2"
            >
              View All Jobs <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="job-grid-full-width">
            {[...filteredJobs]
              .sort((a, b) => {
                const aDate = new Date(a.publishedDate || a.postedDate || 0).getTime();
                const bDate = new Date(b.publishedDate || b.postedDate || 0).getTime();
                return bDate - aDate;
              })
              .slice(0, 10)
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewJob={onViewJob}
                  onViewCompany={onViewCompany}
                  tierColor={getTierColor(job.tier)}
                  tierBgColor={getTierBgColor(job.tier)}
                  onSaveJob={onSaveJob}
                  onApply={handleApplyJob}
                  onLoginRequired={onLoginRequired}
                  isSaved={savedJobs.includes(job.id)}
                  isUserLoggedIn={isUserLoggedIn}
                />
              ))}
          </div>
        </div>
      </Section>

      {/* Trusted Companies Section - Scrolling Animation */}
      <Section background="white" padding="md">
        <div className="max-w-full mx-auto overflow-x-hidden">
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 mb-2">
              Trusted By <span className="text-orange-500">1000+</span> Companies
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Leading organizations across industries choose MegaJobNepal</p>
          </div>
          
          {/* Scrolling Companies Container */}
          <div className="relative overflow-x-hidden">
            <div className="flex animate-scroll-right-to-left space-x-6 w-max">
              {/* Duplicate the companies for seamless scroll */}
              {[...activeCompanies, ...activeCompanies].map((company, index) => (
                <div 
                  key={`${company.id}-${index}`}
                  className="flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-sm px-6 py-4 min-w-[180px] whitespace-nowrap hover:shadow-md transition-shadow"
                >
                  <span 
                    className="text-lg font-medium"
                    style={{ color: company.color }}
                  >
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Job Categories Section - Animated Scrolling Layout */}
      <Section background="gray" padding="lg">
        <Container>
          <div className="text-center mb-6 sm:mb-8 px-4">
            <h2 className="responsive-heading text-gray-900 mb-2 sm:mb-4">Browse Jobs by Category</h2>
            <p className="responsive-subheading">Find opportunities in your field of expertise</p>
          </div>
          
          {/* Animated Categories Grid */}
          <div className="space-y-8 overflow-x-hidden">
            {/* Top Row - Left to Right Animation */}
            <div className="relative overflow-x-hidden">
              <div className="flex animate-scroll-left-to-right space-x-6 w-max">
                {/* Duplicate categories for seamless scroll */}
                {[...categories.slice(0, 3), ...categories.slice(0, 3), ...categories.slice(0, 3)].map((category, index) => (
                  <Card key={`top-${index}`} className="hover:shadow-lg transition-shadow cursor-pointer min-w-[300px] flex-shrink-0">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.count} Jobs Available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bottom Row - Right to Left Animation */}
            <div className="relative overflow-x-hidden">
              <div className="flex animate-scroll-right-to-left space-x-6 w-max">
                {/* Duplicate categories for seamless scroll */}
                {[...categories.slice(3, 6), ...categories.slice(3, 6), ...categories.slice(3, 6)].map((category, index) => (
                  <Card key={`bottom-${index}`} className="hover:shadow-lg transition-shadow cursor-pointer min-w-[300px] flex-shrink-0">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.count} Jobs Available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section className="section-padding bg-gray-50">
        <Container>
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="responsive-heading text-gray-900 mb-2 sm:mb-4">What Our Users Say</h2>
            <p className="responsive-subheading">Hear from job seekers and employers who found success with MegaJob</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4">
            <Card className="shadow-lg testimonial-card">
              <CardContent className="content-padding">
                <div className="text-center">
                  <ImageWithFallback
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                  />
                  <blockquote className="text-sm sm:text-lg text-gray-600 mb-3 sm:mb-4 italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation buttons */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 touch-button"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 touch-button"
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </Container>
      </Section>
 

    </div>
  );
  });
