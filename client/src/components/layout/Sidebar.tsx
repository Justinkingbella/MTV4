import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import * as LucideIcons from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: keyof typeof LucideIcons;
}

interface SidebarProps {
  navItems: NavItem[];
  title: string;
}

export default function Sidebar({ navItems, title }: SidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Close sidebar on location change for mobile
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [location]);
  
  // Close sidebar when clicking outside for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const mobileMenuButton = document.getElementById("mobile-menu-button");
      
      if (
        sidebar && 
        !sidebar.contains(event.target as Node) && 
        mobileMenuButton && 
        !mobileMenuButton.contains(event.target as Node) &&
        window.innerWidth < 768 &&
        isMobileOpen
      ) {
        setIsMobileOpen(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileOpen]);
  
  // Adjust for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <div 
      id="sidebar" 
      className={`lg:w-64 md:w-20 w-64 bg-white shadow-md fixed inset-y-0 left-0 transform transition duration-200 ease-in-out z-10 ${
        isMobileOpen || window.innerWidth >= 768 
          ? "translate-x-0" 
          : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="lg:block hidden">
          <span className="text-xl font-semibold text-neutral-dark">{title}</span>
        </div>
        <div className="lg:hidden md:block hidden">
          <span className="text-xl font-semibold">
            {title.split(" ").map(word => word[0]).join("")}
          </span>
        </div>
        <div className="md:hidden block">
          <span className="text-xl font-semibold text-neutral-dark">{title}</span>
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="py-4">
        <nav>
          <ul>
            {navItems.map((item) => {
              const Icon = LucideIcons[item.icon];
              const isActive = location === item.path;
              
              return (
                <li key={item.path} className="mb-1">
                  <Link href={item.path}>
                    <a 
                      className={`flex items-center px-4 py-3 ${
                        isActive 
                          ? "text-gray-800 bg-gray-100" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="lg:block md:hidden block">{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
