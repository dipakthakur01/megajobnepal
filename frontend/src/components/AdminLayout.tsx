import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { NewAdminPanel } from './NewAdminPanel';
import { useApp } from '@/pages/providers/AppProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';

export function AdminLayout() {
  const [currentPage, setCurrentPage] = useState('admin-login');
  
  const { 
    currentUser, 
    setCurrentUser,
    jobs,
    users,
    applications,
    companies,
    setJobs,
    setUsers,
    setCompanies
  } = useApp();

  const { user: authUser, isAuthenticated, logout: authLogout, loading } = useAuth();
  const { confirm } = useConfirm();

  // Check URL path and authentication, sync with AuthContext
  useEffect(() => {
    if (isAuthenticated && authUser && authUser.user_type === 'admin' && authUser.id) {
      // Sync AuthContext user with AppProvider format
      if (!currentUser || currentUser.id !== authUser.id) {
        setCurrentUser({
          id: authUser.id,
          name: authUser.full_name || authUser.email,
          email: authUser.email,
          type: 'admin',
          profile: {
            skills: [],
            experience: '',
            resume: ''
          }
        });
      }
      setCurrentPage('admin-panel');
      window.history.pushState({}, '', '/admin');
    } else if (!loading && !isAuthenticated) {
      setCurrentUser(null);
      setCurrentPage('admin-login');
      window.history.pushState({}, '', '/admin/login');
    }
  }, [isAuthenticated, authUser, currentUser, setCurrentUser]);

  const handleAdminLogin = (user: any) => {
    setCurrentUser(user);
    setCurrentPage('admin-panel');
    window.history.pushState({}, '', '/admin');
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

  const renderPage = () => {
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

    switch (currentPage) {
      case 'admin-panel':
        if (!isAuthenticated || !authUser || authUser.user_type !== 'admin') {
          return (
            <AdminLogin 
              onLogin={handleAdminLogin}
              onBackToWebsite={handleBackToWebsite}
            />
          );
        }
        
        return (
          <NewAdminPanel
            jobs={jobs}
            users={users}
            applications={applications}
            companies={companies}
            onJobUpdate={setJobs}
            onUserUpdate={setUsers}
            onCompanyUpdate={setCompanies}
            currentUser={currentUser}
            onBackToWebsite={handleBackToWebsite}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <AdminLogin 
            onLogin={handleAdminLogin}
            onBackToWebsite={handleBackToWebsite}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}

