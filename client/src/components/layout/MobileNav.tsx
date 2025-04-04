import { Link } from "wouter";
import { 
  BarChart3, 
  Calendar, 
  Home, 
  ImageIcon, 
  User 
} from "lucide-react";

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (page: string) => void;
}

export default function MobileNav({ currentRoute, onNavigate }: MobileNavProps) {
  const isActive = (route: string) => currentRoute === route;
  
  const navItems = [
    { href: "#dashboard", label: "Home", icon: <Home className="h-6 w-6" /> },
    { href: "#profile", label: "Profile", icon: <User className="h-6 w-6" /> },
    { href: "#photos", label: "Photos", icon: <ImageIcon className="h-6 w-6" /> },
    { href: "#tracking", label: "Track", icon: <Calendar className="h-6 w-6" /> },
    { href: "#analysis", label: "Analysis", icon: <BarChart3 className="h-6 w-6" /> },
  ];
  
  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex lg:hidden z-50">
      {navItems.map((item) => (
        <div key={item.href} className="flex-1">
          <a 
            href={item.href}
            className="block w-full h-full"
            onClick={(e) => {
              e.preventDefault();
              console.log('Mobile nav link clicked:', item.href);
              onNavigate(item.href);
            }}
          >
            <div 
              className={`flex flex-col items-center justify-center py-3 cursor-pointer ${
                isActive(item.href) ? "text-primary-600" : "text-neutral-500 hover:text-primary-600"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </a>
        </div>
      ))}
    </nav>
  );
}
