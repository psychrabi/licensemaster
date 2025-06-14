import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddLicenseModal } from "@/components/add-license-modal";
import { DollarSign, Key, ShoppingCart, Users, ArrowUp, Edit, Trash2 } from "lucide-react";
import type { DashboardMetrics, RecentSale, Activity, LicenseType } from "@/lib/types";

export default function Admin() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"]
  });

  const { data: licenses = [], isLoading: licensesLoading } = useQuery<LicenseType[]>({
    queryKey: ["/api/licenses/available"]
  });

  const { data: recentSales = [], isLoading: salesLoading } = useQuery<RecentSale[]>({
    queryKey: ["/api/sales/recent"]
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/activity"]
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage your ASTER license sales and inventory</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Sales</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {metrics ? formatCurrency(metrics.totalSales) : '$0'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="text-green-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                <ArrowUp className="mr-1 h-3 w-3 inline" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available Licenses</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {metrics?.availableLicenses || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Key className="text-blue-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Across all license types</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Licenses Sold</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {metrics?.licensesSold || 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ShoppingCart className="text-purple-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-purple-600 mt-2">
                <ArrowUp className="mr-1 h-3 w-3 inline" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">New Customers</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {metrics?.newCustomers || 0}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Users className="text-amber-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-amber-600 mt-2">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* License Management */}
          <Card>
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900">License Management</CardTitle>
                <AddLicenseModal />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {licensesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-200 h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.type} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">{license.type}</h3>
                        <p className="text-sm text-slate-600">
                          {license.count} available • {formatCurrency(license.price)} each
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {licenses.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No licenses available. Add some licenses to get started.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl font-semibold text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="bg-slate-200 w-8 h-8 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-slate-200 h-4 rounded w-3/4"></div>
                        <div className="bg-slate-200 h-3 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <ShoppingCart className="text-green-600 h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                        <p className="text-xs text-slate-500">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No recent activity to display.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales Table */}
        <Card className="mt-8">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>License</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="animate-pulse bg-slate-200 h-4 rounded w-24"></div></TableCell>
                        <TableCell><div className="animate-pulse bg-slate-200 h-4 rounded w-32"></div></TableCell>
                        <TableCell><div className="animate-pulse bg-slate-200 h-4 rounded w-16"></div></TableCell>
                        <TableCell><div className="animate-pulse bg-slate-200 h-4 rounded w-20"></div></TableCell>
                        <TableCell><div className="animate-pulse bg-slate-200 h-6 rounded w-16"></div></TableCell>
                      </TableRow>
                    ))
                  ) : recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.license.type}</TableCell>
                        <TableCell className="text-slate-500">{sale.customer.email}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(sale.amount)}</TableCell>
                        <TableCell className="text-slate-500">{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={sale.status === "active" ? "default" : "secondary"}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
