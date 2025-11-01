import React from 'react';
import { Button } from './ui/button';
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
  Shield,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { SignupModal } from './modals/SignupModal';
import { OTPModal } from './modals/OTPModal';

interface HeaderProps {
  onNavigate: (page: string, filter?: { type: string; value: string }) => void;
  onLogin: () => void;
  onEmployerSignup?: () => void;
  onLogout: () => void;
  currentPage: string;
}

export function Header({ onNavigate, onLogin, onEmployerSignup, onLogout, currentPage }: HeaderProps) {
  const { user: currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Enhanced navigation handler that always scrolls to top
  const handleNavigationClick = (page: string) => {
    // Always call onNavigate regardless of current page - MainLayout handles the scroll
    onNavigate(page);
  };
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showJobseekerDropdown, setShowJobseekerDropdown] = useState(false);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
  const [showJobsDropdown, setShowJobsDropdown] = useState(false);
  const [showEmployersPageDropdown, setShowEmployersPageDropdown] = useState(false);
  
  // Modal states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  const navigationItems = [
    { key: 'home', label: 'Home' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'employers', label: 'Employers' },
    { key: 'about', label: 'About' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'contact', label: 'Contact' }
  ];

  const jobseekerMenuItems = [
    { icon: Search, label: 'Browse Jobs', action: () => onNavigate('jobs') },
    { icon: FileText, label: 'Resume Builder', action: () => {} },
    { icon: BookOpen, label: 'Career Resources', action: () => onNavigate('blogs') },
    { icon: Star, label: 'Saved Jobs', action: () => onLogin() },
    { icon: TrendingUp, label: 'Salary Insights', action: () => {} },
    { icon: Users, label: 'Career Coaching', action: () => {} }
  ];

  const employerMenuItems = [
    { icon: Briefcase, label: 'Post a Job', action: () => onLogin() },
    { icon: Users, label: 'Find Candidates', action: () => onLogin() },
    { icon: Building2, label: 'Company Profile', action: () => onLogin() },
    { icon: TrendingUp, label: 'Hiring Analytics', action: () => onLogin() },
    { icon: BookOpen, label: 'Hiring Resources', action: () => onNavigate('blogs') },
    { icon: Star, label: 'Premium Plans', action: () => {} }
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src={companyLogo} 
                  alt="MegaJob Nepal" 
                  className="h-14 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onNavigate('home')}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <div key={item.key} className="relative group">
                  <button
                    onClick={() => handleNavigationClick(item.key)}
                    onMouseEnter={() => {
                      if (item.key === 'jobs') setShowJobsDropdown(true);
                      if (item.key === 'employers') setShowEmployersPageDropdown(true);
                    }}
                    onMouseLeave={() => {
                      if (item.key === 'jobs') setShowJobsDropdown(false);
                      if (item.key === 'employers') setShowEmployersPageDropdown(false);
                    }}
                    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === item.key 
                        ? 'text-orange-600 border-b-2 border-orange-600' 
                        : 'text-gray-700 hover:text-orange-600'
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
                            onClick={() => onNavigate('jobs')}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">All Jobs</span>
                          </button>
                          <button 
                            onClick={() => onNavigate('jobs', { type: 'featured', value: 'true' })}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <TrendingUp className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Featured Jobs</span>
                          </button>
                          <button 
                            onClick={() => onNavigate('jobs', { type: 'remote', value: 'true' })}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <Briefcase className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Remote Jobs</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Employers Page Dropdown */}
                  {item.key === 'employers' && showEmployersPageDropdown && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      onMouseEnter={() => setShowEmployersPageDropdown(true)}
                      onMouseLeave={() => setShowEmployersPageDropdown(false)}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Explore Companies</h3>
                        <div className="space-y-2">
                          <button 
                            onClick={() => onNavigate('employers')}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">All Companies</span>
                          </button>
                          <button 
                            onClick={() => {
                              try {
                                // Always navigate to employers page with featured filter and scroll
                                onNavigate('employers', { type: 'featured', value: 'true' });
                                // If already on employers page, also dispatch scroll event
                                if (currentPage === 'employers') {
                                  setTimeout(() => {
                                    const event = new CustomEvent('scrollToSection', {
                                      detail: { section: 'featured-companies' }
                                    });
                                    window.dispatchEvent(event);
                                  }, 100);
                                }
                              } catch (error) {
                                console.log('Navigation error:', error);
                                onNavigate('employers', { type: 'featured', value: 'true' });
                              }
                            }}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Featured Companies</span>
                          </button>
                          <button 
                            onClick={() => {
                              try {
                                // Always navigate to employers page with top-hiring filter and scroll
                                onNavigate('employers', { type: 'top-hiring', value: 'true' });
                                // If already on employers page, also dispatch scroll event
                                if (currentPage === 'employers') {
                                  setTimeout(() => {
                                    const event = new CustomEvent('scrollToSection', {
                                      detail: { section: 'top-hiring-companies' }
                                    });
                                    window.dispatchEvent(event);
                                  }, 100);
                                }
                              } catch (error) {
                                console.log('Navigation error:', error);
                                onNavigate('employers', { type: 'top-hiring', value: 'true' });
                              }
                            }}
                            className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                          >
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Top Hiring Companies</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {/* Admin Panel Access */}
                  {currentUser.user_type === 'admin' && (
                    <Button
                      onClick={() => handleNavigationClick('admin-panel')}
                      variant={currentPage === 'admin-panel' ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Button>
                  )}
                  
                  {/* Regular User Dropdown */}
                  {currentUser.user_type !== 'admin' && (
                    <div className="relative">
                      <button
                        onMouseEnter={() => {
                          if (currentUser.user_type === 'job_seeker') setShowJobseekerDropdown(true);
                          if (currentUser.user_type === 'employer') setShowEmployerDropdown(true);
                        }}
                        onMouseLeave={() => {
                          if (currentUser.user_type === 'job_seeker') setShowJobseekerDropdown(false);
                          if (currentUser.user_type === 'employer') setShowEmployerDropdown(false);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <span>For {currentUser.user_type === 'job_seeker' ? 'Jobseekers' : 'Employers'}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {/* Logged in user dropdown */}
                      {((currentUser.user_type === 'job_seeker' && showJobseekerDropdown) || (currentUser.user_type === 'employer' && showEmployerDropdown)) && (
                        <div 
                          className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                          onMouseEnter={() => {
                            if (currentUser.user_type === 'job_seeker') setShowJobseekerDropdown(true);
                            if (currentUser.user_type === 'employer') setShowEmployerDropdown(true);
                          }}
                          onMouseLeave={() => {
                            if (currentUser.user_type === 'job_seeker') setShowJobseekerDropdown(false);
                            if (currentUser.user_type === 'employer') setShowEmployerDropdown(false);
                          }}
                        >
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                              {currentUser.user_type === 'job_seeker' ? 'Job Seeker Tools' : 'Employer Tools'}
                            </h3>
                            <div className="space-y-2">
                              {(currentUser.user_type === 'job_seeker' ? jobseekerMenuItems : employerMenuItems).map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                  <button
                                    key={index}
                                    onClick={item.action}
                                    className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded transition-colors"
                                  >
                                    <IconComponent className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm">{item.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Dashboard Button */}
                  {currentUser.user_type !== 'admin' && (
                    <Button
                      onClick={() => {
                        if (currentUser.user_type === 'job_seeker') {
                          window.location.href = '/jobseeker-dashboard';
                        } else if (currentUser.user_type === 'employer') {
                          window.location.href = '/employer/dashboard';
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Dashboard
                    </Button>
                  )}
                  
                  {/* User Info and Logout */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Hi, {currentUser.full_name}
                    </span>
                    {currentUser.user_type === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <Button onClick={onLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* For Jobseekers Dropdown */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowJobseekerDropdown(true)}
                      onMouseLeave={() => setShowJobseekerDropdown(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
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
                          <h3 className="font-semibold text-gray-900 mb-3">Job Seeker Resources</h3>
                          <div className="space-y-2">
                            {jobseekerMenuItems.map((item, index) => {
                              const IconComponent = item.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={item.action}
                                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded transition-colors"
                                >
                                  <IconComponent className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="border-t border-gray-200 mt-3 pt-3">
                            <Button onClick={onLogin} size="sm" className="w-full">
                              Sign In / Register
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* For Employers Dropdown */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowEmployerDropdown(true)}
                      onMouseLeave={() => setShowEmployerDropdown(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
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
                          <h3 className="font-semibold text-gray-900 mb-3">Employer Solutions</h3>
                          <div className="space-y-2">
                            {employerMenuItems.map((item, index) => {
                              const IconComponent = item.icon;
                              return (
                                <button
                                  key={index}
                                  onClick={item.action}
                                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded transition-colors"
                                >
                                  <IconComponent className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="border-t border-gray-200 mt-3 pt-3">
                            {onEmployerSignup ? (
                              <Button onClick={onEmployerSignup} size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                                Employer Sign Up
                              </Button>
                            ) : (
                              <Button onClick={onLogin} size="sm" className="w-full">
                                Post Jobs Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={onLogin} variant="outline" size="sm">
                      Login
                    </Button>
                    <Button 
                      onClick={() => setShowSignupModal(true)} 
                      variant="default" 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    // Use enhanced navigation that always scrolls to top
                    handleNavigationClick(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                    currentPage === item.key 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-4">
                {currentUser ? (
                  <div className="space-y-2">
                    {currentUser.user_type === 'admin' ? (
                      <Button
                        onClick={() => {
                          handleNavigationClick('admin-panel');
                          setIsMobileMenuOpen(false);
                        }}
                        variant={currentPage === 'admin-panel' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (currentUser.user_type === 'job_seeker') {
                            window.location.href = '/jobseeker-dashboard';
                          } else if (currentUser.user_type === 'employer') {
                            window.location.href = '/employer/dashboard';
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Dashboard
                      </Button>
                    )}
                    <Button onClick={onLogout} variant="outline" size="sm" className="w-full">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={onLogin} variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowSignupModal(true);
                        setIsMobileMenuOpen(false);
                      }} 
                      variant="default" 
                      size="sm" 
                      className="w-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            onLogin();
          }}
          onOTPRequired={(email) => {
            setOtpEmail(email);
            setShowSignupModal(false);
            setShowOTPModal(true);
          }}
        />

        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          email={otpEmail}
          onBack={() => {
            setShowOTPModal(false);
            setShowSignupModal(true);
          }}
          onSuccess={() => {
            setShowOTPModal(false);
            setOtpEmail('');
            // Optionally trigger a success notification or redirect
          }}
        />
      </header>
  );
}

