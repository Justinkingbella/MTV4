import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Platform settings form schema
const platformSettingsSchema = z.object({
  platformName: z.string().min(2, {
    message: "Platform name must be at least 2 characters.",
  }),
  supportEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().optional(),
  platformLogo: z.string().optional(),
  platformCurrency: z.string().min(1, {
    message: "Please select a currency.",
  }),
  platformLanguage: z.string().min(1, {
    message: "Please select a language.",
  }),
  allowUserRegistration: z.boolean().default(true),
  requireVendorApproval: z.boolean().default(true),
  requireProductApproval: z.boolean().default(true),
});

// Commission settings form schema
const commissionSettingsSchema = z.object({
  defaultCommissionRate: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid commission rate (e.g., 10 or 10.5).",
  }),
  minCommissionAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid minimum amount.",
  }),
  vendorPayoutThreshold: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid payout threshold.",
  }),
  payoutSchedule: z.string().min(1, {
    message: "Please select a payout schedule.",
  }),
});

// Payment settings form schema
const paymentSettingsSchema = z.object({
  stripeEnabled: z.boolean().default(true),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalEnabled: z.boolean().default(false),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
});

export default function AdminSettings() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Platform settings form
  const platformForm = useForm<z.infer<typeof platformSettingsSchema>>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: "VendorHub",
      supportEmail: "support@vendorhub.com",
      contactPhone: "+1 (123) 456-7890",
      platformCurrency: "USD",
      platformLanguage: "en",
      allowUserRegistration: true,
      requireVendorApproval: true,
      requireProductApproval: true,
    },
  });
  
  // Commission settings form
  const commissionForm = useForm<z.infer<typeof commissionSettingsSchema>>({
    resolver: zodResolver(commissionSettingsSchema),
    defaultValues: {
      defaultCommissionRate: "10",
      minCommissionAmount: "1.00",
      vendorPayoutThreshold: "50.00",
      payoutSchedule: "monthly",
    },
  });
  
  // Payment settings form
  const paymentForm = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripeEnabled: true,
      stripePublicKey: "",
      stripeSecretKey: "",
      paypalEnabled: false,
      paypalClientId: "",
      paypalClientSecret: "",
    },
  });
  
  const onPlatformSubmit = async (values: z.infer<typeof platformSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we would save these values to Firebase or a database
      console.log("Platform settings saved:", values);
      
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onCommissionSubmit = async (values: z.infer<typeof commissionSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we would save these values to Firebase or a database
      console.log("Commission settings saved:", values);
      
      toast({
        title: "Settings Saved",
        description: "Commission settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onPaymentSubmit = async (values: z.infer<typeof paymentSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we would save these values to Firebase or a database
      console.log("Payment settings saved:", values);
      
      toast({
        title: "Settings Saved",
        description: "Payment settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-600">Configure platform settings and preferences</p>
      </div>
      
      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>
        
        {/* Platform Settings */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure your platform name, contact information, and general settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...platformForm}>
                <form onSubmit={platformForm.handleSubmit(onPlatformSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={platformForm.control}
                      name="platformName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="platformLogo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>Optional. Enter a URL for your platform logo.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="platformCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="platformLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={platformForm.control}
                      name="allowUserRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Allow User Registration</FormLabel>
                            <FormDescription>
                              When disabled, new users cannot register on the platform.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="requireVendorApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Vendor Approval</FormLabel>
                            <FormDescription>
                              When enabled, new vendor accounts require admin approval.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={platformForm.control}
                      name="requireProductApproval"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Product Approval</FormLabel>
                            <FormDescription>
                              When enabled, new products require admin approval before being listed.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Commission Settings */}
        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>
                Configure commission rates and vendor payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...commissionForm}>
                <form onSubmit={commissionForm.handleSubmit(onCommissionSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={commissionForm.control}
                      name="defaultCommissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The percentage of each sale that the platform takes.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={commissionForm.control}
                      name="minCommissionAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Commission Amount</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The minimum amount of commission per order.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={commissionForm.control}
                      name="vendorPayoutThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Payout Threshold</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Minimum amount required for vendor payouts.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={commissionForm.control}
                      name="payoutSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout Schedule</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often vendors receive payouts.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure payment gateways and methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                  {/* Stripe Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="stripeEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Stripe Payments</FormLabel>
                            <FormDescription>
                              Allow payments via Stripe.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("stripeEnabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4 mt-4">
                        <FormField
                          control={paymentForm.control}
                          name="stripePublicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Public Key</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="pk_..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Secret Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="sk_..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* PayPal Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="paypalEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable PayPal Payments</FormLabel>
                            <FormDescription>
                              Allow payments via PayPal.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("paypalEnabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4 mt-4">
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PayPal Client ID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PayPal Client Secret</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
