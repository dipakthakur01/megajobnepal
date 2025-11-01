import React from 'react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
}

export function AuthErrorHandler({ error, onRetry }: AuthErrorHandlerProps) {
  if (!error) return null;

  const isNetworkError = error.includes('Network') || error.includes('fetch');
  const isConfigError = error.includes('configuration') || error.includes('database');
  const isCredentialError = error.includes('Invalid') || error.includes('password');
  const isAccountExistsError = error.includes('already exists') || error.includes('User already exists') || error.includes('account with this email');

  const getErrorType = () => {
    if (isNetworkError) return 'Network Error';
    if (isConfigError) return 'Configuration Error';
    if (isCredentialError) return 'Authentication Error';
    if (isAccountExistsError) return 'Account Error';
    return 'Error';
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (isConfigError) {
      return 'The authentication system is not properly configured. Please contact support.';
    }
    if (isCredentialError) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (isAccountExistsError) {
      return error; // Return the exact error message from the server
    }
    return error;
  };



  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{getErrorType()}</p>
            <p>{getErrorMessage()}</p>
          </div>
        </AlertDescription>
      </Alert>

      {onRetry && !isAccountExistsError && (
        <div className="flex justify-center">
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
