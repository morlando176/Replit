import { useState } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackingEntry {
  id: number;
  date: string;
  methodUsed: string;
  hoursWorn: number;
}

interface TrackingCalendarProps {
  entries: TrackingEntry[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isLoading: boolean;
}

export default function TrackingCalendar({ 
  entries, 
  selectedDate, 
  onDateSelect,
  isLoading
}: TrackingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);
  
  // Helper to find entry for a specific date
  const findEntryForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    // Log entries for debugging
    console.log('Looking for entry on date:', dateString, 'in entries:', entries);
    
    const entry = entries.find(entry => {
      const entryDate = new Date(entry.date);
      const formattedEntryDate = format(entryDate, 'yyyy-MM-dd');
      console.log('Comparing dates:', formattedEntryDate, dateString, formattedEntryDate === dateString);
      return formattedEntryDate === dateString;
    });
    
    console.log('Found entry:', entry);
    return entry;
  };
  
  // Get status dot color for a date
  const getStatusDot = (date: Date) => {
    // If not the current month, don't show any indicator
    if (!isSameMonth(date, currentMonth)) return null;
    
    // Find entry for this date
    const entry = findEntryForDate(date);
    
    // If no entry exists, don't show any indicator
    if (!entry) return null;
    
    // If entry exists with hours worn, show active indicator
    if (entry.hoursWorn > 0) return "bg-secondary-400"; // Method applied
    
    // If entry exists but no hours worn, show rest day
    return "bg-neutral-200"; // Rest day
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-20" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
            
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i + 7} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Days of Week */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {[...Array(startDay)].map((_, index) => (
            <div key={`empty-${index}`} className="p-1"></div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const statusDot = getStatusDot(day);
            
            return (
              <div key={day.toString()} className="aspect-square p-1">
                <button
                  onClick={() => onDateSelect(day)}
                  className={`rounded-lg h-full w-full text-center p-1 relative ${
                    isSelected 
                      ? 'bg-primary-50 border-2 border-primary-500' 
                      : isToday(day)
                        ? 'bg-primary-50/30' 
                        : ''
                  }`}
                >
                  <div className={`text-sm ${
                    isSelected ? 'font-medium text-primary-700' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {statusDot && (
                    <div 
                      className={`mt-1 h-1.5 w-1.5 ${
                        isSelected ? 'bg-primary-500' : statusDot
                      } rounded-full mx-auto`}
                    ></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-secondary-400 rounded-full"></div>
            <span className="ml-2 text-sm text-neutral-600">Method Applied</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-neutral-200 rounded-full"></div>
            <span className="ml-2 text-sm text-neutral-600">Rest Day</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-primary-500 rounded-full"></div>
            <span className="ml-2 text-sm text-neutral-600">Selected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
