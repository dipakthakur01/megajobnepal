import React, { useState, useEffect } from 'react';
import { LoginModal } from './LoginModal';
import { useApp } from '../pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button } from './ui/button';
import { Globe, Briefcase, Users, BarChart3, Building2, FilePlus, Search } from 'lucide-react';
import { EmployerDashboard } from './EmployerDashboard';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { safeStorage } from '../lib/safe-storage';

export function EmployerLayout() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    setCurrentUser,
    jobs = [],
    applications = [],
    setApplications
  } = useApp();

  const { user: authUser, isAuthenticated, logout: authLogout, loading } = useAuth();
  const { confirm } = useConfirm();

  // Sync auth user to app provider and redirect non-employer types
  useEffect(() => {
    if (isAuthenticated && authUser) {
      if (authUser.user_type === 'employer') {
        if (!currentUser || currentUser.id !== authUser.id) {
          setCurrentUser({
            id: authUser.id || '',
            name: authUser.full_name || authUser.email || 'User',
            email: authUser.email || '',
            type: 'employer',
            profile: { skills: [], experience: '', resume: '' }
          });
        }
        setShowLoginModal(false);
      } else if (authUser.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      } else if (authUser.user_type === 'job_seeker') {
        navigate('/jobseeker-dashboard', { replace: true });
        return;
      }
    } else if (!loading) {
      // Show login modal only when explicitly unauthenticated
      setShowLoginModal(true);
    }
  }, [isAuthenticated, authUser, currentUser, setCurrentUser, loading, navigate]);

  // Read persisted sidebar state safely at top-level
  useEffect(() => {
    if (isAuthenticated && authUser?.user_type === 'employer') {
      try {
        const uid = authUser?.id || 'anonymous';
        const stored = localStorage.getItem(`employer_sidebar_collapsed_${uid}`);
        if (stored !== null) setSidebarCollapsed(stored === 'true');
      } catch {}
    }
  }, [isAuthenticated, authUser]);

  const handleLoginSuccess = (user: any) => {
    if (user && user.type === 'employer') {
      setCurrentUser(user);
      setShowLoginModal(false);
    }
  };

  const handleBackToWebsite = () => {
    navigate('/', { replace: true });
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

  // Minimal, static gating to prevent UI blinking
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <img src={'/CompanyLogo.png'} alt="MegaJob Nepal" width={100} height={100} className="object-contain mx-auto mb-4 opacity-90" />
          <p className="text-muted-foreground">Connecting to your employer account…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && authUser?.user_type === 'employer') {
    const headerOffset = sidebarCollapsed ? 'ml-16 md:ml-16' : 'ml-64 md:ml-64';
    return (
      <div className="min-h-screen bg-background">
        <div className={`bg-card border-b border-border px-6 py-4 ${headerOffset}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Employer Dashboard</h1>
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
        <div className="px-2 sm:px-4 lg:px-6 py-4">
          <ErrorBoundary>
            <EmployerDashboard 
              user={{ id: authUser.id || '', name: authUser.full_name || authUser.email || 'User', email: authUser.email || '', type: 'employer', profile: { skills: [], experience: '', resume: '' } } as any} 
              jobs={jobs} 
              applications={applications} 
              onApplicationUpdate={setApplications} 
              onLogout={handleLogout}
              onSidebarCollapsedChange={setSidebarCollapsed}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Simple login screen without animations
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Employer Dashboard</h1>
          <p className="text-muted-foreground">Sign in as an employer to access your dashboard</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="text-center mb-6">
            <Button variant="outline" onClick={handleBackToWebsite} className="flex items-center gap-2 mx-auto">
              <Globe className="h-4 w-4" />
              Back to Website
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={() => setShowLoginModal(true)} className="w-full">
              Sign In as Employer
            </Button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

