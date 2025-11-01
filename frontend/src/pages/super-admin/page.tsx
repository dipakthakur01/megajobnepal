// import removed: NewAdminPanel is not used here
import { useApp } from '@/pages/providers/AppProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { SuperAdminPanel } from './SuperAdminPanel';

export default function SuperAdminDashboard() {
  const { 
    jobs, 
    users, 
    applications, 
    companies, 
    currentUser,
    setJobs,
    setUsers,
    setCompanies
  } = useApp();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Check if user is authenticated and is super_admin using AuthContext
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.user_type !== 'super_admin')) {
      navigate('/super-admin/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.user_type !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please login to access the super admin panel.</p>
          <button 
            onClick={() => navigate('/super-admin/login')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Go to Super Admin Login
          </button>
        </div>
      </div>
    );
  }

  return <SuperAdminPanel />;
}