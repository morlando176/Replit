import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Photos from "@/pages/Photos";
import Tracking from "@/pages/Tracking";
import Analysis from "@/pages/Analysis";
import NotFound from "@/pages/not-found";

import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

function Router() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#tracking');
  
  // Set initial hash to tracking if no hash is specified
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#tracking';
    }
  }, []);

  useEffect(() => {
    const hashChangeHandler = () => {
      setCurrentRoute(window.location.hash || '#tracking');
    };

    window.addEventListener('hashchange', hashChangeHandler);
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, []);

  return (
    <div className="app-container flex flex-col lg:flex-row min-h-screen">
      <Sidebar currentRoute={currentRoute} />
      
      <div className="main-content flex-1">
        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          <Switch>
            <Route path="/" component={Tracking} />
            {/* Use specific logic for hash-based navigation */}
            {currentRoute === '#dashboard' && <Dashboard />}
            {currentRoute === '#profile' && <Profile />}
            {currentRoute === '#photos' && <Photos />}
            {currentRoute === '#tracking' && <Tracking />}
            {currentRoute === '#analysis' && <Analysis />}
            {!['#dashboard', '#profile', '#photos', '#tracking', '#analysis', ''].includes(currentRoute) && 
              <NotFound />}
          </Switch>
        </div>
      </div>
      
      <MobileNav currentRoute={currentRoute} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
