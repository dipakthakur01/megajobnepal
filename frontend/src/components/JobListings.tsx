import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, SlidersHorizontal, Map, List } from 'lucide-react';
import { JobCardUpdated as JobCard } from './JobCardUpdated';
import { JobMapView } from './JobMapView';
import { useData } from '../context/DataContext';
import { searchHistoryService } from '../services/searchHistoryService';
import { useApp } from '@/pages/providers/AppProvider';
import { normalizeTier } from '../utils/tier';
import type { JobCategory, Company } from '../lib/db-service';
import type { Job as DbJob } from '../lib/db-service';
// Removed dependency on mockData Job type; relying on DataContext jobs


// Mock data for when database is not available
const mockCategories: JobCategory[] = [
  { id: '1', name: 'Information Technology', description: 'IT and Technology Jobs', tier: 1, created_at: new Date(), updated_at: new Date() },
  { id: '2', name: 'Banking & Finance', description: 'Banking and Finance Jobs', tier: 1, created_at: new Date(), updated_at: new Date() },
  { id: '3', name: 'Healthcare', description: 'Healthcare and Medical Jobs', tier: 1, created_at: new Date(), updated_at: new Date() },
  { id: '4', name: 'Education', description: 'Education and Training Jobs', tier: 1, created_at: new Date(), updated_at: new Date() },
  { id: '5', name: 'Marketing & Sales', description: 'Marketing and Sales Jobs', tier: 1, created_at: new Date(), updated_at: new Date() }
];

const mockLocations: string[] = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Chitwan'];


interface JobListingsProps {
  onViewJob: (id: string) => void;
  onSaveJob: (id: string) => void;
  onApply?: (id: string) => void;
  savedJobs: string[];
  filter?: { type: string; value: string };
  isUserLoggedIn?: boolean;
  onLoginRequired?: () => void;
  onViewCompany?: (companyId: string) => void;
}

export function JobListings({ onViewJob, onSaveJob, onApply, savedJobs, filter, isUserLoggedIn = false, onLoginRequired, onViewCompany }: JobListingsProps) {
  const { jobs, loading, error } = useData();
  const { siteSettings } = useApp();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [filters, setFilters] = useState({
    category_id: '',
    location_id: '',
    tier: '',
    employment_type: '',
    experience_level: '',
    work_type: '', // remote, onsite, hybrid
    salary_range: '',
    is_internship: false,
    is_fresher_friendly: false,
    featured: false,
    search: ''
  });

  const jobsPerPage = 12; // Changed to 12 for better grid layout

  useEffect(() => {
    // Initialize categories and locations with mock data
    setCategories(mockCategories);
    setLocations(mockLocations);
  }, []);

  // Apply navigation filter when component receives filter prop
  useEffect(() => {
    if (filter) {
      if (filter.type === 'featured') {
        setFilters(prev => ({ ...prev, featured: true }));
      } else if (filter.type === 'remote') {
        setFilters(prev => ({ ...prev, work_type: 'remote' }));
      }
    }
  }, [filter]);

  // Compute filtered jobs from DataContext
  const filteredJobs = React.useMemo(() => {
    let result = [...jobs];
    
    // Apply client-side filters
    if (searchQuery) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(job.requirements) ? job.requirements.join(' ') : job.requirements || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters.employment_type) {
      result = result.filter(job => job.type === filters.employment_type);
    }

    if (filters.category_id) {
      result = result.filter(job => job.category === filters.category_id);
    }

    if (filters.location_id) {
      result = result.filter(job => job.location === filters.location_id);
    }

    if (filters.experience_level) {
      result = result.filter(job => job.experience === filters.experience_level);
    }

    if (filters.work_type) {
      result = result.filter(job => {
        if (filters.work_type === 'remote') {
          return job.tags?.includes('Remote') || 
                 job.title.toLowerCase().includes('remote') || 
                 job.description.toLowerCase().includes('remote');
        }
        if (filters.work_type === 'hybrid') {
          return job.title.toLowerCase().includes('hybrid') || 
                 job.description.toLowerCase().includes('hybrid');
        }
        if (filters.work_type === 'onsite') {
          return !job.tags?.includes('Remote') && 
                 !job.title.toLowerCase().includes('remote') && 
                 !job.title.toLowerCase().includes('hybrid') &&
                 !job.description.toLowerCase().includes('remote') && 
                 !job.description.toLowerCase().includes('hybrid');
        }
        return true;
      });
    }

    if (filters.is_internship) {
      result = result.filter(job => 
        job.title.toLowerCase().includes('intern') ||
        job.description.toLowerCase().includes('internship') ||
        job.tags?.some(tag => tag.toLowerCase().includes('intern'))
      );
    }

    if (filters.is_fresher_friendly) {
      result = result.filter(job => 
        job.experience === 'entry' ||
        job.title.toLowerCase().includes('junior') ||
        job.title.toLowerCase().includes('entry') ||
        job.description.toLowerCase().includes('fresher') ||
        job.description.toLowerCase().includes('no experience required')
      );
    }

    if (filters.featured) {
      result = result.filter(job => job.featured);
    }
    
    // Sort jobs
    result.sort((a, b) => {
      switch (sortBy) {
        case 'salary':
          return (b.salary || '').localeCompare(a.salary || '');
        case 'relevance':
          return (b.id ? b.id.length : 0) - (a.id ? a.id.length : 0);
        case 'recent':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });
    
    return result;
  }, [jobs, searchQuery, filters, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track search history for AI recommendations
    if (searchQuery.trim()) {
      searchHistoryService.addSearchHistory({
        query: searchQuery.trim(),
        filters: {
          category: filters.category_id,
          location: filters.location_id,
          employmentType: filters.employment_type,
          experienceLevel: filters.experience_level,
          workType: filters.work_type,
          isInternship: filters.is_internship,
          isFresherFriendly: filters.is_fresher_friendly
        }
      });
    }
    
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    let filterValue: any = value === 'all' ? '' : value;
    
    if (key === 'is_internship' || key === 'is_fresher_friendly' || key === 'featured') {
      filterValue = value === 'true';
    }
    
    setFilters(prev => ({ ...prev, [key]: filterValue }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      location_id: '',
      tier: '',
      employment_type: '',
      experience_level: '',
      work_type: '',
      salary_range: '',
      is_internship: false,
      is_fresher_friendly: false,
      featured: false,
      search: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const formatSalary = (min?: number, max?: number, negotiable?: boolean) => {
    if (negotiable) return 'Negotiable';
    if (min && max) return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `NPR ${min.toLocaleString()}+`;
    return 'Not specified';
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Convert job data to match JobCard interface
  const convertJobToJobCardFormat = (job: Job) => {
    // Map salary ranges to job tiers for better distribution
    const salaryString = job.salary || '';
    const salaryNumbers = salaryString.match(/\d+/g);
    const salaryMax = salaryNumbers ? Math.max(...salaryNumbers.map(Number)) : 0;
    let assignedTier = 'latest';
    
    if (salaryMax >= 150000) {
      assignedTier = 'megajob';
    } else if (salaryMax >= 100000) {
      assignedTier = 'premium';
    } else if (salaryMax >= 60000 || job.title.toLowerCase().includes('intern')) {
      assignedTier = 'prime';
    } else {
      assignedTier = 'latest';
    }

    // Override with featured jobs getting higher tiers
    if (job.title.toLowerCase().includes('featured') || job.title.toLowerCase().includes('senior') || job.title.toLowerCase().includes('lead')) {
      if (salaryMax >= 120000) {
        assignedTier = 'megajob';
      } else {
        assignedTier = 'premium';
      }
    }

    // Map company names from trusted brands
    const companyMap: { [key: string]: string } = {
      'google': 'Google',
      'microsoft': 'Microsoft', 
      'netflix': 'Netflix',
      'meta': 'Meta',
      'apple': 'Apple',
      'amazon': 'Amazon',
      'spotify': 'Spotify',
      'slack': 'Slack',
      'tesla': 'Tesla',
      'pinterest': 'Pinterest',
      'adobe': 'Adobe',
      'airbnb': 'Airbnb',
      'salesforce': 'Salesforce',
      'zoom': 'Zoom',
      'uber': 'Uber'
    };

    const cleanCompanyName = job.title.toLowerCase();
    let companyName = 'TechCorp Nepal';
    
    // Try to map to known companies based on job title keywords
    for (const [key, value] of Object.entries(companyMap)) {
      if (cleanCompanyName.includes(key) || job.description.toLowerCase().includes(key)) {
        companyName = value;
        break;
      }
    }

    return {
      id: job.id || '',
      title: job.title,
      company: job.company || companyName,
      location: job.location,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements : [job.requirements || ''],
      postedDate: job.postedDate,
      publishedDate: job.publishedDate,
      deadline: job.deadline,
      salary: job.salary,
      type: job.type,
      tier: job.tier,
      category: job.category,
      experience: job.experience,
      tags: job.tags || [],
      featured: job.featured || false,
      source: job.source || 'online' as const,
      // Preserve available image fields so JobCard can prioritize covers
      logo: (job as any).logo || 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=48&h=48&fit=crop&crop=center',
      companyLogo: (job as any).companyLogo || (job as any).company_logo || undefined,
      coverImageUrl: (job as any).coverImageUrl || (job as any).cover_image_url || null
    };
  };

  const getTierColor = (tier: string) => {
    const t = normalizeTier(tier) || 'latest';
    const cfg = siteSettings?.tierConfig?.[t];
    return cfg?.badgeClass || (
      t === 'megajob' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' :
      t === 'premium' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
      t === 'prime' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
      t === 'newspaper' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const jobTiers = [
    { value: 'mega_job', label: 'MegaJob' },
    { value: 'premium_job', label: 'Premium Job' },
    { value: 'prime_job', label: 'Prime Job' },
    { value: 'latest_job', label: 'Latest Job' },
    { value: 'newspaper_job', label: 'Newspaper Job' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {filter?.type === 'featured' ? 'Featured Jobs' : 
             filter?.type === 'remote' ? 'Remote Jobs' : 
             'Find Your Perfect Job'}
          </h1>
          <p className="text-lg text-gray-600">
            {filter?.type === 'featured' ? 'Discover the best featured job opportunities' : 
             filter?.type === 'remote' ? 'Work from anywhere with these remote opportunities' : 
             `Discover ${filteredJobs.length} opportunities waiting for you`}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by job title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Search Jobs
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Employment Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Employment Type</h4>
                  <Select value={filters.employment_type || 'all'} onValueChange={(value) => handleFilterChange('employment_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                  <Select value={filters.location_id || 'all'} onValueChange={(value) => handleFilterChange('location_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location, index) => (
                        <SelectItem key={index} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                  <Select value={filters.category_id || 'all'} onValueChange={(value) => handleFilterChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id || category.name} value={category.id || category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Experience Level</h4>
                  <Select value={filters.experience_level || 'all'} onValueChange={(value) => handleFilterChange('experience_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Type */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Work Type</h4>
                  <Select value={filters.work_type || 'all'} onValueChange={(value) => handleFilterChange('work_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Job Results */}
          <div className="flex-1">
            
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + jobsPerPage, jobs.length)} of {jobs.length} jobs
              </p>
              <div className="flex items-center space-x-4">
                <Button 
                  variant={viewMode === 'map' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                >
                  {viewMode === 'list' ? (
                    <>
                      <Map className="w-4 h-4 mr-2" />
                      Map View
                    </>
                  ) : (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      List View
                    </>
                  )}
                </Button>
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="salary">Highest Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Job Cards Grid or Map View */}
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 job-grid mb-3 max-w-none">
                {currentJobs.map((job, index) => {
                  const convertedJob = convertJobToJobCardFormat(job);
                  return (
                    <div key={job.id} className="job-card-container">
                      <JobCard 
                        job={convertedJob}
                        onViewJob={onViewJob}
                        onApply={onApply}
                        tierColor={getTierColor(convertedJob.tier)}
                        tierBgColor="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white"
                        onSaveJob={onSaveJob}
                        onLoginRequired={onLoginRequired}
                        isSaved={savedJobs.includes(job.id || '')}
                        isUserLoggedIn={isUserLoggedIn}
                        onViewCompany={onViewCompany}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-8">
                <JobMapView 
                  jobs={filteredJobs}
                  onViewJob={onViewJob}
                  onSaveJob={onSaveJob}
                  savedJobs={savedJobs}
                  isUserLoggedIn={isUserLoggedIn}
                  onLoginRequired={onLoginRequired}
                />
              </div>
            )}

            {/* Pagination - Only show in list view */}
            {viewMode === 'list' && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
