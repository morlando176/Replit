import { useEffect, useRef, useState } from "react";
import { addMonths, format, parseISO, startOfMonth, differenceInMonths, isSameMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CILevelChartProps {
  entries: any[];
  startingCi: number;
  isLoading: boolean;
}

export default function CILevelChart({ entries, startingCi, isLoading }: CILevelChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState("all");
  
  useEffect(() => {
    if (isLoading || entries.length === 0 || !chartRef.current) return;
    
    try {
      // Create datasets
      const { labels, data } = prepareCILevelData(entries, startingCi, timeframe);
      
      // Get chart context
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      // Destroy previous chart if exists
      const chartInstance = (chartRef.current as any).chart;
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Create new chart
      import('chart.js').then(({ Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler }) => {
        Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler);
        
        (chartRef.current as any).chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'CI Level',
              data: data,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                ticks: {
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: 'CI Level'
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
                    return `CI-${context.raw}`;
                  }
                }
              }
            }
          }
        });
      });
    } catch (error) {
      console.error("Error creating CI Level chart:", error);
    }
    
    // Cleanup on unmount
    return () => {
      if (chartRef.current && (chartRef.current as any).chart) {
        (chartRef.current as any).chart.destroy();
      }
    };
  }, [entries, startingCi, isLoading, timeframe]);
  
  // Prepare CI level data by month
  const prepareCILevelData = (entries: any[], startingCI: number, timeframe: string) => {
    if (entries.length === 0) {
      return { labels: [], data: [] };
    }
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get start and end dates
    const firstEntryDate = new Date(sortedEntries[0].date);
    const lastEntryDate = new Date(sortedEntries[sortedEntries.length - 1].date);
    
    // Filter data based on timeframe
    let startDate = firstEntryDate;
    if (timeframe === "6months") {
      startDate = addMonths(lastEntryDate, -6);
    } else if (timeframe === "year") {
      startDate = addMonths(lastEntryDate, -12);
    }
    
    // Calculate number of months between start and end
    const monthCount = differenceInMonths(lastEntryDate, startDate) + 1;
    
    // Initialize arrays
    const labels: string[] = [];
    const data: number[] = [];
    let currentCI = startingCI;
    
    // Generate month labels and initial data points
    let currentMonth = startOfMonth(startDate);
    for (let i = 0; i < monthCount; i++) {
      labels.push(format(currentMonth, 'MMM yyyy'));
      data.push(currentCI);
      currentMonth = addMonths(currentMonth, 1);
    }
    
    // Update CI levels based on entries
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      
      // Skip entries before our timeframe
      if (entryDate < startDate) continue;
      
      // If entry has a CI level, update current CI
      if (entry.ciLevel !== undefined && entry.ciLevel > currentCI) {
        currentCI = entry.ciLevel;
        
        // Find the month index
        const monthIndex = differenceInMonths(entryDate, startDate);
        if (monthIndex >= 0 && monthIndex < data.length) {
          // Update all future months to the new CI level
          for (let i = monthIndex; i < data.length; i++) {
            data[i] = currentCI;
          }
        }
      }
    }
    
    return { labels, data };
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">CI Level Progress</h2>
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
          <h2 className="text-lg font-semibold text-neutral-800 mb-2 sm:mb-0">CI Level Progress</h2>
          
          <Tabs defaultValue="all" value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
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
