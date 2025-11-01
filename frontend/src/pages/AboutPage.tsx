import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Target, Award, TrendingUp, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { HeroCarousel } from '../components/HeroCarousel';
import { apiClient } from '@/lib/api-client';
import { normalizeMediaUrl } from '@/utils/media';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [stats, setStats] = useState([
    { icon: Users, label: 'Active Job Seekers', value: '50,000+' },
    { icon: Target, label: 'Job Placements', value: '12,000+' },
    { icon: Award, label: 'Partner Companies', value: '2,500+' },
    { icon: TrendingUp, label: 'Success Rate', value: '85%' }
  ]);

  const [aboutInfo, setAboutInfo] = useState<any>(null);
  const [managementTeam, setManagementTeam] = useState<any[]>([]);
  const [values, setValues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [infoRes, teamRes] = await Promise.all([
          apiClient.getAboutInfo(),
          apiClient.getTeamMembers()
        ]);
        if (!mounted) return;
        const about = (infoRes as any)?.about ?? infoRes;
        setAboutInfo(about);
        setValues(about?.values || []);
        
        const rawMembers = Array.isArray((teamRes as any)?.members)
          ? (teamRes as any).members
          : (teamRes as any) || [];
        // Deduplicate by stable identifiers: email, LinkedIn, or name|position (lowercased)
        const uniqueMembers: any[] = [];
        const seen = new Set<string>();
        for (const m of rawMembers) {
          const key = (
            (m?.email ? m.email.trim().toLowerCase() : '') ||
            (m?.linkedin ? m.linkedin.trim().toLowerCase() : '') ||
            `${(m?.name || '').trim().toLowerCase()}|${(m?.position || '').trim().toLowerCase()}`
          );
          if (!key) continue;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueMembers.push(m);
          }
        }
        setManagementTeam(uniqueMembers);
        if (about?.statistics) {
          setStats([
            { icon: Users, label: 'Active Job Seekers', value: about.statistics.totalJobs || '—' },
            { icon: Target, label: 'Happy Clients', value: about.statistics.happyClients || '—' },
            { icon: Award, label: 'Successful Placements', value: about.statistics.successfulPlacements || '—' },
            { icon: TrendingUp, label: 'Companies Served', value: about.statistics.companiesServed || '—' }
          ]);
        }
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load about information');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="responsive-container py-6"><div className="text-center text-gray-600">Loading about information...</div></div>
      )}
      {error && !isLoading && (
        <div className="responsive-container py-6"><div className="text-center text-red-600">{error}</div></div>
      )}
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Company Overview */}
      <section className="section-padding bg-white">
        <div className="responsive-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">About MegaJobNepal</h2>
            <p className="responsive-subheading max-w-3xl mx-auto px-4">
              {aboutInfo?.mission || 'Connecting talent with opportunity across Nepal.'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mobile-grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="mobile-card">
                <CardContent className="content-padding text-center">
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">Our Values</h2>
            <p className="responsive-subheading max-w-2xl mx-auto px-4">
              {aboutInfo?.vision || 'We are committed to excellence, integrity, innovation, and community.'}
            </p>
          </div>

          <div className="mobile-grid gap-3 sm:gap-4 lg:gap-6">
            {values.map((value: any, index: number) => (
              <Card key={index} className="mobile-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="content-padding text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="section-padding bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">Our Leadership Team</h2>
            <p className="responsive-subheading max-w-2xl mx-auto px-4">
              Meet the experienced professionals leading MegaJobNepal's mission to transform Nepal's job market.
            </p>
          </div>
          
          <div className="responsive-grid gap-4 sm:gap-6 lg:gap-8">
            {managementTeam.map((member: any) => (
              <div key={member.id} className="group relative">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative">
                    <img
                      src={normalizeMediaUrl(member.image) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop'}
                      alt={member.name}
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                      <h3 className="text-lg sm:text-xl font-bold">{member.name}</h3>
                      <p className="text-sm sm:text-base text-blue-200">{member.position}</p>
                      {member.bio && (
                         <div className="text-xs sm:text-sm mt-2 sm:mt-2 line-clamp-6 overflow-hidden" dangerouslySetInnerHTML={{ __html: String(member.bio) }} />
                       )}
                      <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm break-all">{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{member.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm break-all">{member.linkedin}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4 text-xs text-blue-200">
                        Hover to see contact details
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="responsive-heading mb-3 sm:mb-4">Our Story</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {aboutInfo?.story || 'Founded in 2020 by a team of passionate entrepreneurs and tech professionals, MegaJobNepal strives to connect skilled professionals with leading employers across Nepal.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

