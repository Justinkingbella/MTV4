import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/admin", icon: "BarChart2" },
  { name: "Vendors", path: "/admin/vendors", icon: "Store" },
  { name: "Products", path: "/admin/products", icon: "Package" },
  { name: "Orders", path: "/admin/orders", icon: "ShoppingBag" },
  { name: "Settings", path: "/admin/settings", icon: "Settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { userData } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect if user is not admin
  if (userData && userData.role !== "admin") {
    if (userData.role === "vendor") {
      navigate("/vendor");
    } else {
      navigate("/");
    }
    return null;
  }
  
  return (
    <div className="min-h-screen flex">
      <Sidebar navItems={navItems} title="VendorHub Admin" />
      
      <div className="flex-1 lg:ml-64 md:ml-20">
        <Header />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
