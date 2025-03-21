import { Switch } from "@/components/ui/switch";

interface NotificationToggleProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onChange: (isEnabled: boolean) => void;
}

export default function NotificationToggle({
  title,
  description,
  isEnabled,
  onChange
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <Switch 
        checked={isEnabled} 
        onCheckedChange={onChange}
      />
    </div>
  );
}
