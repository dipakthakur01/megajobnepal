import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { FooterEnhanced } from './FooterEnhanced';
import { LoginModal } from './LoginModal';
import { ScrollToTop } from './ScrollToTop';
import { RecruitmentPopup } from './RecruitmentPopup';
import { useApp } from '@/pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// Import all components directly - NO LAZY LOADING to prevent timeouts
import { HomePage } from './HomePage';
import { JobListings } from './JobListings';
import { JobDetail } from './JobDetailFixed';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { BlogsPage } from './BlogsPage';
import { EmployersPage } from './EmployersPage';
import { CompanyDetailPage } from './CompanyDetailPage';
// (removed) legacy EmployerDashboard import


export function MainLayout() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pageFilter, setPageFilter] = useState<{ type: string; value: string } | undefined>();
  const [showRecruitmentPopup, setShowRecruitmentPopup] = useState(false);
  const [recruitmentContent, setRecruitmentContent] = useState<any | null>(null);
  
  const { 
    currentUser, 
    setCurrentUser,
    jobs,
    applications,
    savedJobs,
    filters,
    setFilters,
    handleApplyJob,
    handleSaveJob
  } = useApp();

  const { user: authUser, isAuthenticated, logout: authLogout, loading } = useAuth();
  const { confirm } = useConfirm();

  // Sync authentication state and handle auto-redirect
  useEffect(() => {
    if (isAuthenticated && authUser) {
      // Determine user type with robust checking
      const getUserType = (user: any): 'admin' | 'jobseeker' | 'employer' => {
        // Check multiple possible field names for user type
        const userType = user.user_type || user.role || user.type;
        
        console.log('🔍 Determining user type for:', user.email);
        console.log('📊 User object fields:', {
          user_type: user.user_type,
          role: user.role,
          type: user.type,
          email: user.email
        });
        
        // Normalize the user type
        if (userType === 'admin' || userType === 'administrator') {
          return 'admin';
        } else if (userType === 'job_seeker' || userType === 'jobseeker') {
          return 'jobseeker';
        } else if (userType === 'employer' || userType === 'company') {
          return 'employer';
        }
        
        // Default fallback based on email patterns for demo accounts
        if (user.email?.includes('admin')) {
          return 'admin';
        } else if (user.email?.includes('jobseeker')) {
          return 'jobseeker';
        } else if (user.email?.includes('employer')) {
          return 'employer';
        }
        
        // Final fallback - default to jobseeker
        console.warn('⚠️ Could not determine user type, defaulting to jobseeker');
        return 'jobseeker';
      };

      // Convert AuthContext user to AppProvider format
      const detectedUserType = getUserType(authUser);
      const newUser = {
        id: authUser.id || '',
        name: authUser.full_name || authUser.email || '',
        email: authUser.email || '',
        type: detectedUserType,
        user_type: detectedUserType, // Add this for consistency
        profile: {
          skills: [],
          experience: '',
          resume: ''
        },
        company: (detectedUserType === 'employer') ? 'Sample Company' : undefined
      };

      console.log('✅ Final user object:', newUser);

      if (!currentUser || currentUser.id !== authUser.id) {
        setCurrentUser(newUser);
        
        // Auto-redirect to dashboard after successful authentication
        // Only redirect if we're on the main layout (not already on a dashboard)
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/home' || currentPath.includes('auth-test')) {
          console.log(`🔄 Redirecting ${newUser.type} user to dashboard...`);
          // Use window.location.href for proper navigation that triggers route changes
          if (newUser.type === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (newUser.type === 'jobseeker') {
            window.location.href = '/jobseeker-dashboard';
          } else if (newUser.type === 'employer') {
            window.location.href = '/employer/dashboard';
          }
        }
      }
    } else if (!isAuthenticated) {
      setCurrentUser(null);
    }
  }, [isAuthenticated, authUser, currentUser, setCurrentUser]);

  // Show recruitment popup logic - only for non-employers after some time - ONCE PER SESSION
  useEffect(() => {
    // Query param override for testing: ?showRecruitment=true or ?popup=recruitment
    try {
      const params = new URLSearchParams(window.location.search);
      const forcePopup = params.get('showRecruitment') === 'true' || params.get('popup') === 'recruitment';
      if (forcePopup) {
        setShowRecruitmentPopup(true);
        sessionStorage.setItem('megajob-recruitment-popup-shown', 'true');
        return;
      }
    } catch {}

    // Don't show if user is already an employer or admin
    if (currentUser && (currentUser.type === 'employer' || currentUser.type === 'admin')) {
      return;
    }

    // Check if user has dismissed the popup before (localStorage)
    const dismissedRecently = localStorage.getItem('megajob-recruitment-popup-dismissed');
    if (dismissedRecently) {
      const dismissedTime = parseInt(dismissedRecently);
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000); // 1 week
      if (dismissedTime > oneWeekAgo) {
        return; // Don't show again for a week
      }
    }

    // Check if popup was already shown in this session
    const sessionShown = sessionStorage.getItem('megajob-recruitment-popup-shown');
    if (sessionShown) {
      return; // Don't show popup if already shown in this session
    }

    // Show popup after 10 seconds of browsing (for both visitors and job seekers)
    const timer = setTimeout(() => {
      setShowRecruitmentPopup(true);
      // Mark as shown in this session
      sessionStorage.setItem('megajob-recruitment-popup-shown', 'true');
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  // Load recruitment content from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getRecruitmentItems();
        const list: any[] = Array.isArray(res) ? res : (res?.items || []);
        const published = list.filter((i) => i && (i.published ?? true));
        const selected = published.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] || null;
        if (!cancelled) setRecruitmentContent(selected);
      } catch (err) {
        console.warn('Failed to load recruitment items', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enhanced smooth scroll to top function with visual content movement
  const smoothScrollToTop = useCallback(() => {
    // Use simpler, more reliable scroll method
    try {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } catch (error) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, []);

  const handleNavigation = (page: string, filterOrParam?: { type: string; value: string } | string) => {
    // Always auto scroll to top when navigating, even if staying on same page
    try {
      smoothScrollToTop();
    } catch (error) {
      console.error('Scroll error:', error);
      // Fallback to simple scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Redirect legacy employer-dashboard page to canonical route
    if (page === 'employer-dashboard') {
      window.location.href = '/employer/dashboard';
      return;
    }
    
    // Handle auth page navigation by showing login modal
    if (page === 'auth') {
      setShowLoginModal(true);
      return;
    }
    
    setCurrentPage(page);
    
    // Handle different parameter types
    if (typeof filterOrParam === 'string') {
      // Legacy string parameter handling
      if (page === 'job-detail') {
        setSelectedJobId(filterOrParam);
      } else if (page === 'company-detail') {
        setSelectedCompanyName(filterOrParam);
      }
    } else if (filterOrParam && typeof filterOrParam === 'object') {
      // New filter parameter handling
      setPageFilter(filterOrParam);
    } else {
      // Clear filter when no parameter provided
      setPageFilter(undefined);
    }
  };

  // Enhanced navigation that always scrolls to top
  const handleNavigationWithScroll = (page: string, filterOrParam?: { type: string; value: string } | string) => {
    // Always scroll to top regardless of current page
    smoothScrollToTop();

    // Redirect legacy employer-dashboard page to canonical route
    if (page === 'employer-dashboard') {
      window.location.href = '/employer/dashboard';
      return;
    }
    
    // Update page state even if it's the same page to ensure consistency
    setCurrentPage(page);
    
    if (typeof filterOrParam === 'string') {
      if (page === 'job-detail') {
        setSelectedJobId(filterOrParam);
      } else if (page === 'company-detail') {
        setSelectedCompanyName(filterOrParam);
      }
    } else if (filterOrParam && typeof filterOrParam === 'object') {
      setPageFilter(filterOrParam);
    } else {
      setPageFilter(undefined);
    }
  };

  // Handle company view navigation
  const handleViewCompany = (companyId: string) => {
    handleNavigation('company-detail', companyId);
  };

  const handleLogin = (user: any) => {
    // Use the same robust user type detection logic
    const getUserType = (user: any): 'admin' | 'jobseeker' | 'employer' => {
      const userType = user.user_type || user.role || user.type;
      
      console.log('🔍 HandleLogin - Determining user type for:', user.email);
      console.log('📊 HandleLogin - User object fields:', {
        user_type: user.user_type,
        role: user.role,
        type: user.type,
        email: user.email
      });
      
      // Normalize the user type
      if (userType === 'admin' || userType === 'administrator') {
        return 'admin';
      } else if (userType === 'job_seeker' || userType === 'jobseeker') {
        return 'jobseeker';
      } else if (userType === 'employer' || userType === 'company') {
        return 'employer';
      }
      
      // Default fallback based on email patterns for demo accounts
      if (user.email?.includes('admin')) {
        return 'admin';
      } else if (user.email?.includes('jobseeker')) {
        return 'jobseeker';
      } else if (user.email?.includes('employer')) {
        return 'employer';
      }
      
      // Final fallback - default to jobseeker
      console.warn('⚠️ HandleLogin - Could not determine user type, defaulting to jobseeker');
      return 'jobseeker';
    };

    const detectedUserType = getUserType(user);
    
    // Update user object with consistent type
    const updatedUser = {
      ...user,
      type: detectedUserType,
      user_type: detectedUserType
    };
    
    setCurrentUser(updatedUser);
    setShowLoginModal(false);
    
    // Redirect users to their appropriate dashboards
    console.log(`🔄 Login success - redirecting ${detectedUserType} user to dashboard...`);
    console.log('Updated user object:', updatedUser);
    
    // Use window.location.href for proper navigation
    if (detectedUserType === 'admin') {
      window.location.href = '/admin/dashboard';
    } else if (detectedUserType === 'jobseeker') {
      window.location.href = '/jobseeker-dashboard';
    } else if (detectedUserType === 'employer') {
      window.location.href = '/employer/dashboard';
    }
  };

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
      await authLogout();
      setCurrentUser(null);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setCurrentUser(null);
      window.location.href = '/';
    }
  };

  const handleViewJob = (jobId: string) => {
    try {
      // Validate job ID
      if (!jobId) {
        console.error('Invalid job ID provided');
        return;
      }
      
      // Check if job exists before navigating
      const jobExists = jobs.some(j => j.id === jobId);
      if (!jobExists) {
        console.error('Job not found:', jobId);
        toast.error('Job not found or has been removed');
        return;
      }
      
      // Visual scroll to top when viewing job details
      smoothScrollToTop();
      
      setSelectedJobId(jobId);
      setCurrentPage('job-detail');
    } catch (error) {
      console.error('Error navigating to job details:', error);
      toast.error('Unable to view job details. Please try again.');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        // Convert AppProvider jobs to mockData Job format
        const convertedJobs = jobs.map(job => ({
          ...job,
          deadline: job.deadline || job.postedDate || '',
          tags: job.tags || []
        }));

        return (
          <HomePage
            jobs={convertedJobs}
            onNavigate={handleNavigation}
            onViewJob={handleViewJob}
            onViewCompany={handleViewCompany}
            filters={filters}
            onFilterChange={setFilters}
            onSaveJob={handleSaveJob}
            savedJobs={savedJobs}
            isUserLoggedIn={!!currentUser}
            onLoginRequired={() => setShowLoginModal(true)}
          />
        );
      case 'jobs':
        return (
          <JobListings 
            onViewJob={handleViewJob}
            onSaveJob={handleSaveJob}
            onViewCompany={handleViewCompany}
            savedJobs={savedJobs}
            filter={pageFilter}
            isUserLoggedIn={!!currentUser}
            onLoginRequired={() => setShowLoginModal(true)}
          />
        );
      case 'job-detail':
        try {
          console.log('🔍 Rendering job detail for ID:', selectedJobId);
          console.log('📊 Total jobs available:', jobs.length);
          
          const job = jobs.find(j => j.id === selectedJobId);
          
          // If job not found, redirect to home
          if (!job) {
            console.warn('❌ Job not found with ID:', selectedJobId);
            setTimeout(() => {
              setCurrentPage('home');
              toast.error('Job not found or has been removed');
            }, 0);
            return (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Job Not Found</h2>
                  <p className="text-gray-600 mb-4">Redirecting to home page...</p>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            );
          }
          
          console.log('✅ Job found:', job.title, 'at', job.company);
          
          const relatedJobs = jobs.filter(j => j.id !== selectedJobId).slice(0, 3);
          const isSaved = selectedJobId ? savedJobs.includes(selectedJobId) : false;
          const hasApplied = applications.some(app => 
            app.jobId === selectedJobId && app.userId === currentUser?.id
          );
          
          console.log('📋 Job detail state:', { 
            isSaved, 
            hasApplied, 
            relatedJobsCount: relatedJobs.length,
            currentUser: currentUser?.email 
          });
          
          return (
            <JobDetail 
              job={job}
              relatedJobs={relatedJobs}
              onApply={handleApplyJob}
              onSave={handleSaveJob}
              isSaved={isSaved}
              hasApplied={hasApplied}
              onViewJob={handleViewJob}
              onViewCompany={(companyName: string) => handleNavigation('company-detail', companyName)}
              currentUser={currentUser}
            />
          );
        } catch (error) {
          console.error('🔴 Error rendering job detail:', error);
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-red-600">Something went wrong</h2>
                <p className="text-gray-600 mb-4">Unable to load job details</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Go to Home
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          );
        }
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'blogs':
        return <BlogsPage />;
      case 'employers':
        return <EmployersPage onNavigate={handleNavigation} filter={pageFilter} />;
      case 'company-detail':
        return (
          <CompanyDetailPage 
            companyName={selectedCompanyName || ''}
            jobs={jobs}
            onViewJob={handleViewJob}
            onSaveJob={handleSaveJob}
            savedJobs={savedJobs}
            onNavigate={handleNavigation}
          />
        );
      // (removed) legacy 'employer-dashboard' case; navigation now redirects to '/employer/dashboard'

      default:
        return (
          <HomePage 
            jobs={jobs}
            onNavigate={handleNavigation}
            onViewJob={handleViewJob}
            filters={filters}
            onFilterChange={setFilters}
            onSaveJob={handleSaveJob}
            savedJobs={savedJobs}
            isUserLoggedIn={!!currentUser}
            onLoginRequired={() => setShowLoginModal(true)}
          />
        );
    }
  };

  // Handle recruitment popup actions
  const handleCloseRecruitmentPopup = () => {
    setShowRecruitmentPopup(false);
    // Store dismissal time in localStorage
    localStorage.setItem('megajob-recruitment-popup-dismissed', Date.now().toString());
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header 
        onNavigate={handleNavigation}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        currentPage={currentPage}
      />
      
      <main className="flex-1 overflow-x-hidden">
        {renderPage()}
      </main>
      
      <FooterEnhanced />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Recruitment Popup */}
      {showRecruitmentPopup && (
        <RecruitmentPopup
          onClose={handleCloseRecruitmentPopup}
          content={recruitmentContent || undefined}
        />
      )}
    </div>
  );
}
