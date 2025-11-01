import React, { useState, useEffect } from 'react';
import { LoginModal } from './LoginModal';
import { useApp } from '../pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import { JobSeekerDashboard } from './JobSeekerDashboard';
import { useNavigate } from 'react-router-dom';

export function JobSeekerLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    setCurrentUser,
    jobs = [],
    applications = [],
    setApplications,
    savedJobs = [],
    handleSaveJob,
    handleApplyJob,
    companies = [],
    followedCompanies = [],
    handleFollowCompany,
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
        navigate('/admin/dashboard', { replace: true });
        return;
      } else if (authUser.user_type === 'employer') {
        // Employers should be redirected to employer dashboard
        navigate('/employer/dashboard', { replace: true });
        return;
      }
    } else if (!isAuthenticated && !loading) {
      // Show login modal for unauthenticated users
      setShowLoginModal(true);
    }
  }, [isAuthenticated, authUser, currentUser, setCurrentUser, loading, navigate]);

  const handleBackToWebsite = () => {
    navigate('/', { replace: true });
  };

  const handleLoginSuccess = (user: any) => {
    // Use robust detection for job seeker type
    const userType = user.user_type || user.role || user.type;
    const normalizedType = (userType || '').toString().toLowerCase().replace('-', '_');
    if (normalizedType === 'job_seeker' || normalizedType === 'jobseeker') {
      setCurrentUser({
        id: user.id || '',
        name: user.full_name || user.email || '',
        email: user.email || '',
        type: 'jobseeker' as const,
        profile: {
          skills: [],
          experience: '',
          resume: ''
        }
      });
      setShowLoginModal(false);
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
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setCurrentUser(null);
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
                onClose={() => navigate('/', { replace: true })}
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
      <div className="bg-card border-b border-border pr-6 py-4 pl-16 md:pl-64">
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

      {(() => {
        const normalizedType = ((authUser as any)?.user_type || '').toString().toLowerCase().replace('-', '_');
        const isJobSeeker = normalizedType === 'job_seeker' || normalizedType === 'jobseeker';
        const effectiveUser = currentUser || (
          isAuthenticated && isJobSeeker
            ? {
                id: (authUser as any)?.id || (authUser as any)?._id || '',
                name: authUser.full_name || authUser.email || '',
                email: authUser.email || '',
                type: 'jobseeker' as const,
                profile: {
                  skills: [],
                  experience: '',
                  resume: ''
                }
              }
            : null
        );
        if (!effectiveUser) {
          return (
            <div className="p-6">
              <div className="bg-white border rounded-md p-6 text-center">
                <p className="text-gray-700">We couldn’t load your profile. Please sign in again.</p>
                <Button className="mt-4" onClick={() => navigate('/auth')}>Go to Sign In</Button>
              </div>
            </div>
          );
        }
        return (
          <JobSeekerDashboard
            user={effectiveUser}
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
        );
      })()}
    </div>
  );
}

