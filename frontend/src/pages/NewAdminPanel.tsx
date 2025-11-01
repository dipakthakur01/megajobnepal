import React, { useEffect, useState } from 'react';
import { AdminDashboardNew } from './admin/AdminDashboardNew';
import { SiteManagement } from './admin/SiteManagement';
import { TrustedCompaniesManagement } from './admin/TrustedCompaniesManagement';
import { RoleManagement } from './admin/RoleManagement';
import { UserManagement } from './admin/UserManagement';
import { EmployerManagementNew } from './admin/EmployerManagementNew';
import { JobPostManagement } from './admin/JobPostManagement';
import { JobParameterManagement } from './admin/JobParameterManagement';
import { CompanyParameterManagement } from './admin/CompanyParameterManagement';
import { PaymentManagement } from './admin/PaymentManagement';
import { ReportManagement } from './admin/ReportManagement';
import { BlogManagement } from './admin/BlogManagement';
import { AboutManagement } from './admin/AboutManagement';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { 
  LayoutDashboard, 
  Globe,
  Shield,
  Building2, 
  Briefcase,
  Settings,
  CreditCard,
  BarChart3,
  FileText,
  Info,
  Users,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  Star
} from 'lucide-react';

type AdminSection = 
  | 'dashboard' 
  | 'site-management'
  | 'trusted-companies' 
  | 'role-management'
  | 'admin-management'
  | 'user-management'
  | 'employer-management' 
  | 'job-post-management'
  | 'job-parameters'
  | 'company-parameters'
  | 'payment-management'
  | 'reports'
  | 'blog-management'
  | 'about-management';

interface NewAdminPanelProps {
  jobs: any[];
  users: any[];
  applications: any[];
  companies: any[];
  onJobUpdate: (jobs: any[]) => void;
  onUserUpdate: (users: any[]) => void;
  onCompanyUpdate: (companies: any[]) => void;
  currentUser: any;
  onBackToWebsite: () => void;
  onLogout: () => void;
}

export function NewAdminPanel({
  jobs,
  users,
  applications,
  companies,
  onJobUpdate,
  onUserUpdate,
  onCompanyUpdate,
  currentUser,
  onBackToWebsite,
  onLogout
}: NewAdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Server-driven companies: fetch on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const serverCompanies = await apiClient.getAdminCompanies({ page: 1, limit: 50 });
        if (mounted) onCompanyUpdate(serverCompanies || []);
      } catch (err) {
        console.warn('Failed to fetch admin companies on mount:', err);
        try {
          const fallback = await apiClient.getCompanies({ page: 1, limit: 50 });
          if (mounted) onCompanyUpdate(fallback || []);
        } catch {}
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Proxy: apply optimistic update then refresh from server
  const onCompanyUpdateServerDriven = async (nextCompanies: any[]) => {
    try { onCompanyUpdate(nextCompanies); } catch {}
    try {
      const refreshed = await apiClient.getAdminCompanies({ page: 1, limit: 50 });
      onCompanyUpdate(refreshed || []);
    } catch (err) {
      console.warn('Company refresh failed:', err);
    }
  };

  // Statistics for navigation badges
  const stats = {
    totalJobs: jobs.length,
    pendingJobs: jobs.filter(job => job.status === 'pending').length || 12,
    totalUsers: users.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length || 24,
    totalCompanies: companies.length,
    verifiedEmployers: companies.filter(c => c.verified).length || 45,
    unverifiedEmployers: companies.filter(c => !c.verified).length || 22
  };

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      section: 'Main',
      badge: null 
    },
    
    // Site Management
    { 
      id: 'site-management', 
      label: 'Site Info', 
      icon: Globe, 
      section: 'Site Management',
      badge: null 
    },
    
    // Trusted Companies Management
    { 
      id: 'trusted-companies', 
      label: 'Trusted Companies', 
      icon: Star, 
      section: 'Site Management',
      badge: null 
    },
    
    // Role Management  
    { 
      id: 'role-management', 
      label: 'Roles', 
      icon: Shield, 
      section: 'Role Management',
      badge: null 
    },
    
    // Admin Management
    { 
      id: 'admin-management', 
      label: 'Admin', 
      icon: Users, 
      section: 'Admin Management',
      badge: users.filter(u => u.type === 'admin').length.toString()
    },
    
    // User Management
    { 
      id: 'user-management', 
      label: 'Users Admin', 
      icon: Users, 
      section: 'User Management',
      badge: stats.totalUsers.toString() 
    },
    
    // Employer Management
    { 
      id: 'employer-management', 
      label: 'Employers', 
      icon: Building2, 
      section: 'Employer Management',
      badge: stats.totalCompanies.toString() 
    },
    
    // Job Management
    { 
      id: 'job-post-management', 
      label: 'Job Posts', 
      icon: Briefcase, 
      section: 'Job Management',
      badge: stats.totalJobs.toString() 
    },
    
    // Job Parameters
    { 
      id: 'job-parameters', 
      label: 'Job Parameters', 
      icon: Settings, 
      section: 'Job Management',
      badge: null 
    },
    
    // Company Parameters
    { 
      id: 'company-parameters', 
      label: 'Company Parameters', 
      icon: Building2, 
      section: 'Job Management',
      badge: null 
    },
    
    // Payment Management
    { 
      id: 'payment-management', 
      label: 'Payments', 
      icon: CreditCard, 
      section: 'Financial',
      badge: null 
    },
    
    // Reports
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: BarChart3, 
      section: 'Analytics',
      badge: null 
    },
    
    // Blog Management
    { 
      id: 'blog-management', 
      label: 'Blogs/News', 
      icon: FileText, 
      section: 'Content',
      badge: null 
    },
    
    // About Management
    { 
      id: 'about-management', 
      label: 'About Sections', 
      icon: Info, 
      section: 'Content',
      badge: null 
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboardNew 
            jobs={jobs}
            users={users}
            applications={applications}
            companies={companies}
            stats={stats}
            onNavigateToSection={(section) => setActiveSection(section as AdminSection)}
          />
        );
      case 'site-management':
        return <SiteManagement />;
      case 'trusted-companies':
        return <TrustedCompaniesManagement />;
      case 'role-management':
        return <RoleManagement users={users} onUserUpdate={onUserUpdate} />;
      case 'admin-management':
        return <UserManagement users={users.filter(u => u.type === 'admin')} onUserUpdate={onUserUpdate} />;
      case 'user-management':
        return <UserManagement users={users} onUserUpdate={onUserUpdate} />;
      case 'employer-management':
        return (
          <EmployerManagementNew 
            companies={companies}
            jobs={jobs}
            applications={applications}
            onCompanyUpdate={onCompanyUpdateServerDriven}
          />
        );
      case 'job-post-management':
        return (
          <JobPostManagement 
            jobs={jobs}
            companies={companies}
            onJobUpdate={onJobUpdate}
          />
        );
      case 'job-parameters':
        return <JobParameterManagement />;
      case 'company-parameters':
        return <CompanyParameterManagement />;
      case 'payment-management':
        return <PaymentManagement jobs={jobs} companies={companies} />;
      case 'reports':
        return <ReportManagement jobs={jobs} users={users} applications={applications} companies={companies} />;
      case 'blog-management':
        return <BlogManagement />;
      case 'about-management':
        return <AboutManagement />;
      default:
        return (
          <AdminDashboardNew 
            jobs={jobs}
            users={users}
            applications={applications}
            companies={companies}
            stats={stats}
            onNavigateToSection={(section) => setActiveSection(section as AdminSection)}
          />
        );
    }
  };

  const groupedNavItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

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
        <div className="flex items-center justify-between p-4 border-b bg-blue-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">M</span>
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-sm">megajobnepal.com.np</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-blue-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {Object.entries(groupedNavItems).map(([section, items]) => (
            <div key={section}>
              {section !== 'Main' && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {section}
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start h-9 px-3 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setActiveSection(item.id as AdminSection);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
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
        <header className="bg-white shadow-sm border-b px-4 py-3">
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
                <h1 className="text-lg font-semibold">
                  {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  System Online
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.pendingJobs} Pending
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {stats.totalUsers} Users
                </Badge>
              </div>
              
              {/* Earth icon to go back to website */}
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToWebsite}
                className="text-gray-600 hover:text-gray-800 border-gray-300"
                title="Go to Website"
              >
                <Globe className="h-4 w-4" />
              </Button>
              
              {/* Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

