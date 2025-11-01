import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Filter, MapPin, Building2, Clock, DollarSign, Users, X } from 'lucide-react';
import { dbService } from '../lib/db-service';
import { searchHistoryService } from '../services/searchHistoryService';
import type { Job } from '../lib/mockData';
import type { JobCategory } from '../lib/db-service';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different job types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const jobTypeColors = {
  'full-time': '#3B82F6', // Blue
  'part-time': '#10B981', // Green
  'contract': '#F59E0B', // Yellow
  'internship': '#8B5CF6', // Purple
  'remote': '#EF4444', // Red
  'default': '#6B7280' // Gray
};

interface JobWithLocation extends Job {
  latitude?: number;
  longitude?: number;
  coordinates?: { lat: number; lng: number };
}

interface JobMapViewProps {
  onViewJob: (id: string) => void;
  onSaveJob: (id: string) => void;
  savedJobs: string[];
  isUserLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

// Component to handle map bounds when jobs change
function MapBoundsHandler({ jobs }: { jobs: JobWithLocation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (jobs.length > 0) {
      const validJobs = jobs.filter(job => 
        (job.latitude && job.longitude) || job.coordinates
      );
      
      if (validJobs.length > 0) {
        const bounds = L.latLngBounds(
          validJobs.map(job => [
            job.latitude || job.coordinates?.lat || 0,
            job.longitude || job.coordinates?.lng || 0
          ])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [jobs, map]);
  
  return null;
}

export function JobMapView({ onViewJob, onSaveJob, savedJobs, isUserLoggedIn = false, onLoginRequired }: JobMapViewProps) {
  const [jobs, setJobs] = useState<JobWithLocation[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobWithLocation | null>(null);
  
  const [filters, setFilters] = useState({
    category_id: '',
    location_id: '',
    employment_type: '',
    work_type: '',
    is_internship: false,
    is_fresher_friendly: false,
    search: ''
  });

  // Mock coordinates for Nepal cities (in a real app, this would come from a geocoding service)
  const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Kathmandu': { lat: 27.7172, lng: 85.3240 },
    'Pokhara': { lat: 28.2096, lng: 83.9856 },
    'Lalitpur': { lat: 27.6588, lng: 85.3247 },
    'Bhaktapur': { lat: 27.6710, lng: 85.4298 },
    'Biratnagar': { lat: 26.4525, lng: 87.2718 },
    'Birgunj': { lat: 27.0104, lng: 84.8767 },
    'Dharan': { lat: 26.8147, lng: 87.2789 },
    'Butwal': { lat: 27.7000, lng: 83.4500 },
    'Hetauda': { lat: 27.4287, lng: 85.0327 },
    'Nepalgunj': { lat: 28.0500, lng: 81.6167 },
    'Chitwan': { lat: 27.5291, lng: 84.3542 },
    'Dhangadhi': { lat: 28.6833, lng: 80.5833 },
    'Janakpur': { lat: 26.7288, lng: 85.9266 },
    'Itahari': { lat: 26.6650, lng: 87.2750 },
    'Gorkha': { lat: 28.0000, lng: 84.6333 }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [filters, searchQuery]);

  const loadData = async () => {
    try {
      const [jobsData, categoriesData] = await Promise.all([
        dbService.getJobs(),
        dbService.getJobCategories()
      ]);

      // Extract unique locations
      const uniqueLocations = [...new Set(jobsData.map(job => job.location).filter(Boolean))];
      setLocations(uniqueLocations);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsData = await dbService.getJobs();
      
      // Add coordinates to jobs based on location
      const jobsWithCoordinates = jobsData.map(job => {
        const coords = locationCoordinates[job.location];
        if (coords) {
          // Add some random offset to avoid overlapping markers
          const randomOffset = 0.01;
          return {
            ...job,
            latitude: coords.lat + (Math.random() - 0.5) * randomOffset,
            longitude: coords.lng + (Math.random() - 0.5) * randomOffset
          };
        }
        return job;
      });

      setJobs(jobsWithCoordinates);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

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
          workType: filters.work_type,
          isInternship: filters.is_internship,
          isFresherFriendly: filters.is_fresher_friendly
        }
      });
    }
    
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      location_id: '',
      employment_type: '',
      work_type: '',
      is_internship: false,
      is_fresher_friendly: false,
      search: ''
    });
    setSearchQuery('');
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => job.latitude && job.longitude);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category_id) {
      filtered = filtered.filter(job => job.category === filters.category_id);
    }

    if (filters.location_id) {
      filtered = filtered.filter(job => job.location === filters.location_id);
    }

    if (filters.employment_type) {
      filtered = filtered.filter(job => job.type === filters.employment_type);
    }

    if (filters.work_type) {
      if (filters.work_type === 'remote') {
        filtered = filtered.filter(job => 
          job.tags?.includes('Remote') || 
          job.title.toLowerCase().includes('remote')
        );
      } else if (filters.work_type === 'hybrid') {
        filtered = filtered.filter(job => 
          job.title.toLowerCase().includes('hybrid')
        );
      } else if (filters.work_type === 'onsite') {
        filtered = filtered.filter(job => 
          !job.tags?.includes('Remote') && 
          !job.title.toLowerCase().includes('remote') && 
          !job.title.toLowerCase().includes('hybrid')
        );
      }
    }

    if (filters.is_internship) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes('intern') ||
        job.tags?.some(tag => tag.toLowerCase().includes('intern'))
      );
    }

    if (filters.is_fresher_friendly) {
      filtered = filtered.filter(job => 
        job.experience === 'entry' ||
        job.title.toLowerCase().includes('junior') ||
        job.title.toLowerCase().includes('entry')
      );
    }

    return filtered;
  }, [jobs, filters]);

  const getJobTypeColor = (job: JobWithLocation) => {
    if (job.tags?.includes('Remote')) return jobTypeColors.remote;
    if (job.title.toLowerCase().includes('intern')) return jobTypeColors.internship;
    return jobTypeColors[job.type as keyof typeof jobTypeColors] || jobTypeColors.default;
  };

  const handleJobSave = (jobId: string) => {
    if (!isUserLoggedIn && onLoginRequired) {
      onLoginRequired();
      return;
    }
    onSaveJob(jobId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Map</h1>
        <p className="text-lg text-gray-600">
          Explore {filteredJobs.length} job opportunities on the map
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by job title, company, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={filters.category_id || 'all'} onValueChange={(value) => handleFilterChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id || category.name} value={category.id || category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Select value={filters.location_id || 'all'} onValueChange={(value) => handleFilterChange('location_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location, index) => (
                      <SelectItem key={index} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Employment Type</label>
                <Select value={filters.employment_type || 'all'} onValueChange={(value) => handleFilterChange('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Type</label>
                <Select value={filters.work_type || 'all'} onValueChange={(value) => handleFilterChange('work_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Work Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Types</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map and Job Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[27.7172, 85.3240]} // Kathmandu center
                  zoom={8}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapBoundsHandler jobs={filteredJobs} />
                  {filteredJobs.map((job) => (
                    <Marker
                      key={job.id}
                      position={[job.latitude!, job.longitude!]}
                      icon={createCustomIcon(getJobTypeColor(job))}
                      eventHandlers={{
                        click: () => setSelectedJob(job)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                          <p className="text-xs text-gray-600 mb-1">{job.company}</p>
                          <p className="text-xs text-gray-500 mb-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </p>
                          <div className="flex gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {job.type}
                            </Badge>
                            {job.tags?.includes('Remote') && (
                              <Badge variant="outline" className="text-xs">
                                Remote
                              </Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => onViewJob(job.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Details Panel */}
        <div className="lg:col-span-1">
          {selectedJob ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedJob(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedJob.company}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedJob.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedJob.salary}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedJob.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedJob.experience} level</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedJob.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => onViewJob(selectedJob.id)}
                  >
                    View Full Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleJobSave(selectedJob.id)}
                  >
                    {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Job on the Map
                </h3>
                <p className="text-gray-500">
                  Click on any marker to view job details here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: jobTypeColors['full-time'] }}></div>
                <span>Full Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: jobTypeColors['part-time'] }}></div>
                <span>Part Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: jobTypeColors.contract }}></div>
                <span>Contract</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: jobTypeColors.internship }}></div>
                <span>Internship</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: jobTypeColors.remote }}></div>
                <span>Remote</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}