import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Globe, 
  Search, 
  Building2,
  Star,
  TrendingUp,
  Award,
  Target,
  CheckCircle
} from 'lucide-react';

import { useApp } from '@/pages/providers/AppProvider';

// Generate a clean avatar URL when a company logo is missing
const getAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Company')}&background=EBF5FF&color=1D4ED8&size=128&bold=true`;


interface EmployersPageProps {
  onNavigate: (page: string, companyName?: string) => void;
  filter?: { type: string; value: string };
}

export function EmployersPage({ onNavigate, filter }: EmployersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [activeFilter, setActiveFilter] = useState(filter?.type || 'all');
  const { companies: globalCompanies, jobs: globalJobs } = useApp();

  // Refs for auto-scrolling to sections
  const featuredCompaniesRef = useRef<HTMLElement>(null);
  const topHiringCompaniesRef = useRef<HTMLElement>(null);

  // Update activeFilter when filter prop changes
  React.useEffect(() => {
    if (filter?.type) {
      setActiveFilter(filter.type);
    }
  }, [filter]);

  // Auto-scroll functions for featured and top hiring companies
  const scrollToFeaturedCompanies = () => {
    try {
      if (featuredCompaniesRef.current) {
        setTimeout(() => {
          featuredCompaniesRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    } catch (error) {
      console.log('Scroll error:', error);
    }
  };

  const scrollToTopHiringCompanies = () => {
    try {
      if (topHiringCompaniesRef.current) {
        setTimeout(() => {
          topHiringCompaniesRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    } catch (error) {
      console.log('Scroll error:', error);
    }
  };

  // Listen for scroll events triggered by header navigation
  useEffect(() => {
    const handleScrollToSection = (event: CustomEvent) => {
      try {
        const { section } = event.detail;
        if (section === 'featured-companies') {
          scrollToFeaturedCompanies();
        } else if (section === 'top-hiring-companies') {
          scrollToTopHiringCompanies();
        }
      } catch (error) {
        console.log('Scroll event error:', error);
      }
    };

    window.addEventListener('scrollToSection', handleScrollToSection as EventListener);
    
    return () => {
      window.removeEventListener('scrollToSection', handleScrollToSection as EventListener);
    };
  }, []);

  // Auto-scroll when activeFilter changes to specific sections
  useEffect(() => {
    if (activeFilter === 'featured') {
      setTimeout(() => scrollToFeaturedCompanies(), 300);
    } else if (activeFilter === 'top-hiring') {
      setTimeout(() => scrollToTopHiringCompanies(), 300);
    }
  }, [activeFilter]);

  // Build companies list from global context (no mock data)
  const companies = Array.isArray(globalCompanies) && globalCompanies.length > 0
    ? globalCompanies.map((c: any, i: number) => ({
        id: c._id || c.id || String(i + 1),
        name: c.name || c.company_name || c.title || 'Company',
        logo: c.logo || c.logo_url || getAvatarUrl(c.name || c.company_name || c.title || 'Company'),
        industry: c.industry || 'Information Technology',
        size: c.company_size || c.size || '1-50 employees',
        location: c.address || c.location || 'Nepal',
        description: c.description || '',
        openJobs: Array.isArray(globalJobs)
          ? globalJobs.filter((j: any) => (j?.company?.name || j?.company) === (c.name || c.company_name || c.title)).length
          : 0,
        rating: c.rating || 0,
        website: c.website || '',
        founded: c.founded || c.founded_year || '',
        specialties: c.specialties || [],
        benefits: c.benefits || [],
        featured: Boolean(c.featured)
      }))
    : [];

  // Filtering logic remains the same
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || company.industry.toLowerCase() === selectedIndustry.toLowerCase();
    const matchesSize = selectedSize === 'all' || company.size.toLowerCase().includes(selectedSize.toLowerCase());
    return matchesSearch && matchesIndustry && matchesSize;
  });

  const featuredCompanies = filteredCompanies.filter(company => company.featured || company.openJobs > 10);
  const topHiringCompanies = filteredCompanies
    .filter(company => company.openJobs > 0)
    .sort((a, b) => b.openJobs - a.openJobs)
    .slice(0, 8);

  const remainingCompanies = filteredCompanies.filter(
    (co) => !featuredCompanies.some((f) => f.id === co.id) && !topHiringCompanies.some((t) => t.id === co.id)
  );

  // Modern Company Card Component
  const CompanyCard = ({ company, showFeaturedBadge = false }: { company: any; showFeaturedBadge?: boolean }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 bg-white">
      <CardContent className="p-6 relative">
        {/* Featured Badge */}
        {showFeaturedBadge && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-3 py-1 text-xs">
              Featured
            </Badge>
          </div>
        )}
        
        {/* Company Info Section */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-50"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = getAvatarUrl(company.name);
              }}
            />
          </div>
          
          {/* Company Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
              {company.name}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{company.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{company.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{company.size}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <Briefcase className="w-4 h-4" />
            <span>{company.openJobs} open positions</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors"
          onClick={() => onNavigate('company-detail', company.name)}
        >
          View Company
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Explore Employers</h1>
          <p className="text-muted-foreground">Discover companies hiring across Nepal</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search companies by name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Banking & Finance">Banking & Finance</SelectItem>
              <SelectItem value="Telecommunications">Telecommunications</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="FMCG">FMCG</SelectItem>
              <SelectItem value="Automotive">Automotive</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              <SelectItem value="1-50 employees">1-50 employees</SelectItem>
              <SelectItem value="50-100 employees">50-100 employees</SelectItem>
              <SelectItem value="100-200 employees">100-200 employees</SelectItem>
              <SelectItem value="200-500 employees">200-500 employees</SelectItem>
              <SelectItem value="500-1000 employees">500-1000 employees</SelectItem>
              <SelectItem value="1000+ employees">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section ref={featuredCompaniesRef as any} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl md:text-2xl font-semibold">Featured Companies</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} showFeaturedBadge={true} />
          ))}
        </div>
      </section>

      <section ref={topHiringCompaniesRef as any} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-xl md:text-2xl font-semibold">Top Hiring Companies</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topHiringCompanies.map(company => (
            <CompanyCard key={company.id} company={company} showFeaturedBadge={false} />
          ))}
        </div>
      </section>

      {/* All Companies Section */}
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl md:text-2xl font-semibold">All Companies</h2>
        </div>
        {remainingCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No companies found matching your criteria.</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {remainingCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} showFeaturedBadge={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
