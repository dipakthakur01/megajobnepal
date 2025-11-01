import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Filter, SlidersHorizontal, Map, Briefcase, Clock, MapPin, Building2, DollarSign, Users, Star, ChevronDown, X, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import { JobCardUpdated as JobCard } from '../components/JobCardUpdated';
import { LoadingSpinner } from './LoadingSpinner';
import { useData } from '../context/DataContext';
import { useApp } from "@/pages/providers/AppProvider";
import type { Job } from '../lib/mockData';

interface JobListingsProps {
  onViewJob: (id: string) => void;
  onSaveJob: (id: string) => void;
  savedJobs: string[];
  filter?: { type: string; value: string };
  isUserLoggedIn?: boolean;
  onLoginRequired?: () => void;
  onViewCompany?: (companyName: string) => void;
}

export function JobListings({ 
  onViewJob, 
  onSaveJob, 
  savedJobs, 
  filter, 
  isUserLoggedIn = false, 
  onLoginRequired,
  onViewCompany 
}: JobListingsProps) {
  const { jobs, loading, error } = useData();
  const { handleApplyJob } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    tier: '',
    type: '',
    experience: '',
    workType: '',
    salaryRange: '',
    featured: false
  });

  const jobsPerPage = 12;

  // Apply navigation filter when component receives filter prop
  useEffect(() => {
    if (filter) {
      if (filter.type === 'featured') {
        setFilters(prev => ({ ...prev, featured: true }));
      } else if (filter.type === 'remote') {
        setFilters(prev => ({ ...prev, workType: 'remote' }));
      } else if (filter.type === 'category') {
        setFilters(prev => ({ ...prev, category: filter.value }));
      } else if (filter.type === 'tier') {
        setFilters(prev => ({ ...prev, tier: filter.value }));
      }
    }
  }, [filter]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(jobs.map(job => job.category))].filter(Boolean);
    const locations = [...new Set(jobs.map(job => job.location))].filter(Boolean);
    const tiers = [...new Set(jobs.map(job => job.tier))].filter(Boolean);
    const types = [...new Set(jobs.map(job => job.type))].filter(Boolean);
    const experiences = [...new Set(jobs.map(job => job.experience))].filter(Boolean);

    return { categories, locations, tiers, types, experiences };
  }, [jobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category);
    }
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }
    if (filters.tier) {
      filtered = filtered.filter(job => job.tier === filters.tier);
    }
    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }
    if (filters.experience) {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }
    if (filters.featured) {
      filtered = filtered.filter(job => job.featured);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'company':
        filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case 'location':
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      default:
        break;
    }

    return filtered;
  }, [jobs, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      tier: '',
      type: '',
      experience: '',
      workType: '',
      salaryRange: '',
      featured: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'megajob': return 'text-yellow-600';
      case 'premium': return 'text-blue-600';
      case 'prime': return 'text-green-600';
      case 'newspaper': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getTierBgColor = (tier: string) => {
    switch (tier) {
      case 'megajob': return 'bg-yellow-50';
      case 'premium': return 'bg-blue-50';
      case 'prime': return 'bg-green-50';
      case 'newspaper': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    typeof value === 'boolean' ? value : value !== ''
  ).length;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="responsive-container section-padding">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="responsive-heading mb-3 sm:mb-4">
              Find Your Perfect Job
            </h1>
            <p className="responsive-subheading max-w-2xl mx-auto">
              Discover {jobs.length}+ opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-2">
              <div className="mobile-search">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mobile-input pl-10 sm:pl-12 h-10 sm:h-12 border-0 text-base sm:text-lg focus:ring-0 focus:border-0"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="btn-responsive touch-button h-10 sm:h-12 px-4 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="responsive-container content-padding">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-700 text-sm touch-button"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Category
                      </label>
                      <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {filterOptions.categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Location
                      </label>
                      <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value === 'all' ? '' : value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {filterOptions.locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Job Tier Filter */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Job Tier
                      </label>
                      <Select value={filters.tier} onValueChange={(value) => handleFilterChange('tier', value === 'all' ? '' : value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="All Tiers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tiers</SelectItem>
                          <SelectItem value="megajob">MegaJob</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="prime">Prime</SelectItem>
                          <SelectItem value="latest">Latest</SelectItem>
                          <SelectItem value="newspaper">Newspaper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience Level Filter */}
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                        Experience Level
                      </label>
                      <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value === 'all' ? '' : value)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                          <SelectItem value="Mid Level">Mid Level</SelectItem>
                          <SelectItem value="Senior Level">Senior Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Featured Jobs Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">
                        Featured Jobs Only
                      </label>
                      <Button
                        variant={filters.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('featured', !filters.featured)}
                        className={`touch-button ${filters.featured ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {filters.featured ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="mb-3 sm:mb-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {filteredJobs.length} Jobs Found
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Showing {((currentPage - 1) * jobsPerPage) + 1} - {Math.min(currentPage * jobsPerPage, filteredJobs.length)} of {filteredJobs.length} results
                </p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-button"
                  >
                    <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-button"
                  >
                    <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 sm:w-48 h-8 sm:h-10 text-sm">
                    <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="title">Job Title</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    Search: "{searchQuery}"
                    <X 
                      className="w-3 h-3 cursor-pointer touch-button" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    Category: {filters.category}
                    <X 
                      className="w-3 h-3 cursor-pointer touch-button" 
                      onClick={() => handleFilterChange('category', '')}
                    />
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    Location: {filters.location}
                    <X 
                      className="w-3 h-3 cursor-pointer touch-button" 
                      onClick={() => handleFilterChange('location', '')}
                    />
                  </Badge>
                )}
                {filters.tier && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    Tier: {filters.tier}
                    <X 
                      className="w-3 h-3 cursor-pointer touch-button" 
                      onClick={() => handleFilterChange('tier', '')}
                    />
                  </Badge>
                )}
                {filters.featured && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    Featured Jobs
                    <X 
                      className="w-3 h-3 cursor-pointer touch-button" 
                      onClick={() => handleFilterChange('featured', false)}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Job Results */}
            {currentJobs.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 job-grid" 
                  : "space-y-3 sm:space-y-4"
                }>
                  {currentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewJob={onViewJob}
                      tierColor={getTierColor(job.tier)}
                      tierBgColor={getTierBgColor(job.tier)}
                      onSaveJob={onSaveJob}
                      onApply={handleApplyJob}
                      onLoginRequired={onLoginRequired}
                      isSaved={savedJobs.includes(job.id)}
                      isUserLoggedIn={isUserLoggedIn}
                      onViewCompany={onViewCompany}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-responsive mt-8 sm:mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="touch-button text-sm sm:text-base"
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 sm:w-10 sm:h-10 p-0 touch-button text-sm sm:text-base"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="touch-button text-sm sm:text-base"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Jobs Found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button onClick={clearFilters} variant="outline" className="touch-button">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
