import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";

export interface ActivityProps {
  imageUrl?: string;
  initials?: string;
  icon?: keyof typeof LucideIcons;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  timestamp: string;
}

export default function ActivityCard({
  imageUrl,
  initials,
  icon,
  iconBgColor = "bg-gray-300",
  iconColor = "text-gray-800",
  title,
  timestamp
}: ActivityProps) {
  let IconComponent = null;
  
  if (icon) {
    const Icon = LucideIcons[icon];
    IconComponent = (
      <div className={`h-10 w-10 rounded-full ${iconBgColor} overflow-hidden flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    );
  }
  
  return (
    <li className="py-4 flex">
      <div className="mr-4">
        {imageUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={imageUrl} alt="Activity image" />
            <AvatarFallback>{initials || "A"}</AvatarFallback>
          </Avatar>
        ) : IconComponent ? (
          IconComponent
        ) : (
          <div className={`h-10 w-10 rounded-full ${iconBgColor} overflow-hidden flex items-center justify-center`}>
            <span className="text-sm font-medium text-white">{initials || "A"}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
      </div>
    </li>
  );
}
