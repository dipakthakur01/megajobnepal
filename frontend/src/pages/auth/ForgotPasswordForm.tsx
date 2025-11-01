import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface ForgotPasswordFormProps {
  onSuccess?: (resetToken?: string) => void;
  onBack?: () => void;
  onBackToLogin?: () => void; // Added for compatibility
}

export function ForgotPasswordForm({ onSuccess, onBack, onBackToLogin }: ForgotPasswordFormProps) {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    setValidationError('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    try {
      const result = await forgotPassword(email);
      if (!result.error) {
        setIsSubmitted(true);
        onSuccess?.();
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <p className="text-sm text-gray-600">
            If an account with <span className="font-semibold">{email}</span> exists, 
            you will receive a password reset link shortly.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again with a different email address.
            </p>
            
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                clearError();
              }}
              className="w-full"
            >
              Try Different Email
            </Button>
            
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Reset Password</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

