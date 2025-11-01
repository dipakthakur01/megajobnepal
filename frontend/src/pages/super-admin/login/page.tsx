import { SuperAdminLogin } from '@/components/SuperAdminLogin';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { useEffect } from 'react';

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // If already authenticated as super_admin, go to super admin dashboard
  // If authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.user_type === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (user.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleLogin = (_user: any) => {
    navigate('/super-admin/dashboard');
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  return (
    <SuperAdminLogin 
      onLogin={handleLogin}
      onBackToWebsite={handleBackToWebsite}
    />
  );
}