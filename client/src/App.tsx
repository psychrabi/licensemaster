import { Switch, Route, Link, useLocation } from "wouter";
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
  const [location] = useLocation();
  const { itemCount } = useCart();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Key className="text-white h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">ASTER Licenses</span>
              </div>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/">
                <Button
                  variant={isActive("/") ? "default" : "ghost"}
                  className={isActive("/") ? "bg-blue-600 text-white" : "text-slate-600"}
                >
                  <StoreIcon className="mr-2 h-4 w-4" />
                  Store
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  className={isActive("/admin") ? "bg-blue-600 text-white" : "text-slate-600"}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/licenses">
                <Button
                  variant={isActive("/licenses") ? "default" : "ghost"}
                  className={isActive("/licenses") ? "bg-blue-600 text-white" : "text-slate-600"}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Licenses
                </Button>
              </Link>
              <Link href="/customers">
                <Button
                  variant={isActive("/customers") ? "default" : "ghost"}
                  className={isActive("/customers") ? "bg-blue-600 text-white" : "text-slate-600"}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </Button>
              </Link>
              <Link href="/sales">
                <Button
                  variant={isActive("/sales") ? "default" : "ghost"}
                  className={isActive("/sales") ? "bg-blue-600 text-white" : "text-slate-600"}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Sales
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Link href="/cart">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
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
        <div className="grid grid-cols-6 gap-1 py-2 px-2">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full`}
            >
              <StoreIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">Store</span>
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/admin") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full`}
            >
              <Settings className="h-4 w-4 mb-1" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
          <Link href="/licenses">
            <Button
              variant={isActive("/licenses") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/licenses") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full`}
            >
              <Package className="h-4 w-4 mb-1" />
              <span className="text-xs">Licenses</span>
            </Button>
          </Link>
          <Link href="/customers">
            <Button
              variant={isActive("/customers") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/customers") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full`}
            >
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">Customers</span>
            </Button>
          </Link>
          <Link href="/sales">
            <Button
              variant={isActive("/sales") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/sales") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full`}
            >
              <Receipt className="h-4 w-4 mb-1" />
              <span className="text-xs">Sales</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button
              variant={isActive("/cart") ? "default" : "ghost"}
              size="sm"
              className={`${isActive("/cart") ? "bg-blue-600 text-white" : "text-slate-600"} flex-col h-auto py-2 w-full relative`}
            >
              <ShoppingCart className="h-4 w-4 mb-1" />
              <span className="text-xs">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        <Switch>
          <Route path="/" component={Store} />
          <Route path="/admin" component={Admin} />
          <Route path="/licenses" component={Licenses} />
          <Route path="/customers" component={Customers} />
          <Route path="/sales" component={Sales} />
          <Route path="/cart" component={Cart} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
