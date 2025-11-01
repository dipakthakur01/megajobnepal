import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
// Replace incorrect hook import with the actual AuthContext hook
import { useAuth } from '@/components/auth/AuthContext';
import { RouterHeader } from './components/RouterHeader';
import RouterFooter from './components/RouterFooter';
import { RecruitmentPopup } from './components/RecruitmentPopup';

// Pages - importing from pages where they actually exist
import { HomePage as Home } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { JobListings as Jobs } from './components/JobListings';
import { JobDetail as JobDetails } from './components/JobDetailFixed';

import UserProfile from './pages/UserProfile';
import { JobSeekerLayout } from './components/JobSeekerLayout';
import { EmployerLayout } from './components/EmployerLayout';
// import removed: legacy AdminDashboard alias not used
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { BlogsPage } from './pages/BlogsPage';
import { EmployersPage } from './components/EmployersPageNew';
import { CompanyDetailPage } from './components/CompanyDetailPage';

// Additional components
import { JobMapView } from './components/JobMapView';
import { PerformanceMonitor } from './components/PerformanceMonitor';

import { EmergencyApp } from './components/EmergencyApp';
// Auth: forgot/reset password forms
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import { ResetPasswordWithOtpForm } from './components/auth/ResetPasswordWithOtpForm';

// Admin pages
import AdminLoginPage from './pages/admin/login/page';
import AdminDashboardPage from './pages/admin/page';
// Super Admin pages
import SuperAdminLoginPage from './pages/super-admin/login/page';
import SuperAdminDashboardPage from './pages/super-admin/page';
import { UserManagement } from './components/admin/UserManagement';
import { EmployerManagementNew } from './components/admin/EmployerManagementNew';
import { CompanyManagementNew } from './components/admin/CompanyManagementNew';
import { JobManagementEnhanced } from './components/admin/JobManagementEnhanced';
import { BlogManagement } from './components/admin/BlogManagement';
import { PaymentManagement } from './components/admin/PaymentManagement';
import { ReportManagement } from './components/admin/ReportManagement';
import { SiteManagement } from './components/admin/SiteManagement';

// Resume Builder components
import ResumeBuilder from './components/resume/ResumeBuilder';
import ResumeList from './components/resume/ResumeList';
import SharedResumeView from './components/resume/SharedResumeView';
import { useApp } from './pages/providers/AppProvider';
import { useData } from './context/DataContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - Auth state:', { isAuthenticated, user, loading, requiredRole });
  console.log('🛡️ ProtectedRoute - User type:', user?.user_type);
  console.log('🛡️ ProtectedRoute - Role check:', requiredRole ? (user?.user_type === requiredRole || user?.user_type === 'job_seeker' && requiredRole === 'jobseeker') : 'n/a');

  if (loading) {
    console.log('⏳ ProtectedRoute - Loading...');
    // Render a visible loading screen to avoid a blank page due to theme colors
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && !(user?.user_type === requiredRole || (requiredRole === 'jobseeker' && user?.user_type === 'job_seeker'))) {
    console.log('🚫 ProtectedRoute - Role mismatch, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Access granted');
  return <>{children}</>;
};

// Public Route component (redirect if already authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user && user.user_type) {
    // Redirect authenticated users to their respective dashboards
    if (user.user_type === 'job_seeker') {
      return <Navigate to="/jobseeker-dashboard" replace />;
    } else if (user.user_type === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (user.user_type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.user_type === 'super_admin') {
      return <Navigate to="/super-admin/dashboard" replace />;
    } else {
      // Fallback to home page
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// Wrapper component for EmployersPage with navigation
const EmployersPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigation = (page: string, companyName?: string) => {
    switch (page) {
      case 'company-detail':
        if (companyName) {
          navigate(`/company/${encodeURIComponent(companyName)}`);
        }
        break;
      case 'jobs':
        navigate('/jobs');
        break;
      default:
        navigate(`/${page}`);
    }
  };

  return <EmployersPage onNavigate={handleNavigation} />;
};

const AppRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { savedJobs, handleSaveJob, handleApplyJob, currentUser, applications } = useApp();
  const { jobs } = useData();
  
  const [showRecruitmentPopup, setShowRecruitmentPopup] = useState(false);

  // Force popup via query parameter override (e.g., ?showRecruitment=true or ?popup=recruitment)
  const params = new URLSearchParams(location.search);
  const forcePopup = params.get('showRecruitment') === 'true' || params.get('popup') === 'recruitment';

  useEffect(() => {
    // If forced by query param, show immediately regardless of user type or prior dismissals
    if (forcePopup) {
      setShowRecruitmentPopup(true);
      sessionStorage.setItem('megajob-recruitment-popup-shown', 'true');
      return;
    }

    // Determine if current route is a dashboard/admin route (hide popup on these unless forced)
    const dashboardRoutes = [
      '/jobseeker-dashboard',
      '/jobseeker/dashboard',
      '/employer/dashboard',
      '/admin',
      '/admin/dashboard',
      '/admin/users',
      '/admin/employers',
      '/admin/companies',
      '/admin/jobs',
      '/admin/blogs',
      '/admin/payments',
      '/admin/reports',
      '/admin/site',
      '/super-admin',
      '/super-admin/dashboard'
    ];
    const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));

    const sessionShown = sessionStorage.getItem('megajob-recruitment-popup-shown');

    // Always show immediately for non-logged-in users on public pages (no delay), but only once per session
    if (!isAuthenticated && !isDashboardRoute) {
      if (!sessionShown) {
        setShowRecruitmentPopup(true);
        sessionStorage.setItem('megajob-recruitment-popup-shown', 'true');
      }
      return;
    }

    // Do not show for employer/admin users unless forced
    if (user && (user.user_type === 'employer' || user.user_type === 'admin')) {
      return;
    }

    // Respect dismissal for logged-in users (one week cooldown)
    const dismissedRecently = localStorage.getItem('megajob-recruitment-popup-dismissed');
    if (dismissedRecently) {
      const dismissedTime = parseInt(dismissedRecently);
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissedTime > oneWeekAgo) {
        return;
      }
    }

    // Show only once per session
    if (sessionShown) {
      return;
    }

    // Default behavior: show after 10 seconds
    const timer = setTimeout(() => {
      setShowRecruitmentPopup(true);
      sessionStorage.setItem('megajob-recruitment-popup-shown', 'true');
    }, 10000);

    return () => clearTimeout(timer);
  }, [user, isAuthenticated, forcePopup, location.pathname]);

  const handleDismissPopup = () => {
    setShowRecruitmentPopup(false);
    localStorage.setItem('megajob-recruitment-popup-dismissed', String(Date.now()));
  };

  // Define dashboard routes that should not show the main header
  const dashboardRoutes = [
    '/jobseeker-dashboard',
    '/jobseeker/dashboard',
    '/employer/dashboard',
    // Hide main header across all admin area routes (including login)
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/employers',
    '/admin/companies',
    '/admin/jobs',
    '/admin/blogs',
    '/admin/payments',
    '/admin/reports',
    '/admin/site',
    // Hide header for all super-admin routes (login and dashboard)
    '/super-admin',
    '/super-admin/dashboard'
  ];
  
  const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardRoute && <RouterHeader />}
      {((!isDashboardRoute) || forcePopup) && showRecruitmentPopup && (
        <RecruitmentPopup 
          onClose={handleDismissPopup}
          onNavigate={(page: string) => navigate(`/${page}`)}
        />
      )}
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <Home 
              onNavigate={(page: string) => navigate(`/${page}`)}
              onViewJob={(id: string) => navigate(`/jobs/${id}`)}
              onViewCompany={(name: string) => navigate(`/company/${encodeURIComponent(name)}`)}
              filters={{
                location: '',
                type: '',
                category: '',
                salary: '',
                experience: ''
              }}
              onFilterChange={() => {}}
              onSaveJob={(id: string) => handleSaveJob(id)}
              savedJobs={savedJobs}
              isUserLoggedIn={isAuthenticated}
              onLoginRequired={() => navigate('/auth')}
            />
          } />
          <Route path="/jobs" element={
            <Jobs 
              onViewJob={(id: string) => navigate(`/jobs/${id}`)}
              onViewCompany={(name: string) => navigate(`/company/${encodeURIComponent(name)}`)}
              onSaveJob={(id: string) => handleSaveJob(id)}
              onApply={(id: string) => handleApplyJob(id)}
              savedJobs={savedJobs}
              isUserLoggedIn={isAuthenticated}
              onLoginRequired={() => navigate('/auth')}
            />
          } />
          <Route path="/megajobs" element={
            <Jobs 
              onViewJob={(id: string) => navigate(`/jobs/${id}`)}
              onViewCompany={(name: string) => navigate(`/company/${encodeURIComponent(name)}`)}
              onSaveJob={(id: string) => handleSaveJob(id)}
              onApply={(id: string) => handleApplyJob(id)}
              savedJobs={savedJobs}
              isUserLoggedIn={isAuthenticated}
              onLoginRequired={() => navigate('/auth')}
              filter={{ type: 'tier', value: 'megajob' }}
            />
          } />
          <Route path="/jobs/:id" element={<JobDetailsRoute />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/employers" element={<EmployersPageWrapper />} />
          <Route path="/company/:id" element={
            <CompanyDetailPage 
              companyName=""
              jobs={[]}
              onViewJob={(id: string) => navigate(`/jobs/${id}`)}
              onSaveJob={(id: string) => handleSaveJob(id)}
              savedJobs={savedJobs}
              onNavigate={(path: string) => navigate(path)}
            />
          } />
          <Route path="/jobs/map" element={
            <JobMapView 
              onViewJob={(id: string) => navigate(`/jobs/${id}`)}
              onSaveJob={(id: string) => handleSaveJob(id)}
              savedJobs={savedJobs}
              isUserLoggedIn={isAuthenticated}
              onLoginRequired={() => navigate('/auth')}
            />
          } />
          <Route path="/performance" element={
            <PerformanceMonitor name="App Performance">
              <div>Performance monitoring content</div>
            </PerformanceMonitor>
          } />
          
          <Route path="/emergency" element={<EmergencyApp />} />
          
          {/* Public resume sharing route */}
          <Route path="/resume/shared/:token" element={<SharedResumeView />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/register" element={<SignInPage />} />
          <Route path="/auth" element={<SignInPage />} />
          {/* Forgot/Reset Password routes */}
          <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordRoute />} />
          <Route path="/auth/reset-password-otp" element={<ResetPasswordOtpRoute />} />
          <Route path="/reset-password" element={<ResetPasswordRoute />} />
          <Route path="/auth/reset-password" element={<ResetPasswordRoute />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
          <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />

          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />

          {/* Resume Builder routes */}
          <Route 
            path="/resumes" 
            element={
              <ProtectedRoute>
                <ResumeList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-builder" 
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-builder/:id" 
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            } 
          />
          
          {/* JobSeeker routes */}
          <Route 
            path="/jobseeker-dashboard" 
            element={
              <ProtectedRoute requiredRole="job_seeker">
                <JobSeekerLayout />
              </ProtectedRoute>
            } 
          />
          {/* Redirect legacy jobseeker path to canonical */}
          <Route 
            path="/jobseeker/dashboard" 
            element={<Navigate to="/jobseeker-dashboard" replace />} 
          />

          {/* Employer routes */}
          <Route 
            path="/employer/dashboard" 
            element={
              <EmployerLayout />
            } 
          />
          <Route 
            path="/employer-dashboard" 
            element={<Navigate to="/employer/dashboard" replace />} 
          />

          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          {/* Super Admin routes */}
          <Route 
            path="/super-admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <ErrorBoundary>
                  <SuperAdminDashboardPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement 
                  users={[]}
                  onUserUpdate={() => {}}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/employers" 
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployerManagementNew 
                  companies={[]}
                  jobs={[]}
                  applications={[]}
                  onCompanyUpdate={() => {}}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/companies" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CompanyManagementNew 
                  companies={[]}
                  onCompanyUpdate={() => {}}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/jobs" 
            element={
              <ProtectedRoute requiredRole="admin">
                <JobManagementEnhanced 
                  jobs={[]}
                  companies={[]}
                  onJobUpdate={() => {}}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/blogs" 
            element={
              <ProtectedRoute requiredRole="admin">
                <BlogManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute requiredRole="admin">
                <PaymentManagement 
                  jobs={[]}
                  companies={[]}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ReportManagement 
                  jobs={[]}
                  users={[]}
                  applications={[]}
                  companies={[]}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/site" 
            element={
              <ProtectedRoute requiredRole="admin">
                <SiteManagement />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isDashboardRoute && <RouterFooter />}
    </div>
  );
};

// Wrapper component to provide proper props to JobDetails using app/data contexts
const JobDetailsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs } = useData();
  const { currentUser, applications, savedJobs, handleApplyJob, handleSaveJob } = useApp();

  const job = jobs.find((j: any) => j.id === id);
  const relatedJobs = jobs.filter((j: any) => j.id !== id).slice(0, 6);
  const isSaved = id ? savedJobs.includes(id) : false;
  const hasApplied = id && currentUser ? applications.some(a => a.jobId === id && a.userId === currentUser.id) : false;

  return (
    <JobDetails 
      job={job as any}
      relatedJobs={relatedJobs as any}
      onApply={(jobId: string, applicationData?: any) => handleApplyJob(jobId, applicationData)}
      onSave={(jobId: string) => handleSaveJob(jobId)}
      isSaved={!!isSaved}
      hasApplied={!!hasApplied}
      onViewJob={(jobId: string) => navigate(`/jobs/${jobId}`)}
      currentUser={currentUser}
    />
  );
};

// Wrapper route components for Forgot/Reset Password flows
const ForgotPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ForgotPasswordForm onBackToLogin={() => navigate('/login')} />
  );
};

const ResetPasswordOtpRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';

  if (!email) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  return (
    <ResetPasswordWithOtpForm
      email={email}
      onSuccess={() => navigate('/login')}
      onBackToLogin={() => navigate('/login')}
    />
  );
};

const ResetPasswordRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token') || '';

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <ResetPasswordForm
      resetToken={token}
      onSuccess={() => navigate('/login')}
      onBackToLogin={() => navigate('/login')}
    />
  );
};

export default AppRouter;
