import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddLicenseModal } from "@/components/add-license-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Key, Search, Filter, Trash2, Edit, Plus } from "lucide-react";
import type { License } from "@shared/schema";

export default function Licenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: licenses = [], isLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"]
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/licenses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete license",
        variant: "destructive"
      });
    }
  });

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || license.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "available" && !license.isSold && license.isActive) ||
                         (filterStatus === "sold" && license.isSold) ||
                         (filterStatus === "inactive" && !license.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (license: License) => {
    if (license.isSold) {
      return <Badge variant="secondary">Sold</Badge>;
    }
    if (!license.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Available</Badge>;
  };

  const licenseTypes = Array.from(new Set(licenses.map(l => l.type)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading licenses...</p>
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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">License Management</h1>
              <p className="text-slate-600">Manage your ASTER license inventory</p>
            </div>
            <AddLicenseModal />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Licenses</p>
                  <p className="text-3xl font-bold text-slate-900">{licenses.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Key className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {licenses.filter(l => !l.isSold && l.isActive).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Key className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sold</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {licenses.filter(l => l.isSold).length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Key className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Inactive</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {licenses.filter(l => !l.isActive).length}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Key className="text-red-600 h-6 w-6" />
                </div>
              </div>
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
                    placeholder="Search by license key or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {licenseTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Licenses Table */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Licenses ({filteredLicenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>License Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLicenses.length > 0 ? (
                    filteredLicenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono text-sm">
                          {license.licenseKey}
                        </TableCell>
                        <TableCell className="font-medium">
                          {license.type}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(license.price)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(license)}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(license.createdAt.toString())}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteLicenseMutation.mutate(license.id)}
                              disabled={deleteLicenseMutation.isPending || license.isSold}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {searchTerm || filterType !== "all" || filterStatus !== "all" 
                          ? "No licenses match your filters."
                          : "No licenses available. Add some licenses to get started."
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