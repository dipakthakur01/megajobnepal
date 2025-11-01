import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../../lib/api-client';
import { User } from '../../lib/postgresql-types';
import { postgresqlAuthService } from '../../lib/postgresql-auth';
import { safeStorage } from '../../lib/safe-storage';
import { toast } from 'sonner';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: User }>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    user_type: 'job_seeker' | 'employer';
    phone_number?: string;
    company_data?: {
      name: string;
      description: string;
      website?: string;
      location: string;
      industry: string;
      size: string;
      founded_year?: number;
      employer_job_title?: string;
      employer_department?: string;
    };
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for compatibility
  verifyOTP: (otp: string) => Promise<{ error?: string }>;
  resendOTP: () => Promise<{ error?: string }>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string, otp?: string) => Promise<{ error?: string }>;
  sendAdminPasswordOTP: () => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>;
  uploadProfileImage: (file: File) => Promise<{ error?: string; imageUrl?: string }>;
  uploadResume: (file: File) => Promise<{ error?: string; resumeUrl?: string; fileName?: string }>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 AuthContext - Initializing auth...');
        const token = safeStorage.getItem('megajobnepal_auth_token');
        console.log('🔍 AuthContext - Token found:', !!token);
        
        if (token) {
          console.log('🔄 AuthContext - Getting profile...');
          const profileResponse = await apiClient.getProfile();
          console.log('🔍 AuthContext - Profile response:', profileResponse);
          
          if (profileResponse && profileResponse.user) {
            console.log('🔍 AuthContext - Setting user:', profileResponse.user);
            console.log('🔍 AuthContext - User type:', profileResponse.user.user_type);
            setUser(profileResponse.user);
          } else {
            console.log('⚠️ AuthContext - No profile data, removing token');
            safeStorage.removeItem('megajobnepal_auth_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        safeStorage.removeItem('megajobnepal_auth_token');
      } finally {
        console.log('✅ AuthContext - Initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string; user?: User }> => {
    console.log('🚀 AuthContext - signIn function called!');
    console.log('🔍 AuthContext - Email:', email);
    console.log('🔍 AuthContext - Password length:', password?.length);
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 AuthContext - Signing in...');
      const result = await apiClient.login({ email, password });
      console.log('🔍 AuthContext - Login result:', result);
      
      if (!result.token) {
        console.log('⚠️ AuthContext - No token in response');
        setError(result.error || 'Login failed');
        return { error: result.error || 'Login failed' };
      }

      console.log('🔍 AuthContext - User data from login:', result.user);
      console.log('🔍 AuthContext - User type from login:', result.user?.user_type);

      // Store token and user
      safeStorage.setItem('megajobnepal_auth_token', result.token);
      setUser(result.user);
      
      return { user: result.user };
    } catch (error) {
      const status = (error as any)?.status;
      let errorMessage = 'Sign in failed';
      if (status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (status === 403) {
        errorMessage = 'Access denied. Please contact an administrator to request access.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('❌ AuthContext - Sign in error:', error);
      toast.error(errorMessage);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    full_name: string;
    user_type: 'job_seeker' | 'employer';
    phone_number?: string;
    company_data?: {
      name: string;
      description: string;
      website?: string;
      location: string;
      industry: string;
      size: string;
      founded_year?: number;
      employer_job_title?: string;
      employer_department?: string;
    };
  }): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      // First, send OTP to email
      const otpResult = await apiClient.sendOTP(userData.email);
      
      if (!otpResult.message) {
        const errorMsg = otpResult.error || 'Failed to send OTP email';
        toast.error(errorMsg);
        return { error: errorMsg };
      }

      // Store email and user data for OTP verification (we'll register after OTP verification)
      setPendingUserId(userData.email);
      setPendingUserData({
        email: userData.email,
        password: userData.password,
        fullName: userData.full_name,
        userType: userData.user_type,
        phone: userData.phone_number,
        companyData: userData.company_data
      });
      
      return {};
    } catch (error) {
      let errorMessage = 'Sign up failed';
      
      if (error instanceof Error) {
        // Check for specific error messages from the server
        if (error.message.includes('An account with this email already exists')) {
          errorMessage = error.message; // Use the exact server message
        } else if (error.message.includes('User already exists')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('409')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      if (!pendingUserId || !pendingUserData) {
        const errorMsg = 'No pending verification found';
        toast.error(errorMsg);
        return { error: errorMsg };
      }

      // Complete the signup with OTP verification
      const registerResult = await apiClient.completeSignup({
        email: pendingUserData.email,
        password: pendingUserData.password,
        user_type: pendingUserData.userType,
        full_name: pendingUserData.fullName,
        otp: otp,
        phone_number: pendingUserData.phone,
        company_data: pendingUserData.companyData
          ? {
              // Map frontend keys to backend expected schema
              company_name: pendingUserData.companyData.name,
              company_description: pendingUserData.companyData.description,
              company_website: pendingUserData.companyData.website,
              company_location: pendingUserData.companyData.location,
              company_industry: pendingUserData.companyData.industry,
              company_size: pendingUserData.companyData.size,
              company_founded_year: pendingUserData.companyData.founded_year,
              employer_job_title: pendingUserData.companyData.employer_job_title,
              employer_department: pendingUserData.companyData.employer_department,
            }
          : undefined,
      });

      if (registerResult.token) {
        // Do not auto-login after successful signup verification.
        // Clear pending state and prompt user to log in manually.
        setPendingUserId(null);
        setPendingUserData(null);
        toast.success('Account created successfully. Please log in to continue.');
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (): Promise<{ error?: string }> => {
    try {
      setError(null);

      if (!pendingUserId) {
        const errorMsg = 'No pending verification found';
        toast.error(errorMsg);
        return { error: errorMsg };
      }

      // Resend OTP by calling sendOTP again
      const result = await apiClient.sendOTP(pendingUserId);
      
      if (!result.message) {
        const errorMsg = result.error || 'Failed to resend OTP';
        toast.error(errorMsg);
        return { error: errorMsg };
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      setError(null);

    const result = await postgresqlAuthService.forgotPassword(email);
      
      if (!result.success) {
        setError(result.error || 'Failed to send reset email');
        return { error: result.error || 'Failed to send reset email' };
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      setError(null);

    const result = await postgresqlAuthService.resetPassword(token, newPassword);
      
      if (!result.success) {
        setError(result.error || 'Failed to reset password');
        return { error: result.error || 'Failed to reset password' };
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const sendAdminPasswordOTP = async (): Promise<{ error?: string }> => {
    try {
      setError(null);
      if (!user) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }
      if (user.user_type !== 'admin') {
        setError('Not authorized');
        return { error: 'Not authorized' };
      }
      const result = await apiClient.adminSendPasswordOTP();
      if (result?.message) {
        toast.success('OTP sent to admin email');
        return {};
      } else {
        const msg = result?.error || 'Failed to send OTP';
        setError(msg);
        toast.error(msg);
        return { error: msg };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, otp?: string): Promise<{ error?: string }> => {
    try {
      setError(null);

      if (!user) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }

      if (user.user_type === 'admin') {
        const result = await apiClient.adminChangePassword({ currentPassword, newPassword });
        if (result?.message || result?.success) {
          toast.success('Password changed successfully');
          return {};
        } else {
          const msg = result?.error || 'Failed to change password';
          setError(msg);
          return { error: msg };
        }
      }

      if (!user.id) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }

    const result = await postgresqlAuthService.changePassword(user.id, currentPassword, newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully');
        return {};
      } else {
        setError(result.error || 'Failed to change password');
        return { error: result.error || 'Failed to change password' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error?: string }> => {
    try {
      setError(null);

      if (!user?._id) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }

      const response = await apiClient.updateProfile(updates);
      
      if (response && response.user) {
        setUser(response.user);
        toast.success('Profile updated successfully');
        return {};
      } else {
        setError('Failed to update profile');
        return { error: 'Failed to update profile' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const uploadProfileImage = async (file: File): Promise<{ error?: string; imageUrl?: string }> => {
    try {
      setError(null);

      if (!user?._id) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }

      const response = await apiClient.uploadProfileImage(file);
      
      if (response && response.imageUrl) {
        toast.success('Profile image uploaded successfully');
        // Refresh user from backend to ensure consistent shape and fields
        try {
          const refreshed = await apiClient.getProfile();
          if (refreshed && refreshed.user) {
            setUser(refreshed.user);
          } else {
            // Fallback: update just the field locally
            setUser(prev => prev ? { ...prev, profileImage: response.imageUrl } : null);
          }
        } catch {
          setUser(prev => prev ? { ...prev, profileImage: response.imageUrl } : null);
        }
        return { imageUrl: response.imageUrl };
      } else {
        setError('Failed to upload profile image');
        return { error: 'Failed to upload profile image' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile image';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const uploadResume = async (file: File): Promise<{ error?: string; resumeUrl?: string; fileName?: string }> => {
    try {
      setError(null);

      if (!user?._id) {
        setError('Not authenticated');
        return { error: 'Not authenticated' };
      }

      const response = await apiClient.uploadResume(file);
      
      if (response && response.resumeUrl) {
        // Update user with new resume URL and filename
        setUser(prev => prev ? { 
          ...prev, 
          resume: response.resumeUrl,
          resumeFileName: response.fileName 
        } : null);
        toast.success('Resume uploaded successfully');
        return { resumeUrl: response.resumeUrl, fileName: response.fileName };
      } else {
        setError('Failed to upload resume');
        return { error: 'Failed to upload resume' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload resume';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      safeStorage.removeItem('megajobnepal_auth_token');
      setUser(null);
      setPendingUserId(null);
      setPendingUserData(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && !!safeStorage.getItem('megajobnepal_auth_token'),
    error,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias for compatibility
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    sendAdminPasswordOTP,
    updateProfile,
    uploadProfileImage,
    uploadResume,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
