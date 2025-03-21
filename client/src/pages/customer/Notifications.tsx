import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Bell } from "lucide-react";
import NotificationToggle from "@/components/ui/notification-toggle";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function Notifications() {
  const { userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize notification preferences from userData or with defaults
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "orderUpdates",
      title: "Order Updates",
      description: "Receive notifications about your order status.",
      enabled: userData?.notifications?.orderUpdates ?? true
    },
    {
      id: "newDeals",
      title: "New Deals & Promotions",
      description: "Get notified about new deals and special offers.",
      enabled: userData?.notifications?.newDeals ?? true
    },
    {
      id: "wishlist",
      title: "Wishlist Updates",
      description: "Get notified when items in your wishlist change price or go back in stock.",
      enabled: userData?.notifications?.wishlist ?? true
    },
    {
      id: "accountAlerts",
      title: "Account Alerts",
      description: "Receive security alerts and account change notifications.",
      enabled: userData?.notifications?.accountAlerts ?? true
    },
    {
      id: "marketing",
      title: "Marketing Emails",
      description: "Receive marketing and promotional emails.",
      enabled: userData?.notifications?.marketing ?? false
    }
  ]);
  
  const handleToggle = (id: string, isEnabled: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: isEnabled } : pref
      )
    );
  };
  
  const handleSavePreferences = async () => {
    setIsSubmitting(true);
    
    try {
      // Convert preferences array to object for storage
      const notificationSettings = preferences.reduce((acc, pref) => {
        acc[pref.id] = pref.enabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      await updateUserData({
        notifications: notificationSettings
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="space-y-6">
        {preferences.map((pref) => (
          <NotificationToggle
            key={pref.id}
            title={pref.title}
            description={pref.description}
            isEnabled={pref.enabled}
            onChange={(isEnabled) => handleToggle(pref.id, isEnabled)}
          />
        ))}
        
        <Button 
          onClick={handleSavePreferences} 
          disabled={isSubmitting}
          className="mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
