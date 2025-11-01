import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { AuthTrigger } from './auth/AuthTrigger';
import { forceScrollToTop } from '../utils/scrollUtils';
const companyLogo = '/images/Megajoblogo-removebg-preview.png';
import { 
  User as UserIcon, 
  Briefcase, 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Search, 
  FileText, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Users,
  Shield
} from 'lucide-react';

export function RouterHeader() {
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showJobseekerDropdown, setShowJobseekerDropdown] = useState(false);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
  const [showJobsDropdown, setShowJobsDropdown] = useState(false);
  const [showEmployersPageDropdown, setShowEmployersPageDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showAdminLoginDropdown, setShowAdminLoginDropdown] = useState(false);
  
  // Role helpers to cleanly determine user type
  const userRole = (currentUser as any)?.role || (currentUser as any)?.user_type || '';
  const isAdmin = userRole === 'admin' || userRole === 'administrator' || userRole === 'super_admin';
  const isEmployer = userRole === 'employer';
  const isJobseeker = userRole === 'jobseeker' || userRole === 'job_seeker' || (!isAdmin && !isEmployer);
  const isAdminArea = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!confirmed) return;
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  const handleNavigate = (path: string, params?: URLSearchParams) => {
    const fullPath = params ? `${path}?${params.toString()}` : path;
    navigate(fullPath);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/jobs')) return 'jobs';
    if (path.startsWith('/employers') || path.startsWith('/companies')) return 'employers';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/blogs')) return 'blogs';
    if (path.startsWith('/contact')) return 'contact';
    return '';
  };

  const currentPage = getCurrentPage();

  const navigationItems = [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'jobs', label: 'Jobs', path: '/jobs' },
    { key: 'employers', label: 'Employers', path: '/employers' },
    { key: 'about', label: 'About', path: '/about' },
    { key: 'blogs', label: 'Blogs', path: '/blogs' },
    { key: 'contact', label: 'Contact', path: '/contact' }
  ];

  const jobseekerMenuItems = [
    { icon: Search, label: 'Browse Jobs', action: () => navigate('/jobs') },
    { icon: FileText, label: 'Resume Builder', action: () => navigate('/resume-builder') },
    { icon: BookOpen, label: 'Career Resources', action: () => navigate('/blogs') },
    { icon: Star, label: 'Saved Jobs', action: () => isAuthenticated ? navigate('/profile') : navigate('/login') },
    { icon: TrendingUp, label: 'Salary Insights', action: () => navigate('/blogs') },
    { icon: Users, label: 'Career Coaching', action: () => navigate('/blogs') },
    { icon: TrendingUp, label: 'Performance Monitor', action: () => navigate('/performance') },
    { icon: Shield, label: 'Emergency Tools', action: () => navigate('/emergency') }
  ];

  const employerMenuItems = [
    { icon: Briefcase, label: 'Post a Job', action: () => isAuthenticated ? navigate('/employer/dashboard') : navigate('/login') },
    { icon: Users, label: 'Find Candidates', action: () => isAuthenticated ? navigate('/employer/dashboard') : navigate('/login') },
    { icon: Building2, label: 'Company Profile', action: () => isAuthenticated ? navigate('/employer/dashboard') : navigate('/login') },
    { icon: TrendingUp, label: 'Hiring Analytics', action: () => isAuthenticated ? navigate('/employer/dashboard') : navigate('/login') },
    { icon: BookOpen, label: 'Hiring Resources', action: () => navigate('/blogs') },
    { icon: Star, label: 'Premium Plans', action: () => navigate('/employers') }
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Dashboard', action: () => navigate(userRole === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard') },
    { icon: Users, label: 'User Management', action: () => navigate('/admin/users') },
    { icon: Building2, label: 'Company Management', action: () => navigate('/admin/companies') },
    { icon: Briefcase, label: 'Job Management', action: () => navigate('/admin/jobs') },
    { icon: Users, label: 'Employer Management', action: () => navigate('/admin/employers') },
    { icon: BookOpen, label: 'Blog Management', action: () => navigate('/admin/blogs') },
    { icon: TrendingUp, label: 'Reports', action: () => navigate('/admin/reports') },
    { icon: Star, label: 'Site Management', action: () => navigate('/admin/site') }
  ];

  // Enhanced navigation handler that ensures scroll-to-top even for same page
  const handleNavigation = (path: string) => {
    const currentPath = location.pathname;
    
    // If navigating to the same page, force scroll to top
    if (currentPath === path) {
      forceScrollToTop();
    } else {
      // Navigate to new page (RouteScrollToTop will handle scroll)
      navigate(path);
    }
  };

  // Enhanced navigation with scroll for dropdown items
  const handleNavigationWithScroll = (action: () => void) => {
    // Execute the navigation action
    action();
    // Force scroll to top after a brief delay to ensure navigation completes
    setTimeout(() => {
      forceScrollToTop();
    }, 100);
  };

  // Conditional spacing based on auth (keep public site unchanged)
  const isLoggedIn = Boolean(isAuthenticated && currentUser);
  const logoMarginClass = isLoggedIn ? 'mr-10' : 'mr-8';
  const navSpacingClass = isLoggedIn ? 'space-x-6' : 'space-x-8';
  const navMarginClass = isLoggedIn ? 'ml-4' : '';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className={`flex items-center ${logoMarginClass}`}>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img 
                  src={companyLogo} 
                  alt="MegaJob Nepal" 
                  className="h-10 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex ${navSpacingClass} flex-1 ${navMarginClass}`}>
            {navigationItems.map((item) => (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => {
                    if (item.key === 'jobs') setShowJobsDropdown(true);
                    if (item.key === 'employers') setShowEmployersPageDropdown(true);
                  }}
                  onMouseLeave={() => {
                    if (item.key === 'jobs') setShowJobsDropdown(false);
                    if (item.key === 'employers') setShowEmployersPageDropdown(false);
                  }}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                    currentPage === item.key 
                      ? 'text-orange-600 border-orange-600' 
                      : 'text-gray-700 hover:text-orange-600 border-transparent hover:border-orange-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {(item.key === 'employers' || item.key === 'jobs') && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {/* Jobs Dropdown */}
                {item.key === 'jobs' && showJobsDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setShowJobsDropdown(true)}
                    onMouseLeave={() => setShowJobsDropdown(false)}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Browse Jobs</h3>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleNavigation('/jobs')}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">All Jobs</span>
                        </button>
                        <button 
                          onClick={() => handleNavigation('/megajobs')}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Mega Jobs</span>
                        </button>
                        <button 
                          onClick={() => handleNavigation('/jobs?featured=true')}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <TrendingUp className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Featured Jobs</span>
                        </button>
                        <button 
                          onClick={() => handleNavigation('/jobs?remote=true')}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Star className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Remote Jobs</span>
                        </button>
                        <button 
                          onClick={() => handleNavigation('/jobs/map')}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Job Map View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employers Dropdown */}
                {item.key === 'employers' && showEmployersPageDropdown && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setShowEmployersPageDropdown(true)}
                    onMouseLeave={() => setShowEmployersPageDropdown(false)}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Companies</h3>
                      <div className="space-y-2">
                        <Link 
                          to="/employers"
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">All Companies</span>
                        </Link>
                        <Link 
                          to="/employers?featured=true"
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Featured Companies</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Auth and User Menu */}
          <div className="flex items-center space-x-4">
            {/* For Jobseekers Dropdown */}
            <div className="relative hidden md:block">
              <button
                onMouseEnter={() => setShowJobseekerDropdown(true)}
                onMouseLeave={() => setShowJobseekerDropdown(false)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                <span>For Jobseekers</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showJobseekerDropdown && (
                <div 
                  className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  onMouseEnter={() => setShowJobseekerDropdown(true)}
                  onMouseLeave={() => setShowJobseekerDropdown(false)}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Job Seeker Tools</h3>
                    <div className="space-y-2">
                      {jobseekerMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={item.action}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* For Employers Dropdown */}
            <div className="relative hidden md:block">
              <button
                onMouseEnter={() => setShowEmployerDropdown(true)}
                onMouseLeave={() => setShowEmployerDropdown(false)}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                <span>For Employers</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showEmployerDropdown && (
                <div 
                  className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  onMouseEnter={() => setShowEmployerDropdown(true)}
                  onMouseLeave={() => setShowEmployerDropdown(false)}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Employer Tools</h3>
                    <div className="space-y-2">
                      {employerMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={item.action}
                          className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Authentication */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Link or Admin Dropdown */}
                {isAdmin && isAdminArea ? (
                  <div className="relative hidden md:block">
                    <button
                      onMouseEnter={() => setShowAdminDropdown(true)}
                      onMouseLeave={() => setShowAdminDropdown(false)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors border border-gray-300 rounded-md"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showAdminDropdown && (
                      <div 
                        className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                        onMouseEnter={() => setShowAdminDropdown(true)}
                        onMouseLeave={() => setShowAdminDropdown(false)}
                      >
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Admin Tools</h3>
                          <div className="space-y-2">
                            {adminMenuItems.map((item, index) => (
                              <button
                                key={index}
                                onClick={item.action}
                                className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                              >
                                <item.icon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {(currentUser as any).full_name || (currentUser as any).name || (currentUser as any).email}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate(userRole === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard')}>
                        <Shield className="w-4 h-4 mr-2" /> {userRole === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                      </DropdownMenuItem>
                    )}
                    {isEmployer && (
                      <DropdownMenuItem onClick={() => navigate('/employer/dashboard')}>
                        <Shield className="w-4 h-4 mr-2" /> Employer Dashboard
                      </DropdownMenuItem>
                    )}
                    {isJobseeker && (
                      <DropdownMenuItem onClick={() => navigate('/jobseeker-dashboard')}>
                        <UserIcon className="w-4 h-4 mr-2" /> My Profile
                      </DropdownMenuItem>
                    )}
                    {isJobseeker && (
                      <DropdownMenuItem onClick={() => navigate('/jobs?saved=true')}>
                        <Star className="w-4 h-4 mr-2" /> Saved Jobs
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <AuthTrigger variant="header" />
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    handleNavigation(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.key 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4 px-4">
                  <AuthTrigger variant="inline" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}