import React, { useState, useEffect } from 'react';
import { LoginModal } from '../components/LoginModal';
import { useApp } from './providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from '../components/ui/button';
import { Globe } from 'lucide-react';
import { JobSeekerDashboard } from '../components/JobSeekerDashboard';

export function JobSeekerLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { 
    currentUser, 
    setCurrentUser,
    jobs = [],
    applications = [],
    setApplications,
    savedJobs = [],
    companies = [],
    followedCompanies = [],
    handleSaveJob,
    handleApplyJob,
    handleFollowCompany
  } = useApp();

  const { user: authUser, isAuthenticated, logout: authLogout, loading } = useAuth();
  const { confirm } = useConfirm();

  // Check authentication status and sync with app provider
  useEffect(() => {
    if (isAuthenticated && authUser) {
      // For job seeker dashboard, accept only job_seeker user_type
      if (authUser.user_type === 'job_seeker') {
        // Sync AuthContext user with AppProvider format
        if (!currentUser || currentUser.id !== authUser.id) {
          setCurrentUser({
            id: authUser.id || '',
            name: authUser.full_name || authUser.email || '',
            email: authUser.email || '',
            type: 'jobseeker' as const,
            profile: {
              skills: [],
              experience: '',
              resume: ''
            }
          });
        }
        setShowLoginModal(false);
      } else if (authUser.user_type === 'admin') {
        // Admins should be redirected to admin dashboard
        window.location.href = '/admin';
        return;
      } else if (authUser.user_type === 'employer') {
        // Employers should be redirected to employer dashboard
        window.location.href = '/employer/dashboard';
        return;
      }
    } else if (!isAuthenticated && !loading) {
      // Show login modal for unauthenticated users
      setShowLoginModal(true);
    }
  }, [isAuthenticated, authUser, currentUser, setCurrentUser, loading]);

  const handleLoginSuccess = (user: any) => {
    console.log('Login success callback received user:', user);
    
    // Handle both AuthContext user format and legacy format
    if (user) {
      // If it's an AuthContext user (from signIn), it will have user_type
      if (user.user_type === 'job_seeker') {
        const formattedUser = {
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          type: 'jobseeker' as const,
          profile: {
            skills: [],
            experience: '',
            resume: ''
          }
        };
        setCurrentUser(formattedUser);
        setShowLoginModal(false);
      }
      // If it's already in legacy format (type: 'jobseeker')
      else if (user.type === 'jobseeker') {
        setCurrentUser(user);
        setShowLoginModal(false);
      }
    }
  };

  const handleBackToWebsite = () => {
    window.location.href = '/';
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

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated or not a job seeker
  // Only show login screen if we're sure authentication has completed (loading is false)
  if (!loading && (!isAuthenticated || !authUser || authUser.user_type !== 'job_seeker')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Job Seeker Dashboard</h1>
            <p className="text-muted-foreground">Sign in as a job seeker to access your dashboard</p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={handleBackToWebsite}
                className="flex items-center gap-2 mx-auto"
              >
                <Globe className="h-4 w-4" />
                Back to Website
              </Button>
            </div>

            <div className="relative">
              <LoginModal
                isOpen={true}
                onClose={() => window.location.href = '/'}
                onLoginSuccess={handleLoginSuccess}
                targetUserType="jobseeker"
              />
            </div>


          </div>
        </div>
      </div>
    );
  }

  // Show job seeker dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back to website button */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Job Seeker Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToWebsite}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Back to Website
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {currentUser && (
        <JobSeekerDashboard
          user={currentUser}
          jobs={jobs}
          applications={applications}
          onApplicationUpdate={setApplications}
          onLogout={handleLogout}
          savedJobs={savedJobs}
          onToggleSaveJob={handleSaveJob}
          onApplyJob={handleApplyJob}
          companies={companies}
          followedCompanies={followedCompanies}
          onToggleFollowCompany={handleFollowCompany}
        />
      )}
    </div>
  );
}

