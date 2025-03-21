import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import CustomerLayout from "@/components/layout/CustomerLayout";
import Profile from "./Profile";
import Security from "./Security";
import Notifications from "./Notifications";
import PaymentMethods from "./PaymentMethods";
import { useAuth } from "@/context/AuthContext";

export default function CustomerSettings() {
  const { userData } = useAuth();
  const [location, setLocation] = useLocation();
  const [matchProfile] = useRoute("/settings/profile");
  const [matchSecurity] = useRoute("/settings/security");
  const [matchNotifications] = useRoute("/settings/notifications");
  const [matchPaymentMethods] = useRoute("/settings/payment-methods");
  
  // Redirect to profile page by default
  useEffect(() => {
    if (location === "/settings") {
      setLocation("/settings/profile");
    }
  }, [location, setLocation]);
  
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  let content;
  let title = "Account Settings";
  let description = "Manage your account settings and preferences.";
  
  if (matchProfile) {
    content = <Profile />;
    title = "Profile Information";
    description = "Update your personal information and how others see you on the platform.";
  } else if (matchSecurity) {
    content = <Security />;
    title = "Password & Security";
    description = "Change your password and manage security settings.";
  } else if (matchNotifications) {
    content = <Notifications />;
    title = "Notification Preferences";
    description = "Choose what notifications you want to receive.";
  } else if (matchPaymentMethods) {
    content = <PaymentMethods />;
    title = "Payment Methods";
    description = "Add and manage your payment methods.";
  }
  
  return (
    <CustomerLayout title={title} description={description}>
      {content}
    </CustomerLayout>
  );
}
