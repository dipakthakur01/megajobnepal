import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { 
  Users, User, Eye, Edit, Trash2, Download, Upload, Filter, Search, 
  Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileText, 
  Calendar, BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock,
  Bell, MessageCircle, Settings
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface JobSeeker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  bio?: string;
  skills: string[];
  experience: string;
  education: string;
  resumeUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  profileCompletion: number;
  lastActive: string;
  joinedDate: string;
  totalApplications: number;
  savedJobs: number;
  profileViews: number;
  isVerified: boolean;
  preferredJobTypes: string[];
  expectedSalary?: number;
  availabilityStatus: string;
  noticePeriod?: string;
}

interface JobAlert {
  id: string;
  userId: string;
  userName: string;
  title: string;
  keywords: string[];
  location: string;
  jobType: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  matchCount: number;
}

export function JobSeekerManagement() {
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<JobSeeker | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  const mockJobSeekers: JobSeeker[] = [
    {
      id: '1',
      name: 'Rajesh Sharma',
      email: 'rajesh@example.com',
      phone: '+977 9841234567',
      location: 'Kathmandu, Nepal',
      bio: 'Experienced software developer with 5+ years in web development',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      experience: '5+ years',
      education: 'Bachelor in Computer Engineering',
      resumeUrl: '/resume_rajesh.pdf',
      status: 'active',
      profileCompletion: 95,
      lastActive: '2024-01-20',
      joinedDate: '2023-06-15',
      totalApplications: 23,
      savedJobs: 15,
      profileViews: 156,
      isVerified: true,
      preferredJobTypes: ['full_time', 'remote'],
      expectedSalary: 80000,
      availabilityStatus: 'actively_looking',
      noticePeriod: '30_days'
    },
    {
      id: '2',
      name: 'Priya Thapa',
      email: 'priya@example.com',
      phone: '+977 9876543210',
      location: 'Pokhara, Nepal',
      bio: 'Digital marketing specialist passionate about brand growth',
      skills: ['SEO', 'Social Media Marketing', 'Content Writing', 'Google Ads'],
      experience: '3+ years',
      education: 'MBA in Marketing',
      status: 'active',
      profileCompletion: 87,
      lastActive: '2024-01-19',
      joinedDate: '2023-08-22',
      totalApplications: 18,
      savedJobs: 12,
      profileViews: 89,
      isVerified: true,
      preferredJobTypes: ['full_time', 'part_time'],
      expectedSalary: 60000,
      availabilityStatus: 'open_to_offers',
      noticePeriod: '15_days'
    },
    {
      id: '3',
      name: 'Amit Gurung',
      email: 'amit@example.com',
      location: 'Lalitpur, Nepal',
      bio: 'Fresh graduate looking for opportunities in finance sector',
      skills: ['Financial Analysis', 'Excel', 'Power BI', 'SAP'],
      experience: 'Fresher',
      education: 'Bachelor in Business Administration',
      status: 'active',
      profileCompletion: 65,
      lastActive: '2024-01-21',
      joinedDate: '2023-12-10',
      totalApplications: 8,
      savedJobs: 25,
      profileViews: 34,
      isVerified: false,
      preferredJobTypes: ['full_time', 'internship'],
      expectedSalary: 35000,
      availabilityStatus: 'actively_looking',
      noticePeriod: 'immediate'
    }
  ];

  const mockJobAlerts: JobAlert[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Rajesh Sharma',
      title: 'Full Stack Developer Jobs',
      keywords: ['react', 'node.js', 'javascript'],
      location: 'Kathmandu',
      jobType: 'full_time',
      isActive: true,
      createdAt: '2024-01-15',
      lastTriggered: '2024-01-20',
      matchCount: 5
    },
    {
      id: '2',
      userId: '2',
      userName: 'Priya Thapa',
      title: 'Marketing Manager Positions',
      keywords: ['marketing', 'seo', 'digital marketing'],
      location: 'Pokhara',
      jobType: 'full_time',
      isActive: true,
      createdAt: '2024-01-10',
      lastTriggered: '2024-01-18',
      matchCount: 3
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobSeekers(mockJobSeekers);
      setJobAlerts(mockJobAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setJobSeekers(jobSeekers.map(user => 
      user.id === id ? { ...user, status: newStatus as any } : user
    ));
    toast.success('Status updated successfully');
  };

  const handleVerifyUser = (id: string) => {
    setJobSeekers(jobSeekers.map(user => 
      user.id === id ? { ...user, isVerified: !user.isVerified } : user
    ));
    toast.success('Verification status updated');
  };

  const handleSendMessage = () => {
    if (!messageSubject || !messageContent || !selectedJobSeeker) {
      toast.error('Please fill in all fields');
      return;
    }

    // Simulate sending message
    console.log('Sending message to:', selectedJobSeeker.email, {
      subject: messageSubject,
      content: messageContent
    });

    toast.success('Message sent successfully');
    setShowMessageModal(false);
    setMessageSubject('');
    setMessageContent('');
  };

  const handleExportData = () => {
    const csvContent = jobSeekers.map(user => 
      `${user.name},${user.email},${user.location},${user.experience},${user.status},${user.totalApplications}`
    ).join('\n');
    
    const blob = new Blob([`Name,Email,Location,Experience,Status,Applications\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job_seekers.csv';
    link.click();
    
    toast.success('Data exported successfully');
  };

  const filteredJobSeekers = jobSeekers
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'applications': return b.totalApplications - a.totalApplications;
        case 'completion': return b.profileCompletion - a.profileCompletion;
        case 'recent':
        default: return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      }
    });

  const paginatedJobSeekers = filteredJobSeekers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredJobSeekers.length / itemsPerPage);

  const stats = {
    total: jobSeekers.length,
    active: jobSeekers.filter(u => u.status === 'active').length,
    verified: jobSeekers.filter(u => u.isVerified).length,
    activeAlerts: jobAlerts.filter(a => a.isActive).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Seeker Management</h2>
          <p className="text-gray-600">Manage job seekers and their profiles</p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Job Seekers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Job Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Job Seekers</TabsTrigger>
          <TabsTrigger value="alerts">Job Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search job seekers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent Activity</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                    <SelectItem value="completion">Profile Completion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Seekers Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">User</th>
                      <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                      <th className="text-left p-4 font-medium text-gray-900">Experience</th>
                      <th className="text-left p-4 font-medium text-gray-900">Profile</th>
                      <th className="text-left p-4 font-medium text-gray-900">Activity</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedJobSeekers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.profilePicture ? (
                                <ImageWithFallback
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-600">{user.experience}</p>
                                {user.isVerified && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-3 h-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{user.experience}</p>
                            <p className="text-xs text-gray-600">{user.education}</p>
                            <div className="flex flex-wrap gap-1">
                              {user.skills.slice(0, 2).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {user.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  {user.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${user.profileCompletion}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{user.profileCompletion}%</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-600">
                              <span>{user.profileViews} views</span>
                              {user.resumeUrl && (
                                <Badge className="bg-blue-100 text-blue-800">Resume</Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-sm">
                            <p>{user.totalApplications} applications</p>
                            <p>{user.savedJobs} saved jobs</p>
                            <p className="text-xs text-gray-600">
                              Last active: {new Date(user.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Select 
                            value={user.status} 
                            onValueChange={(value) => handleStatusChange(user.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJobSeeker(user);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJobSeeker(user);
                                setShowMessageModal(true);
                              }}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(user.id)}
                              className={user.isVerified ? 'text-green-600' : ''}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredJobSeekers.length)} of {filteredJobSeekers.length} results
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Alerts Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge className={alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">User: {alert.userName}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">{alert.location}</Badge>
                          <Badge variant="outline">{alert.jobType.replace('_', ' ')}</Badge>
                          {alert.keywords.map((keyword) => (
                            <Badge key={keyword} className="bg-blue-100 text-blue-800 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                          {alert.lastTriggered && (
                            <span>Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}</span>
                          )}
                          <span>Matches: {alert.matchCount}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="jobseeker-details-description">
          <DialogHeader>
            <DialogTitle>Job Seeker Details</DialogTitle>
            <DialogDescription id="jobseeker-details-description">
              View complete profile information and activity history for this job seeker.
            </DialogDescription>
          </DialogHeader>
          {selectedJobSeeker && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold">{selectedJobSeeker.name}</h3>
                    {selectedJobSeeker.isVerified && (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{selectedJobSeeker.email}</p>
                  <p className="text-gray-600">{selectedJobSeeker.bio}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> {selectedJobSeeker.phone || 'Not provided'}</p>
                    <p><strong>Location:</strong> {selectedJobSeeker.location || 'Not provided'}</p>
                    <p><strong>Joined:</strong> {new Date(selectedJobSeeker.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Professional Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Experience:</strong> {selectedJobSeeker.experience}</p>
                    <p><strong>Education:</strong> {selectedJobSeeker.education}</p>
                    <p><strong>Expected Salary:</strong> NPR {selectedJobSeeker.expectedSalary?.toLocaleString() || 'Not specified'}</p>
                    <p><strong>Availability:</strong> {selectedJobSeeker.availabilityStatus.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJobSeeker.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedJobSeeker.totalApplications}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedJobSeeker.savedJobs}</p>
                  <p className="text-sm text-gray-600">Saved Jobs</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedJobSeeker.profileViews}</p>
                  <p className="text-sm text-gray-600">Profile Views</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedJobSeeker?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message"
                rows={5}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
