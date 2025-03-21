import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/firebase";
import { useStripe, Elements, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, CreditCard, ShoppingCart, CheckCircle, AlertTriangle } from "lucide-react";
import PaymentGatewaySelector, { PaymentGateway } from "@/components/payment/PaymentGatewaySelector";
import { stripePromise } from "@/lib/stripe";
import { 
  getPaymentInitializationData, 
  processPaymentWithGateway, 
  isRedirectGateway,
  requiresClientIntegration,
  handlePaymentRedirect
} from "@/lib/payments";

const shippingSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  postalCode: z.string().min(3, {
    message: "Postal code must be at least 3 characters.",
  }),
  country: z.string().min(2, {
    message: "Please select a country.",
  }),
  shippingMethod: z.string({
    required_error: "Please select a shipping method.",
  }),
  notes: z.string().optional(),
});

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [location, setLocation] = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  
  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      city: userData?.city || "",
      state: userData?.state || "",
      postalCode: userData?.postalCode || "",
      country: userData?.country || "US",
      shippingMethod: "standard",
      notes: "",
    },
  });
  
  useEffect(() => {
    // Update shipping cost when shipping method changes
    const shippingMethod = form.watch("shippingMethod");
    if (shippingMethod === "express") {
      setShippingCost(15.99);
    } else if (shippingMethod === "priority") {
      setShippingCost(9.99);
    } else {
      setShippingCost(4.99);
    }
  }, [form.watch("shippingMethod")]);
  
  const handleSubmit = async (shippingData: z.infer<typeof shippingSchema>) => {
    if (!stripe || !elements) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmation`,
          payment_method_data: {
            billing_details: {
              name: `${shippingData.firstName} ${shippingData.lastName}`,
              email: shippingData.email,
              phone: shippingData.phone,
              address: {
                line1: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.postalCode,
                country: shippingData.country,
              },
            },
          },
        },
        redirect: "if_required",
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Create order in database
        const orderData = {
          customerId: userData?.id,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            vendorId: item.vendorId,
          })),
          shipping: {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
            address: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.postalCode,
            country: shippingData.country,
            method: shippingData.shippingMethod,
          },
          payment: {
            method: "stripe",
            transactionId: paymentIntent.id,
            amount: totalPrice + shippingCost,
            status: "completed",
          },
          notes: shippingData.notes,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        
        // In a real app, we would call our API
        // const orderId = await createOrder(orderData);
        
        setIsPaymentComplete(true);
        
        // Clear cart after successful order
        clearCart();
        
        toast({
          title: "Order Placed Successfully",
          description: "Your order has been placed and will be processed shortly.",
          variant: "default",
        });
        
        // Redirect to confirmation page
        setTimeout(() => {
          setLocation("/order/confirmation");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during the payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isPaymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Payment Successful!</h2>
        <p className="text-gray-600 text-center mb-6">
          Your order has been placed and will be processed shortly.
        </p>
        <p className="text-gray-600 text-center mb-6">
          Redirecting to confirmation page...
        </p>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Shipping Information</h2>
            <p className="text-sm text-gray-500 mb-4">Enter your shipping details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal/ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-medium">Shipping Method</h2>
            <p className="text-sm text-gray-500 mb-4">Select your preferred shipping method</p>
            
            <FormField
              control={form.control}
              name="shippingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="standard" />
                          <FormLabel htmlFor="standard" className="font-normal cursor-pointer">
                            <div>
                              <p className="font-medium">Standard Shipping</p>
                              <p className="text-sm text-gray-500">Delivery in 5-7 business days</p>
                            </div>
                          </FormLabel>
                        </div>
                        <p className="font-medium">$4.99</p>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="priority" id="priority" />
                          <FormLabel htmlFor="priority" className="font-normal cursor-pointer">
                            <div>
                              <p className="font-medium">Priority Shipping</p>
                              <p className="text-sm text-gray-500">Delivery in 2-3 business days</p>
                            </div>
                          </FormLabel>
                        </div>
                        <p className="font-medium">$9.99</p>
                      </div>
                      
                      <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="express" id="express" />
                          <FormLabel htmlFor="express" className="font-normal cursor-pointer">
                            <div>
                              <p className="font-medium">Express Shipping</p>
                              <p className="text-sm text-gray-500">Delivery in 1-2 business days</p>
                            </div>
                          </FormLabel>
                        </div>
                        <p className="font-medium">$15.99</p>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-medium">Order Notes (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Add any special instructions for your order</p>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any special delivery instructions, notes for the vendor, etc."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-medium mb-4">Payment Information</h2>
            <div className="border rounded-md p-6">
              <PaymentElement />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full lg:w-auto" 
          disabled={isSubmitting || !stripe || !elements}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Complete Payment (${(totalPrice + shippingCost).toFixed(2)})
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>("stripe");
  const [paymentStep, setPaymentStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [shippingData, setShippingData] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState(4.99);
  const { items, totalPrice, clearCart } = useCart();
  const { userData } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to cart if cart is empty
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      setLocation("/cart");
      return;
    }
    
    // Create a payment intent if Stripe is selected and we're on the payment step
    const initializePaymentGateway = async () => {
      if (requiresClientIntegration(selectedGateway) && paymentStep === 'payment') {
        try {
          const data = await getPaymentInitializationData(
            selectedGateway, 
            totalPrice + shippingCost
          );
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        } catch (error) {
          console.error(`Error initializing ${selectedGateway} payment:`, error);
          toast({
            title: "Payment Initialization Failed",
            description: "Could not initialize payment gateway. Please try again or choose a different payment method.",
            variant: "destructive",
          });
        }
      }
    };
    
    initializePaymentGateway();
  }, [items.length, selectedGateway, paymentStep, totalPrice, shippingCost, toast, setLocation]);

  // Form definition for checkout
  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      city: userData?.city || "",
      state: userData?.state || "",
      postalCode: userData?.postalCode || "",
      country: userData?.country || "US",
      shippingMethod: "standard",
      notes: "",
    },
  });
  
  // Handle shipping form submission
  const handleShippingSubmit = (data: z.infer<typeof shippingSchema>) => {
    setShippingData(data);
    
    // Update shipping cost based on the method
    if (data.shippingMethod === "express") {
      setShippingCost(15.99);
    } else if (data.shippingMethod === "priority") {
      setShippingCost(9.99);
    } else {
      setShippingCost(4.99);
    }
    
    // Move to payment step
    setPaymentStep('payment');
  };
  
  // Handle payment gateway selection
  const handleGatewayChange = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    
    // Reset client secret if changing from Stripe to another gateway
    if (gateway !== 'stripe') {
      setClientSecret('');
    } else {
      // Initialize stripe if selecting it
      getPaymentInitializationData(gateway, totalPrice + shippingCost)
        .then(data => {
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch(error => {
          console.error("Error initializing Stripe:", error);
        });
    }
  };
  
  // Process payment with non-Stripe gateways
  const handleExternalPayment = async () => {
    if (!shippingData) return;
    
    setIsProcessing(true);
    
    try {
      // Generate an order ID
      const generatedOrderId = `ORD-${Date.now()}`;
      setOrderId(generatedOrderId);
      
      // Prepare common payment details
      const paymentDetails = {
        amount: totalPrice + shippingCost,
        orderId: generatedOrderId,
        customerId: userData?.id,
        customerEmail: shippingData.email,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone || "",
        returnUrl: `${window.location.origin}/order/confirmation`,
        cancelUrl: `${window.location.origin}/checkout`,
        description: `Order #${generatedOrderId}`,
        itemName: `Order #${generatedOrderId} (${items.length} items)`
      };
      
      // Process payment with selected gateway
      const response = await processPaymentWithGateway(selectedGateway, paymentDetails);
      
      // Handle redirect-based payment gateways
      if (isRedirectGateway(selectedGateway)) {
        const redirected = await handlePaymentRedirect(selectedGateway, response);
        
        if (redirected) {
          // If the redirect was handled, we'll wait for the webhook
          return;
        }
      }
      
      // If we got here, payment was successful without redirect
      handlePaymentSuccess(generatedOrderId);
    } catch (error: any) {
      console.error(`Payment error (${selectedGateway}):`, error);
      toast({
        title: "Payment Failed",
        description: error.message || `An error occurred during the ${selectedGateway} payment process. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle successful payment
  const handlePaymentSuccess = (paymentOrderId: string) => {
    setIsPaymentComplete(true);
    clearCart();
    
    toast({
      title: "Order Placed Successfully",
      description: "Your order has been placed and will be processed shortly.",
      variant: "default",
    });
    
    // Redirect to confirmation page
    setTimeout(() => {
      setLocation("/order/confirmation");
    }, 2000);
  };
  
  // Render loading state
  if ((requiresClientIntegration(selectedGateway) && !clientSecret && paymentStep === 'payment') || isProcessing) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Preparing your payment...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Render payment success state
  if (isPaymentComplete) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Payment Successful!</h2>
            <p className="text-gray-600 text-center mb-6">
              Your order has been placed and will be processed shortly.
            </p>
            <p className="text-gray-600 text-center mb-6">
              Redirecting to confirmation page...
            </p>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Checkout</h1>
          
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <button 
              onClick={() => setLocation("/cart")}
              className="text-primary hover:text-primary/80"
            >
              Cart
            </button>
            <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">Checkout</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {paymentStep === 'shipping' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleShippingSubmit)} className="space-y-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-medium">Shipping Information</h2>
                        <p className="text-sm text-gray-500 mb-4">Enter your shipping details</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-base font-medium mb-3">Shipping Method</h3>
                          <FormField
                            control={form.control}
                            name="shippingMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-2"
                                  >
                                    <div className="flex items-center justify-between border rounded-md p-3">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="standard" id="standard" />
                                        <FormLabel htmlFor="standard" className="cursor-pointer">
                                          <div>
                                            <p className="font-medium">Standard Shipping</p>
                                            <p className="text-sm text-gray-500">Delivery in 5-7 business days</p>
                                          </div>
                                        </FormLabel>
                                      </div>
                                      <p className="font-medium">$4.99</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border rounded-md p-3">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="priority" id="priority" />
                                        <FormLabel htmlFor="priority" className="cursor-pointer">
                                          <div>
                                            <p className="font-medium">Priority Shipping</p>
                                            <p className="text-sm text-gray-500">Delivery in 2-3 business days</p>
                                          </div>
                                        </FormLabel>
                                      </div>
                                      <p className="font-medium">$9.99</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border rounded-md p-3">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="express" id="express" />
                                        <FormLabel htmlFor="express" className="cursor-pointer">
                                          <div>
                                            <p className="font-medium">Express Shipping</p>
                                            <p className="text-sm text-gray-500">Delivery in 1-2 business days</p>
                                          </div>
                                        </FormLabel>
                                      </div>
                                      <p className="font-medium">$15.99</p>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="mt-6">
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Notes (optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Special instructions for delivery"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end mt-6">
                          <Button type="submit" size="lg">
                            Continue to Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            
            {paymentStep === 'payment' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">Payment Method</h2>
                  <Button variant="outline" size="sm" onClick={() => setPaymentStep('shipping')}>
                    Back to Shipping
                  </Button>
                </div>
                
                {/* Payment Gateway Selector */}
                <div className="mb-8">
                  <PaymentGatewaySelector
                    selectedGateway={selectedGateway}
                    onSelect={handleGatewayChange}
                  />
                </div>
                
                {/* Payment Form - Stripe */}
                {selectedGateway === 'stripe' && clientSecret && (
                  <div className="mb-6">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <div className="bg-white rounded-lg p-4 border">
                        <h3 className="text-sm font-medium mb-4 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Card Details
                        </h3>
                        <PaymentElement />
                        <Button className="w-full mt-6" onClick={() => {
                          // Implementation would use the Stripe Elements
                          toast({
                            title: "Processing Payment",
                            description: "Your payment is being processed...",
                          });
                        }}>
                          Pay ${(totalPrice + shippingCost).toFixed(2)}
                        </Button>
                      </div>
                    </Elements>
                  </div>
                )}
                
                {/* Payment Form - External Gateways (PayFast, PayToday, DOP) */}
                {selectedGateway !== 'stripe' && (
                  <div className="space-y-6">
                    <Card className="bg-gray-50 border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <p className="text-sm text-gray-600">
                            You'll be redirected to {selectedGateway === 'payfast' ? 'PayFast' : 
                              selectedGateway === 'paytoday' ? 'PayToday' : 'DOP'} to complete your payment.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Button className="w-full" onClick={handleExternalPayment}>
                      Proceed to {selectedGateway === 'payfast' ? 'PayFast' : 
                        selectedGateway === 'paytoday' ? 'PayToday' : 'DOP'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex">
                      <div className="h-16 w-16 rounded overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{paymentStep === 'shipping' ? 'Calculated at next step' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>${paymentStep === 'shipping' ? totalPrice.toFixed(2) : (totalPrice + shippingCost).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
