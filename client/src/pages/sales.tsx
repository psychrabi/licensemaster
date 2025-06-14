import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Search, Filter, Download, TrendingUp, ShoppingCart, Calendar } from "lucide-react";
import type { RecentSale } from "@/lib/types";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  const { data: sales = [], isLoading } = useQuery<RecentSale[]>({
    queryKey: ["/api/sales/recent", 100] // Get more sales for the sales page
  });

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.license.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || sale.status === filterStatus;
    
    let matchesPeriod = true;
    if (filterPeriod !== "all") {
      const saleDate = new Date(sale.createdAt);
      const now = new Date();
      
      switch (filterPeriod) {
        case "today":
          matchesPeriod = saleDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesPeriod = saleDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesPeriod = saleDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const formatCurrency = (amount: string | number) => {
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Calculate statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0);
  const activeSales = filteredSales.filter(sale => sale.status === "active").length;
  const todaySales = filteredSales.filter(sale => {
    const today = new Date().toDateString();
    return new Date(sale.createdAt).toDateString() === today;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales Management</h1>
              <p className="text-slate-600">Track and analyze your license sales performance</p>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Sales
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="text-green-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                <TrendingUp className="mr-1 h-3 w-3 inline" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Sales</p>
                  <p className="text-3xl font-bold text-slate-900">{sales.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ShoppingCart className="text-blue-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Sales</p>
                  <p className="text-3xl font-bold text-slate-900">{activeSales}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <ShoppingCart className="text-purple-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today's Sales</p>
                  <p className="text-3xl font-bold text-slate-900">{todaySales}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Calendar className="text-emerald-600 h-6 w-6" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">Sales today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by license type, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Sales History ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Sale ID</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Ago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm">
                          #{sale.id.toString().padStart(4, '0')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{sale.license.type}</p>
                            <p className="text-sm text-slate-500 font-mono">{sale.license.licenseKey}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{sale.customer.name}</p>
                            <p className="text-sm text-slate-500">{sale.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(sale.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sale.status === "active" ? "default" : "secondary"}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(sale.createdAt)}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {getTimeAgo(sale.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {searchTerm || filterStatus !== "all" || filterPeriod !== "all"
                          ? "No sales match your filters."
                          : "No sales found. Sales will appear here when customers make purchases."
                        }
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