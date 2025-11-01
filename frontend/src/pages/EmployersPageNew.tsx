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

  const companies = [
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Partner Companies</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Discover top employers in Nepal and explore career opportunities with 
              industry-leading companies across various sectors.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Companies Section - moved from HomePage */}
      <section ref={featuredCompaniesRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-8">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Companies</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompanies.map((company) => (
              <Card key={company.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{company.openJobs} open positions</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
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

      {/* Top Hiring Companies Section - moved from HomePage */}
      <section ref={topHiringCompaniesRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Hiring Companies</h2>
            <Badge variant="secondary" className="ml-2">
              Companies hiring 15+ positions
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topHiringCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {company.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">{company.rating}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{company.size}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                          Top Hiring
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {company.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
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
                          <span className="font-semibold text-green-600">
                            {company.openJobs} jobs
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {company.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>Founded {company.founded}</span>
                          <span>•</span>
                          <Globe className="w-4 h-4" />
                          <span>{company.website}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
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

      {/* Filtered Companies Section - only show when filtering */}
      {(activeFilter === 'featured' || activeFilter === 'top-hiring') && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                {activeFilter === 'featured' && <Star className="w-6 h-6 text-yellow-500" />}
                {activeFilter === 'top-hiring' && <TrendingUp className="w-6 h-6 text-green-500" />}
                <h2 className="text-2xl font-bold text-gray-900">{getSectionTitle()}</h2>
                {activeFilter === 'top-hiring' && (
                  <Badge variant="secondary" className="ml-2">
                    Companies hiring 15+ positions
                  </Badge>
                )}
              </div>
              <div className="flex space-x-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companiesToDisplay.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {company.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{company.rating}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{company.size}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {company.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {company.openJobs >= 15 && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                Top Hiring
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {company.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
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
                            <span className={`${company.openJobs >= 15 ? 'font-semibold text-green-600' : ''}`}>
                              {company.openJobs} jobs
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {company.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Founded {company.founded}</span>
                            <span>•</span>
                            <Globe className="w-4 h-4" />
                            <span>{company.website}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
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

            {companiesToDisplay.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No companies found</h3>
                <p className="text-gray-500">
                  {activeFilter === 'featured' 
                    ? 'No featured companies match your criteria.'
                    : activeFilter === 'top-hiring'
                    ? 'No top hiring companies match your criteria.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* General Companies Section - only show when not filtering */}
      {activeFilter === 'all' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">All Companies</h2>
              </div>
              <div className="flex space-x-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companiesToDisplay.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {company.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">{company.rating}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{company.size}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {company.featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {company.openJobs >= 15 && (
                              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                Top Hiring
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {company.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
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
                            <span className={`${company.openJobs >= 15 ? 'font-semibold text-green-600' : ''}`}>
                              {company.openJobs} jobs
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {company.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Founded {company.founded}</span>
                            <span>•</span>
                            <Globe className="w-4 h-4" />
                            <span>{company.website}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
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

            {companiesToDisplay.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No companies found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Partner With Us */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With MegaJobNepal?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of companies that trust us to find the right talent for their teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Targeted Reach</h3>
              <p className="text-gray-600">
                Access to Nepal's largest pool of qualified candidates across all industries and skill levels.
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">
                85% hiring success rate with our advanced matching algorithms and screening processes.
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                Comprehensive candidate verification and quality checks to ensure the best matches for your team.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
