import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Dock, Users, Building, Calendar, CalendarDays, CalendarCheck, Check, ArrowDown } from "lucide-react";
import type { LicenseType } from "@/lib/types";



const LICENSE_CONFIGS = {
  "ASTER Pro-2": {
    icon: Dock,
    badge: { text: "Popular", variant: "default" as const },
    color: "bg-blue-600",
    users: 2,
    support: "Professional support",
    updates: "Lifetime updates"
  },
  "ASTER Pro-3": {
    icon: Users,
    badge: null,
    color: "bg-blue-600",
    users: 3,
    support: "Professional support", 
    updates: "Lifetime updates"
  },
  "ASTER Pro-6": {
    icon: Building,
    badge: { text: "Enterprise", variant: "secondary" as const },
    color: "bg-blue-600",
    users: 6,
    support: "Priority support",
    updates: "Lifetime updates"
  },
  "ASTER Annual-2": {
    icon: Calendar,
    badge: { text: "Annual", variant: "outline" as const },
    color: "bg-emerald-600",
    users: 2,
    support: "Standard support",
    updates: "Annual updates"
  },
  "ASTER Annual-3": {
    icon: CalendarDays,
    badge: { text: "Annual", variant: "outline" as const },
    color: "bg-emerald-600",
    users: 3,
    support: "Standard support",
    updates: "Annual updates"
  },
  "ASTER Annual-6": {
    icon: CalendarCheck,
    badge: { text: "Annual", variant: "outline" as const },
    color: "bg-emerald-600",
    users: 6,
    support: "Priority support",
    updates: "Annual updates"
  }
};

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const { addToCart } = useCart();

  const { data: licenses = [], isLoading } = useQuery<LicenseType[]>({
    queryKey: ["/api/licenses/available"]
  });

  const handleAddToCart = (license: LicenseType) => {
    addToCart(license.type, license.price);
    toast({
      title: "Added to Cart",
      description: `${license.type} has been added to your cart.`
    });
  };

  const filteredLicenses = licenses.filter(license => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "pro") return license.type.includes("Pro");
    if (selectedCategory === "annual") return license.type.includes("Annual");
    return true;
  });

  const categories = [
    { id: "all", label: "All Licenses" },
    { id: "pro", label: "Pro Licenses" },
    { id: "annual", label: "Annual Licenses" }
  ];

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">ASTER Software Licenses</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Professional virtualization solutions for your business needs. Choose from our range of Pro and Annual licenses.
            </p>
            <Button className="bg-white text-blue-600 px-8 py-4 text-lg hover:bg-slate-50 h-auto">
              <ArrowDown className="mr-2 h-5 w-5" />
              Explore Licenses
            </Button>
          </div>
        </div>
      </section>

      {/* License Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your License</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the perfect ASTER license for your virtualization needs. All licenses include full support and updates.
          </p>
        </div>

        {/* License Category Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-blue-600 text-white" : "text-slate-600"}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* License Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLicenses.map((license) => {
            const config = LICENSE_CONFIGS[license.type as keyof typeof LICENSE_CONFIGS];
            const IconComponent = config?.icon || Dock;
            
            return (
              <Card key={license.type} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-600/10 p-3 rounded-lg">
                      <IconComponent className="text-blue-600 h-6 w-6" />
                    </div>
                    {config?.badge && (
                      <Badge variant={config.badge.variant}>
                        {config.badge.text}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{license.type}</h3>
                  <p className="text-slate-600 mb-4">
                    {license.type.includes("Pro") 
                      ? `Professional solution for ${config?.users || 2} simultaneous users.`
                      : `Cost-effective annual license for ${config?.users || 2} simultaneous users.`
                    }
                  </p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-slate-900">${license.price}</div>
                    <div className="text-sm text-slate-500">
                      {license.type.includes("Annual") ? "Per year" : "One-time license"}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-slate-600">
                      <Check className="text-emerald-600 mr-2 h-4 w-4" />
                      {config?.users || 2} simultaneous users
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <Check className="text-emerald-600 mr-2 h-4 w-4" />
                      {config?.support || "Professional support"}
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <Check className="text-emerald-600 mr-2 h-4 w-4" />
                      {config?.updates || "Lifetime updates"}
                    </li>
                  </ul>
                  
                  <Button
                    className={`w-full ${license.type.includes("Annual") ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    onClick={() => handleAddToCart(license)}
                    disabled={license.count === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {license.count === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  
                  <div className="mt-2 text-center">
                    <span className="text-sm text-slate-500">
                      {license.count} {license.count === 1 ? "license" : "licenses"} available
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose ASTER?</h2>
            <p className="text-lg text-slate-600">Trusted by thousands of businesses worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure & Reliable</h3>
              <p className="text-slate-600">Enterprise-grade security with 99.9% uptime guarantee</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">24/7 Support</h3>
              <p className="text-slate-600">Professional support team available around the clock</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-sync-alt text-yellow-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Regular Updates</h3>
              <p className="text-slate-600">Continuous improvements and new features</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
