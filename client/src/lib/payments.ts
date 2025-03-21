import { 
  processStripePayment, 
  processPayFastPayment, 
  processPayTodayPayment, 
  processDOPPayment,
  createPaymentIntent
} from './stripe';
import { PaymentGateway } from '@/components/payment/PaymentGatewaySelector';

/**
 * Central function to process payments with any supported payment gateway
 */
export const processPaymentWithGateway = async (
  gateway: PaymentGateway,
  paymentDetails: {
    amount: number;
    orderId: string;
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethodId?: string;
    returnUrl?: string;
    cancelUrl?: string;
    description?: string;
    itemName?: string;
  }
) => {
  const {
    amount,
    orderId,
    customerId,
    customerEmail,
    customerName,
    customerPhone,
    paymentMethodId,
    returnUrl,
    cancelUrl,
    description,
    itemName
  } = paymentDetails;

  switch (gateway) {
    case 'stripe':
      if (!paymentMethodId) {
        throw new Error("Payment method ID is required for Stripe payments");
      }
      return processStripePayment(
        paymentMethodId,
        amount,
        customerId || '',
        orderId
      );

    case 'payfast':
      if (!returnUrl || !cancelUrl) {
        throw new Error("Return URL and cancel URL are required for PayFast payments");
      }
      return processPayFastPayment(
        amount,
        orderId,
        returnUrl,
        cancelUrl,
        customerId,
        customerEmail,
        customerName,
        itemName
      );

    case 'paytoday':
      if (!customerPhone) {
        throw new Error("Customer phone number is required for PayToday payments");
      }
      return processPayTodayPayment(
        amount,
        orderId,
        customerPhone,
        customerId,
        customerEmail,
        customerName,
        description
      );

    case 'dop':
      if (!returnUrl) {
        throw new Error("Return URL is required for DOP payments");
      }
      return processDOPPayment(
        amount,
        orderId,
        returnUrl,
        customerId,
        customerEmail,
        customerName
      );

    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

/**
 * Get initial payment data based on the selected gateway
 */
export const getPaymentInitializationData = async (
  gateway: PaymentGateway,
  amount: number,
  metadata: any = {}
) => {
  switch (gateway) {
    case 'stripe':
      const clientSecret = await createPaymentIntent(amount, metadata);
      return { clientSecret };
      
    case 'payfast':
    case 'paytoday':
    case 'dop':
      // These gateways don't need initialization
      return null;
      
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

/**
 * Helper function to determine if a particular gateway requires a redirect flow
 */
export const isRedirectGateway = (gateway: PaymentGateway): boolean => {
  return gateway === 'payfast' || gateway === 'paytoday' || gateway === 'dop';
};

/**
 * Helper function to determine if a particular gateway requires client-side integration
 */
export const requiresClientIntegration = (gateway: PaymentGateway): boolean => {
  return gateway === 'stripe';
};

/**
 * Handle redirect response from gateway
 */
export const handlePaymentRedirect = async (
  gateway: PaymentGateway,
  response: any
) => {
  if (isRedirectGateway(gateway) && response.redirectUrl) {
    // For PayFast, we need to submit a form with the payment data
    if (gateway === 'payfast' && response.formData) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.redirectUrl;
      form.style.display = 'none';

      // Add all form fields
      Object.entries(response.formData).forEach(([key, value]) => {
        if (value) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
      });

      // Add form to body and submit
      document.body.appendChild(form);
      form.submit();
      return true;
    } 
    
    // For other gateways, just redirect to the URL
    window.location.href = response.redirectUrl;
    return true;
  }
  
  return false;
};