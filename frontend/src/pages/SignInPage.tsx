import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

export const SignInPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect already logged-in users to their respective dashboards
  useEffect(() => {
    console.log('🔍 SignInPage useEffect - Auth state check:');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user.user_type:', user?.user_type);
    console.log('user.user_type === "job_seeker":', user?.user_type === 'job_seeker');
    
    if (isAuthenticated && user) {
      if (user.user_type === 'job_seeker') {
        console.log('🔄 Redirecting job seeker to dashboard');
        navigate('/jobseeker-dashboard');
      } else if (user.user_type === 'employer') {
        console.log('🔄 Redirecting employer to dashboard');
        navigate('/employer/dashboard');
      } else if (user.user_type === 'admin') {
        console.log('🔄 Redirecting admin to dashboard');
        navigate('/admin/dashboard');
      }
    } else {
      console.log('❌ No user_type found or not authenticated');
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuthSuccess = (userData?: any) => {
    // Use userData from callback if available, otherwise fall back to context user
    const userToUse = userData || user;
    
    // Get user data to determine role-based routing
    if (userToUse && userToUse.user_type) {
      // Route based on user type
      if (userToUse.user_type === 'job_seeker') {
        navigate('/jobseeker-dashboard');
      } else if (userToUse.user_type === 'employer') {
        navigate('/employer/dashboard');
      } else if (userToUse.user_type === 'admin') {
        navigate('/admin/dashboard');
      } else if (userToUse.user_type === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else {
        console.log('🔄 SignInPage - handleAuthSuccess unknown type, redirecting to home');
        // Fallback to home page
        navigate('/');
      }
    } else {
      console.log('⚠️ SignInPage - handleAuthSuccess no user data, redirecting to home');
      // If no user data available, fallback to home page
      navigate('/');
    }
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          {/* Company Logo */}
          <div className="flex justify-center mb-3">
            <img 
              src="/CompanyLogo.png" 
              alt="Company Logo" 
              className="h-12 w-auto"
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {authMode === 'login' 
              ? 'Sign in to your account or create a new one' 
              : 'Create your account or sign in to an existing one'
            }
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-6 px-4 shadow-xl rounded-2xl sm:px-8">
          {/* Toggle buttons */}
          <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={handleSwitchToLogin}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={handleSwitchToSignup}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Form */}
          <AuthForm
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
          />
        </div>

        <div className="mt-4 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};