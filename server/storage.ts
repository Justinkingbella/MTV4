import { 
  users, products, orders, orderItems, reviews, categories,
  productImages, productSpecifications, paymentTransactions,
  carts, cartItems, wishlists, vendorPayouts, notifications, activities,
  type User, type Product, type Order, type Review, type Category,
  type InsertUser, type InsertProduct, type InsertOrder, type InsertReview
} from "@shared/schema";
import { and, eq, inArray, avg, count, like, desc, asc, sql } from "drizzle-orm";
import { PgDatabase } from "drizzle-orm/pg-core";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(role?: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  approveVendor(id: number): Promise<User | undefined>;
  updateUserStripeInfo(id: number, data: { stripeCustomerId?: string, stripeSubscriptionId?: string }): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filters?: { vendorId?: number, categoryId?: number, approved?: boolean, status?: string, featured?: boolean }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined>;
  approveProduct(id: number, adminId: number): Promise<Product | undefined>;
  incrementProductViews(id: number): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(filters?: { customerId?: number, vendorId?: number, status?: string }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateProductRating(productId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private reviews: Map<number, Review>;
  private categories: Map<number, Category>;
  
  private userId: number;
  private productId: number;
  private orderId: number;
  private reviewId: number;
  private categoryId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.categories = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.reviewId = 1;
    this.categoryId = 1;
    
    // Initialize with some categories
    this.initializeCategories();
  }

  private initializeCategories() {
    const defaultCategories = [
      { name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1606765962248-7ff407b51667?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      { name: "Beauty & Health", slug: "beauty-health", imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      { name: "Home & Garden", slug: "home-garden", imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
      { name: "Sports & Outdoors", slug: "sports-outdoors", imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
    ];
    
    defaultCategories.forEach(category => {
      const id = this.categoryId++;
      const now = new Date().toISOString();
      
      this.categories.set(id, {
        id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl,
        createdAt: now,
      } as Category);
    });
  }

  // === User Methods ===
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsers(role?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    return users;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date().toISOString();
    
    const newUser: User = {
      id,
      ...user,
      createdAt: now,
    } as User;
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async approveVendor(id: number): Promise<User | undefined> {
    const vendor = this.users.get(id);
    
    if (!vendor || vendor.role !== "vendor") {
      return undefined;
    }
    
    const approvedVendor: User = {
      ...vendor,
      approved: true,
      updatedAt: new Date().toISOString(),
    };
    
    this.users.set(id, approvedVendor);
    return approvedVendor;
  }

  async updateUserStripeInfo(id: number, data: { stripeCustomerId?: string, stripeSubscriptionId?: string }): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: data.stripeCustomerId || user.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId || user.stripeSubscriptionId,
      updatedAt: new Date().toISOString(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // === Product Methods ===
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filters?: { vendorId?: number, categoryId?: number, approved?: boolean, status?: string, featured?: boolean }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.vendorId !== undefined) {
        products = products.filter(product => product.vendorId === filters.vendorId);
      }
      
      if (filters.categoryId !== undefined) {
        products = products.filter(product => product.categoryId === filters.categoryId);
      }
      
      if (filters.approved !== undefined) {
        products = products.filter(product => product.approved === filters.approved);
      }
      
      if (filters.status) {
        products = products.filter(product => product.status === filters.status);
      }
      
      if (filters.featured) {
        products = products.filter(product => product.featured);
      }
    }
    
    return products;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date().toISOString();
    
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const newProduct: Product = {
      id,
      ...product,
      slug,
      createdAt: now,
      status: product.status || "draft",
      approved: product.approved || false,
    } as Product;
    
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    
    if (!product) {
      return undefined;
    }
    
    // Update slug if name is changed
    let slug = product.slug;
    if (data.name && data.name !== product.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const updatedProduct: Product = {
      ...product,
      ...data,
      slug,
      updatedAt: new Date().toISOString(),
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async approveProduct(id: number, adminId: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    
    if (!product) {
      return undefined;
    }
    
    const approvedProduct: Product = {
      ...product,
      approved: true,
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: adminId,
      updatedAt: new Date().toISOString(),
    };
    
    this.products.set(id, approvedProduct);
    return approvedProduct;
  }

  async incrementProductViews(id: number): Promise<void> {
    const product = this.products.get(id);
    
    if (product) {
      product.views = (product.views || 0) + 1;
      this.products.set(id, product);
    }
  }

  // === Category Methods ===
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // === Order Methods ===
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(filters?: { customerId?: number, vendorId?: number, status?: string }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (filters) {
      if (filters.customerId !== undefined) {
        orders = orders.filter(order => order.customerId === filters.customerId);
      }
      
      // Vendor filtering would require joining with order items in a real DB
      // This is a simplified implementation
      
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }
    }
    
    return orders;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date().toISOString();
    
    // Generate a unique order number
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newOrder: Order = {
      id,
      ...order,
      orderNumber,
      createdAt: now,
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "pending",
    } as Order;
    
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    
    if (!order) {
      return undefined;
    }
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      completedAt: status === "delivered" ? new Date().toISOString() : order.completedAt,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // === Review Methods ===
  
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const now = new Date().toISOString();
    
    const newReview: Review = {
      id,
      ...review,
      createdAt: now,
      status: review.status || "pending",
    } as Review;
    
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateProductRating(productId: number): Promise<void> {
    const product = this.products.get(productId);
    
    if (!product) {
      return;
    }
    
    const reviews = Array.from(this.reviews.values())
      .filter(review => review.productId === productId && review.status === "approved");
    
    if (reviews.length === 0) {
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const updatedProduct: Product = {
      ...product,
      rating: parseFloat(averageRating.toFixed(2)),
      reviewCount: reviews.length,
      updatedAt: new Date().toISOString(),
    };
    
    this.products.set(productId, updatedProduct);
  }
}

export const storage = new MemStorage();
