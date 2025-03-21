import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  ShoppingBag, 
  ExternalLink, 
  Printer, 
  CreditCard, 
  Globe, 
  Calendar
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentGateway } from "@/components/payment/PaymentGatewaySelector";
import { SiStripe, SiPaypal } from "react-icons/si";
import { FiCreditCard } from "react-icons/fi";

// Map payment methods to icons and display names
const PAYMENT_METHOD_INFO = {
  stripe: {
    icon: SiStripe,
    name: "Stripe",
    lastDigits: "4242", // Example for Stripe
    maskedCard: "•••• 4242"
  },
  payfast: {
    icon: FiCreditCard,
    name: "PayFast",
    lastDigits: "8888", // Example for PayFast
    maskedCard: "•••• 8888"
  },
  paytoday: {
    icon: SiPaypal,
    name: "PayToday",
    lastDigits: "5555", // Example for PayToday
    maskedCard: "•••• 5555"
  },
  dop: {
    icon: Globe,
    name: "DOP",
    lastDigits: "9999", // Example for DOP
    maskedCard: "•••• 9999"
  }
};

export default function OrderConfirmation() {
  const [location, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>("stripe");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();
  const { userData } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        // Get order ID from URL query params if present
        const url = new URL(window.location.href);
        const orderIdFromUrl = url.searchParams.get("order_id");
        const paymentGateway = (url.searchParams.get("payment_method") as PaymentGateway) || "stripe";
        
        // In a real app, we would fetch order details from the API
        // For now, we'll use the URL parameters or generate random values
        const generatedOrderNumber = orderIdFromUrl || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        
        setOrderNumber(generatedOrderNumber);
        setPaymentMethod(paymentGateway);
        setShippingMethod(url.searchParams.get("shipping_method") || "standard");
        
        if (url.searchParams.get("order_date")) {
          setOrderDate(new Date(url.searchParams.get("order_date") || ""));
        }
        
        // Clear the cart since order is complete
        clearCart();
        
        // Success notification
        toast({
          title: "Order Confirmed",
          description: `Order #${generatedOrderNumber} has been successfully placed.`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          title: "Error",
          description: "Could not retrieve order details. Please contact customer support.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
    
    // Update page title
    document.title = "Order Confirmation | Vendorly";
    
    return () => {
      document.title = "Vendorly";
    };
  }, [clearCart, toast]);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="pt-6 px-6 pb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been received and is now being processed.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                  <p className="text-base font-medium">{orderNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                  <p className="text-base">
                    {orderDate.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                  <p className="text-base flex items-center">
                    {paymentMethod && PAYMENT_METHOD_INFO[paymentMethod] ? (
                      <>
                        <span className="inline-flex items-center mr-2">
                          {React.createElement(PAYMENT_METHOD_INFO[paymentMethod].icon, {
                            className: "h-4 w-4 mr-1"
                          })}
                        </span>
                        {PAYMENT_METHOD_INFO[paymentMethod].name} 
                        {PAYMENT_METHOD_INFO[paymentMethod].maskedCard && 
                          <span className="ml-1">({PAYMENT_METHOD_INFO[paymentMethod].maskedCard})</span>
                        }
                      </>
                    ) : (
                      "Credit Card"
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Shipping Method</h3>
                  <p className="text-base">
                    {shippingMethod === "express" ? "Express Shipping (1-2 business days)" : 
                     shippingMethod === "priority" ? "Priority Shipping (2-3 business days)" : 
                     "Standard Shipping (5-7 business days)"}
                  </p>
                </div>
                
                {userData && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                      <p className="text-base">
                        {userData.address ? (
                          <>
                            {userData.address}, {userData.city}<br />
                            {userData.state}, {userData.postalCode}, {userData.country}
                          </>
                        ) : (
                          "Not available"
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
                      <p className="text-base">{userData.email || "Not available"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              <p>
                A confirmation email has been sent to your email address. You can track your order status in your account.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Link href="/">
                <Button className="w-full sm:w-auto" size="lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
              
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="w-1/2 sm:w-auto">
                  <Printer className="mr-2 h-5 w-5" />
                  Print Receipt
                </Button>
                
                <Link href="/account/orders">
                  <Button variant="outline" size="lg" className="w-1/2 sm:w-auto">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Track Order
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Questions about your order? <span className="text-primary hover:underline">Contact our support team</span>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
