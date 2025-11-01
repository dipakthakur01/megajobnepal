import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
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
import { apiClient } from '../../lib/api-client';
import { confirmDelete } from '../../utils/confirmDelete';

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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
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
    }
  ]);

  // Mock admin users
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

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

  const mapRoleLabel = (user_type?: string) => {
    if (!user_type) return 'Admin';
    return user_type === 'super_admin' ? 'Super Admin' : 'Admin';
  };

  const toBackendRole = (label: string) => {
    const normalized = (label || '').toLowerCase();
    return normalized.includes('super') ? 'super_admin' : 'admin';
  };

  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        const res = await apiClient.getAdminUsers({ limit: 100 });
        const items = Array.isArray(res?.users) ? res.users : [];
        const mapped: User[] = items.map((u: any) => ({
          id: u._id || u.id || String(Date.now()),
          name: u.full_name || u.name || '',
          email: u.email,
          role: mapRoleLabel(u.user_type),
          status: (u.status === 'inactive' ? 'inactive' : 'active'),
          lastLogin: u.lastLogin || u.last_login || ''
        }));
        setAdminUsers(mapped);
        if (typeof onUserUpdate === 'function') onUserUpdate(mapped);
      } catch (error) {
        console.warn('Failed to load admin users', error);
        toast.error('Failed to load admin users');
      }
    };
    loadAdminUsers();
  }, []);

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const created = await apiClient.createAdminUser({
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.name,
      });
      const admin = created?.admin;
      const id = admin?._id || admin?.id;
      const desiredRole = toBackendRole(newUser.role);
      if (id && desiredRole !== 'admin') {
        await apiClient.updateUserRole(String(id), desiredRole);
      }
      const user: User = {
        id: String(id || Date.now()),
        name: admin?.full_name || newUser.name,
        email: admin?.email || newUser.email,
        role: desiredRole === 'super_admin' ? 'Super Admin' : 'Admin',
        status: 'active',
        lastLogin: 'Never'
      };
      setAdminUsers(prev => [user, ...prev]);
      if (typeof onUserUpdate === 'function') onUserUpdate([user, ...adminUsers]);
      setNewUser({ name: '', email: '', role: '', password: '' });
      setIsAddUserOpen(false);
      toast.success('User added successfully!');
    } catch (error) {
      console.error('Create admin failed', error);
      const message = error instanceof Error ? error.message : 'Failed to create admin user';
      toast.error(message);
    }
  };

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState({ name: '', email: '', role: '', password: '' });

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const id = selectedUser.id;
    const originalRole = selectedUser.role;
    const desiredRole = editUser.role || originalRole;
    try {
      // Update basic fields
      await apiClient.updateAdminUser(id, { email: editUser.email, name: editUser.name });

      // Update role if changed
      if (desiredRole !== originalRole) {
        await apiClient.updateUserRole(id, toBackendRole(desiredRole));
      }

      // Reset password if provided
      if (editUser.password && editUser.password.trim().length >= 6) {
        await apiClient.resetUserPassword(id, editUser.password.trim());
      }

      // Reflect in UI
      setAdminUsers(prev => prev.map(u => (
        u.id === id ? { ...u, name: editUser.name, email: editUser.email, role: desiredRole } : u
      )));
      if (typeof onUserUpdate === 'function') {
        onUserUpdate(adminUsers.map(u => (
          u.id === id ? { ...u, name: editUser.name, email: editUser.email, role: desiredRole } : u
        )));
      }

      toast.success('User updated successfully');
      setIsEditUserOpen(false);
      setSelectedUser(null);
      setEditUser({ name: '', email: '', role: '', password: '' });
    } catch (error) {
      console.error('Update admin failed', error);
      const message = error instanceof Error ? error.message : 'Failed to update admin user';
      toast.error(message);
    }
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirmDelete('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.deleteAdminUser(userId);
      setAdminUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.warn('Delete admin failed', error);
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(message);
    }
  };


  const toggleUserStatus = async (userId: string) => {
    const target = adminUsers.find(u => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.updateUserStatus(userId, nextStatus);
      setAdminUsers(prev => prev.map(user => user.id === userId ? { ...user, status: nextStatus } : user));
      toast.success('User status updated!');
    } catch (error) {
      console.error('Update status failed', error);
      const message = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(message);
    }
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
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* Admin Users Tab */}
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
              <CardTitle>Admin Users ({filteredUsers.length})</CardTitle>
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
                            <Button variant="outline" size="sm" onClick={() => openEditUser(user)}>
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
          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Admin User</DialogTitle>
                <DialogDescription>
                  Update name, email, role, or reset password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editUserName">Full Name</Label>
                  <Input
                    id="editUserName"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserEmail">Email</Label>
                  <Input
                    id="editUserEmail"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserRole">Role</Label>
                  <select
                    id="editUserRole"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUserPassword">Reset Password</Label>
                  <Input
                    id="editUserPassword"
                    type="password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    placeholder="Enter new password (optional)"
                  />
                  <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
