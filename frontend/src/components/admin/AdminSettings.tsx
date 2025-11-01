import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings, 
  DollarSign, 
  Bell, 
  Mail, 
  Shield, 
  Database,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettingsProps {
  currentUser: any;
}

export function AdminSettings({ currentUser }: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'MegaJobNepal',
    siteDescription: 'Nepal\'s Premier Job Portal',
    contactEmail: 'admin@megajobnepal.com.np',
    contactPhone: '+977-1-4123456',
    address: 'Kathmandu, Nepal',
    
    // Job Posting Pricing
    primeJobPrice: 2000,
    premiumJobPrice: 5000,
    megaJobPrice: 10000,
    
    // Email Settings
    emailNotifications: true,
    adminEmailAlerts: true,
    welcomeEmailEnabled: true,
    applicationEmailEnabled: true,
    
    // System Settings
    maxJobsPerCompany: 50,
    jobExpiryDays: 30,
    allowGuestApplications: false,
    requireEmailVerification: true,
    
    // Security Settings
    passwordMinLength: 8,
    sessionTimeout: 24, // hours
    enableTwoFactor: false,
    enableCaptcha: true,
    
    // API Settings
    apiRateLimit: 100, // requests per minute
    backupFrequency: 'daily',
    maintenanceMode: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        siteName: 'MegaJobNepal',
        siteDescription: 'Nepal\'s Premier Job Portal',
        contactEmail: 'admin@megajobnepal.com.np',
        contactPhone: '+977-1-4123456',
        address: 'Kathmandu, Nepal',
        primeJobPrice: 2000,
        premiumJobPrice: 5000,
        megaJobPrice: 10000,
        emailNotifications: true,
        adminEmailAlerts: true,
        welcomeEmailEnabled: true,
        applicationEmailEnabled: true,
        maxJobsPerCompany: 50,
        jobExpiryDays: 30,
        allowGuestApplications: false,
        requireEmailVerification: true,
        passwordMinLength: 8,
        sessionTimeout: 24,
        enableTwoFactor: false,
        enableCaptcha: true,
        apiRateLimit: 100,
        backupFrequency: 'daily',
        maintenanceMode: false
      });
      toast.success('Settings reset to default values');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Admin Settings</h2>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Job Posting Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primePrice">Prime Job Price (NPR)</Label>
                  <Input
                    id="primePrice"
                    type="number"
                    value={settings.primeJobPrice}
                    onChange={(e) => setSettings({ ...settings, primeJobPrice: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Basic job posting with standard visibility</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premiumPrice">Premium Job Price (NPR)</Label>
                  <Input
                    id="premiumPrice"
                    type="number"
                    value={settings.premiumJobPrice}
                    onChange={(e) => setSettings({ ...settings, premiumJobPrice: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Enhanced visibility and priority listing</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="megaPrice">MegaJob Price (NPR)</Label>
                  <Input
                    id="megaPrice"
                    type="number"
                    value={settings.megaJobPrice}
                    onChange={(e) => setSettings({ ...settings, megaJobPrice: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Maximum visibility and premium features</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Price Comparison</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prime Job:</span>
                    <Badge className="bg-green-100 text-green-800">Rs. {settings.primeJobPrice.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium Job:</span>
                    <Badge className="bg-blue-100 text-blue-800">Rs. {settings.premiumJobPrice.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>MegaJob:</span>
                    <Badge className="bg-purple-100 text-purple-800">Rs. {settings.megaJobPrice.toLocaleString()}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications to users</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Email Alerts</Label>
                    <p className="text-sm text-gray-500">Receive alerts for important system events</p>
                  </div>
                  <Switch
                    checked={settings.adminEmailAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, adminEmailAlerts: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Welcome Email</Label>
                    <p className="text-sm text-gray-500">Send welcome email to new users</p>
                  </div>
                  <Switch
                    checked={settings.welcomeEmailEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, welcomeEmailEnabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Application Confirmation</Label>
                    <p className="text-sm text-gray-500">Send confirmation email for job applications</p>
                  </div>
                  <Switch
                    checked={settings.applicationEmailEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, applicationEmailEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxJobs">Max Jobs per Company</Label>
                  <Input
                    id="maxJobs"
                    type="number"
                    value={settings.maxJobsPerCompany}
                    onChange={(e) => setSettings({ ...settings, maxJobsPerCompany: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobExpiry">Job Expiry (Days)</Label>
                  <Input
                    id="jobExpiry"
                    type="number"
                    value={settings.jobExpiryDays}
                    onChange={(e) => setSettings({ ...settings, jobExpiryDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Guest Applications</Label>
                    <p className="text-sm text-gray-500">Allow users to apply without registration</p>
                  </div>
                  <Switch
                    checked={settings.allowGuestApplications}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowGuestApplications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-gray-500">Users must verify email before accessing features</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Minimum Password Length</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 24 })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableTwoFactor: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable CAPTCHA</Label>
                    <p className="text-sm text-gray-500">Protect forms with CAPTCHA verification</p>
                  </div>
                  <Switch
                    checked={settings.enableCaptcha}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableCaptcha: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                API & System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">API Rate Limit (per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFreq">Backup Frequency</Label>
                  <Select 
                    value={settings.backupFrequency} 
                    onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </div>

              {settings.maintenanceMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Maintenance mode is enabled. Public users cannot access the site.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

