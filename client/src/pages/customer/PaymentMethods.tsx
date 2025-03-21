import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  getCustomerPaymentMethods, 
  savePaymentMethod, 
  deletePaymentMethod 
} from "@/lib/stripe";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const cardSchema = z.object({
  cardHolderName: z.string().min(2, {
    message: "Card holder name must be at least 2 characters.",
  }),
  cardNumber: z.string().refine(
    (value) => /^\d{13,19}$/.test(value.replace(/\s/g, "")), {
      message: "Please enter a valid card number.",
    }
  ),
  expiryDate: z.string().refine(
    (value) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value), {
      message: "Please enter a valid expiry date (MM/YY).",
    }
  ),
  cvv: z.string().refine(
    (value) => /^\d{3,4}$/.test(value), {
      message: "Please enter a valid CVV code.",
    }
  ),
});

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
}

export default function PaymentMethods() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardHolderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });
  
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!userData?.id) return;
      
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from Stripe
        // const methods = await getCustomerPaymentMethods(userData.id);
        
        // For now, use mock data
        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: "pm_1234567890",
            brand: "visa",
            last4: "4242",
            expMonth: 12,
            expYear: 24,
            cardholderName: "John Doe"
          },
          {
            id: "pm_0987654321",
            brand: "mastercard",
            last4: "5678",
            expMonth: 10,
            expYear: 25,
            cardholderName: "John Doe"
          }
        ];
        
        setSavedPaymentMethods(mockPaymentMethods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          title: "Error",
          description: "Failed to load payment methods.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [userData?.id, toast]);
  
  const onSubmit = async (values: z.infer<typeof cardSchema>) => {
    if (!userData?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add a payment method.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call Stripe
      // const paymentMethodId = await createPaymentMethod(values);
      // await savePaymentMethod(paymentMethodId, userData.id);
      
      // Mock adding a new payment method
      const [expMonth, expYear] = values.expiryDate.split('/');
      const newPaymentMethod: PaymentMethod = {
        id: `pm_new${Date.now()}`,
        brand: "visa",
        last4: values.cardNumber.slice(-4),
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        cardholderName: values.cardHolderName
      };
      
      setSavedPaymentMethods(prev => [...prev, newPaymentMethod]);
      
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePaymentMethod = async () => {
    if (!selectedPaymentMethodId) return;
    
    try {
      // In a real app, we would call Stripe
      // await deletePaymentMethod(selectedPaymentMethodId);
      
      // Mock deleting payment method
      setSavedPaymentMethods(prev => 
        prev.filter(method => method.id !== selectedPaymentMethodId)
      );
      
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSelectedPaymentMethodId(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-6">Add New Payment Method</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cardHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name as appears on card" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    {...field} 
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      form.setValue("cardNumber", formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input placeholder="MM/YY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Saved Payment Methods</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : savedPaymentMethods.length === 0 ? (
          <p className="text-sm text-gray-500">No payment methods saved yet.</p>
        ) : (
          <div className="space-y-4">
            {savedPaymentMethods.map((method) => (
              <div 
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-md"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {method.brand === "visa" ? (
                      <div className="bg-blue-100 p-2 rounded-md text-blue-800 text-xs font-bold uppercase">
                        VISA
                      </div>
                    ) : method.brand === "mastercard" ? (
                      <div className="bg-red-100 p-2 rounded-md text-red-800 text-xs font-bold uppercase">
                        MC
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-2 rounded-md text-gray-800 text-xs font-bold uppercase">
                        CARD
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                
                <AlertDialog
                  open={isDeleteDialogOpen && selectedPaymentMethodId === method.id}
                  onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedPaymentMethodId(null);
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPaymentMethodId(method.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this payment method? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeletePaymentMethod}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
