import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
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
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Shield, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  Settings,
  UserPlus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete } from '../../utils/confirmDelete';
import { apiClient } from '../../lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
}

interface RoleManagementProps {
  users: User[];
  onUserUpdate: (users: User[]) => void;
}

export function RoleManagement({ users, onUserUpdate }: RoleManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Mock roles data
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['all_permissions'],
      userCount: 1,
      color: 'red'
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Administrative access with most permissions',
      permissions: ['manage_users', 'manage_jobs', 'manage_companies', 'view_reports'],
      userCount: 2,
      color: 'blue'
    },
    {
      id: '3',
      name: 'HR Manager',
      description: 'Human resources management and job posting',
      permissions: ['manage_jobs', 'view_applications', 'manage_companies'],
      userCount: 5,
      color: 'green'
    },
    {
      id: '4',
      name: 'Content Manager',
      description: 'Manage content, blogs, and website information',
      permissions: ['manage_content', 'manage_blogs', 'manage_site_info'],
      userCount: 3,
      color: 'purple'
    },
    {
      id: '5',
      name: 'Support Agent',
      description: 'Customer support and user assistance',
      permissions: ['view_users', 'manage_support_tickets'],
      userCount: 8,
      color: 'orange'
    },
    {
      id: '6',
      name: 'Employer',
      description: 'Company representatives who post jobs',
      permissions: ['manage_own_jobs', 'view_applications'],
      userCount: 50,
      color: 'indigo'
    },
    {
      id: '7',
      name: 'Job Seeker',
      description: 'Users looking for employment opportunities',
      permissions: ['apply_jobs', 'manage_profile'],
      userCount: 1200,
      color: 'emerald'
    }
  ]);

  // All users from API
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Function to map backend user_type to frontend role labels
  const mapRoleLabel = (user_type?: string) => {
    const t = String(user_type || '').toLowerCase();
    if (t === 'super_admin') return 'Super Admin';
    if (t === 'admin') return 'Admin';
    if (t === 'hr') return 'HR Manager';
    if (t === 'content' || t === 'content_manager') return 'Content Manager';
    if (t === 'support' || t === 'support_agent') return 'Support Agent';
    if (t === 'employer') return 'Employer';
    if (t === 'job_seeker' || t === 'jobseeker') return 'Job Seeker';
    return 'Job Seeker'; // Default for unknown types
  };

  // Load all users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Load all system users for Admin dashboard
        const res = await apiClient.getAllUsers({ limit: 500 });
        const items = Array.isArray((res as any)?.users) ? (res as any).users : (Array.isArray(res) ? (res as any) : []);
        const mapped: User[] = items.map((u: any) => ({
          id: u._id || u.id || String(Date.now()),
          name: u.full_name || u.name || '',
          email: u.email,
          role: mapRoleLabel(u.user_type),
          status: (u.status === 'inactive' ? 'inactive' : 'active'),
          lastLogin: u.lastLogin || u.last_login || 'Never'
        }));
        setAllUsers(mapped);
        if (typeof onUserUpdate === 'function') onUserUpdate(mapped);
      } catch (error) {
        console.warn('Failed to load users', error);
        toast.error('Failed to load users');
      }
    };
    loadUsers();
  }, []);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'blue'
  });

  const availablePermissions = [
    'all_permissions',
    'manage_users',
    'manage_jobs',
    'manage_companies',
    'manage_applications',
    'manage_payments',
    'view_reports',
    'manage_content',
    'manage_blogs',
    'manage_site_info',
    'manage_support_tickets',
    'view_users',
    'view_applications',
    'export_data'
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // Filter by user type
    const matchesUserType = (() => {
      switch (selectedUserType) {
        case 'all':
          return true;
        case 'admins':
          return ['Super Admin', 'Admin'].includes(user.role);
        case 'hr':
          return user.role === 'HR Manager';
        case 'content':
          return user.role === 'Content Manager';
        case 'support':
          return user.role === 'Support Agent';
        case 'employers':
          return user.role === 'Employer';
        case 'job_seekers':
          return user.role === 'Job Seeker';
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesRole && matchesUserType;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: 'Never'
    };

    setAllUsers([...allUsers, user]);
    setNewUser({ name: '', email: '', role: '', password: '' });
    setIsAddUserOpen(false);
    toast.success('User added successfully!');
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      userCount: 0,
      color: newRole.color
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', permissions: [], color: 'blue' });
    setIsAddRoleOpen(false);
    toast.success('Role created successfully!');
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    setRoles(roles.map(role => 
      role.id === editingRole.id ? editingRole : role
    ));
    setIsEditRoleOpen(false);
    setEditingRole(null);
    toast.success('Role updated successfully!');
  };

  const handleDeleteRole = (roleId: string) => {
    if (!confirmDelete('Are you sure you want to delete this role?')) return;
    setRoles(roles.filter(role => role.id !== roleId));
    toast.success('Role deleted successfully!');
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirmDelete('Are you sure you want to delete this user?')) return;
    setAdminUsers(adminUsers.filter(user => user.id !== userId));
    toast.success('User deleted successfully!');
  };

  const toggleUserStatus = (userId: string) => {
    setAdminUsers(adminUsers.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    toast.success('User status updated!');
  };

  const getRoleColor = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-gray-600">Manage user roles, permissions, and access control</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                    title="Filter by user type"
                  >
                    <option value="all">All Users</option>
                    <option value="admins">Admins</option>
                    <option value="hr">HR Users</option>
                    <option value="content">Content Managers</option>
                    <option value="support">Support Agents</option>
                    <option value="employers">Employers</option>
                    <option value="job_seekers">Job Seekers</option>
                  </select>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Admin User</DialogTitle>
                        <DialogDescription>
                          Create a new admin user account with role assignment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="userName">Full Name</Label>
                          <Input
                            id="userName"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">Email</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userRole">Role</Label>
                          <select
                            id="userRole"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="">Select role</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userPassword">Temporary Password</Label>
                          <Input
                            id="userPassword"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Enter temporary password"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Last Login</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getRoleColor(
                            roles.find(r => r.name === user.role)?.color || 'blue'
                          )}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.lastLogin}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">System Roles</h3>
              <p className="text-gray-600">Manage roles and their permissions</p>
            </div>
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleColor">Color</Label>
                      <select
                        id="roleColor"
                        value={newRole.color}
                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Describe this role"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {availablePermissions.map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={newRole.permissions.includes(permission)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewRole({
                                  ...newRole,
                                  permissions: [...newRole.permissions, permission]
                                });
                              } else {
                                setNewRole({
                                  ...newRole,
                                  permissions: newRole.permissions.filter(p => p !== permission)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={permission} className="text-sm">
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <Card key={role.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleColor(role.color)}>
                      {role.name}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            {role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRoleName">Role Name</Label>
                  <Input
                    id="editRoleName"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRoleColor">Color</Label>
                  <select
                    id="editRoleColor"
                    value={editingRole.color}
                    onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description</Label>
                <Textarea
                  id="editRoleDescription"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availablePermissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission}`}
                        checked={editingRole.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingRole({
                              ...editingRole,
                              permissions: [...editingRole.permissions, permission]
                            });
                          } else {
                            setEditingRole({
                              ...editingRole,
                              permissions: editingRole.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${permission}`} className="text-sm">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

