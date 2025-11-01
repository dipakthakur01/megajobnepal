import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Info, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Upload,
  Save,
  Image as ImageIcon,
  Mail,
  Phone,
  Linkedin,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { dbService } from '@/lib/db-service';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/auth/AuthContext';

// Ensure we always have required fields even if backend stored partial data
const DEFAULT_ABOUT_INFO = {
  mission: 'To connect talented professionals with leading employers across Nepal, fostering career growth and business success.',
  vision: "To be Nepal's premier job portal, empowering careers and transforming the employment landscape.",
  story: 'Founded in 2020, MegaJobNepal emerged from a vision to revolutionize the job market in Nepal. Our founders recognized the gap between talented job seekers and quality employers, and set out to bridge this divide through innovative technology and dedicated service.',
  values: [
    { title: 'Innovation', description: 'We continuously evolve our platform to meet changing market needs.' },
    { title: 'Integrity', description: 'We maintain transparency and honesty in all our interactions.' },
    { title: 'Excellence', description: 'We strive for the highest quality in everything we do.' },
    { title: 'Community', description: 'We are committed to building a strong professional community in Nepal.' }
  ],
  statistics: {
    totalJobs: '10,000+',
    happyClients: '5,000+',
    successfulPlacements: '15,000+',
    companiesServed: '2,500+'
  }
};

export function AboutManagement() {
  const [aboutInfo, setAboutInfo] = useState(DEFAULT_ABOUT_INFO);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    position: '',
    bio: '',
    education: '',
    experience: '',
    linkedin: '',
    email: '',
    phone: '',
    image: ''
  });
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // One-time purge to prevent localStorage-based restoration of deleted members
  useEffect(() => {
    try {
      localStorage.removeItem('mysql_megajob_db_team_members');
    } catch {}
  }, []);
  // Deduplicate team members by stable identifiers (email, LinkedIn, name+position)
  const dedupeMembers = (members: any[]) => {
    const seen = new Set<string>();
    return (Array.isArray(members) ? members : []).filter((m: any) => {
      const key = (
        (m?.email ? m.email.trim().toLowerCase() : '') ||
        (m?.linkedin ? m.linkedin.trim().toLowerCase() : '') ||
        `${(m?.name || '').trim().toLowerCase()}|${(m?.position || '').trim().toLowerCase()}`
      );
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const normalizeUrl = (url?: string) => {
    const u = (url || '').trim();
    if (!u) return '';
    return u.startsWith('http') ? u : `https://${u}`;
  };
  const ensureUniqueIds = (members: any[]) => {
    const keyOf = (m: any) => (
      m?.email?.trim().toLowerCase() ||
      m?.linkedin?.trim().toLowerCase() ||
      `${(m?.name || '').trim().toLowerCase()}|${(m?.position || '').trim().toLowerCase()}`
    );
    return (Array.isArray(members) ? members : []).map((m: any) => ({
      ...m,
      id: m?.id || keyOf(m)
    }));
  };
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [infoRes, teamRes] = await Promise.all([
          apiClient.getAboutInfo().catch(() => null),
          apiClient.getTeamMembers().catch(() => null)
        ]);
        const infoRaw = infoRes && (infoRes as any)?.about ? (infoRes as any).about : infoRes;
        const normalizedAbout = {
          ...DEFAULT_ABOUT_INFO,
          ...(infoRaw || {}),
          values: Array.isArray((infoRaw as any)?.values) ? (infoRaw as any).values : DEFAULT_ABOUT_INFO.values,
          statistics: { ...DEFAULT_ABOUT_INFO.statistics, ...(((infoRaw as any)?.statistics) || {}) }
        };

        const rawMembers = Array.isArray((teamRes as any)?.members)
          ? (teamRes as any).members
          : (Array.isArray(teamRes) ? (teamRes as any) : []);
        const nextMembers = ensureUniqueIds(dedupeMembers(rawMembers));

        if (!mounted) return;
        setAboutInfo(normalizedAbout);
        setTeamMembers(nextMembers);
      } catch {
        try {
          const infoRaw = await dbService.getAboutInfo?.();
          const info = infoRaw && typeof infoRaw === 'object' ? infoRaw : {};
          const normalizedAbout = {
            ...DEFAULT_ABOUT_INFO,
            ...info,
            values: Array.isArray((info as any).values) ? (info as any).values : DEFAULT_ABOUT_INFO.values,
            statistics: { ...DEFAULT_ABOUT_INFO.statistics, ...((info as any).statistics || {}) }
          };

          const membersRaw = await (dbService.getTeamMembers?.());
          const nextMembers = ensureUniqueIds(dedupeMembers(Array.isArray(membersRaw) ? membersRaw : []));

          if (!mounted) return;
          setAboutInfo(normalizedAbout);
          setTeamMembers(nextMembers);
        } catch {
          // Keep defaults on error
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const persistAbout = async (nextInfo: any) => {
    const normalized = {
      ...DEFAULT_ABOUT_INFO,
      ...nextInfo,
      values: Array.isArray(nextInfo?.values) ? nextInfo.values : DEFAULT_ABOUT_INFO.values,
      statistics: { ...DEFAULT_ABOUT_INFO.statistics, ...(nextInfo?.statistics || {}) }
    };
    setAboutInfo(normalized);
    try {
      await apiClient.updateAboutInfo(normalized);
    } catch (err) {
      try { dbService.saveAboutInfo?.(normalized); } catch { /* noop */ }
      toast.warning('Backend unavailable. Saved About info locally.');
    }
  };

  const persistMembers = async (nextMembers: any[], opts: { successMessage?: string } = {}) => {
    const normalized = ensureUniqueIds(dedupeMembers(nextMembers));
    try {
      const res = await apiClient.saveTeamMembers(normalized);
      const saved = Array.isArray((res as any)?.members) ? (res as any).members : normalized;
      setTeamMembers(saved);
      // Keep any local fallback storage in sync/cleared to avoid ghost rehydration
      try {
        localStorage.setItem('mysql_megajob_db_team_members', JSON.stringify(saved));
      } catch { /* noop */ }
      // Refresh from backend to ensure UI reflects true DB state
      try {
        const teamRes = await apiClient.getTeamMembers();
        const raw = Array.isArray((teamRes as any)?.members)
          ? (teamRes as any).members
          : (Array.isArray(teamRes) ? (teamRes as any) : []);
        setTeamMembers(ensureUniqueIds(dedupeMembers(raw)));
      } catch { /* noop */ }
      toast.success(opts.successMessage || 'Team members saved');
    } catch (error: any) {
      console.error('Failed to save team members:', error);
      const status = (error?.status ?? error?.code);
      if (status === 401 || status === 403) {
        toast.error('Not authorized. Super admin role required to save.');
      } else {
        toast.error('Could not reach backend. Changes not saved.');
      }
      // Refresh current state from backend so UI matches actual DB
      try {
        const teamRes = await apiClient.getTeamMembers();
        const raw = Array.isArray((teamRes as any)?.members)
          ? (teamRes as any).members
          : (Array.isArray(teamRes) ? teamRes as any : []);
        setTeamMembers(ensureUniqueIds(dedupeMembers(raw)));
      } catch { /* noop */ }
    }
  };

  const clearAllMembers = async () => {
    await persistMembers([]);
    // Also clear local fallback store to prevent automatic repopulation
    try { localStorage.removeItem('mysql_megajob_db_team_members'); } catch { /* noop */ }
    // Success toast handled inside persistMembers
  };

  const keepOnlyOneMember = async () => {
    if (!teamMembers.length) {
      toast.info('No team members to keep.');
      return;
    }
    await persistMembers([teamMembers[0]]);
    toast.success('Kept one team member and removed the rest.');
  };

  const removeDuplicateMembers = async () => {
    if (!teamMembers.length) {
      toast.info('No team members to deduplicate.');
      return;
    }
    const before = teamMembers.length;
    const deduped = dedupeMembers(teamMembers);
    await persistMembers(deduped);
    const removed = before - deduped.length;
    toast.success(removed > 0 ? `Removed ${removed} duplicate(s).` : 'No duplicates found.');
  };

  const handleSaveAbout = async () => {
    await persistAbout(aboutInfo);
    await persistMembers(teamMembers);
    toast.success('About information updated successfully!');
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.position || !newMember.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
      image: newMember.image || ''
    };

    await persistMembers([...teamMembers, member]);
    setNewMember({
      name: '',
      position: '',
      bio: '',
      education: '',
      experience: '',
      linkedin: '',
      email: '',
      phone: '',
      image: '',
      facebook: '',
      whatsapp: ''
    });
    setIsAddMemberOpen(false);
    // Success toast handled inside persistMembers
  };

  const handleMemberImageUpload = async (file: File, target: 'new' | 'edit') => {
    if (!file) return;
    try {
      if (target === 'new') setUploadingNewImage(true); else setUploadingEditImage(true);
      const res = await apiClient.uploadTeamMemberImage(file);
      const url = res?.url || res?.secure_url || res?.path;
      if (url) {
        if (target === 'new') {
          setNewMember(prev => ({ ...prev, image: url }));
        } else if (editingMember) {
          setEditingMember({ ...editingMember, image: url });
        }
        toast.success('Image uploaded and URL set');
      } else {
        toast.warning('Upload succeeded, but no URL returned');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      if (target === 'new') setUploadingNewImage(false); else setUploadingEditImage(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    await persistMembers(teamMembers.filter(member => member.id !== id), { successMessage: 'Team member removed' });
    // Success toast handled inside persistMembers
  };

  const addValue = () => {
    persistAbout({
      ...aboutInfo,
      values: [...(aboutInfo.values || DEFAULT_ABOUT_INFO.values), { title: '', description: '' }]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">About Section Management</h2>
          <p className="text-gray-600">Manage about page content and team information</p>
        </div>
        <Button onClick={handleSaveAbout} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save All Changes</span>
        </Button>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="about">About Information</TabsTrigger>
          <TabsTrigger value="team">Management Team</TabsTrigger>
        </TabsList>

        {/* About Information */}
        <TabsContent value="about" className="space-y-6">
          {/* Mission & Vision */}
          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={aboutInfo.mission}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, mission: e.target.value })}
                  placeholder="Enter mission statement"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  value={aboutInfo.vision}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, vision: e.target.value })}
                  placeholder="Enter vision statement"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Story */}
          <Card>
            <CardHeader>
              <CardTitle>Company Story</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="story"
                value={aboutInfo.story}
                onChange={(e) => setAboutInfo({ ...aboutInfo, story: e.target.value })}
                placeholder="Write company story"
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle>Core Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(aboutInfo.values || []).map((value, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={value.title}
                        onChange={(e) => {
                          const updated = [...(aboutInfo.values || [])];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setAboutInfo({ ...aboutInfo, values: updated });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={value.description}
                        onChange={(e) => {
                          const updated = [...(aboutInfo.values || [])];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setAboutInfo({ ...aboutInfo, values: updated });
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addValue} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Value
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Company Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalJobs">Total Jobs Posted</Label>
                  <Input
                    id="totalJobs"
                    value={aboutInfo.statistics.totalJobs}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...aboutInfo.statistics, totalJobs: e.target.value }
                    })}
                    placeholder="e.g., 10,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="happyClients">Happy Clients</Label>
                  <Input
                    id="happyClients"
                    value={aboutInfo.statistics.happyClients}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...aboutInfo.statistics, happyClients: e.target.value }
                    })}
                    placeholder="e.g., 5,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="successfulPlacements">Successful Placements</Label>
                  <Input
                    id="successfulPlacements"
                    value={aboutInfo.statistics.successfulPlacements}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...aboutInfo.statistics, successfulPlacements: e.target.value }
                    })}
                    placeholder="e.g., 15,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companiesServed">Companies Served</Label>
                  <Input
                    id="companiesServed"
                    value={aboutInfo.statistics.companiesServed}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...aboutInfo.statistics, companiesServed: e.target.value }
                    })}
                    placeholder="e.g., 2,500+"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Team */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Management Team ({teamMembers.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { persistMembers([]); }}
                  >
                    Remove All
                  </Button>
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to the management team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberName">Full Name</Label>
                            <Input
                              id="memberName"
                              value={newMember.name}
                              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memberPosition">Position</Label>
                            <Input
                              id="memberPosition"
                              value={newMember.position}
                              onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                              placeholder="Enter position/title"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memberBio">Biography</Label>
                          <RichTextEditor
                            value={newMember.bio}
                            onChange={(value) => setNewMember({ ...newMember, bio: value })}
                            placeholder="Write team member bio here..."
                            showImageUpload={false}
                            showLinkInsert={true}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberEducation">Education</Label>
                            <Input
                              id="memberEducation"
                              value={newMember.education}
                              onChange={(e) => setNewMember({ ...newMember, education: e.target.value })}
                              placeholder="Educational background"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memberExperience">Experience</Label>
                            <Input
                              id="memberExperience"
                              value={newMember.experience}
                              onChange={(e) => setNewMember({ ...newMember, experience: e.target.value })}
                              placeholder="Years of experience"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberEmail">Email</Label>
                            <Input
                              id="memberEmail"
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              placeholder="Email address"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memberLinkedin">LinkedIn</Label>
                            <Input
                              id="memberLinkedin"
                              value={newMember.linkedin}
                              onChange={(e) => setNewMember({ ...newMember, linkedin: e.target.value })}
                              placeholder="LinkedIn profile URL"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberFacebook">Facebook</Label>
                            <Input
                              id="memberFacebook"
                              value={newMember.facebook}
                              onChange={(e) => setNewMember({ ...newMember, facebook: e.target.value })}
                              placeholder="Facebook profile/page URL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memberWhatsapp">WhatsApp</Label>
                            <Input
                              id="memberWhatsapp"
                              value={newMember.whatsapp}
                              onChange={(e) => setNewMember({ ...newMember, whatsapp: e.target.value })}
                              placeholder="WhatsApp number e.g. 9800000000"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="memberPhone">Phone</Label>
                            <Input
                              id="memberPhone"
                              value={newMember.phone}
                              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                              placeholder="+977-9800000000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Upload Profile Image</Label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleMemberImageUpload(file, 'new');
                              }}
                            />
                            {uploadingNewImage && (
                              <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMember}>Add Member</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="aspect-square w-full max-w-[120px] bg-gray-100 rounded-lg overflow-hidden">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={`${member.name || 'Team member'} image`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="grid place-items-center h-full w-full">
                                <Users className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold break-words">{member.name}</h3>
                          <p className="text-sm text-blue-600 break-words">{member.position}</p>
                          {member.bio && (
                            <div className="text-sm text-gray-600 line-clamp-4" dangerouslySetInnerHTML={{ __html: member.bio }} />
                          )}
                          <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                            {member.linkedin && (
                              <a
                                href={normalizeUrl(member.linkedin)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 break-all"
                              >
                                <Linkedin className="w-4 h-4" /> {member.linkedin}
                              </a>
                            )}
                            {member.facebook && (
                              <a
                                href={normalizeUrl(member.facebook)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 break-all"
                              >
                                <Facebook className="w-4 h-4" /> {member.facebook}
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 break-all"
                              >
                                <Mail className="w-4 h-4" /> {member.email}
                              </a>
                            )}
                            {member.phone && (
                              <a
                                href={`tel:${(member.phone || '').replace(/\s+/g,'')}`}
                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                              >
                                <Phone className="w-4 h-4" /> {member.phone}
                              </a>
                            )}
                            {member.whatsapp && (
                              <a
                                href={`https://wa.me/${String(member.whatsapp).replace(/\D+/g,'')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                              >
                                <MessageCircle className="w-4 h-4" /> WhatsApp: {member.whatsapp}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member information.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMemberName">Full Name</Label>
                  <Input
                    id="editMemberName"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMemberPosition">Position</Label>
                  <Input
                    id="editMemberPosition"
                    value={editingMember.position}
                    onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMemberBio">Bio</Label>
                <RichTextEditor
                  value={editingMember.bio}
                  onChange={(value) => setEditingMember({ ...editingMember, bio: value })}
                  placeholder="Write team member bio here..."
                  showImageUpload={false}
                  showLinkInsert={true}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMemberEducation">Education</Label>
                  <Input
                    id="editMemberEducation"
                    value={editingMember.education}
                    onChange={(e) => setEditingMember({ ...editingMember, education: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMemberExperience">Experience</Label>
                  <Input
                    id="editMemberExperience"
                    value={editingMember.experience}
                    onChange={(e) => setEditingMember({ ...editingMember, experience: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMemberEmail">Email</Label>
                  <Input
                    id="editMemberEmail"
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMemberLinkedin">LinkedIn</Label>
                  <Input
                    id="editMemberLinkedin"
                    value={editingMember.linkedin}
                    onChange={(e) => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMemberFacebook">Facebook</Label>
                  <Input
                    id="editMemberFacebook"
                    value={editingMember.facebook || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editMemberWhatsapp">WhatsApp</Label>
                  <Input
                    id="editMemberWhatsapp"
                    value={editingMember.whatsapp || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, whatsapp: e.target.value })}
                    placeholder="9800000000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMemberPhone">Phone</Label>
                  <Input
                    id="editMemberPhone"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="+977-9800000000"
                  />
                </div>
                <div className="space-y-2">
                  {/* spacer */}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMemberImage">Profile Image URL</Label>
                <Input
                  id="editMemberImage"
                  placeholder="https://..."
                  value={editingMember.image || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, image: e.target.value })}
                />
                <Label>Upload Profile Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMemberImageUpload(file, 'edit');
                  }}
                />
                {uploadingEditImage && (
                  <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Bio font controls removed; use RichTextEditor toolbar */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingMember(null)}>Cancel</Button>
                <Button onClick={async () => {
                  // Persist update
                  const updated = teamMembers.map(m => m.id === editingMember.id ? editingMember : m);
                  await persistMembers(updated);
                  setEditingMember(null);
                  toast.success('Team member updated successfully!');
                }}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

