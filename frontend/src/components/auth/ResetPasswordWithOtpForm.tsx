import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Lock, CheckCircle, KeyRound } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';

interface ResetPasswordWithOtpFormProps {
  email: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export function ResetPasswordWithOtpForm({ email, onSuccess, onBackToLogin }: ResetPasswordWithOtpFormProps) {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!otp || otp.trim().length !== 6) {
      errors.otp = 'Enter the 6-digit OTP code';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.changePasswordWithOtp(email, otp.trim(), password);
      if (res?.message || res?.success) {
        toast.success('Password reset successfully');
        setIsSubmitted(true);
      } else {
        const msg = res?.error || 'Failed to reset password';
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'otp') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setOtp(digitsOnly);
      return;
    }
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (error) setError(null);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Password Reset Successful</CardTitle>
          <p className="text-sm text-gray-600">
            Your password has been updated. You can now sign in.
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={onSuccess} className="w-full">
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Verify OTP & Set New Password</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          We sent a 6-digit code to {email}. Enter it and choose a new password.
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
            <Label htmlFor="otp">OTP Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {validationErrors.otp && (
              <p className="text-sm text-red-600">{validationErrors.otp}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 text-gray-400 hover:text-gray-500 bg-transparent min-w-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10"
                required
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating Password...' : 'Verify & Update Password'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center w-full"
            >
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}