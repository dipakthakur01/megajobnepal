import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

interface OTPVerificationFormProps {
  tempSignupId: string;
  email?: string;
  developmentOTP?: string; // For development only
  onSuccess?: () => void;
  onBack?: () => void;
  onResend?: () => void; // Added missing prop
}

export function OTPVerificationForm({ 
  tempSignupId, 
  email, 
  developmentOTP,
  onSuccess, 
  onBack,
  onResend
}: OTPVerificationFormProps) {
  const { verifyOTP, resendOTP, loading, error, clearError } = useAuth();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (developmentOTP) {
      setOtp(developmentOTP);
    }
  }, [developmentOTP]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOTP(otp);
      if (!result.error) {
        toast.success('Account verified successfully! Welcome to MegaJobNepal!');
        onSuccess?.();
      }
    } catch (err) {
      toast.error('OTP verification failed. Please try again.');
      console.error('OTP verification error:', err);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    try {
      setResendLoading(true);
      clearError();
      
      const result = await resendOTP();
      
      if (!result.error) {
        toast.success('New OTP sent successfully! Please check your email.');
        // Reset timer
        setTimeLeft(600);
        setCanResend(false);
      }
      
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    clearError();
    
    // Auto-verify when OTP is complete
    if (value.length === 6) {
      setTimeout(() => handleVerify(), 100);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to{' '}
          <span className="font-semibold">{email || 'your email'}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {developmentOTP && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> OTP is {developmentOTP}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter verification code
            </label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOTPChange}
                inputMode="numeric"
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            onClick={handleVerify} 
            className="w-full bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:from-[#E55A00] hover:to-[#FF6600] text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Email'
            )}
          </Button>
        </div>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {timeLeft > 0 ? (
              <span>Code expires in {formatTime(timeLeft)}</span>
            ) : (
              <span className="text-red-600">Code expired</span>
            )}
          </div>

          <div>
            <button
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className={`text-sm font-medium ${
                canResend && !resendLoading
                  ? 'text-blue-600 hover:text-blue-500'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {resendLoading ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Didn\'t receive the code? Resend'
              )}
            </button>
          </div>

          <div>
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-500 font-medium"
            >
              ← Back to signup
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

