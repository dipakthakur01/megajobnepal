import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'employer' | 'job_seeker' | 'hr';
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole, 
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.user_type !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAuth?: boolean;
    requiredRole?: 'admin' | 'employer' | 'job_seeker' | 'hr';
  }
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard 
        requireAuth={options?.requireAuth} 
        requiredRole={options?.requiredRole}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}

