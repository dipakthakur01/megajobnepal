import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
import { HeroCarousel } from '../components/HeroCarousel';
import { apiClient } from '../lib/api-client';
import { useApp } from './providers/AppProvider';

interface EmployersPageProps {
  onNavigate: (page: string, companyName?: string) => void;
  filter?: { type: string; value: string };
}

export function EmployersPage({ onNavigate, filter }: EmployersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [activeFilter, setActiveFilter] = useState(filter?.type || 'all');

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

  // Prepare to fetch employers from backend (UI remains unchanged)
  const [employers, setEmployers] = useState<any[]>([]);
  const [empError, setEmpError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.getEmployers();
        const items = Array.isArray((data as any)?.companies)
          ? (data as any).companies
          : Array.isArray(data)
            ? (data as any)
            : [];
        setEmployers(items);
      } catch (err: any) {
        console.warn('Failed to load employers:', err);
        setEmpError(err?.message || 'Failed to load employers');
      }
    })();
  }, []);

  useEffect(() => {
    if (employers.length) {
      console.log('Loaded employers:', employers.length);
    }
  }, [employers]);

  const { companies: globalCompanies, jobs: globalJobs } = useApp();

  let companies = Array.isArray(globalCompanies) && globalCompanies.length > 0
    ? globalCompanies.map((c: any, i: number) => ({
        id: c._id || c.id || String(i + 1),
        name: c.name || c.company_name || c.title || 'Company',
        logo: c.logo || c.logo_url || '',
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
    : (Array.isArray(employers) && employers.length > 0
      ? employers.map((c: any, i: number) => ({
          id: c._id || c.id || String(i + 1),
          name: c.name || c.company_name || 'Company',
          logo: c.logo || '',
          industry: c.industry || 'Information Technology',
          size: c.company_size || '1-50 employees',
          location: c.address || 'Nepal',
          description: c.description || '',
          openJobs: 0,
          rating: 0,
          website: c.website || '',
          founded: c.founded || '',
          specialties: [],
          benefits: [],
          featured: Boolean(c.featured)
        }))
      : []);

  const MOCK_companies = [
    {
      id: 1,
      name: 'Himalayan Bank Limited',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
      industry: 'Banking & Finance',
      size: '1000+ employees',
      location: 'Kathmandu, Nepal',
      description: 'One of Nepal\'s leading commercial banks providing comprehensive banking and financial services across the country.',
      openJobs: 15,
      rating: 4.5,
      website: 'www.himalayanbank.com',
      founded: '1993',
      specialties: ['Commercial Banking', 'Corporate Finance', 'Retail Banking', 'Investment Services'],
      benefits: ['Health Insurance', 'Retirement Plans', 'Professional Development', 'Performance Bonuses'],
      featured: true
    },
    {
      id: 2,
      name: 'Ncell Axiata Limited',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop',
      industry: 'Telecommunications',
      size: '1000+ employees',
      location: 'Lalitpur, Nepal',
      description: 'Nepal\'s leading telecommunications company providing mobile, internet, and digital services to millions of customers.',
      openJobs: 28,
      rating: 4.3,
      website: 'www.ncell.axiata.com',
      founded: '2004',
      specialties: ['Mobile Services', '4G/5G Networks', 'Digital Services', 'Enterprise Solutions'],
      benefits: ['Flexible Working', 'Medical Coverage', 'Career Growth', 'International Exposure'],
      featured: true
    },
    {
      id: 3,
      name: 'Nepal Investment Bank',
      logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop',
      industry: 'Banking & Finance',
      size: '500-1000 employees',
      location: 'Kathmandu, Nepal',
      description: 'A premier financial institution in Nepal offering innovative banking solutions and investment services.',
      openJobs: 8,
      rating: 4.4,
      website: 'www.nibl.com.np',
      founded: '1986',
      specialties: ['Investment Banking', 'Corporate Banking', 'SME Banking', 'Digital Banking'],
      benefits: ['Comprehensive Health Plans', 'Education Support', 'Performance Incentives', 'Work-Life Balance'],
      featured: false
    },
    {
      id: 4,
      name: 'Tata Motors Nepal',
      logo: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=200&h=200&fit=crop',
      industry: 'Automotive',
      size: '200-500 employees',
      location: 'Birgunj, Nepal',
      description: 'Leading automotive manufacturer and distributor in Nepal, part of the prestigious Tata Group.',
      openJobs: 12,
      rating: 4.2,
      website: 'www.tatamotors.com.np',
      founded: '1998',
      specialties: ['Vehicle Manufacturing', 'Sales & Distribution', 'After-sales Service', 'Parts & Accessories'],
      benefits: ['Medical Insurance', 'Transport Facility', 'Skill Development', 'Employee Recognition'],
      featured: false
    },
    {
      id: 5,
      name: 'F1Soft International',
      logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop',
      industry: 'Information Technology',
      size: '500-1000 employees',
      location: 'Kathmandu, Nepal',
      description: 'Nepal\'s leading fintech company providing digital payment solutions and financial technology services.',
      openJobs: 24,
      rating: 4.6,
      website: 'www.f1soft.com',
      founded: '2004',
      specialties: ['Fintech Solutions', 'Digital Payments', 'Mobile Banking', 'Software Development'],
      benefits: ['Flexible Hours', 'Remote Work Options', 'Learning Budget', 'Health & Wellness Programs'],
      featured: true
    },
    {
      id: 6,
      name: 'CG Corp Global',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop',
      industry: 'Conglomerate',
      size: '1000+ employees',
      location: 'Kathmandu, Nepal',
      description: 'One of Nepal\'s largest business conglomerates with interests in diverse sectors including FMCG, hospitality, and energy.',
      openJobs: 32,
      rating: 4.1,
      website: 'www.cgcorp.com.np',
      founded: '1984',
      specialties: ['FMCG Products', 'Hospitality', 'Energy', 'Infrastructure Development'],
      benefits: ['Comprehensive Benefits', 'Career Advancement', 'Training Programs', 'Employee Welfare'],
      featured: false
    },
    {
      id: 7,
      name: 'Nepal Telecom',
      logo: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200&h=200&fit=crop',
      industry: 'Telecommunications',
      size: '1000+ employees',
      location: 'Kathmandu, Nepal',
      description: 'Nepal\'s national telecommunications service provider offering comprehensive communication services across the country.',
      openJobs: 18,
      rating: 4.0,
      website: 'www.ntc.net.np',
      founded: '1975',
      specialties: ['Fixed Line Services', 'Mobile Communications', 'Internet Services', 'Network Infrastructure'],
      benefits: ['Government Benefits', 'Job Security', 'Pension Plans', 'Medical Facilities'],
      featured: false
    },
    {
      id: 8,
      name: 'Unilever Nepal',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
      industry: 'FMCG',
      size: '200-500 employees',
      location: 'Hetauda, Nepal',
      description: 'Leading consumer goods company in Nepal, part of the global Unilever family, manufacturing and marketing everyday products.',
      openJobs: 7,
      rating: 4.7,
      website: 'www.unilever.com.np',
      founded: '1994',
      specialties: ['Consumer Products', 'Personal Care', 'Home Care', 'Food & Beverages'],
      benefits: ['Global Career Opportunities', 'Competitive Packages', 'Learning & Development', 'Diversity & Inclusion'],
      featured: true
    },
    {
      id: 9,
      name: 'Worldlink Communications',
      logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop',
      industry: 'Internet Services',
      size: '500-1000 employees',
      location: 'Lalitpur, Nepal',
      description: 'Nepal\'s largest internet service provider offering high-speed internet, data center, and digital services.',
      openJobs: 16,
      rating: 4.3,
      website: 'www.worldlink.com.np',
      founded: '1995',
      specialties: ['Internet Services', 'Data Center', 'Enterprise Solutions', 'Digital TV'],
      benefits: ['Technology Exposure', 'Skill Enhancement', 'Health Benefits', 'Work Environment'],
      featured: false
    },
    {
      id: 10,
      name: 'Dabur Nepal',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&h=200&fit=crop',
      industry: 'Healthcare & FMCG',
      size: '100-200 employees',
      location: 'Kathmandu, Nepal',
      description: 'Leading healthcare and FMCG company in Nepal, part of India\'s Dabur Group, specializing in Ayurvedic and natural products.',
      openJobs: 5,
      rating: 4.4,
      website: 'www.dabur.com.np',
      founded: '1998',
      specialties: ['Ayurvedic Products', 'Personal Care', 'Health Supplements', 'Natural Products'],
      benefits: ['Health & Wellness Focus', 'Product Benefits', 'Training Programs', 'Performance Recognition'],
      featured: false
    },
    // Adding more companies for top hiring section
    {
      id: 11,
      name: 'Everest Bank Limited',
      logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&h=200&fit=crop',
      industry: 'Banking & Finance',
      size: '1000+ employees',
      location: 'Kathmandu, Nepal',
      description: 'A leading commercial bank in Nepal offering comprehensive banking and financial solutions.',
      openJobs: 22,
      rating: 4.3,
      website: 'www.everestbankltd.com',
      founded: '1994',
      specialties: ['Commercial Banking', 'Corporate Banking', 'Retail Banking', 'Digital Banking'],
      benefits: ['Health Insurance', 'Career Growth', 'Training Programs', 'Performance Bonuses'],
      featured: false
    },
    {
      id: 12,
      name: 'Sipradi Trading',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=200&fit=crop',
      industry: 'Automotive',
      size: '500-1000 employees',
      location: 'Kathmandu, Nepal',
      description: 'Leading automotive company in Nepal, authorized distributor of Hyundai vehicles and heavy equipment.',
      openJobs: 19,
      rating: 4.2,
      website: 'www.sipradi.com',
      founded: '1998',
      specialties: ['Vehicle Sales', 'After-sales Service', 'Spare Parts', 'Heavy Equipment'],
      benefits: ['Medical Coverage', 'Training Programs', 'Career Development', 'Performance Incentives'],
      featured: false
    },
    {
      id: 13,
      name: 'Laxmi Bank Limited',
      logo: 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=200&h=200&fit=crop',
      industry: 'Banking & Finance',
      size: '500-1000 employees',
      location: 'Kathmandu, Nepal',
      description: 'Progressive commercial bank focusing on digital banking solutions and customer-centric services.',
      openJobs: 20,
      rating: 4.4,
      website: 'www.laxmibank.com',
      founded: '2002',
      specialties: ['Digital Banking', 'SME Banking', 'Retail Banking', 'Corporate Services'],
      benefits: ['Health Benefits', 'Professional Development', 'Work-Life Balance', 'Innovation Culture'],
      featured: false
    },
    {
      id: 14,
      name: 'Vianet Communications',
      logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop',
      industry: 'Internet Services',
      size: '200-500 employees',
      location: 'Kathmandu, Nepal',
      description: 'Leading internet service provider offering fiber internet, data center, and enterprise solutions.',
      openJobs: 15,
      rating: 4.1,
      website: 'www.vianet.com.np',
      founded: '2001',
      specialties: ['Fiber Internet', 'Data Center', 'Cloud Solutions', 'Enterprise Networking'],
      benefits: ['Technology Exposure', 'Skill Development', 'Flexible Hours', 'Health Coverage'],
      featured: false
    }
  ];

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'Banking & Finance', label: 'Banking & Finance' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'FMCG', label: 'FMCG' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Healthcare & FMCG', label: 'Healthcare' },
    { value: 'Internet Services', label: 'Internet Services' },
    { value: 'Conglomerate', label: 'Conglomerate' }
  ];

  const companySizes = [
    { value: 'all', label: 'All Sizes' },
    { value: '1-50 employees', label: 'Startup (1-50)' },
    { value: '50-200 employees', label: 'Small (50-200)' },
    { value: '200-500 employees', label: 'Medium (200-500)' },
    { value: '500-1000 employees', label: 'Large (500-1000)' },
    { value: '1000+ employees', label: 'Enterprise (1000+)' }
  ];

  const featuredCompanies = companies.filter(company => company.featured);
  
  // Top hiring companies (companies with the most open jobs)
  const topHiringCompanies = companies
    .filter(company => company.openJobs >= 15)
    .sort((a, b) => b.openJobs - a.openJobs);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    const matchesSize = selectedSize === 'all' || company.size === selectedSize;
    
    // Apply additional filter based on activeFilter
    let matchesActiveFilter = true;
    if (activeFilter === 'featured') {
      matchesActiveFilter = company.featured;
    } else if (activeFilter === 'top-hiring') {
      matchesActiveFilter = company.openJobs >= 15;
    }
    
    return matchesSearch && matchesIndustry && matchesSize && matchesActiveFilter;
  });

  // Get companies to display based on active filter
  const getCompaniesToDisplay = () => {
    switch (activeFilter) {
      case 'featured':
        return filteredCompanies.filter(company => company.featured);
      case 'top-hiring':
        return filteredCompanies.filter(company => company.openJobs >= 15);
      default:
        return filteredCompanies;
    }
  };

  const companiesToDisplay = getCompaniesToDisplay();

  // Get section title based on active filter
  const getSectionTitle = () => {
    switch (activeFilter) {
      case 'featured':
        return 'Featured Companies';
      case 'top-hiring':
        return 'Top Hiring Companies';
      default:
        return 'All Companies';
    }
  };
  
  const stats = [
    { icon: Building2, label: 'Partner Companies', value: '2,500+' },
    { icon: Briefcase, label: 'Active Job Openings', value: '15,000+' },
    { icon: Users, label: 'Successful Hires', value: '50,000+' },
    { icon: Award, label: 'Top Employers', value: '500+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroCarousel />
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="responsive-container">
          <div className="text-center">
            <h1 className="hero-title mb-4">Partner Companies</h1>
            <p className="hero-subtitle max-w-2xl mx-auto mb-8">
              Discover top employers in Nepal and explore career opportunities with 
              industry-leading companies across various sectors.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mobile-input pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white">
        <div className="responsive-container">
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Companies Section - moved from HomePage */}
      <section ref={featuredCompaniesRef} className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            <h2 className="responsive-heading text-gray-900">Featured Companies</h2>
          </div>
          
          <div className="responsive-grid">
            {featuredCompanies.map((company) => (
              <Card key={company.id} className="mobile-card overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white text-xs">
                    Featured
                  </Badge>
                </div>
                <CardContent className="content-padding">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{company.openJobs} open positions</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="touch-button w-full mt-3 text-xs sm:text-sm"
                    onClick={() => onNavigate('company-detail', company.name)}
                  >
                    View Company
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Hiring Companies Section */}
      <section ref={topHiringCompaniesRef} className="section-padding bg-white">
        <div className="responsive-container">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="responsive-heading text-gray-900">Top Hiring Companies</h2>
          </div>
          
          <div className="responsive-grid">
            {topHiringCompanies.map((company) => (
              <Card key={company.id} className="mobile-card hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="content-padding">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                            <span className="text-xs sm:text-sm text-gray-600">{company.rating}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs sm:text-sm text-gray-600">{company.size}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                          Top Hiring
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-xs sm:text-sm mt-2 line-clamp-2">
                        {company.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{company.industry}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-semibold text-green-600">
                            {company.openJobs} jobs
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                        {company.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                          <span>Founded {company.founded}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{company.website}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="touch-button text-xs sm:text-sm"
                          onClick={() => onNavigate('company-detail', company.name)}
                        >
                          View Jobs
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Companies Section */}
      <section className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="responsive-heading text-gray-900">All Companies</h2>
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredCompanies.length} companies
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="mobile-input w-full sm:w-48 bg-white">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="mobile-input w-full sm:w-48 bg-white">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="mobile-card hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="content-padding">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0 mx-auto sm:mx-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors text-center sm:text-left">
                            {company.name}
                          </h3>
                          <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{company.rating}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{company.size}</span>
                          </div>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                          {company.featured && (
                            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                              Featured
                            </Badge>
                          )}
                          {company.openJobs >= 15 && !company.featured && (
                            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                              Top Hiring
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2 text-center sm:text-left">
                        {company.description}
                      </p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-4 h-4" />
                          <span>{company.industry}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span className={`font-semibold ${company.openJobs >= 15 ? 'text-green-600' : 'text-gray-600'}`}>
                            {company.openJobs} jobs
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mt-3">
                        {company.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                        <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-500">
                          <span>Founded {company.founded}</span>
                          <span>•</span>
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{company.website}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="touch-button w-full sm:w-auto"
                          onClick={() => onNavigate('company-detail', company.name)}
                        >
                          View Jobs
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria to find more companies.
              </p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
