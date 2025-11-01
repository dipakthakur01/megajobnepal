import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Users, Database, Settings } from 'lucide-react';
import { postgresqlAuthService } from '../../lib/postgresql-auth';
import { dbService } from '../../lib/db-service';

export function AuthenticationDiagnostics() {
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [authLogs, setAuthLogs] = useState<string[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setAuthLogs([]);
    
    const log = (message: string) => {
      console.log(message);
      setAuthLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    try {
      log('🔍 Starting authentication diagnostics...');

      // Check localStorage database
      log('📊 Checking localStorage database...');
      const usersData = localStorage.getItem('mysql_megajob_db_users');
      const jobsData = localStorage.getItem('mysql_megajob_db_jobs');
      const companiesData = localStorage.getItem('mysql_megajob_db_companies');

      const userCount = usersData ? JSON.parse(usersData).length : 0;
      const jobCount = jobsData ? JSON.parse(jobsData).length : 0;
      const companyCount = companiesData ? JSON.parse(companiesData).length : 0;

      log(`📈 Found ${userCount} users, ${jobCount} jobs, ${companyCount} companies`);

      log('🧪 Authentication system ready for testing...');

      // Get all users from database
      log('👥 Fetching all users from database...');
      const allUsers = await dbService.getUsers();
      setUsers(allUsers);

      // Check user verification status
      log('✔️ Checking user verification status...');
      const unverifiedUsers = allUsers.filter(user => !user.is_verified);

      setDiagnosticsData({
        database: {
          users: userCount,
          jobs: jobCount,
          companies: companyCount,
          status: userCount > 0 ? 'healthy' : 'empty'
        },
        authentication: {
          totalUsers: allUsers.length,
          verifiedUsers: allUsers.length - unverifiedUsers.length,
          unverifiedUsers: unverifiedUsers.length
        },
        users: allUsers,
        issues: []
      });

      log('✨ Diagnostics completed successfully!');

    } catch (error) {
      log(`💥 Diagnostics failed: ${error}`);
      setDiagnosticsData({
        error: String(error),
        database: { status: 'error' },
        authentication: { status: 'error' }
      });
    } finally {
      setIsRunning(false);
    }
  };



  const resetAuthSystem = async () => {
    if (!confirm('This will reset the entire authentication system. Are you sure?')) return;
    
    try {
      setAuthLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: 🔄 Resetting authentication system...`]);
      
      // Clear auth-related localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('mysql_megajob_db_users');
      
      // Trigger database re-setup
      await dbService.setupDatabase();
      
      setAuthLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ✅ Authentication system reset`]);
      
      // Reload page to trigger fresh setup
      window.location.reload();
    } catch (error) {
      setAuthLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ❌ Reset failed: ${error}`]);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Authentication Diagnostics
            <div className="flex gap-2">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Refresh'}
              </Button>
              <Button 
                onClick={resetAuthSystem}
                variant="destructive" 
                size="sm"
              >
                Reset System
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {diagnosticsData && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Database Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <Badge variant="outline">{diagnosticsData.database.users}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Jobs:</span>
                          <Badge variant="outline">{diagnosticsData.database.jobs}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Companies:</span>
                          <Badge variant="outline">{diagnosticsData.database.companies}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant={diagnosticsData.database.status === 'healthy' ? 'default' : 'destructive'}>
                            {diagnosticsData.database.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Authentication Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Users:</span>
                          <Badge variant="outline">{diagnosticsData.authentication.totalUsers}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Verified:</span>
                          <Badge variant="default">{diagnosticsData.authentication.verifiedUsers}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Unverified:</span>
                          <Badge variant="destructive">{diagnosticsData.authentication.unverifiedUsers}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div key={user.id || index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={user.user_type === 'admin' ? 'default' : 'outline'}>
                        {user.user_type}
                      </Badge>
                      <Badge variant={user.is_verified ? 'default' : 'destructive'}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>



            <TabsContent value="logs" className="space-y-2">
              <div className="max-h-96 overflow-y-auto space-y-1">
                {authLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
