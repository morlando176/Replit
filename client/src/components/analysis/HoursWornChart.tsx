import { useEffect, useRef, useState } from "react";
import { 
  eachMonthOfInterval, 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  subMonths, 
  addMonths 
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HoursWornChartProps {
  entries: any[];
  isLoading: boolean;
}

export default function HoursWornChart({ entries, isLoading }: HoursWornChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState("6months");
  
  useEffect(() => {
    if (isLoading || !chartRef.current) return;
    
    try {
      // Create datasets
      const { labels, data } = prepareHoursData(entries, timeframe);
      
      // Get chart context
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      // Destroy previous chart if exists
      const chartInstance = (chartRef.current as any).chart;
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Create new chart
      import('chart.js').then(({ Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip }) => {
        Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);
        
        (chartRef.current as any).chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Hours Worn',
              data: data,
              backgroundColor: '#10B981',
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Total Hours'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return `${context.raw} hours`;
                  }
                }
              }
            }
          }
        });
      });
    } catch (error) {
      console.error("Error creating Hours Worn chart:", error);
    }
    
    // Cleanup on unmount
    return () => {
      if (chartRef.current && (chartRef.current as any).chart) {
        (chartRef.current as any).chart.destroy();
      }
    };
  }, [entries, isLoading, timeframe]);
  
  // Prepare hours data by month
  const prepareHoursData = (entries: any[], timeframe: string) => {
    if (entries.length === 0) {
      return { labels: [], data: [] };
    }
    
    // Determine time range based on selected timeframe
    const today = new Date();
    let startDate;
    
    if (timeframe === "3months") {
      startDate = subMonths(today, 3);
    } else if (timeframe === "6months") {
      startDate = subMonths(today, 6);
    } else if (timeframe === "year") {
      startDate = subMonths(today, 12);
    } else {
      // Find the earliest entry date
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      startDate = new Date(sortedEntries[0]?.date || today);
    }
    
    // Generate array of months in the range
    const months = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(today)
    });
    
    // Initialize arrays
    const labels: string[] = [];
    const data: number[] = [];
    
    // Populate data for each month
    months.forEach(month => {
      labels.push(format(month, 'MMM'));
      
      // Calculate total hours for this month
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthlyHours = entries.reduce((total, entry) => {
        const entryDate = new Date(entry.date);
        if (isWithinInterval(entryDate, { start: monthStart, end: monthEnd })) {
          return total + (entry.hoursWorn || 0);
        }
        return total;
      }, 0);
      
      data.push(monthlyHours);
    });
    
    return { labels, data };
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">Monthly Hours Worn</h2>
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4 flex-col sm:flex-row">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2 sm:mb-0">Monthly Hours Worn</h2>
          
          <Tabs defaultValue="6months" value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="3months">3 Months</TabsTrigger>
              <TabsTrigger value="6months">6 Months</TabsTrigger>
              <TabsTrigger value="year">1 Year</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          <canvas ref={chartRef} height="250"></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
