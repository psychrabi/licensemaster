import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Key, Store as StoreIcon, Settings, ShoppingCart, User, Users, Receipt, Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import Store from "@/pages/store";
import Admin from "@/pages/admin";
import Licenses from "@/pages/licenses";
import Customers from "@/pages/customers";
import Sales from "@/pages/sales";
import Cart from "@/pages/cart";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [activeTab, setActiveTab] = useState<"store" | "admin" | "licenses" | "customers" | "sales">("store");

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="text-white h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-slate-900">ASTER Licenses</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <Button
                variant={activeTab === "store" ? "default" : "ghost"}
                onClick={() => setActiveTab("store")}
                className={activeTab === "store" ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                <StoreIcon className="mr-2 h-4 w-4" />
                Store
              </Button>
              <Button
                variant={activeTab === "admin" ? "default" : "ghost"}
                onClick={() => setActiveTab("admin")}
                className={activeTab === "admin" ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "licenses" ? "default" : "ghost"}
                onClick={() => setActiveTab("licenses")}
                className={activeTab === "licenses" ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                <Package className="mr-2 h-4 w-4" />
                Licenses
              </Button>
              <Button
                variant={activeTab === "customers" ? "default" : "ghost"}
                onClick={() => setActiveTab("customers")}
                className={activeTab === "customers" ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
              <Button
                variant={activeTab === "sales" ? "default" : "ghost"}
                onClick={() => setActiveTab("sales")}
                className={activeTab === "sales" ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Sales
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">John Admin</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="block md:hidden bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-5 gap-1 py-2 px-2">
          <Button
            variant={activeTab === "store" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("store")}
            className={`${activeTab === "store" ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2`}
          >
            <StoreIcon className="h-4 w-4 mb-1" />
            <span className="text-xs">Store</span>
          </Button>
          <Button
            variant={activeTab === "admin" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("admin")}
            className={`${activeTab === "admin" ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2`}
          >
            <Settings className="h-4 w-4 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button
            variant={activeTab === "licenses" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("licenses")}
            className={`${activeTab === "licenses" ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2`}
          >
            <Package className="h-4 w-4 mb-1" />
            <span className="text-xs">Licenses</span>
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("customers")}
            className={`${activeTab === "customers" ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2`}
          >
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs">Customers</span>
          </Button>
          <Button
            variant={activeTab === "sales" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sales")}
            className={`${activeTab === "sales" ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2`}
          >
            <Receipt className="h-4 w-4 mb-1" />
            <span className="text-xs">Sales</span>
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="w-full">
        {activeTab === "store" && <Store />}
        {activeTab === "admin" && <Admin />}
        {activeTab === "licenses" && <Licenses />}
        {activeTab === "customers" && <Customers />}
        {activeTab === "sales" && <Sales />}
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Navigation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
