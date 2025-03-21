import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminVendors from "@/pages/admin/Vendors";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminSettings from "@/pages/admin/Settings";
import VendorDashboard from "@/pages/vendor/Dashboard";
import VendorProducts from "@/pages/vendor/Products";
import VendorOrders from "@/pages/vendor/Orders";
import VendorSettings from "@/pages/vendor/Settings";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerSecurity from "@/pages/customer/Security";
import CustomerNotifications from "@/pages/customer/Notifications";
import CustomerPaymentMethods from "@/pages/customer/PaymentMethods";
import CustomerSettings from "@/pages/customer/Settings";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import { useAuth } from "@/context/AuthContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

function Router() {
  const { user, isLoading } = useAuth();

  // Wait until auth state is loaded
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/product/:id" component={ProductDetails} />
      
      {/* Admin routes - Only accessible by admin role */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/vendors" component={AdminVendors} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      {/* Vendor routes - Only accessible by vendor role */}
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/vendor/products" component={VendorProducts} />
      <Route path="/vendor/orders" component={VendorOrders} />
      <Route path="/vendor/settings" component={VendorSettings} />
      
      {/* Customer routes - Requires auth */}
      <Route path="/settings" component={CustomerSettings} />
      <Route path="/settings/profile" component={CustomerProfile} />
      <Route path="/settings/security" component={CustomerSecurity} />
      <Route path="/settings/notifications" component={CustomerNotifications} />
      <Route path="/settings/payment-methods" component={CustomerPaymentMethods} />
      <Route path="/checkout" component={Checkout} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
