import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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

interface PaymentManagementProps {
  jobs: any[];
  companies: any[];
}

export function PaymentManagement({ jobs, companies }: PaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock payment and subscription data
  const payments = [
    {
      id: '1',
      company: 'Tech Solutions Pvt Ltd',
      amount: 5000,
      currency: 'NPR',
      type: 'MegaJob',
      status: 'completed',
      method: 'eSewa',
      date: '2024-01-15',
      transactionId: 'TXN123456789',
      jobTitle: 'Senior Software Developer'
    },
    {
      id: '2',
      company: 'Digital Marketing Hub',
      amount: 3000,
      currency: 'NPR',
      type: 'Premium Job',
      status: 'completed',
      method: 'Khalti',
      date: '2024-01-14',
      transactionId: 'TXN987654321',
      jobTitle: 'Marketing Manager'
    },
    {
      id: '3',
      company: 'Healthcare Plus',
      amount: 2000,
      currency: 'NPR',
      type: 'Prime Job',
      status: 'pending',
      method: 'Bank Transfer',
      date: '2024-01-13',
      transactionId: 'TXN456789123',
      jobTitle: 'Nurse Supervisor'
    },
    {
      id: '4',
      company: 'Education First',
      amount: 1000,
      currency: 'NPR',
      type: 'Latest Jobs',
      status: 'failed',
      method: 'IME Pay',
      date: '2024-01-12',
      transactionId: 'TXN789123456',
      jobTitle: 'Mathematics Teacher'
    }
  ];

  const subscriptions = [
    {
      id: '1',
      company: 'Tech Solutions Pvt Ltd',
      plan: 'Premium Annual',
      amount: 50000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      autoRenew: true,
      jobsLimit: 100,
      jobsUsed: 45
    },
    {
      id: '2',
      company: 'Digital Marketing Hub',
      plan: 'Standard Monthly',
      amount: 8000,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'active',
      autoRenew: true,
      jobsLimit: 20,
      jobsUsed: 18
    },
    {
      id: '3',
      company: 'Healthcare Plus',
      plan: 'Basic Monthly',
      amount: 3000,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      status: 'expired',
      autoRenew: false,
      jobsLimit: 5,
      jobsUsed: 5
    }
  ];

  const commissions = [
    {
      id: '1',
      type: 'Application Fee',
      description: '5% commission from successful job applications',
      rate: 5,
      amount: 125000,
      status: 'active'
    },
    {
      id: '2',
      type: 'Premium Placement',
      description: '10% commission from premium job placements',
      rate: 10,
      amount: 85000,
      status: 'active'
    },
    {
      id: '3',
      type: 'Featured Company',
      description: 'Monthly fee for featured company listing',
      rate: 2000,
      amount: 48000,
      status: 'active'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
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
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenue = payments
    .filter(p => p.status === 'completed' && new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">NPR {totalRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-blue-600">NPR {monthlyRevenue.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-orange-600">NPR {totalCommissions.toLocaleString()}</p>
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

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search payments, companies, transaction IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    {filteredPayments.map(payment => (
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
                          <span className="font-medium">{payment.currency} {payment.amount.toLocaleString()}</span>
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
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
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
                    {subscriptions.map(subscription => (
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
                          <span className="font-medium">NPR {subscription.amount.toLocaleString()}</span>
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
                {commissions.map(commission => (
                  <Card key={commission.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">{commission.type}</h3>
                          <p className="text-sm text-gray-600">{commission.description}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rate:</span>
                            <span className="font-medium">
                              {commission.type === 'Featured Company' ? 
                                `NPR ${commission.rate}` : 
                                `${commission.rate}%`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Monthly Revenue:</span>
                            <span className="font-medium">NPR {commission.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge className={commission.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {commission.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
