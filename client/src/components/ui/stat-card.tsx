import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ title, value, change, trend = "neutral" }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
        </div>
        {trend && (
          <div className={`flex items-center ${
            trend === "up" ? "text-green-500" : 
            trend === "down" ? "text-red-500" : 
            "text-gray-500"
          }`}>
            {trend === "up" ? (
              <ArrowUp className="h-5 w-5" />
            ) : trend === "down" ? (
              <ArrowDown className="h-5 w-5" />
            ) : null}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-2">
          <span className={`text-sm font-medium ${
            change > 0 ? "text-green-500" : 
            change < 0 ? "text-red-500" : 
            "text-gray-500"
          }`}>
            {change > 0 ? "+" : ""}{change}% from last month
          </span>
        </div>
      )}
    </div>
  );
}
