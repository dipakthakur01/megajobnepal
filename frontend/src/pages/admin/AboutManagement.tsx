import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
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
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';
import { dbService } from '../../lib/db-service'

export function AboutManagement() {
  const [aboutInfo, setAboutInfo] = useState({
    mission: 'To connect talented professionals with leading employers across Nepal, fostering career growth and business success.',
    vision: 'To be Nepal\'s premier job portal, empowering careers and transforming the employment landscape.',
    story: 'Founded in 2020, MegaJobNepal emerged from a vision to revolutionize the job market in Nepal. Our founders recognized the gap between talented job seekers and quality employers, and set out to bridge this divide through innovative technology and dedicated service.',
    values: [
      {
        title: 'Innovation',
        description: 'We continuously evolve our platform to meet changing market needs.'
      },
      {
        title: 'Integrity',
        description: 'We maintain transparency and honesty in all our interactions.'
      },
      {
        title: 'Excellence',
        description: 'We strive for the highest quality in everything we do.'
      },
      {
        title: 'Community',
        description: 'We are committed to building a strong professional community in Nepal.'
      }
    ],
    statistics: {
      totalJobs: '10,000+',
      happyClients: '5,000+',
      successfulPlacements: '15,000+',
      companiesServed: '2,500+'
    }
  });

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
    phone: ''
  });

  // Mobile flip state and URL normalization helpers
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const normalizeUrl = (url?: string) => {
    const u = (url || '').trim();
    if (!u) return '';
    return u.startsWith('http') ? u : `https://${u}`;
  };

  const dedupeMembers = (members: any[]): any[] => {
    if (!Array.isArray(members)) return []
    const seen = new Set<string>()
    const result: any[] = []
    for (const m of members) {
      const key = (m.email?.trim()?.toLowerCase() || m.linkedin?.trim()?.toLowerCase() || `${m.name}|${m.position}`).trim()
      if (!seen.has(key)) {
        seen.add(key)
        result.push(m)
      }
    }
    return result
  }

  // Ensure each member has a unique, stable id before any operations
  const ensureUniqueIds = (members: any[]): any[] => {
    const used = new Set<string>()
    return members.map((m, idx) => {
      let baseId = (m?.id || m?.email || m?.linkedin || `${(m?.name || '').trim().toLowerCase()}|${(m?.position || '').trim().toLowerCase()}` || `${Date.now()}-${idx}`).toString().trim()
      let id = baseId
      let bump = 1
      while (used.has(id)) {
        id = `${baseId}-${bump++}`
      }
      used.add(id)
      return { ...m, id }
    })
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const about = await dbService.getAboutInfo()
        if (mounted && about && typeof about === 'object') {
          setAboutInfo(prev => ({
            ...prev,
            ...about,
            values: Array.isArray((about as any).values) ? (about as any).values : (prev.values || []),
            statistics: {
              ...(prev.statistics || {}),
              ...((about as any).statistics || {})
            }
          }))
        }
      } catch {}
      try {
        const membersRaw = await dbService.getTeamMembers()
        const next = Array.isArray(membersRaw) ? dedupeMembers(membersRaw) : []
        if (mounted) setTeamMembers(next)
      } catch {
        if (mounted) setTeamMembers([])
      }
    })()
    return () => { mounted = false }
  }, [])

  const persistTeamMembers = async (members: any[]) => {
    try {
      const normalized = ensureUniqueIds(dedupeMembers(members))
      setTeamMembers(normalized)
      await dbService.saveTeamMembers(normalized)
    } catch (e) {
      console.error('Failed to save team members', e)
      toast.error('Failed to save team members')
    }
  }

  const handleSaveAbout = async () => {
    try {
      await dbService.saveAboutInfo(aboutInfo)
      await persistTeamMembers(teamMembers)
      toast.success('About information updated successfully!')
    } catch (e) {
      toast.error('Failed to save changes')
    }
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.position || !newMember.bio) {
      toast.error('Please fill in all required fields');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
      image: ''
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({
      name: '',
      position: '',
      bio: '',
      education: '',
      experience: '',
      linkedin: '',
      email: '',
      phone: ''
    });
    setIsAddMemberOpen(false);
    toast.success('Team member added successfully!');
  };

  const handleEditMember = (member: any) => {
    setEditingMember({ ...member });
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;

    setTeamMembers(teamMembers.map(member => 
      member.id === editingMember.id ? editingMember : member
    ));
    setEditingMember(null);
    toast.success('Team member updated successfully!');
  };

  const handleDeleteMember = (id: string) => {
    const normalized = ensureUniqueIds(teamMembers)
    const next = normalized.filter(member => member.id !== id)
    setTeamMembers(next)
    persistTeamMembers(next)
    toast.success('Team member deleted successfully!')
  };

  const addValue = () => {
    setAboutInfo({
      ...aboutInfo,
      values: [...(aboutInfo.values || []), { title: '', description: '' }]
    });
  };

  const updateValue = (index: number, field: string, value: string) => {
    const baseValues = Array.isArray(aboutInfo.values) ? aboutInfo.values : []
    const updatedValues = baseValues.map((val, i) => 
      i === index ? { ...val, [field]: value } : val
    );
    setAboutInfo({ ...aboutInfo, values: updatedValues });
  };

  const removeValue = (index: number) => {
    setAboutInfo({
      ...aboutInfo,
      values: (aboutInfo.values || []).filter((_, i) => i !== index)
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
                  value={aboutInfo.mission || ''}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, mission: e.target.value })}
                  placeholder="Enter company mission"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  value={aboutInfo.vision || ''}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, vision: e.target.value })}
                  placeholder="Enter company vision"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Story */}
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="story">Company Story</Label>
                <Textarea
                  id="story"
                  value={aboutInfo.story || ''}
                  onChange={(e) => setAboutInfo({ ...aboutInfo, story: e.target.value })}
                  placeholder="Tell your company story"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company Values */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Our Values</CardTitle>
                <Button onClick={addValue} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(aboutInfo.values || []).map((value, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Value {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeValue(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`value-title-${index}`}>Title</Label>
                        <Input
                          id={`value-title-${index}`}
                          value={value.title}
                          onChange={(e) => updateValue(index, 'title', e.target.value)}
                          placeholder="Value title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-description-${index}`}>Description</Label>
                        <Textarea
                          id={`value-description-${index}`}
                          value={value.description}
                          onChange={(e) => updateValue(index, 'description', e.target.value)}
                          placeholder="Value description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                    value={aboutInfo.statistics?.totalJobs || ''}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...(aboutInfo.statistics || {}), totalJobs: e.target.value }
                    })}
                    placeholder="e.g., 10,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="happyClients">Happy Clients</Label>
                  <Input
                    id="happyClients"
                    value={aboutInfo.statistics?.happyClients || ''}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...(aboutInfo.statistics || {}), happyClients: e.target.value }
                    })}
                    placeholder="e.g., 5,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="successfulPlacements">Successful Placements</Label>
                  <Input
                    id="successfulPlacements"
                    value={aboutInfo.statistics?.successfulPlacements || ''}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...(aboutInfo.statistics || {}), successfulPlacements: e.target.value }
                    })}
                    placeholder="e.g., 15,000+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companiesServed">Companies Served</Label>
                  <Input
                    id="companiesServed"
                    value={aboutInfo.statistics?.companiesServed || ''}
                    onChange={(e) => setAboutInfo({
                      ...aboutInfo,
                      statistics: { ...(aboutInfo.statistics || {}), companiesServed: e.target.value }
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
                  <Button variant="outline" onClick={() => { setTeamMembers([]); persistTeamMembers([]); }}>Remove All</Button>
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
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
                          <Textarea
                            id="memberBio"
                            value={newMember.bio}
                            onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                            placeholder="Enter member biography"
                            rows={4}
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
                            <Label htmlFor="memberPhone">Phone</Label>
                            <Input
                              id="memberPhone"
                              value={newMember.phone}
                              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                              placeholder="+977-9800000000"
                            />
                          </div>
                          <div className="space-y-2">{/* spacer */}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMember(member)}
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
                        <div className={`flip-card team-card-fixed-height ${flippedId === member.id ? 'flip-active' : ''}`}
                             onClick={() => { if (isMobile) setFlippedId(flippedId === member.id ? null : member.id); }}>
                          <div className="flip-inner">
                            <div className="flip-face flip-front">
                              <div className="space-y-2">
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-sm text-blue-600">{member.position}</p>
                                {member.bio && (<p className="text-sm text-gray-600 line-clamp-4">{member.bio}</p>)}
                                <div className="space-y-1 text-xs text-gray-500">
                                  <p><strong>Education:</strong> {member.education}</p>
                                  <p><strong>Experience:</strong> {member.experience}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flip-face flip-back">
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
                                {!isMobile && (
                                  <p className="text-xs text-gray-500">Hover to flip. Tap on mobile.</p>
                                )}
                              </div>
                            </div>
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
        <DialogContent className="max-w-2xl">
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
                <Label htmlFor="editMemberBio">Biography</Label>
                <Textarea
                  id="editMemberBio"
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  rows={4}
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
                  <Label htmlFor="editMemberPhone">Phone</Label>
                  <Input
                    id="editMemberPhone"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">{/* spacer */}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMember}>Update Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

