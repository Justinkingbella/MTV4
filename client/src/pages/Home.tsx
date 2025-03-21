import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard from "@/components/ui/product-card";
import VendorCard from "@/components/ui/vendor-card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/firebase";
import { ShoppingBag, ArrowRight, Truck, Shield, CheckCircle, Award } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  vendorId: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

interface Vendor {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
}

export default function Home() {
  const { toast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from Firebase
        // For now, use mock data
        
        // Featured Products
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Premium Wireless Headphones",
            description: "High-quality sound with noise cancellation feature.",
            price: 89.99,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: 4.8,
            vendorId: "v1",
            category: "Electronics"
          },
          {
            id: "2",
            name: "Smart Watch Series 3",
            description: "Track your fitness goals and stay connected.",
            price: 149.99,
            imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: 4.5,
            vendorId: "v2",
            category: "Electronics"
          },
          {
            id: "3",
            name: "Minimalist Chair (Grey)",
            description: "Modern design with comfortable cushioning.",
            price: 79.99,
            imageUrl: "https://images.unsplash.com/photo-1567538096621-38d2284b23ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: 4.7,
            vendorId: "v3",
            category: "Home & Garden"
          },
          {
            id: "4",
            name: "Professional DSLR Camera",
            description: "Capture stunning photos with this high-end camera.",
            price: 899.99,
            imageUrl: "https://images.unsplash.com/photo-1576786672534-638cf93d0e4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: 4.9,
            vendorId: "v2",
            category: "Electronics"
          }
        ];
        
        // Categories
        const mockCategories: Category[] = [
          {
            id: "c1",
            name: "Electronics",
            imageUrl: "https://images.unsplash.com/photo-1606765962248-7ff407b51667?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          },
          {
            id: "c2",
            name: "Fashion",
            imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          },
          {
            id: "c3",
            name: "Beauty & Health",
            imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          },
          {
            id: "c4",
            name: "Home & Garden",
            imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          },
          {
            id: "c5",
            name: "Sports & Outdoors",
            imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
          }
        ];
        
        // Top Vendors
        const mockVendors: Vendor[] = [
          {
            id: "v1",
            name: "AudioTech",
            imageUrl: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80",
            rating: 4.9,
            reviewCount: 1200
          },
          {
            id: "v2",
            name: "TechWorld",
            imageUrl: "https://images.unsplash.com/photo-1560243563-062bfc001d68?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80",
            rating: 4.7,
            reviewCount: 850
          },
          {
            id: "v3",
            name: "HomeDecor",
            imageUrl: "https://images.unsplash.com/photo-1555529771-122e5d9f2341?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80",
            rating: 4.8,
            reviewCount: 720
          }
        ];
        
        setFeaturedProducts(mockProducts);
        setCategories(mockCategories);
        setTopVendors(mockVendors);
      } catch (error) {
        console.error("Error fetching home data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeData();
  }, [toast]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-gray-900 mb-8">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80" 
            alt="Electronics banner" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Shop from thousands of verified vendors
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300">
            Discover quality products from trusted vendors, with secure payments.
          </p>
          <div className="mt-10">
            <Link href="/categories">
              <Button size="lg" className="px-6 bg-white text-gray-900 hover:bg-gray-100">
                Shop Now
              </Button>
            </Link>
            <Link href="/vendor/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="ml-4 px-6 text-white bg-opacity-20 hover:bg-opacity-30 border-white"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-medium text-primary hover:text-blue-600">
            View All Categories
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.id}`} className="group relative rounded-lg overflow-hidden bg-white shadow hover:shadow-md">
              <div>
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  className="h-48 w-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:text-blue-600">
            View All Products
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              imageUrl={product.imageUrl}
              rating={product.rating}
              vendorId={product.vendorId}
            />
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold text-white mb-4">Save up to 40% on Electronics</h2>
              <p className="text-lg text-gray-300 mb-6">
                Limited time offer on all electronics. Don't miss out on these amazing deals.
              </p>
              <Link href="/categories/c1">
                <Button>Shop Now</Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Electronics promotion" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Vendors</h2>
          <Link href="/vendors" className="text-sm font-medium text-primary hover:text-blue-600">
            View All Vendors
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {topVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              id={vendor.id}
              name={vendor.name}
              imageUrl={vendor.imageUrl}
              rating={vendor.rating}
              reviewCount={vendor.reviewCount}
            />
          ))}
        </div>
      </div>

      {/* Why Shop With Us */}
      <div className="bg-gray-50 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Shop With Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best shopping experience with verified vendors and secure transactions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick and reliable shipping for all your purchases</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">Multiple secure payment options available</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Products</h3>
              <p className="text-sm text-gray-600">All products verified for quality assurance</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rewards Program</h3>
              <p className="text-sm text-gray-600">Earn points and get discounts on future purchases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Vendor CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-primary rounded-lg overflow-hidden">
          <div className="px-6 py-12 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Selling on VendorHub?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of successful vendors and reach millions of customers with our powerful marketplace tools.
            </p>
            <Link href="/vendor/register">
              <Button 
                className="px-6 bg-white text-primary hover:bg-gray-100"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
