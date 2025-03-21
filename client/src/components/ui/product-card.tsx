import { useState } from "react";
import { Link } from "wouter";
import { Star, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  vendorId: string;
  onClick?: (id: string) => void;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  rating,
  vendorId,
  onClick
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price,
      image: imageUrl,
      quantity: 1,
      vendorId
    });
  };
  
  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlisted(!isWishlisted);
    
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted ? `${name} has been removed from your wishlist.` : `${name} has been added to your wishlist.`,
    });
  };
  
  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <Link href={`/product/${id}`} className="block">
        <div className="overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={name} 
            className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="flex-1 text-primary hover:text-blue-700 font-medium py-2 text-sm border-r border-gray-200 rounded-none"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
        <Button 
          variant="ghost" 
          className="w-12 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-none"
          onClick={handleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
