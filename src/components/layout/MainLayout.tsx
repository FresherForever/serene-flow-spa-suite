import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Home, 
  Users, 
  UserCircle, 
  Settings, 
  Menu, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  
  // Update sidebar state when switching between mobile and desktop
  React.useEffect(() => {
    if (isMobile !== undefined) {
      setSidebarOpen(!isMobile);
    }
  }, [isMobile]);
  
  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      path: "/"
    },
    {
      icon: Calendar,
      label: "Appointments",
      path: "/appointments"
    },
    {
      icon: Users,
      label: "Staff",
      path: "/staff"
    },
    {
      icon: UserCircle,
      label: "Customers",
      path: "/customers"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings"
    }
  ];
  
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out bg-white shadow-lg md:relative md:translate-x-0",
          "max-h-screen overflow-y-auto", // Ensure scrolling works in all orientations
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link 
              to="/" 
              className="flex items-center"
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span className="text-xl font-semibold text-spa-600">SereneSpa</span>
            </Link>
            <button
              className="p-1 rounded-md md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-spa-100 text-spa-700"
                    : "text-gray-700 hover:bg-spa-50"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-sage-200 flex items-center justify-center">
                <span className="text-sage-700 font-medium">SA</span>
              </div>
              <div>
                <div className="text-sm font-medium">Spa Admin</div>
                <div className="text-xs text-gray-500">admin@serenespa.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white">
          <button
            className="p-1 rounded-md md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              <button className="p-1 rounded-md text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="min-h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;