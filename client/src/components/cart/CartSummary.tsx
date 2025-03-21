import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function CartSummary() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, totalPrice } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [hasCouponError, setHasCouponError] = useState(false);
  
  // Estimated tax as 8% of the total
  const estimatedTax = (totalPrice * 0.08);
  // Shipping is free for orders over $100
  const shipping = totalPrice > 100 ? 0 : 9.99;
  // Grand total
  const grandTotal = totalPrice + estimatedTax + shipping - discount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      return;
    }
    
    setIsApplying(true);
    setHasCouponError(false);
    
    // Simulate API call to apply coupon
    setTimeout(() => {
      // Here we're just checking for a demo coupon code "SAVE10"
      if (couponCode.toUpperCase() === "SAVE10") {
        const discountAmount = totalPrice * 0.1; // 10% discount
        setDiscount(discountAmount);
        toast({
          title: "Coupon applied!",
          description: `You saved $${discountAmount.toFixed(2)} with this coupon.`,
        });
      } else {
        setHasCouponError(true);
        toast({
          title: "Invalid coupon",
          description: "This coupon code is invalid or has expired.",
          variant: "destructive",
        });
      }
      setIsApplying(false);
    }, 800);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout.",
        variant: "destructive",
      });
      
      // Remember the cart and redirect to login
      setLocation("/login?redirect=checkout");
    } else {
      // Proceed to checkout
      setLocation("/checkout");
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Subtotal ({items.length} items)</p>
          <p className="text-sm font-medium">${totalPrice.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Shipping</p>
          {shipping === 0 ? (
            <p className="text-sm font-medium text-green-600">Free</p>
          ) : (
            <p className="text-sm font-medium">${shipping.toFixed(2)}</p>
          )}
        </div>
        
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Estimated Tax</p>
          <p className="text-sm font-medium">${estimatedTax.toFixed(2)}</p>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <p className="text-sm">Discount</p>
            <p className="text-sm font-medium">-${discount.toFixed(2)}</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between">
          <p className="text-base font-medium text-gray-900">Total</p>
          <p className="text-base font-medium text-gray-900">${grandTotal.toFixed(2)}</p>
        </div>
        {shipping === 0 && (
          <p className="text-xs text-green-600 mt-1">
            Free shipping on orders over $100!
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
          Discount Code
        </label>
        <div className="flex space-x-2">
          <Input
            id="coupon"
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className={hasCouponError ? "border-red-500" : ""}
          />
          <Button 
            variant="outline" 
            onClick={handleApplyCoupon}
            disabled={isApplying || !couponCode.trim()}
          >
            {isApplying ? "Applying..." : "Apply"}
          </Button>
        </div>
        {hasCouponError && (
          <p className="text-xs text-red-500 mt-1">
            This coupon code is invalid or has expired.
          </p>
        )}
      </div>
      
      <Button 
        className="w-full"
        size="lg"
        onClick={handleProceedToCheckout}
        disabled={items.length === 0}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Proceed to Checkout
      </Button>
      
      <div className="mt-4">
        <Button 
          variant="link"
          className="text-sm w-full"
          onClick={() => setLocation("/")}
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
