import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertProductSchema, insertReviewSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Payment gateways initialization
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe payment processing may not work correctly.');
}

// Stripe initialization
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

// PayFast configuration variables (would come from environment in production)
const payFastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || "10000100",
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
  passphrase: process.env.PAYFAST_PASSPHRASE || "",
  testMode: true,
  baseUrl: "https://sandbox.payfast.co.za"
};

// PayToday configuration variables
const payTodayConfig = {
  apiKey: process.env.PAYTODAY_API_KEY || "test_api_key",
  secretKey: process.env.PAYTODAY_SECRET_KEY || "test_secret_key",
  testMode: true,
  baseUrl: "https://api.sandbox.paytoday.com"
};

// Digital Online Payments (DOP) configuration variables
const dopConfig = {
  merchantId: process.env.DOP_MERCHANT_ID || "test_merchant",
  apiKey: process.env.DOP_API_KEY || "test_api_key",
  testMode: true,
  baseUrl: "https://api.sandbox.dop.com"
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // === Auth Routes ===
  
  // Create user account
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Failed to register user" });
      }
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      // This would typically use a token from the request
      const uid = req.headers.authorization?.split(" ")[1];
      
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ error: "Failed to fetch user information" });
    }
  });

  // === User Management Routes ===
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getUsers(role);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // In a real app, you'd validate permissions here
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Approve vendor
  app.post("/api/vendors/:id/approve", async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendor = await storage.approveVendor(vendorId);
      
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error(`Error approving vendor ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to approve vendor" });
    }
  });

  // === Product Routes ===
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        vendorId: req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        approved: req.query.approved === "true" ? true : 
                 req.query.approved === "false" ? false : undefined,
        status: req.query.status as string | undefined,
        featured: req.query.featured === "true" ? true : undefined,
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Increment view count
      await storage.incrementProductViews(productId);
      
      res.json(product);
    } catch (error) {
      console.error(`Error fetching product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  // Update product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error(`Error updating product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Approve product
  app.post("/api/products/:id/approve", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const adminId = req.body.adminId;
      
      if (!adminId) {
        return res.status(400).json({ error: "Admin ID is required" });
      }
      
      const product = await storage.approveProduct(productId, adminId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error(`Error approving product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to approve product" });
    }
  });

  // === Category Routes ===
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // === Order Routes ===
  
  // Get all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const filters = {
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        vendorId: req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined,
        status: req.query.status as string | undefined,
      };
      
      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error(`Error fetching order ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  });

  // Update order status
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error(`Error updating order status ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // === Review Routes ===
  
  // Get reviews for a product
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error(`Error fetching reviews for product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      
      // Update product rating
      await storage.updateProductRating(reviewData.productId);
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to create review" });
      }
    }
  });

  // === Stripe Payment Routes ===
  
  // Create payment intent for one-time payment
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { amount, metadata = {} } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata,
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Create subscription for vendors
  app.post("/api/get-or-create-subscription", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { userId, priceId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }
      
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      }
      
      // Create or get Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName,
        });
        
        stripeCustomerId = customer.id;
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId });
      }
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update user with subscription ID
      await storage.updateUserStripeInfo(user.id, { 
        stripeCustomerId, 
        stripeSubscriptionId: subscription.id 
      });
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Process payment with existing payment method (Stripe)
  app.post("/api/process-payment/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { paymentMethodId, amount, customerId, orderId } = req.body;
      
      if (!paymentMethodId || !amount || !customerId) {
        return res.status(400).json({ error: "Payment method ID, amount, and customer ID are required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        metadata: { orderId },
      });
      
      res.json({ 
        success: true, 
        gateway: "stripe",
        paymentIntent: { 
          id: paymentIntent.id, 
          status: paymentIntent.status 
        } 
      });
    } catch (error: any) {
      console.error("Error processing Stripe payment:", error);
      res.status(500).json({ error: "Failed to process Stripe payment" });
    }
  });
  
  // Process payment with PayFast
  app.post("/api/process-payment/payfast", async (req, res) => {
    try {
      const { amount, orderId, returnUrl, cancelUrl, customerId, customerEmail, customerName, itemName } = req.body;
      
      if (!amount || !orderId || !returnUrl || !cancelUrl) {
        return res.status(400).json({ 
          error: "Amount, order ID, return URL, and cancel URL are required" 
        });
      }
      
      // Generate a unique payment ID
      const paymentId = `PF-${orderId}-${Date.now()}`;
      
      // Create a payment form data to redirect the user
      const paymentData = {
        merchant_id: payFastConfig.merchantId,
        merchant_key: payFastConfig.merchantKey,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: `${req.protocol}://${req.get('host')}/api/payment-webhook/payfast`,
        name_first: customerName?.split(' ')[0] || '',
        name_last: customerName?.split(' ').slice(1).join(' ') || '',
        email_address: customerEmail || '',
        m_payment_id: paymentId,
        amount: amount.toFixed(2),
        item_name: itemName || `Order #${orderId}`,
        custom_int1: orderId,
        custom_str1: customerId || ''
      };
      
      // In a real implementation, we would generate a signature
      // paymentData.signature = generatePayFastSignature(paymentData, payFastConfig.passphrase);
      
      res.json({
        success: true,
        gateway: "payfast",
        redirectUrl: payFastConfig.testMode 
          ? payFastConfig.baseUrl + '/eng/process' 
          : 'https://www.payfast.co.za/eng/process',
        formData: paymentData
      });
    } catch (error: any) {
      console.error("Error creating PayFast payment:", error);
      res.status(500).json({ error: "Failed to create PayFast payment" });
    }
  });
  
  // Process payment with PayToday
  app.post("/api/process-payment/paytoday", async (req, res) => {
    try {
      const { amount, orderId, customerId, customerEmail, customerName, customerPhone, description } = req.body;
      
      if (!amount || !orderId || !customerPhone) {
        return res.status(400).json({ 
          error: "Amount, order ID, and customer phone are required" 
        });
      }
      
      // In a real implementation, we would make an API call to PayToday
      // For demo purposes, we'll simulate the API response
      
      // Generate a unique reference
      const reference = `PT-${orderId}-${Date.now()}`;
      
      // Construct what would be sent to PayToday API
      const paymentData = {
        reference,
        amount: amount.toFixed(2),
        phoneNumber: customerPhone,
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        description: description || `Order #${orderId}`,
        metadata: {
          orderId,
          customerId: customerId || ''
        },
        callbackUrl: `${req.protocol}://${req.get('host')}/api/payment-webhook/paytoday`
      };
      
      // Normally this would be returned from the PayToday API
      const paymentResponse = {
        status: 'pending',
        paymentId: reference,
        paymentUrl: `https://pay.paytoday.com.na/pay/${reference}`
      };
      
      res.json({
        success: true,
        gateway: "paytoday",
        paymentId: paymentResponse.paymentId,
        redirectUrl: paymentResponse.paymentUrl,
        status: paymentResponse.status
      });
    } catch (error: any) {
      console.error("Error creating PayToday payment:", error);
      res.status(500).json({ error: "Failed to create PayToday payment" });
    }
  });
  
  // Process payment with Digital Online Payments (DOP)
  app.post("/api/process-payment/dop", async (req, res) => {
    try {
      const { amount, orderId, customerId, customerEmail, customerName, returnUrl } = req.body;
      
      if (!amount || !orderId || !returnUrl) {
        return res.status(400).json({ 
          error: "Amount, order ID, and return URL are required" 
        });
      }
      
      // Generate a unique transaction ID
      const transactionId = `DOP-${orderId}-${Date.now()}`;
      
      // Construct what would be sent to DOP API
      const paymentData = {
        merchantId: dopConfig.merchantId,
        transactionId,
        amount: amount.toFixed(2),
        currency: 'USD',
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        description: `Order #${orderId}`,
        metadata: {
          orderId,
          customerId: customerId || ''
        },
        callbackUrl: `${req.protocol}://${req.get('host')}/api/payment-webhook/dop`,
        returnUrl
      };
      
      // Normally this would be returned from the DOP API
      const paymentResponse = {
        status: 'created',
        paymentId: transactionId,
        paymentUrl: `https://checkout.dopdigital.com/pay/${transactionId}`
      };
      
      res.json({
        success: true,
        gateway: "dop",
        paymentId: paymentResponse.paymentId,
        redirectUrl: paymentResponse.paymentUrl,
        status: paymentResponse.status
      });
    } catch (error: any) {
      console.error("Error creating DOP payment:", error);
      res.status(500).json({ error: "Failed to create DOP payment" });
    }
  });

  // Save payment method
  app.post("/api/save-payment-method", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { paymentMethodId, customerId } = req.body;
      
      if (!paymentMethodId || !customerId) {
        return res.status(400).json({ error: "Payment method ID and customer ID are required" });
      }
      
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving payment method:", error);
      res.status(500).json({ error: "Failed to save payment method" });
    }
  });

  // Get customer payment methods
  app.get("/api/payment-methods/:customerId", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
      
      res.json({ paymentMethods: paymentMethods.data });
    } catch (error: any) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Delete payment method
  app.delete("/api/payment-methods/:paymentMethodId", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    try {
      const { paymentMethodId } = req.params;
      
      if (!paymentMethodId) {
        return res.status(400).json({ error: "Payment method ID is required" });
      }
      
      await stripe.paymentMethods.detach(paymentMethodId);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ error: "Failed to delete payment method" });
    }
  });
  
  // === Payment Webhook Routes ===
  
  // Stripe webhook
  app.post("/api/payment-webhook/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    
    let event;
    const signature = req.headers['stripe-signature'];
    
    try {
      // In a real implementation, we would verify the webhook signature
      // event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      
      // For demo purposes, we'll assume the event is valid
      event = req.body;
      
      // Handle the event based on its type
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          // Update order payment status
          await storage.updateOrderStatus(parseInt(orderId), 'processing');
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // PayFast webhook
  app.post("/api/payment-webhook/payfast", async (req, res) => {
    try {
      // PayFast sends payment notification data in the request body
      const { custom_int1, payment_status, m_payment_id } = req.body;
      
      // In a real implementation, we would verify the ITN (Instant Transaction Notification)
      // is actually from PayFast and not spoofed
      
      if (payment_status === 'COMPLETE' && custom_int1) {
        // Update order payment status
        await storage.updateOrderStatus(parseInt(custom_int1), 'processing');
      }
      
      // PayFast expects an empty response with a 200 status code
      res.status(200).send('');
    } catch (error: any) {
      console.error('PayFast webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // PayToday webhook
  app.post("/api/payment-webhook/paytoday", async (req, res) => {
    try {
      // PayToday would send payment details in the request body
      const { reference, status, payment_id } = req.body;
      
      // Extract orderId from reference (PT-orderId-timestamp)
      const orderId = reference.split('-')[1];
      
      if (status === 'successful' && orderId) {
        // Update order payment status
        await storage.updateOrderStatus(parseInt(orderId), 'processing');
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('PayToday webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // DOP webhook
  app.post("/api/payment-webhook/dop", async (req, res) => {
    try {
      // DOP would send payment details in the request body
      const { transaction_id, status, metadata } = req.body;
      
      // Extract orderId from transaction_id (DOP-orderId-timestamp) or from metadata
      let orderId;
      if (metadata && metadata.orderId) {
        orderId = metadata.orderId;
      } else {
        orderId = transaction_id.split('-')[1];
      }
      
      if (status === 'completed' && orderId) {
        // Update order payment status
        await storage.updateOrderStatus(parseInt(orderId), 'processing');
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('DOP webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
