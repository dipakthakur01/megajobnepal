import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
      return;
    }

    try {
      const result = await verifyOTP(otp);
      if (!result.error) {
        onSuccess?.();
      }
    } catch (err) {
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
        // Reset timer
        setTimeLeft(600);
        setCanResend(false);
      }
      
    } catch (err) {
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
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {developmentOTP && (
          <Alert>
            <AlertDescription>
              <strong>Development Mode:</strong> OTP is {developmentOTP}
            </AlertDescription>
          </Alert>
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
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
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
