import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Search, User, Mail, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete } from '../../utils/confirmDelete';
import { apiClient } from '../../lib/api-client';

interface UserManagementProps {
  users: any[];
  onUserUpdate: (users: any[]) => void;
}

export function UserManagement({ users, onUserUpdate }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [localUsers, setLocalUsers] = useState<any[]>(Array.isArray(users) ? users : []);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    type: 'jobseeker' as 'jobseeker' | 'employer',
    company: '',
    profile: {
      resume: '',
      skills: '',
      experience: ''
    }
  });

  // Load all users for admin dashboard but show only job seekers and employers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.getAllUsers({ limit: 500 });
        const items = Array.isArray((res as any)?.users) ? (res as any).users : (Array.isArray(res) ? (res as any) : []);
        const mapped = items.map((u: any) => ({
          id: u._id || u.id || String(Date.now()),
          name: u.full_name || u.name || '',
          email: u.email,
          type: (u.user_type === 'job_seeker' ? 'jobseeker' : (u.user_type || '')),
          company: u.company_name || u.company || '',
          profile: u.profile || {}
        }));
        if (mounted) setLocalUsers(mapped);
        if (typeof onUserUpdate === 'function') onUserUpdate(mapped);
      } catch (err) {
        console.warn('Failed to load users for admin dashboard', err);
        // fall back to passed-in users prop if any
        if (mounted && Array.isArray(users)) setLocalUsers(users);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Filter users based on search and filters
  const filteredUsers = localUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    // Only show Job Seekers and Employers by default when filterType is 'all'
    const matchesType = filterType === 'all' 
      ? ['jobseeker', 'employer'].includes(user.type)
      : user.type === filterType;
    const matchesStatus = filterStatus === 'all'; // Can add status logic later

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateUser = () => {
    const user = {
      id: Date.now().toString(),
      ...newUser,
      profile: newUser.type === 'jobseeker' ? {
        ...newUser.profile,
        skills: newUser.profile.skills.split(',').map(s => s.trim()).filter(s => s)
      } : undefined
    };

    const next = [...localUsers, user];
    setLocalUsers(next);
    if (typeof onUserUpdate === 'function') onUserUpdate(next);
    setIsCreateModalOpen(false);
    setNewUser({
      name: '',
      email: '',
      type: 'jobseeker',
      company: '',
      profile: {
        resume: '',
        skills: '',
        experience: ''
      }
    });
    toast.success('User created successfully!');
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const updatedUsers = localUsers.map((user: any) =>
      user.id === selectedUser.id
        ? {
            ...selectedUser,
            profile: selectedUser.type === 'jobseeker' && selectedUser.profile ? {
              ...selectedUser.profile,
              skills: Array.isArray(selectedUser.profile.skills) 
                ? selectedUser.profile.skills 
                : selectedUser.profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            } : selectedUser.profile
          }
        : user
    );
    setLocalUsers(updatedUsers);
    if (typeof onUserUpdate === 'function') onUserUpdate(updatedUsers);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    toast.success('User updated successfully!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirmDelete('Are you sure you want to delete this user?')) {
      const updatedUsers = localUsers.filter((user: any) => user.id !== userId);
      setLocalUsers(updatedUsers);
      if (typeof onUserUpdate === 'function') onUserUpdate(updatedUsers);
      toast.success('User deleted successfully!');
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employer':
        return 'bg-blue-100 text-blue-800';
      case 'jobseeker':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const UserFormFields = ({ user, setUser }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="e.g. john@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">User Type *</Label>
        <Select value={user.type} onValueChange={(value) => setUser({ ...user, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jobseeker">Job Seeker</SelectItem>
            <SelectItem value="employer">Employer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user.type === 'employer' && (
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={user.company || ''}
            onChange={(e) => setUser({ ...user, company: e.target.value })}
            placeholder="e.g. Himalayan Bank Limited"
          />
        </div>
      )}

      {user.type === 'jobseeker' && (
        <>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input
              id="skills"
              value={Array.isArray(user.profile?.skills) ? user.profile.skills.join(', ') : user.profile?.skills || ''}
              onChange={(e) => setUser({ 
                ...user, 
                profile: { 
                  ...user.profile, 
                  skills: e.target.value 
                } 
              })}
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              value={user.profile?.experience || ''}
              onChange={(e) => setUser({ 
                ...user, 
                profile: { 
                  ...user.profile, 
                  experience: e.target.value 
                } 
              })}
              placeholder="e.g. 3 years in software development"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="resume">Resume/CV Link</Label>
            <Input
              id="resume"
              value={user.profile?.resume || ''}
              onChange={(e) => setUser({ 
                ...user, 
                profile: { 
                  ...user.profile, 
                  resume: e.target.value 
                } 
              })}
              placeholder="e.g. https://example.com/resume.pdf"
            />
          </div>
        </>
      )}
    </div>
  );

  const userStats = {
    total: users.length,
    jobSeekers: users.filter(u => u.type === 'jobseeker').length,
    employers: users.filter(u => u.type === 'employer').length,
    admins: users.filter(u => u.type === 'admin').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the platform with their profile information.
              </DialogDescription>
            </DialogHeader>
            <UserFormFields user={newUser} setUser={setNewUser} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-bold">{userStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Job Seekers</p>
                <p className="text-xl font-bold">{userStats.jobSeekers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Employers</p>
                <p className="text-xl font-bold">{userStats.employers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-xl font-bold">{userStats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jobseeker">Job Seekers</SelectItem>
                <SelectItem value="employer">Employers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge className={getUserTypeColor(user.type)}>
                            {user.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {user.company && (
                        <div>
                          <p className="text-gray-600"><strong>Company:</strong></p>
                          <p>{user.company}</p>
                        </div>
                      )}
                      
                      {user.profile?.experience && (
                        <div>
                          <p className="text-gray-600"><strong>Experience:</strong></p>
                          <p>{user.profile.experience}</p>
                        </div>
                      )}

                      {user.profile?.skills && user.profile.skills.length > 0 && (
                        <div className="sm:col-span-2 lg:col-span-1">
                          <p className="text-gray-600"><strong>Skills:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(Array.isArray(user.profile.skills) ? user.profile.skills : []).slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {Array.isArray(user.profile.skills) && user.profile.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                {user.profile.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {user.profile?.resume && (
                      <div className="mt-3">
                        <a 
                          href={user.profile.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Resume/CV
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser({
                          ...user,
                          profile: user.profile ? {
                            ...user.profile,
                            skills: Array.isArray(user.profile.skills) 
                              ? user.profile.skills.join(', ') 
                              : (user.profile.skills || '')
                          } : undefined
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.type === 'admin'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user's profile information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserFormFields user={selectedUser} setUser={setSelectedUser} />
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
