import React, { useState } from 'react';
import { AdminDashboard } from './admin/AdminDashboard';
import { JobManagementEnhanced } from './admin/JobManagementEnhanced';
import { CompanyManagementEnhanced } from './admin/CompanyManagementEnhanced';
import { EmployerManagementEnhanced } from './admin/EmployerManagementEnhanced';
import { UserManagement } from './admin/UserManagement';
import { ApplicationManagement } from './admin/ApplicationManagement';
import { JobSeekerManagement } from './admin/JobSeekerManagement';
import { AdminSettings } from './admin/AdminSettings';
import { NewsManagement } from './admin/NewsManagement';
import { HeroImageManagement } from './admin/HeroImageManagement';
import { AuthenticationDiagnostics } from './admin/AuthenticationDiagnostics';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Users, 
  UserCheck,
  UserPlus,
  FileText, 
  Settings,
  Menu,
  X,
  Newspaper,
  Image,
  Shield
} from 'lucide-react';

type AdminSection = 'dashboard' | 'jobs' | 'companies' | 'employers' | 'users' | 'job-seekers' | 'applications' | 'news' | 'hero-images' | 'auth-diagnostics' | 'settings';

interface AdminPanelProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
  onJobUpdate: (jobs: any[]) => void;
  onUserUpdate: (users: any[]) => void;
  onCompanyUpdate: (companies: any[]) => void;
  currentUser: any;
}

export function AdminPanel({
  jobs,
  users,
  applications,
  companies,
  onJobUpdate,
  onUserUpdate,
  onCompanyUpdate,
  currentUser
}: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const employerCount = users.filter(user => user.user_type === 'employer' || user.role === 'employer').length;
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: jobs.length.toString() },
    { id: 'companies', label: 'Companies', icon: Building2, badge: companies.length.toString() },
    { id: 'employers', label: 'Employer Management', icon: UserPlus, badge: employerCount.toString() },
    { id: 'users', label: 'Users', icon: Users, badge: users.length.toString() },
    { id: 'job-seekers', label: 'Job Seekers', icon: UserCheck, badge: null },
    { id: 'applications', label: 'Applications', icon: FileText, badge: applications.length.toString() },
    { id: 'news', label: 'News & Announcements', icon: Newspaper, badge: null },
    { id: 'hero-images', label: 'Hero Images', icon: Image, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'jobs':
        return (
          <JobManagementEnhanced 
            jobs={jobs}
            companies={companies}
            onJobUpdate={onJobUpdate}
          />
        );
      case 'companies':
        return (
          <CompanyManagementEnhanced 
            companies={companies}
            jobs={jobs}
            onCompanyUpdate={onCompanyUpdate}
          />
        );
      case 'employers':
        return (
          <EmployerManagementEnhanced 
            companies={companies}
            users={users}
            jobs={jobs}
            onCompanyUpdate={onCompanyUpdate}
            onUserUpdate={onUserUpdate}
          />
        );
      case 'users':
        return (
          <UserManagement 
            users={users}
            onUserUpdate={onUserUpdate}
          />
        );
      case 'job-seekers':
        return <JobSeekerManagement />;
      case 'applications':
        return (
          <ApplicationManagement 
            applications={applications}
            jobs={jobs}
            users={users}
          />
        );
      case 'news':
        return <NewsManagement />;
      case 'hero-images':
        return <HeroImageManagement />;
      case 'settings':
        return <AdminSettings currentUser={currentUser} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:transform-none lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">Admin Panel</h2>
            <p className="text-sm text-gray-600">MegaJobNepal</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection(item.id as AdminSection);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Admin info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {navigationItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your job portal efficiently
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                System Online
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
