import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays } from "date-fns";

interface MethodComparisonProps {
  entries: any[];
  startDate?: string | Date;
  isLoading: boolean;
}

interface MethodStats {
  method: string;
  daysUsed: number;
  avgHours: number;
  avgComfort: number;
  ciGainRate: number;
}

export default function MethodComparison({ entries, startDate, isLoading }: MethodComparisonProps) {
  const [methodStats, setMethodStats] = useState<MethodStats[]>([]);
  
  useEffect(() => {
    if (!entries || entries.length === 0 || !startDate) return;
    
    const methodsMap = new Map<string, any>();
    
    // Calculate statistics for each method
    entries.forEach(entry => {
      const { methodUsed, hoursWorn, comfortLevel } = entry;
      
      if (!methodUsed || methodUsed === "Rest Day") return;
      
      if (!methodsMap.has(methodUsed)) {
        methodsMap.set(methodUsed, {
          method: methodUsed,
          daysUsed: 0,
          totalHours: 0,
          totalComfort: 0,
          comfortEntries: 0
        });
      }
      
      const stats = methodsMap.get(methodUsed);
      stats.daysUsed += 1;
      stats.totalHours += hoursWorn || 0;
      
      if (comfortLevel !== undefined) {
        stats.totalComfort += comfortLevel;
        stats.comfortEntries += 1;
      }
      
      methodsMap.set(methodUsed, stats);
    });
    
    // Calculate averages and estimate CI gain rate based on consistency and hours
    const start = new Date(startDate);
    const today = new Date();
    const totalDays = Math.max(1, differenceInDays(today, start));
    
    const methodStatsArray = Array.from(methodsMap.values()).map(stats => {
      const avgHours = stats.daysUsed > 0 ? stats.totalHours / stats.daysUsed : 0;
      const avgComfort = stats.comfortEntries > 0 ? stats.totalComfort / stats.comfortEntries : 0;
      
      // Estimate CI gain rate - this is a simplistic model
      // We assume the most effective method has highest hours x consistency combination
      const consistency = stats.daysUsed / totalDays;
      const effectivenessScore = consistency * avgHours / 12; // Normalize against 12 hours/day target
      
      // Base yearly CI gain rate with adjustment factor
      // This is just a rough estimation model - not scientifically validated
      const baseYearlyGain = 0.8; // Average yearly gain from community data
      const ciGainRate = baseYearlyGain * effectivenessScore;
      
      return {
        method: stats.method,
        daysUsed: stats.daysUsed,
        avgHours: avgHours,
        avgComfort: avgComfort,
        ciGainRate: ciGainRate
      };
    });
    
    // Sort by days used (most used first)
    methodStatsArray.sort((a, b) => b.daysUsed - a.daysUsed);
    
    setMethodStats(methodStatsArray);
  }, [entries, startDate]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Method Effectiveness</h2>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (methodStats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Method Effectiveness</h2>
          <p className="text-neutral-500 text-center py-4">
            Not enough data to compare methods. Continue tracking to see effectiveness.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Method Effectiveness</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Days Used</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg. Hours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Comfort</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">CI Gain Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {methodStats.map((stats, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-800">
                    {stats.method}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-neutral-600">
                    {stats.daysUsed}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-neutral-600">
                    {stats.avgHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-neutral-600">
                    {stats.avgComfort.toFixed(1)}/5
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
                    index === 0 ? 'text-secondary-600 font-medium' : 'text-neutral-600'
                  }`}>
                    {stats.ciGainRate.toFixed(2)} CI/year
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
