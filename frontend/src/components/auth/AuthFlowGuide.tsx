import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { CheckCircle, ArrowRight, Mail, Key, LogIn } from 'lucide-react';

export function AuthFlowGuide() {
  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
          <LogIn className="w-4 h-4" />
          Authentication Flow Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="py-3">
          <AlertDescription className="text-xs">
            <strong>Getting "Invalid credentials" error?</strong>
            <br />
            This usually means you need to create an account first. Follow the steps below:
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <strong>Sign Up</strong>
                <Badge variant="outline" className="text-xs py-0">New users</Badge>
              </div>
              <p className="text-gray-600">
                Create your account by filling out the signup form with your email, password, name, and role (Job Seeker or Employer).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3 h-3" />
                <strong>Verify OTP</strong>
                <Badge variant="outline" className="text-xs py-0">Required</Badge>
              </div>
              <p className="text-gray-600">
                Enter the 6-digit verification code. <strong>In development mode, the OTP will be shown automatically.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 font-semibold flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-3 h-3" />
                <strong>Login</strong>
                <Badge variant="default" className="text-xs py-0">Now available</Badge>
              </div>
              <p className="text-gray-600">
                Use your email and password to sign in to your account.
              </p>
            </div>
          </div>
        </div>

        <Alert className="py-3">
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>Development Mode Features:</strong>
            <br />
            • OTP codes are displayed automatically for easy testing
            <br />
            • Password reset tokens are shown in the console
            <br />
            • All authentication flows work without email service
          </AlertDescription>
        </Alert>

        <div className="pt-2 border-t border-blue-200">
          <div className="text-xs text-blue-700">
            <strong>Quick Test:</strong> Try signing up with a test email like <code>test@example.com</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
