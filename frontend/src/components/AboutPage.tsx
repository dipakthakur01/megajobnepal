import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Target, Award, TrendingUp, Mail, Phone, MapPin, Linkedin, Facebook, MessageCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { normalizeMediaUrl } from '@/utils/media';

export function AboutPage() {
  const [stats, setStats] = useState([
    { icon: Users, label: 'Active Job Seekers', value: '50,000+' },
    { icon: Target, label: 'Job Placements', value: '12,000+' },
    { icon: Award, label: 'Partner Companies', value: '2,500+' },
    { icon: TrendingUp, label: 'Success Rate', value: '85%' }
  ]);

  const [aboutInfo, setAboutInfo] = useState<any>(null);
  const [managementTeam, setManagementTeam] = useState<any[]>([]);
  const [values, setValues] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [overviewMember, setOverviewMember] = useState<any | null>(null);

  // Detect mobile viewport for tap-to-reveal behavior
  useEffect(() => {
    try {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    } catch {}
  }, []);

  // Fetch about info and team members
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
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
      } catch (err) {
        // Non-fatal; keep existing defaults
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">About MegaJobNepal</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connecting job seekers with top employers across Nepal, enabling growth and opportunities through technology.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                      <div className="text-xl font-semibold">{stat.value}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {aboutInfo?.vision || 'We are committed to excellence, integrity, innovation, and community.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the experienced professionals leading MegaJobNepal's mission to transform Nepal's job market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {managementTeam.map((member) => {
              const id = member.id || `${(member.name || '').trim().toLowerCase()}|${(member.position || '').trim().toLowerCase()}`;
              const isFlipped = isMobile ? flippedId === id : false;
              const normalizeUrl = (u?: string) => {
                const s = (u || '').trim();
                if (!s) return '';
                return s.startsWith('http') ? s : `https://${s}`;
              };
              return (
                <div key={id} className="group relative">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 team-card-fixed-height">
                    <div className={`flip-card h-full ${isFlipped ? 'flip-active' : ''}`} onClick={() => { if (isMobile) setFlippedId(isFlipped ? null : id); }}>
                      <div className="flip-inner">
                        {/* Front */}
                        <div className="flip-face flip-front">
                          <div className="relative h-full">
                            <img
                              src={normalizeMediaUrl(member.image) || 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1349&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                              alt={member.name || 'Team Member'}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-4 text-center">
                              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.position}</p>
                              {member.bio && (
                                <div className="mt-2 text-sm text-gray-700 line-clamp-6 overflow-hidden" dangerouslySetInnerHTML={{ __html: String(member.bio) }} />
                              )}
                              {isMobile && (
                                <div className="mt-2">
                                  <span className="text-xs text-blue-600">Tap card to flip</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Back */}
                        <div className="flip-face flip-back">
                          <div className="h-full p-6 bg-blue-50">
                            <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-600">{member.position}</p>
                            <div className="mt-4 space-y-3">
                              {member.email && (
                                <div className="flex items-center space-x-3">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="text-sm break-all text-blue-700 hover:underline"
                                  >
                                    {member.email}
                                  </a>
                                </div>
                              )}
                              {member.phone && (
                                <div className="flex items-center space-x-3">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <a
                                    href={`tel:${String(member.phone).replace(/\s+/g, '')}`}
                                    className="text-sm text-blue-700 hover:underline"
                                  >
                                    {member.phone}
                                  </a>
                                </div>
                              )}
                              {member.whatsapp && (
                                <div className="flex items-center space-x-3">
                                  <MessageCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                                  <a
                                    href={`https://wa.me/${String(member.whatsapp).replace(/\D+/g,'')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm break-all text-green-700 hover:underline"
                                  >
                                    WhatsApp: {member.whatsapp}
                                  </a>
                                </div>
                              )}
                              {member.linkedin && (
                                <div className="flex items-center space-x-3">
                                  <Linkedin className="w-4 h-4 flex-shrink-0" />
                                  <a
                                    href={normalizeUrl(member.linkedin)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm break-all text-blue-700 hover:underline"
                                  >
                                    {member.linkedin}
                                  </a>
                                </div>
                              )}
                              {member.facebook && (
                                <div className="flex items-center space-x-3">
                                  <Facebook className="w-4 h-4 flex-shrink-0" />
                                  <a
                                    href={normalizeUrl(member.facebook)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm break-all text-blue-700 hover:underline"
                                  >
                                    {member.facebook}
                                  </a>
                                </div>
                              )}
                            </div>
                            {!isMobile && (
                              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setOverviewMember(member)}>More Info</Button>
                            )}
                            {isMobile && (
                              <div className="mt-4 text-xs text-blue-600">Tap again to flip back</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Founded in 2018 by a team of passionate entrepreneurs and tech professionals, MegaJobNepal 
            </p>
          </div>
        </div>
      </section>
      {overviewMember && (
        <Dialog open={!!overviewMember} onOpenChange={(open) => { if (!open) setOverviewMember(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{overviewMember.name || 'Team Member'}</DialogTitle>
              <DialogDescription>
                {overviewMember.position || ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={overviewMember.image || 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1349&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                alt={overviewMember.name || 'Team Member'}
                className="w-full h-48 object-cover rounded"
              />
              {overviewMember.bio && (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: String(overviewMember.bio) }} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {overviewMember.education && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Education</h4>
                    <p className="text-sm text-gray-700">{overviewMember.education}</p>
                  </div>
                )}
                {overviewMember.experience && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Experience</h4>
                    <p className="text-sm text-gray-700">{overviewMember.experience}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {overviewMember.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${overviewMember.email}`} className="text-sm break-all text-blue-600">{overviewMember.email}</a>
                  </div>
                )}
                {overviewMember.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${String(overviewMember.phone).replace(/\s+/g, '')}`} className="text-sm text-blue-600">{overviewMember.phone}</a>
                  </div>
                )}
                {overviewMember.whatsapp && (
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
                    <a href={`https://wa.me/${String(overviewMember.whatsapp).replace(/\D+/g,'')}`} target="_blank" rel="noreferrer" className="text-sm break-all text-green-700">WhatsApp: {overviewMember.whatsapp}</a>
                  </div>
                )}
                {overviewMember.linkedin && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 flex-shrink-0" />
                    <a href={overviewMember.linkedin} target="_blank" rel="noreferrer" className="text-sm break-all text-blue-600">{overviewMember.linkedin}</a>
                  </div>
                )}
                {overviewMember.facebook && (
                  <div className="flex items-center space-x-2">
                    <Facebook className="w-4 h-4 flex-shrink-0" />
                    <a href={overviewMember.facebook} target="_blank" rel="noreferrer" className="text-sm break-all text-blue-600">{overviewMember.facebook}</a>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

