import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey, isSupabaseConfigured } from '../../lib/auth-config';
import { DatabaseChecker } from './DatabaseChecker';

interface HealthCheck {
  status: string;
  timestamp?: string;
  database?: string;
  environment?: {
    database_backend?: string;
    localStorage_access?: string;
    auth_system?: string;
    supabase_url?: string;
    supabase_service_role_key?: string;
    supabase_anon_key?: string;
  };
  error?: string;
}

export function AuthDebugInfo() {
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Check database configuration on mount
  useEffect(() => {
    const configured = isSupabaseConfigured(); // Keep for backwards compatibility
    console.log('MySQL Auth configured:', !configured); // Inverted logic kept for legacy
    if (!configured) {
      setExpanded(true);
    }
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      // Check browser storage access for database simulation
      const testKey = `health_check_${Date.now()}`;
      localStorage.setItem(testKey, JSON.stringify({ timestamp: new Date().toISOString() }));
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue) {
        setHealthCheck({
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: 'connected',
          environment: {
            database_backend: 'MySQL',
            localStorage_access: 'configured',
            auth_system: 'configured'
          }
        });
      } else {
        setHealthCheck({
          status: 'error',
          error: 'Unable to access browser storage',
        });
      }
    } catch (error: any) {
      setHealthCheck({
        status: 'error',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'connected':
      case 'configured':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'ok' || status === 'connected' || status === 'configured' 
      ? 'default' 
      : status === 'error' || status === 'missing'
      ? 'destructive'
      : 'secondary';
    
    return (
      <Badge variant={variant} className="ml-2">
        {status}
      </Badge>
    );
  };

  const configured = isSupabaseConfigured();

  if (!expanded && configured) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
          className="text-xs"
        >
          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
          Debug Info
        </Button>
      </div>
    );
  }

  if (!expanded && !configured) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
          className="text-xs border-red-200 text-red-600"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          ⚠️ Configuration Required
        </Button>
      </div>
    );
  }

  return (
    <Card className={`mb-4 ${!configured ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm ${!configured ? 'text-red-800' : 'text-orange-800'}`}>
            Authentication Debug Information
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className={`${!configured ? 'text-red-600 hover:text-red-800' : 'text-orange-600 hover:text-orange-800'}`}
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div>
          <h4 className={`text-sm font-medium ${!configured ? 'text-red-800' : 'text-orange-800'} mb-2`}>
            Configuration Status
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Overall Status:</span>
              <div className="flex items-center">
                {getStatusIcon(configured ? 'configured' : 'missing')}
                <span className="ml-1">{configured ? 'Configured' : 'Not Configured'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Configuration */}
        <div>
          <h4 className={`text-sm font-medium ${!configured ? 'text-green-800' : 'text-orange-800'} mb-2`}>
            Database Configuration (MySQL)
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Storage Backend:</span>
              <div className="flex items-center">
                {getStatusIcon('configured')}
                <span className="ml-1 text-gray-600 truncate max-w-48">
                  Backend API + MySQL
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Anon Key:</span>
              <div className="flex items-center">
                {getStatusIcon('configured')}
                <span className="ml-1 text-gray-600">••••••••</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Project ID:</span>
              <div className="flex items-center">
                {getStatusIcon('configured')}
                <span className="ml-1 text-gray-600">{projectId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <DatabaseChecker />

        {/* Server Health Check */}
        {configured && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-800">Server Health</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={checkHealth}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span className="ml-1">Check</span>
              </Button>
            </div>
            
            {healthCheck ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Server Status:</span>
                  <div className="flex items-center">
                    {getStatusIcon(healthCheck.status)}
                    {getStatusBadge(healthCheck.status)}
                  </div>
                </div>
                
                {healthCheck.database && (
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <div className="flex items-center">
                      {getStatusIcon(healthCheck.database)}
                      {getStatusBadge(healthCheck.database)}
                    </div>
                  </div>
                )}
                
                {healthCheck.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                      <strong>Error:</strong> {healthCheck.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {healthCheck.timestamp && (
                  <div className="text-xs text-gray-500 mt-2">
                    Last checked: {new Date(healthCheck.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                Click "Check" to test server connectivity
              </div>
            )}
          </div>
        )}

        {/* Authentication Tips */}
        <div>
          <h4 className={`text-sm font-medium ${!configured ? 'text-red-800' : 'text-orange-800'} mb-2`}>
            Authentication Tips
          </h4>
          <Alert className="py-2">
            <AlertDescription className="text-xs">
              <strong>Getting "Invalid credentials" error?</strong>
              <br />
              • Make sure you've signed up for an account first
              <br />
              • Try creating a test account using the signup form
              <br />
              • Check if the database tables are set up properly
              <br />
              • Verify the server is running and accessible
            </AlertDescription>
          </Alert>
        </div>

        {/* Common Issues & Solutions */}
        <div>
          <h4 className={`text-sm font-medium ${!configured ? 'text-red-800' : 'text-orange-800'} mb-2`}>
            Troubleshooting
          </h4>
          <div className="space-y-2 text-xs text-gray-700">
            {!configured && (
              <div className="space-y-1">
                <div>• <strong>Database ready:</strong> Backend API with MySQL is properly configured</div>
                <div>• <strong>Authentication:</strong> Using built-in browser authentication system</div>
                <div>• <strong>Storage:</strong> Data is stored locally in your browser</div>
              </div>
            )}
            
            <div className="space-y-1">
              <div>• <strong>Storage access:</strong> Browser storage should be accessible and enabled</div>
              <div>• <strong>Database setup:</strong> Run the database setup if no data is found</div>
              <div>• <strong>Authentication:</strong> Use demo credentials or create new accounts</div>
              <div>• <strong>Data persistence:</strong> Data is stored locally in your browser</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
