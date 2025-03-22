import { useEffect, useState } from "react";
import { 
  eachDayOfInterval, 
  endOfWeek, 
  format, 
  startOfWeek, 
  subWeeks 
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackingEntry {
  id: number;
  date: string;
  methodUsed: string;
  hoursWorn: number;
  comfortLevel?: number;
}

interface WeeklySummaryProps {
  entries: TrackingEntry[];
}

export default function WeeklySummary({ entries }: WeeklySummaryProps) {
  const [summary, setSummary] = useState({
    averageHours: 0,
    daysTracked: 0,
    averageComfort: 0
  });
  
  useEffect(() => {
    // Calculate weekly summary
    if (entries.length > 0) {
      const today = new Date();
      const startDate = startOfWeek(today);
      const endDate = endOfWeek(today);
      
      // Get all days in the current week
      const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Find entries for the current week
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // Calculate average hours
      const totalHours = weekEntries.reduce((sum, entry) => sum + entry.hoursWorn, 0);
      const averageHours = weekEntries.length > 0 ? totalHours / weekEntries.length : 0;
      
      // Calculate average comfort level
      let totalComfort = 0;
      let entriesWithComfort = 0;
      
      weekEntries.forEach(entry => {
        if (entry.comfortLevel !== undefined) {
          totalComfort += entry.comfortLevel;
          entriesWithComfort++;
        }
      });
      
      const averageComfort = entriesWithComfort > 0 ? totalComfort / entriesWithComfort : 0;
      
      setSummary({
        averageHours,
        daysTracked: weekEntries.length,
        averageComfort
      });
    }
  }, [entries]);
  
  if (entries.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Weekly Summary</h2>
          <p className="text-sm text-neutral-500 text-center py-4">
            No tracking data available yet. Start tracking to see your weekly summary.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Weekly Summary</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-neutral-700">Average Hours</span>
              <span className="text-sm font-medium text-neutral-800">
                {summary.averageHours.toFixed(1)} hrs/day
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (summary.averageHours / 24) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-neutral-700">Consistency</span>
              <span className="text-sm font-medium text-neutral-800">
                {summary.daysTracked}/7 days
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${(summary.daysTracked / 7) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {summary.averageComfort > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-neutral-700">Comfort Level</span>
                <span className="text-sm font-medium text-neutral-800">
                  {summary.averageComfort.toFixed(1)}/5
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${(summary.averageComfort / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
