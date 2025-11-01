'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './Header';
import { FooterEnhanced } from './FooterEnhanced';
import { ScrollToTop } from '../components/ScrollToTop';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from '@/components/auth/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Get current page from pathname
  const getCurrentPage = () => {
    if (pathname === '/') return 'home';
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || 'home';
  };

  const handleNavigation = (page: string, filter?: { type: string; value: string }) => {
    switch (page) {
      case 'home':
        router.push('/');
        break;
      case 'jobs':
        router.push('/jobs');
        break;
      case 'employers':
        router.push('/employers');
        break;
      case 'about':
        router.push('/about');
        break;
      case 'blogs':
        router.push('/blogs');
        break;
      case 'contact':
        router.push('/contact');
        break;
      case 'jobseeker-dashboard':
        router.push('/jobseeker-dashboard');
        break;
      case 'employer-dashboard':
        router.push('/employer/dashboard');
         break;
      default:
        router.push(`/${page}`);
        break;
    }
  };

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'default'
    });
    
    if (!confirmed) return;
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    // Optionally redirect to dashboard based on user type
    if (user?.user_type === 'job_seeker') {
      router.push('/jobseeker-dashboard');
    } else if (user?.user_type === 'employer') {
      router.push('/employer/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onNavigate={handleNavigation} 
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentPage={getCurrentPage()}
      />
      <main className="flex-1">
        {children}
      </main>
      <FooterEnhanced />
      <ScrollToTop />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

