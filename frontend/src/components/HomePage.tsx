import React, { useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, MapPin, Briefcase, Users, Star, ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { Job } from '../lib/mockData';
import { normalizeTier } from '../utils/tier';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { LoadingSpinner } from './LoadingSpinner';
import { JobCardImproved as JobCard } from './JobCardImproved';
import { NewsAnnouncementEnhanced as NewsAnnouncement } from './NewsAnnouncementEnhanced';
import { HeroCarousel } from './HeroCarousel';
import { useState } from 'react';

interface HomePageProps {
  jobs: Job[];
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

export const HomePage = React.memo(function HomePage({ jobs, onNavigate, onViewJob, onViewCompany, filters, onFilterChange, onSaveJob, savedJobs = [], isUserLoggedIn = false, onLoginRequired }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // No artificial loading delay needed



  // Helper function to deduplicate jobs by company and keep only one representative job per company
  const deduplicateJobsByCompany = (jobList: Job[]) => {
    const companyJobsMap = new Map<string, Job[]>();
    
    // Group jobs by company
    for (const job of jobList) {
      const companyName = job.company || 'Unknown Company';
      if (!companyJobsMap.has(companyName)) {
        companyJobsMap.set(companyName, []);
      }
      companyJobsMap.get(companyName)!.push(job);
    }

    // For each company, select the best representative job
    const deduplicatedJobs: Job[] = [];
    for (const [companyName, companyJobs] of Array.from(companyJobsMap)) {
      // Sort jobs within company by priority:
      // 1. Featured jobs first
      // 2. Most recent posted date
      // 3. Higher tier priority (megajob > premium > prime > latest > newspaper)
      const sortedJobs = companyJobs.sort((a, b) => {
        // Featured jobs get priority
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by posted date (most recent first)
        const dateComparison = (b.postedDate || b.publishedDate || '').localeCompare(a.postedDate || a.publishedDate || '');
        if (dateComparison !== 0) return dateComparison;
        
        // Finally by tier priority
        const tierPriority = { megajob: 5, premium: 4, prime: 3, latest: 2, latest_job: 2, newspaper: 1, newspaper_job: 1 };
        const aPriority = tierPriority[a.tier as keyof typeof tierPriority] || 0;
        const bPriority = tierPriority[b.tier as keyof typeof tierPriority] || 0;
        return bPriority - aPriority;
      });

      // Take the first (best) job and add company job count info
      const representativeJob = { 
        ...sortedJobs[0], 
        companyJobCount: companyJobs.length,
        allCompanyJobs: companyJobs
      };
      deduplicatedJobs.push(representativeJob);
    }

    return deduplicatedJobs;
  };

  // Memoize filtered job lists for performance - show one job per company per tier
  const jobsByTier = useMemo(() => {
    const megajobs: Job[] = [];
    const premium: Job[] = [];
    const prime: Job[] = [];
    const latest: Job[] = [];
    const newspaper: Job[] = [];

    // Check if jobs is defined and is an array before iterating
    if (!jobs || !Array.isArray(jobs)) {
      return { megajobs, premium, prime, latest, newspaper };
    }

    // Single pass through jobs for better performance - categorize all jobs first
    for (const job of jobs) {
      const tier = normalizeTier(job.tier);
      if (tier === 'megajob') {
        megajobs.push(job);
      } else if (tier === 'premium') {
        premium.push(job);
      } else if (tier === 'prime') {
        prime.push(job);
      } else if (tier === 'latest') {
        latest.push(job);
      } else if (tier === 'newspaper') {
        newspaper.push(job);
      }
      
      // Also categorize based on source for latest jobs
      if (job.source === 'online' && !['megajob', 'premium', 'prime'].includes((tier || '') as string)) {
        if (!latest.includes(job)) {
          latest.push(job);
        }
      } else if (job.source === 'newspaper') {
        if (!newspaper.includes(job)) {
          newspaper.push(job);
        }
      }
    }

    // Sort latest jobs by date (simple string comparison works with YYYY-MM-DD format)
    latest.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

    // Deduplicate each tier to show only one job per company
    return {
      megajob: deduplicateJobsByCompany(megajobs),
      premium: deduplicateJobsByCompany(premium),
      prime: deduplicateJobsByCompany(prime),
      latest: deduplicateJobsByCompany(latest),
      newspaper: deduplicateJobsByCompany(newspaper)
    };
  }, [jobs]);
  
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
    { 
      id: 1,
      name: 'Netflix', 
      color: '#E50914',
      logo: null,
      isActive: true
    },
    { 
      id: 2,
      name: 'Meta', 
      color: '#1877F2',
      logo: null,
      isActive: true
    },
    { 
      id: 3,
      name: 'Microsoft', 
      color: '#00A1F1',
      logo: null,
      isActive: true
    },
    { 
      id: 4,
      name: 'Pinterest', 
      color: '#E60023',
      logo: null,
      isActive: true
    },
    { 
      id: 5,
      name: 'Slack', 
      color: '#4A154B',
      logo: null,
      isActive: true
    },
    { 
      id: 6,
      name: 'Spotify', 
      color: '#1DB954',
      logo: null,
      isActive: true
    },
    { 
      id: 7,
      name: 'Google', 
      color: '#4285F4',
      logo: null,
      isActive: true
    },
    { 
      id: 8,
      name: 'Apple', 
      color: '#FF6600',
      logo: null,
      isActive: true
    },
    { 
      id: 9,
      name: 'Amazon', 
      color: '#FF9900',
      logo: null,
      isActive: true
    },
    { 
      id: 10,
      name: 'Tesla', 
      color: '#007ACC',
      logo: null,
      isActive: true
    },
    { 
      id: 11,
      name: 'Uber', 
      color: '#FF6600',
      logo: null,
      isActive: true
    },
    { 
      id: 12,
      name: 'Airbnb', 
      color: '#FF5A5F',
      logo: null,
      isActive: true
    },
    { 
      id: 13,
      name: 'Zoom', 
      color: '#007ACC',
      logo: null,
      isActive: true
    },
    { 
      id: 14,
      name: 'Adobe', 
      color: '#FF6600',
      logo: null,
      isActive: true
    },
    { 
      id: 15,
      name: 'Salesforce', 
      color: '#007ACC',
      logo: null,
      isActive: true
    },
    { 
      id: 16,
      name: 'Shopify', 
      color: '#96BF48',
      logo: null,
      isActive: true
    },
    { 
      id: 17,
      name: 'TikTok', 
      color: '#FF0050',
      logo: null,
      isActive: true
    },
    { 
      id: 18,
      name: 'Figma', 
      color: '#F24E1E',
      logo: null,
      isActive: true
    },
    { 
      id: 19,
      name: 'DigitalOcean', 
      color: '#0080FF',
      logo: null,
      isActive: true
    }
  ], []);

  // Filter only active companies
  const activeCompanies = trustedCompanies.filter(company => company.isActive);

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

  const handleSearch = () => {
    onFilterChange({ 
      ...filters, 
      search: searchQuery,
      location: locationQuery,
      category: categoryQuery
    });
    onNavigate('jobs');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Safety check to prevent infinite loops
  if (!jobs || !Array.isArray(jobs)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <HeroCarousel>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find a Job. <span className="text-blue-600">Today</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Search and Apply for the Best Jobs in Nepal Today
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search and Apply for the Best Jobs in Nepal Today"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Location" 
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-10 w-full sm:w-40" 
                  />
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    placeholder="Category" 
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="pl-10 w-full sm:w-40" 
                  />
                </div>
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onNavigate('auth')}
            >
              Post a Job
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate('auth')}
            >
              Register/Login
            </Button>
          </div>
        </div>
      </HeroCarousel>

      {/* Job Tiers Section with News Sidebar */}
      <section className="py-8 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-full mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Job Opportunities by Tier</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover premium job listings from top employers across Nepal</p>
          </div>

          {/* Main Content with Sidebar Layout */}
          <div className="flex gap-4 items-start">
            {/* Main Content Area */}
            <div className="flex-1 space-y-12">

          {/* MegaJob Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">MegaJob</h3>
                  <p className="text-gray-600 text-lg">Premium positions from top companies</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate('jobs')} className="px-6 py-2 text-sm font-medium">
                View All MegaJobs
              </Button>
            </div>
            
            {jobsByTier.megajob.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 job-grid max-w-7xl mx-auto">
                {jobsByTier.megajob.map((job, index) => (
                  <div key={job.id} className="job-card-container">
                    <JobCard 
                      job={job}
                      onViewJob={onViewJob}
                      onViewCompany={onViewCompany}
                      tierColor="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                      tierBgColor="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white"
                      onSaveJob={onSaveJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No MegaJobs Available</h4>
                <p className="text-gray-600">Premium job opportunities will appear here soon.</p>
              </div>
            )}
          </div>

          {/* Premium Job Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Premium Job</h3>
                  <p className="text-gray-600 text-lg">Quality opportunities with excellent benefits</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate('jobs')} className="px-6 py-2 text-sm font-medium">
                View All Premium Jobs
              </Button>
            </div>
            
            {jobsByTier.premium.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 job-grid max-w-7xl mx-auto">
                {jobsByTier.premium.map((job, index) => (
                  <div key={job.id} className="job-card-container">
                    <JobCard 
                      job={job}
                      onViewJob={onViewJob}
                      onViewCompany={onViewCompany}
                      tierColor="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      tierBgColor="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white"
                      onSaveJob={onSaveJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Briefcase className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Premium Jobs Available</h4>
                <p className="text-gray-600">Quality job opportunities will appear here soon.</p>
              </div>
            )}
          </div>

          {/* Prime Job Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Prime Job</h3>
                  <p className="text-gray-600 text-lg">Great opportunities to start your career</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate('jobs')} className="px-6 py-2 text-sm font-medium">
                View All Prime Jobs
              </Button>
            </div>
            
            {jobsByTier.prime.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 job-grid max-w-7xl mx-auto">
                {jobsByTier.prime.map((job, index) => (
                  <div key={job.id} className="job-card-container">
                    <JobCard 
                      job={job}
                      onViewJob={onViewJob}
                      onViewCompany={onViewCompany}
                      tierColor="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      tierBgColor="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white"
                      onSaveJob={onSaveJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
                <Search className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Prime Jobs Available</h4>
                <p className="text-gray-600">Career starter opportunities will appear here soon.</p>
              </div>
            )}
          </div>

          {/* Latest Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Latest Jobs</h3>
                  <p className="text-gray-600 text-lg">Freshly posted opportunities just for you</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate('jobs')} className="px-6 py-2 text-sm font-medium">
                View All Latest Jobs
              </Button>
            </div>
            
            {jobsByTier.latest.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 job-grid max-w-7xl mx-auto">
                {jobsByTier.latest.map((job, index) => (
                  <div key={job.id} className="job-card-container">
                    <JobCard 
                      job={job}
                      onViewJob={onViewJob}
                      onViewCompany={onViewCompany}
                      tierColor="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      tierBgColor="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white"
                      onSaveJob={onSaveJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-purple-50 rounded-xl border-2 border-purple-200">
                <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Latest Jobs Available</h4>
                <p className="text-gray-600">Fresh job opportunities will appear here soon.</p>
              </div>
            )}
          </div>

          {/* Newspaper Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Newspaper Jobs</h3>
                  <p className="text-gray-600 text-lg">Traditional job postings from trusted sources</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => onNavigate('jobs')} className="px-6 py-2 text-sm font-medium">
                View All Newspaper Jobs
              </Button>
            </div>
            
            {jobsByTier.newspaper.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 job-grid max-w-7xl mx-auto">
                {jobsByTier.newspaper.map((job, index) => (
                  <div key={job.id} className="job-card-container">
                    <JobCard 
                      job={job}
                      onViewJob={onViewJob}
                      onViewCompany={onViewCompany}
                      tierColor="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      tierBgColor="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white"
                      onSaveJob={onSaveJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-orange-50 rounded-xl border-2 border-orange-200">
                <Users className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">No Newspaper Jobs Available</h4>
                <p className="text-gray-600">Traditional job postings will appear here soon.</p>
              </div>
            )}
          </div>

          {/* View All Jobs CTA */}
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => onNavigate('jobs')} className="bg-gray-900 hover:bg-gray-800">
              View All Job Opportunities
            </Button>
          </div>
            </div>

            {/* News & Announcement Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 sticky top-6">
              <NewsAnnouncement />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies Section - Slowed down animation */}
      <section className="py-12 px-4 bg-white overflow-x-hidden">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-2">
              Trusted By <span className="text-primary">1000+</span> Companies
            </h2>
            <p className="text-gray-600">Leading organizations across industries choose MegaJobNepal</p>
          </div>
          
          {/* Scrolling Companies Container - Simple clean interface */}
          <div className="relative overflow-x-hidden">
            <div className="flex animate-scroll-right-to-left space-x-6 w-max">
              {/* Duplicate the companies for seamless scroll */}
              {[...activeCompanies, ...activeCompanies].map((company, index) => (
                <div 
                  key={`${company.id}-${index}`}
                  className="flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-sm px-6 py-4 min-w-[180px] whitespace-nowrap"
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
      </section>

      {/* Job Categories Section - Animated Scrolling Layout */}
      <section className="py-12 px-4 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs by Category</h2>
            <p className="text-lg text-gray-600">Find opportunities in your field of expertise</p>
          </div>
          
          {/* Animated Categories Grid */}
          <div className="space-y-8">
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


        </div>
      </section>

      {/* Testimonials Section - Simple layout */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Success stories from job seekers and employers</p>
          </div>
          
          <div className="relative">
            <Card className="shadow-lg mx-4 md:mx-12">
              <CardContent className="p-6 md:p-8">
                <div className="text-center">
                  <ImageWithFallback
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                  <blockquote className="text-lg text-gray-600 mb-4 italic px-4">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-sm text-gray-600">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation buttons - positioned outside card on larger screens, hidden on small screens */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden md:flex shadow-lg bg-white hover:bg-gray-50"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:flex shadow-lg bg-white hover:bg-gray-50"
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            {/* Mobile navigation - dots indicator */}
            <div className="flex justify-center mt-4 space-x-2 md:hidden">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  );
});
