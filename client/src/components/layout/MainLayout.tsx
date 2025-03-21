import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, Bell, Menu, X } from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, userData, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                className="lg:hidden text-gray-600 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-semibold text-gray-900">VendorHub</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                <Link href="/" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/categories" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                  Categories
                </Link>
                <Link href="/vendors" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                  Vendors
                </Link>
                {userData?.role === "admin" && (
                  <Link href="/admin" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Admin Panel
                  </Link>
                )}
                {userData?.role === "vendor" && (
                  <Link href="/vendor" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Vendor Panel
                  </Link>
                )}
              </div>
            </div>
            
            <div className="hidden md:block flex-1 px-4 max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative mx-4">
                <button className="text-gray-600 focus:outline-none">
                  <div className="relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </div>
                </button>
              </div>
              
              {/* Cart */}
              <Link href="/cart" className="text-gray-600 hover:text-gray-900 p-2 relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 text-xs bg-primary text-white rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              {/* User dropdown */}
              <div className="ml-4 relative">
                {user ? (
                  <div className="flex items-center">
                    <Link href="/settings/profile" className="text-gray-600 hover:text-gray-900 p-2">
                      <User className="h-6 w-6" />
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={logout}
                      className="ml-2"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login" className="inline-block">
                      <Button variant="outline" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="inline-block">
                      <Button size="sm">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link href="/" className="text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link href="/categories" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                Categories
              </Link>
              <Link href="/vendors" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                Vendors
              </Link>
              {userData?.role === "admin" && (
                <Link href="/admin" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                  Admin Panel
                </Link>
              )}
              {userData?.role === "vendor" && (
                <Link href="/vendor" className="text-gray-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                  Vendor Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">VendorHub</h3>
              <p className="text-sm text-gray-400">A multi-vendor marketplace connecting thousands of vendors with millions of customers worldwide.</p>
              <div className="flex mt-4 space-x-3">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Shipping Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">My Account</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Sign In</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">View Cart</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">My Wishlist</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Track My Order</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Help</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="flex">
                <input type="email" placeholder="Enter your email" className="min-w-0 flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                <button type="submit" className="px-4 py-2 bg-primary rounded-r-md text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-400 text-center">© 2025 VendorHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
