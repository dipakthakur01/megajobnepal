import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Check, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { OTPVerificationForm } from './OTPVerificationForm';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: (user?: any) => void;
}

type AuthMode = 'login' | 'signup' | 'otp';

export function AuthForm({ initialMode = 'login', onSuccess }: AuthFormProps) {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'job_seeker' as 'job_seeker' | 'employer',
    companyName: ''
  });

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Reset form when mode changes
  useEffect(() => {
    setError('');
    if (mode !== 'otp') {
      setFormData(prev => ({
        email: rememberMe ? prev.email : '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'job_seeker',
        companyName: ''
      }));
    }
  }, [mode, rememberMe]);

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 AuthForm - handleSubmit called!');
    console.log('🔍 AuthForm - Mode:', mode);
    console.log('🔍 AuthForm - Form data:', { email: formData.email, passwordLength: formData.password?.length });
    
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        console.log('🔄 AuthForm - Calling signIn...');
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          toast.error(result.error);
          setError(result.error);
        } else {
          // Handle Remember Me functionality
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          toast.success('Successfully signed in!');
          onSuccess?.(result.user);
        }
      } else if (mode === 'signup') {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }

        const fullNameOrCompany = formData.role === 'employer'
          ? formData.companyName.trim()
          : `${formData.firstName} ${formData.lastName}`.trim();

        const result = await signUp({
          email: formData.email,
          password: formData.password,
          full_name: fullNameOrCompany,
          user_type: formData.role,
          phone_number: formData.phoneNumber,
          company_data: formData.role === 'employer' ? {
            name: formData.companyName.trim(),
            description: '',
            location: '',
            industry: '',
            size: ''
          } : undefined
        });

        if (result.error) {
          toast.error(result.error);
          setError(result.error);
        } else {
          // Success - transition to OTP verification
          setPendingEmail(formData.email);
          setMode('otp');
          toast.success('SMS code successfully sent');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      setError('An unexpected error occurred');
    }
  };

  const handleOTPSuccess = () => {
    // After signup verification, do not auto-login. Switch to login mode.
    toast.success('Account created successfully. Please log in to continue.');
    setMode('login');
    setFormData(prev => ({
      ...prev,
      email: pendingEmail || prev.email,
      password: '',
      confirmPassword: ''
    }));
    onSuccess?.();
  };

  const handleBackFromOTP = () => {
    setMode('signup');
    setPendingEmail('');
  };

  if (mode === 'otp') {
    return (
      <OTPVerificationForm
        tempSignupId={pendingEmail}
        email={pendingEmail}
        onSuccess={handleOTPSuccess}
        onBack={handleBackFromOTP}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-1 text-xs text-gray-600">
          {mode === 'login' 
            ? 'Sign in to your account to continue' 
            : 'Fill in your details to get started'
          }
        </p>
      </div>



      {error && (
        <div className="mb-2 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Signup Fields */}
        {mode === 'signup' && (
          <>
            {formData.role === 'job_seeker' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Last name"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="job_seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>
          </>
        )}

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-none p-0 h-auto leading-none bg-transparent no-hover-transform"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password for Signup */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        )}

        {/* Remember Me and Forgot Password (Login only) */}
        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {mode === 'login' ? 'Signing in...' : 'Creating account...'}
            </div>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}