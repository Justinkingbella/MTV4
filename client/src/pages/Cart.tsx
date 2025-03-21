import { useEffect } from "react";
import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, totalItems } = useCart();
  
  // Update page title when component mounts
  useEffect(() => {
    document.title = "Your Cart | VendorHub";
    
    return () => {
      document.title = "VendorHub";
    };
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-100 p-6">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow px-6 py-4">
                <div className="flex justify-between items-center pb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Items ({totalItems})
                  </h2>
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Cart Summary */}
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
