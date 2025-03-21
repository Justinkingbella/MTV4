import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface VendorLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/vendor", icon: "BarChart2" },
  { name: "Products", path: "/vendor/products", icon: "Package" },
  { name: "Orders", path: "/vendor/orders", icon: "ShoppingBag" },
  { name: "Settings", path: "/vendor/settings", icon: "Settings" },
];

export default function VendorLayout({ children }: VendorLayoutProps) {
  const { userData } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect if user is not vendor
  if (userData && userData.role !== "vendor") {
    if (userData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
    return null;
  }
  
  return (
    <div className="min-h-screen flex">
      <Sidebar 
        navItems={navItems} 
        title={userData?.storeName || "Vendor Dashboard"} 
      />
      
      <div className="flex-1 lg:ml-64 md:ml-20">
        <Header />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
