import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "./queryClient";
import { PaymentGateway } from "@/components/payment/PaymentGatewaySelector";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn("Missing Stripe key: VITE_STRIPE_PUBLIC_KEY. Stripe payments may not work correctly.");
}

// Initialize Stripe with the public key
export const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// Process payment with selected gateway
export const processPayment = async (gateway: PaymentGateway, paymentData: any) => {
  try {
    const response = await apiRequest("POST", `/api/process-payment/${gateway}`, paymentData);
    return response.json();
  } catch (error) {
    console.error(`Error processing ${gateway} payment:`, error);
    throw error;
  }
};

// Create a payment intent for one-time checkout with Stripe
export const createPaymentIntent = async (amount: number, metadata: any = {}) => {
  try {
    const response = await apiRequest("POST", "/api/create-payment-intent", {
      amount,
      metadata
    });
    
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

// Create a subscription for vendors
export const createVendorSubscription = async (priceId: string, customerId?: string) => {
  try {
    const response = await apiRequest("POST", "/api/get-or-create-subscription", {
      priceId,
      customerId
    });
    
    const data = await response.json();
    return {
      subscriptionId: data.subscriptionId,
      clientSecret: data.clientSecret
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

// Process payment with Stripe
export const processStripePayment = async (
  paymentMethodId: string,
  amount: number,
  customerId: string,
  orderId?: string
) => {
  return processPayment('stripe', {
    paymentMethodId,
    amount,
    customerId,
    orderId
  });
};

// Process payment with PayFast
export const processPayFastPayment = async (
  amount: number,
  orderId: string,
  returnUrl: string,
  cancelUrl: string,
  customerId?: string,
  customerEmail?: string,
  customerName?: string,
  itemName?: string
) => {
  return processPayment('payfast', {
    amount,
    orderId,
    returnUrl,
    cancelUrl,
    customerId,
    customerEmail,
    customerName,
    itemName
  });
};

// Process payment with PayToday
export const processPayTodayPayment = async (
  amount: number,
  orderId: string,
  customerPhone: string,
  customerId?: string,
  customerEmail?: string,
  customerName?: string,
  description?: string
) => {
  return processPayment('paytoday', {
    amount,
    orderId,
    customerPhone,
    customerId,
    customerEmail,
    customerName,
    description
  });
};

// Process payment with DOP
export const processDOPPayment = async (
  amount: number,
  orderId: string,
  returnUrl: string,
  customerId?: string,
  customerEmail?: string,
  customerName?: string
) => {
  return processPayment('dop', {
    amount,
    orderId,
    returnUrl,
    customerId,
    customerEmail,
    customerName
  });
};

// Process a payment with an existing Stripe payment method (legacy method)
export const processPaymentWithExistingMethod = async (
  paymentMethodId: string,
  amount: number,
  customerId: string,
  orderId?: string
) => {
  console.warn("processPaymentWithExistingMethod is deprecated. Use processStripePayment instead.");
  return processStripePayment(paymentMethodId, amount, customerId, orderId);
};

// Save a payment method for future use (Stripe only)
export const savePaymentMethod = async (paymentMethodId: string, customerId: string) => {
  try {
    const response = await apiRequest("POST", "/api/save-payment-method", {
      paymentMethodId,
      customerId
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving payment method:", error);
    throw error;
  }
};

// Get customer's saved payment methods (Stripe only)
export const getCustomerPaymentMethods = async (customerId: string) => {
  try {
    const response = await apiRequest("GET", `/api/payment-methods/${customerId}`, undefined);
    
    const data = await response.json();
    return data.paymentMethods;
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw error;
  }
};

// Delete a payment method (Stripe only)
export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    await apiRequest("DELETE", `/api/payment-methods/${paymentMethodId}`, undefined);
    return true;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
};
