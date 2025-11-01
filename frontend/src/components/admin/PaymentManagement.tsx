import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PaymentManagementProps {
  jobs: any[];
  companies: any[];
}

export function PaymentManagement({ jobs, companies }: PaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Commissions: no backend yet; avoid mock by leaving empty
  const commissions: any[] = [];

  // Safe currency formatter to avoid calling toLocaleString on undefined
  const formatCurrency = (amount: unknown, currency: string = 'NPR') => {
    const num = typeof amount === 'number' ? amount : Number(amount ?? 0);
    try {
      return `${currency} ${num.toLocaleString()}`;
    } catch {
      return `${currency} ${num || 0}`;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [serverPayments, serverSubscriptions] = await Promise.all([
          apiClient.getPayments(),
          apiClient.getSubscriptions()
        ]);
        if (!mounted) return;
        setPayments(Array.isArray(serverPayments) ? serverPayments : []);
        setSubscriptions(Array.isArray(serverSubscriptions) ? serverSubscriptions : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load payments');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.company?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
                         payment.jobTitle?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase?.().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { class: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      failed: { class: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      refunded: { class: 'bg-blue-100 text-blue-800', icon: XCircle, label: 'Refunded' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.completed;
    const Icon = config.icon;
    return (
      <Badge className={config.class}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'bg-green-100 text-green-800', label: 'Active' },
      expired: { class: 'bg-red-100 text-red-800', label: 'Expired' },
      cancelled: { class: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const monthlyRevenue = payments
    .filter(p => p.status === 'completed' && new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalCommissions = commissions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  const handleMarkPaid = async (payment: any) => {
    try {
      const updated = await apiClient.updatePaymentStatus(payment.id, 'completed');
      setPayments(prev => prev.map(p => (p.id === payment.id ? { ...p, ...updated } : p)));
    } catch {
      setPayments(prev => prev.map(p => (p.id === payment.id ? { ...p, status: 'completed' } : p)));
    }
  };

  const handleRefund = async (payment: any) => {
    try {
      const updated = await apiClient.refundPayment(payment.id);
      setPayments(prev => prev.map(p => (p.id === payment.id ? { ...p, ...updated } : p)));
    } catch {
      setPayments(prev => prev.map(p => (p.id === payment.id ? { ...p, status: 'refunded' } : p)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-gray-600">Manage payments, subscriptions, and financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue, 'NPR')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyRevenue, 'NPR')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-purple-600">{activeSubscriptions}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commissions</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalCommissions, 'NPR')}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Transaction</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Job Type</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-6 px-4 text-center text-gray-600" colSpan={8}>Loading payments…</td></tr>
                ) : filteredPayments.length === 0 ? (
                  <tr><td className="py-6 px-4 text-center text-gray-600" colSpan={8}>No payments found</td></tr>
                ) : filteredPayments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{payment.transactionId}</p>
                        <p className="text-sm text-gray-600">{payment.jobTitle}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{payment.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{payment.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(payment.amount, payment.currency || 'NPR')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{payment.method}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payment.date}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(payment.status === 'pending' || payment.status === 'failed') && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkPaid(payment)}>
                          Mark Paid
                        </Button>
                      )}
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => handleRefund(payment)}>
                          Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Subscriptions ({subscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-left py-3 px-4">Job Usage</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Auto Renew</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td className="py-6 px-4 text-center text-gray-600" colSpan={8}>Loading subscriptions…</td></tr>
                    ) : subscriptions.length === 0 ? (
                      <tr><td className="py-6 px-4 text-center text-gray-600" colSpan={8}>No subscriptions found</td></tr>
                    ) : subscriptions.map(subscription => (
                      <tr key={subscription.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{subscription.company}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{subscription.plan}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{formatCurrency(subscription.amount, 'NPR')}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div>
                            <p>{subscription.startDate}</p>
                            <p>to {subscription.endDate}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(subscription.jobsUsed / subscription.jobsLimit) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {subscription.jobsUsed}/{subscription.jobsLimit}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getSubscriptionBadge(subscription.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={subscription.autoRenew ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {subscription.autoRenew ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
              <p className="text-sm text-gray-600">Configure commission rates and revenue streams</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commissions.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-600 py-6">No commission data</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <p className="text-sm text-gray-600">Generate and export financial reports</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Revenue Reports</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Monthly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Quarterly Financial Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Annual Revenue Analysis
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Transaction Reports</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Payment Transaction Log
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Failed Transactions Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Subscription Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
