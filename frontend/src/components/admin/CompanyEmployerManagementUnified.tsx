import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Users, BarChart3 } from 'lucide-react';
import { EmployerManagementNew } from './EmployerManagementNew';
import { CompanyManagementNew } from './CompanyManagementNew';
import { ReportManagement } from './ReportManagement';
import { apiClient } from '../../lib/api-client';

interface CompanyEmployerManagementUnifiedProps {
  companies: any[];
  jobs: any[];
  applications: any[];
  onCompanyUpdate: (companies: any[]) => void;
}

export function CompanyEmployerManagementUnified({
  companies,
  jobs,
  applications,
  onCompanyUpdate,
}: CompanyEmployerManagementUnifiedProps) {
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Quick stats header
  const totalCompanies = safeCompanies.length;
  const verified = safeCompanies.filter((c) => !!c?.verified).length;
  const unverified = totalCompanies - verified;

  // Proxy: optimistic update then refresh authoritative data from server
  const onCompanyUpdateServerDriven = async (nextCompanies: any[]) => {
    try { onCompanyUpdate(nextCompanies); } catch {}
    try {
      const refreshed = await apiClient.getAdminCompanies({ page: 1, limit: 50 });
      onCompanyUpdate(refreshed || []);
    } catch (err) {
      console.warn('Company refresh failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-blue-600">{totalCompanies}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{verified}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending/Unverified</p>
              <p className="text-2xl font-bold text-yellow-600">{unverified}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </CardContent>
        </Card>
      </div>

      {/* Unified Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profiles">Company Profiles</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EmployerManagementNew
            companies={safeCompanies}
            jobs={safeJobs}
            applications={safeApplications}
            onCompanyUpdate={onCompanyUpdateServerDriven}
          />
        </TabsContent>

        <TabsContent value="profiles">
          <CompanyManagementNew
            companies={safeCompanies}
            onCompanyUpdate={onCompanyUpdateServerDriven}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportManagement
            jobs={safeJobs}
            users={[]}
            applications={safeApplications}
            companies={safeCompanies}
          />
        </TabsContent>
      </Tabs>

      {/* CTA to add a company quickly */}
      <div className="flex justify-end">
        <Button onClick={() => setActiveTab('profiles')} className="bg-primary hover:bg-primary/90">
          Add Company
        </Button>
      </div>
    </div>
  );
}