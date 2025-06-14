import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowRight } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required")
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Cart() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  const checkoutMutation = useMutation({
    mutationFn: async (customerData: CheckoutForm) => {
      // Process each item in the cart as separate sales
      const purchases = [];
      
      for (const item of cart.items) {
        for (let i = 0; i < item.quantity; i++) {
          const response = await apiRequest("POST", "/api/sales", {
            licenseType: item.licenseType,
            customerEmail: customerData.customerEmail,
            customerName: customerData.customerName
          });
          purchases.push(response);
        }
      }
      
      return purchases;
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${cart.itemCount} license${cart.itemCount > 1 ? 's' : ''}. License keys have been sent to your email.`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/recent"] });
      clearCart();
      reset();
      setCheckoutOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
        variant: "destructive"
      });
    }
  });

  const onCheckout = (data: CheckoutForm) => {
    checkoutMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="text-slate-400 h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
            <p className="text-slate-600 mb-8">Add some licenses to your cart to get started.</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-slate-600">Review your selected licenses before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Cart Items ({cart.itemCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>License Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.items.map((item) => (
                        <TableRow key={item.licenseType}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{item.licenseType}</p>
                              <p className="text-sm text-slate-500">
                                {item.licenseType.includes("Pro") ? "Lifetime license" : "Annual subscription"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(parseFloat(item.price))}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.licenseType, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="min-w-[3rem] text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.licenseType, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              {formatCurrency(parseFloat(item.price) * item.quantity)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.licenseType)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-xl font-semibold text-slate-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(cart.total)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700 h-12">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Proceed to Checkout
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Complete Your Purchase</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-semibold mb-2">Order Summary</h3>
                            <div className="space-y-1 text-sm">
                              {cart.items.map(item => (
                                <div key={item.licenseType} className="flex justify-between">
                                  <span>{item.licenseType} x{item.quantity}</span>
                                  <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-green-600">{formatCurrency(cart.total)}</span>
                            </div>
                          </div>
                          
                          <form onSubmit={handleSubmit(onCheckout)} className="space-y-4">
                            <div>
                              <Label htmlFor="customerName">Full Name</Label>
                              <Input
                                {...register("customerName")}
                                placeholder="John Smith"
                                className="mt-1"
                              />
                              {errors.customerName && (
                                <p className="text-sm text-red-600 mt-1">{errors.customerName.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="customerEmail">Email Address</Label>
                              <Input
                                {...register("customerEmail")}
                                type="email"
                                placeholder="john@company.com"
                                className="mt-1"
                              />
                              {errors.customerEmail && (
                                <p className="text-sm text-red-600 mt-1">{errors.customerEmail.message}</p>
                              )}
                            </div>
                            
                            <div className="flex space-x-4 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setCheckoutOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={checkoutMutation.isPending}
                              >
                                {checkoutMutation.isPending ? "Processing..." : "Complete Purchase"}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.history.back()}
                    >
                      <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                      Continue Shopping
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={clearCart}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}