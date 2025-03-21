import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">VendorHub</h3>
            <p className="text-sm text-gray-400">
              A multi-vendor marketplace connecting thousands of vendors with millions of customers worldwide.
            </p>
            <div className="flex mt-4 space-x-3">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-sm text-gray-400 hover:text-white">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-gray-400 hover:text-white">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="text-sm text-gray-400 hover:text-white">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service">
                  <a className="text-sm text-gray-400 hover:text-white">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy">
                  <a className="text-sm text-gray-400 hover:text-white">Shipping Policy</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">My Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login">
                  <a className="text-sm text-gray-400 hover:text-white">Sign In</a>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <a className="text-sm text-gray-400 hover:text-white">View Cart</a>
                </Link>
              </li>
              <li>
                <Link href="/wishlist">
                  <a className="text-sm text-gray-400 hover:text-white">My Wishlist</a>
                </Link>
              </li>
              <li>
                <Link href="/account/orders">
                  <a className="text-sm text-gray-400 hover:text-white">Track My Order</a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-sm text-gray-400 hover:text-white">Help</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                className="px-4 py-2 bg-primary rounded-r-md text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} VendorHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
