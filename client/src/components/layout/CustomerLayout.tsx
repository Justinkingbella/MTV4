import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Header from "./Header";

interface CustomerLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function CustomerLayout({ 
  children, 
  title, 
  description = "Manage your account settings and preferences."
}: CustomerLayoutProps) {
  const { userData } = useAuth();
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto p-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        {/* Settings Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex">
            <Link href="/settings/profile">
              <a className={`border-b-2 px-4 py-3 text-sm font-medium ${
                location === "/settings/profile" || location === "/settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                Profile
              </a>
            </Link>
            <Link href="/settings/security">
              <a className={`border-b-2 px-4 py-3 text-sm font-medium ${
                location === "/settings/security"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                Security
              </a>
            </Link>
            <Link href="/settings/notifications">
              <a className={`border-b-2 px-4 py-3 text-sm font-medium ${
                location === "/settings/notifications"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                Notifications
              </a>
            </Link>
            <Link href="/settings/payment-methods">
              <a className={`border-b-2 px-4 py-3 text-sm font-medium ${
                location === "/settings/payment-methods"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                Payment Methods
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
