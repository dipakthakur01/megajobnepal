import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LoginForm } from './auth/LoginForm';
import { useAuth } from '@/components/auth/AuthContext';

interface SuperAdminLoginProps {
  onLogin: (user: any) => void;
  onBackToWebsite: () => void;
}

export function SuperAdminLogin({ onLogin, onBackToWebsite }: SuperAdminLoginProps) {
  const { user } = useAuth();

  const handleLoginSuccess = (authUser?: any) => {
    const effectiveUser = authUser || user;
    if (effectiveUser) {
      onLogin(effectiveUser);
      toast.success('Welcome to Super Admin Panel!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Website Button */}
        <Button
          variant="ghost"
          onClick={onBackToWebsite}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Website
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Super Admin Login</CardTitle>
            <p className="text-gray-600 mt-2">Access the MegaJobNepal Super Admin Panel</p>
          </CardHeader>
          
          <CardContent className="pt-2">
            <div className="space-y-4">
              <LoginForm
                isAdminLogin={true}
                onSuccess={handleLoginSuccess}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2024 MegaJobNepal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
