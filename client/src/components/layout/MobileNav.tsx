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
}

export default function MobileNav({ currentRoute }: MobileNavProps) {
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
        <Link key={item.href} href={item.href}>
          <a 
            className={`flex flex-col items-center justify-center flex-1 py-3 ${
              isActive(item.href) ? "text-primary-600" : "text-neutral-500 hover:text-primary-600"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
