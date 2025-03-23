import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import TrackingCalendar from "@/components/tracking/TrackingCalendar";
import EntryForm from "@/components/tracking/EntryForm";
import WeeklySummary from "@/components/tracking/WeeklySummary";
import { Card, CardContent } from "@/components/ui/card";

export default function Tracking() {
  // Initialize with current date, but ensure it's normalized (no time component)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Remove time component
    return now;
  });
  
  // Handler for date selection that ensures consistent date format
  const handleDateSelect = (date: Date) => {
    // Normalize the date by removing time component
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    console.log(`Selected date (normalized): ${normalizedDate.toISOString()}`);
    setSelectedDate(normalizedDate);
  };
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/1']
  });
  
  // Fetch all tracking entries for this user, but only once (not per day)
  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/tracking/1']
  });
  
  // Calculate days since starting
  const daysSinceStart = user?.startDate 
    ? Math.floor((new Date().getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 
    : 0;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-2">Daily Tracking</h1>
      <p className="text-neutral-600 mb-6">Track your daily restoration activities and progress</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Calendar */}
          <TrackingCalendar 
            entries={entries || []} 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            isLoading={isLoadingEntries}
          />
          
          {/* Daily Entry Form */}
          <EntryForm 
            userId={1}
            date={selectedDate}
            defaultMethod={user?.method || ""}
            defaultTension={user?.tension || 500}
            daysSinceStart={daysSinceStart}
          />
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Weekly Summary */}
          <WeeklySummary entries={entries || []} />
          
          {/* Recommendations */}
          <Card className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Recommendations</h2>
            
            <div className="space-y-4">
              {user?.circumference && (
                <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                  <h3 className="text-sm font-medium text-primary-800 mb-1">Optimal Tension</h3>
                  <p className="text-sm text-primary-700">
                    Based on your circumference ({user.circumference}"), 
                    the recommended tension is {Math.round(parseFloat(user.circumference) * 100)}g.
                    {user?.tension && (
                      ` Your current setting (${user.tension}g) is ${
                        Math.abs(user.tension - Math.round(parseFloat(user.circumference) * 100)) <= 50
                          ? "close to optimal"
                          : user.tension < Math.round(parseFloat(user.circumference) * 100)
                            ? "lower than recommended"
                            : "higher than recommended"
                      }.`
                    )}
                  </p>
                </div>
              )}
              
              {entries && entries.length > 0 && (
                <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-800 mb-1">Consistent Progress</h3>
                  <p className="text-sm text-secondary-700">
                    You've been consistently applying your method for {
                      Math.round((entries.length / Math.max(daysSinceStart, 1)) * 100)
                    }% of days. 
                    {(entries.length / Math.max(daysSinceStart, 1)) >= 0.7 
                      ? " Great job maintaining your routine!"
                      : " Try to increase your consistency for better results."}
                  </p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Journey Stats */}
          <Card className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Journey Stats</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-center">
                <div className="text-2xl font-bold text-primary-600">{daysSinceStart}</div>
                <div className="text-xs text-neutral-600 mt-1">Days Restoring</div>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-center">
                <div className="text-2xl font-bold text-primary-600">CI-{user?.ciLevel || 0}</div>
                <div className="text-xs text-neutral-600 mt-1">Current Level</div>
              </div>
              
              {user?.startingCi !== undefined && user?.ciLevel !== undefined && (
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-center">
                  <div className="text-2xl font-bold text-primary-600">+{Math.max(0, user.ciLevel - user.startingCi)}</div>
                  <div className="text-xs text-neutral-600 mt-1">CI Levels Gained</div>
                </div>
              )}
              
              {user?.targetCi !== undefined && user?.ciLevel !== undefined && (
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {Math.round((user.ciLevel / user.targetCi) * 100)}%
                  </div>
                  <div className="text-xs text-neutral-600 mt-1">To Goal (CI-{user.targetCi})</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
