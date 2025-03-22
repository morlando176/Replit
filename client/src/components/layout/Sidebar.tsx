import { Link } from "wouter";
import { 
  BarChart3, 
  Calendar, 
  Home, 
  ImageIcon, 
  User 
} from "lucide-react";
import UserAvatar from "@/components/ui/user-avatar";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentRoute, onNavigate }: SidebarProps) {
  const isActive = (route: string) => currentRoute === route;
  
  const navItems = [
    { href: "#dashboard", label: "Dashboard", icon: <Home className="h-5 w-5 mr-3" /> },
    { href: "#profile", label: "Profile", icon: <User className="h-5 w-5 mr-3" /> },
    { href: "#photos", label: "Photos", icon: <ImageIcon className="h-5 w-5 mr-3" /> },
    { href: "#tracking", label: "Daily Tracking", icon: <Calendar className="h-5 w-5 mr-3" /> },
    { href: "#analysis", label: "Analysis", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
  ];
  
  return (
    <div className="sidebar hidden lg:flex flex-col bg-white border-r border-neutral-200 h-screen sticky top-0">
      <div className="p-4 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-primary-600 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2" />
          RestoreTrack
        </h1>
      </div>
      
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <a 
                href={item.href}
                onClick={(e) => {
                  console.log('Sidebar link clicked:', item.href);
                }}
              >
                <div
                  className={`flex items-center p-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    isActive(item.href) 
                      ? "bg-primary-50 text-primary-600" 
                      : "text-neutral-800 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center">
          <UserAvatar name="John Doe" />
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">John Doe</p>
            <p className="text-xs text-neutral-500">CI-4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
