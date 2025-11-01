import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, AlertCircle, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { isSupabaseConfigured } from '../../lib/auth-config';

export function AuthStatus() {
  const { user, isAuthenticated, loading, error, logout } = useAuth();

  const isDemoMode = !isSupabaseConfigured();

  const getStatusBadge = () => {
    if (loading) {
      return <Badge className="bg-yellow-100 text-yellow-800">Loading</Badge>;
    }
    if (error) {
      return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
    if (isAuthenticated) {
      return <Badge className="bg-green-100 text-green-800">Authenticated</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Not Authenticated</Badge>;
  };

  const getStatusIcon = () => {
    if (loading) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    if (error) return <XCircle className="w-5 h-5 text-red-600" />;
    if (isAuthenticated) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <User className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Authentication Status</span>
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemoMode && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">Demo Mode Active</p>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Supabase not configured. Using mock authentication.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Error:</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {user && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900">User Information:</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">Email: {user.email}</p>
                <p className="text-sm text-gray-600">Role: {user.user_type}</p>
                <p className="text-sm text-gray-600">Name: {user.full_name}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {!user && !loading && (
          <div className="text-center py-4">
            <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Not signed in</p>
            <p className="text-xs text-gray-500 mt-1">
              {isDemoMode 
                ? 'Use any email/password to sign in (demo mode)'
                : 'Sign in to see your account information'
              }
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <p>Mode: {isDemoMode ? 'Demo' : 'Production'}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p>Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Error: {error ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

