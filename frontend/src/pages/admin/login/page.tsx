import { AdminLogin } from '@/components/AdminLogin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // If already authenticated as admin, go straight to dashboard
  // If authenticated as super_admin, redirect to super-admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.user_type === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleAdminLogin = (_user: any) => {
    navigate('/admin/dashboard');
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  return (
    <AdminLogin 
      onLogin={handleAdminLogin}
      onBackToWebsite={handleBackToWebsite}
    />
  );
}
