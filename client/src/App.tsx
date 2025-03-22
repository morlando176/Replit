import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Photos from "@/pages/Photos";
import Tracking from "@/pages/Tracking";
import Analysis from "@/pages/Analysis";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

// Create a simple state-based router 
function App() {
  // Default to tracking page
  const [currentPage, setCurrentPage] = useState('tracking');
  
  console.log('Current page state:', currentPage);
  
  // Function to handle navigation
  const handleNavigation = (page: string) => {
    console.log('Navigation requested to:', page);
    // Remove hash if present
    const cleanPage = page.replace('#', '');
    setCurrentPage(cleanPage);
  };

  // Render the current page based on state
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'photos':
        return <Photos />;
      case 'tracking':
        return <Tracking />;
      case 'analysis':
        return <Analysis />;
      default:
        return <NotFound />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container flex flex-col lg:flex-row min-h-screen">
        <Sidebar 
          currentRoute={`#${currentPage}`} 
          onNavigate={handleNavigation}
        />
        
        <div className="main-content flex-1">
          <div className="p-4 lg:p-8 pb-20 lg:pb-8">
            {renderCurrentPage()}
          </div>
        </div>
        
        <MobileNav 
          currentRoute={`#${currentPage}`} 
          onNavigate={handleNavigation}
        />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
