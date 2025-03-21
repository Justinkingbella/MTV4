import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface VendorCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  onClick?: (id: string) => void;
}

export default function VendorCard({
  id,
  name,
  imageUrl,
  rating,
  reviewCount,
  onClick
}: VendorCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  return (
    <div 
      className="flex flex-col items-center text-center cursor-pointer"
      onClick={handleClick}
    >
      <Avatar className="w-20 h-20 mb-3">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="text-xs text-gray-500 flex items-center">
        {rating.toFixed(1)} <Star className="h-3 w-3 text-yellow-400 mx-1 inline" /> 
        ({reviewCount})
      </p>
    </div>
  );
}
