import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface ForgotPasswordFormProps {
  onSuccess?: (resetToken?: string) => void;
  onBack?: () => void;
  onBackToLogin?: () => void; // Added for compatibility
}

export function ForgotPasswordForm({ onSuccess, onBack, onBackToLogin }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.sendPasswordChangeOtp(email);
      if (res?.message) {
        setIsSubmitted(true);
        onSuccess?.();
      } else {
        setError(res?.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
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
            If an account with <span className="font-semibold">{email}</span> exists, we just sent a 6-digit code.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Didn’t receive the code? Check your spam folder or try again with a different email.
            </p>
            <Button
              onClick={() => (window.location.href = `/auth/reset-password-otp?email=${encodeURIComponent(email)}`)}
              className="w-full"
            >
              Enter OTP & Reset Password
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setError(null);
              }}
              className="w-full"
            >
              Try Different Email
            </Button>
            <button
              onClick={onBackToLogin ?? onBack}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Reset Password via OTP</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Enter your email address and we’ll send a 6-digit code to verify and reset your password.
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
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
