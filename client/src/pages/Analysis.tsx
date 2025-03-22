import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, format, addMonths, subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import CILevelChart from "@/components/analysis/CILevelChart";
import HoursWornChart from "@/components/analysis/HoursWornChart";
import MethodComparison from "@/components/analysis/MethodComparison";

export default function Analysis() {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user/1']
  });
  
  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/tracking/1']
  });
  
  // Get the journey metrics
  const getJourneyMetrics = () => {
    if (!user?.startDate || !user?.ciLevel || !user?.startingCi || !user?.targetCi) {
      return {
        ciGainRate: 0,
        daysPerLevel: 0,
        estimatedCompletion: null
      };
    }
    
    const startDate = new Date(user.startDate);
    const today = new Date();
    const totalDays = Math.max(1, differenceInDays(today, startDate));
    const levelsGained = Math.max(0, user.ciLevel - user.startingCi);
    
    // Calculate CI gain rate per year
    const ciGainRate = (levelsGained / totalDays) * 365;
    
    // Calculate average days per CI level
    const daysPerLevel = levelsGained > 0 ? totalDays / levelsGained : 0;
    
    // Calculate estimated completion date
    let estimatedCompletion = null;
    if (ciGainRate > 0) {
      const levelsRemaining = user.targetCi - user.ciLevel;
      const daysRemaining = levelsRemaining * daysPerLevel;
      estimatedCompletion = addMonths(today, Math.round(daysRemaining / 30));
    }
    
    return {
      ciGainRate,
      daysPerLevel,
      estimatedCompletion
    };
  };
  
  // Get the milestone data
  const getMilestones = () => {
    if (!user?.startDate || !entries || entries.length === 0) return [];
    
    const startDate = new Date(user.startDate);
    const pastMilestones = [];
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Track the highest CI level seen
    let highestCiSeen = user.startingCi || 0;
    let ciMilestones = new Map();
    
    // Process entries to find when CI levels changed
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      
      // If this is a photo with a CI level that's higher than what we've seen
      if (entry.ciLevel && entry.ciLevel > highestCiSeen) {
        highestCiSeen = entry.ciLevel;
        if (!ciMilestones.has(highestCiSeen)) {
          ciMilestones.set(highestCiSeen, {
            type: 'ci',
            level: highestCiSeen,
            date: entryDate,
            day: differenceInDays(entryDate, startDate) + 1
          });
        }
      }
    }
    
    // Convert milestones to array
    pastMilestones.push(...ciMilestones.values());
    
    // Add future milestones if needed
    const futureMilestones = [];
    if (user.ciLevel !== undefined && user.targetCi !== undefined) {
      const metrics = getJourneyMetrics();
      if (metrics.daysPerLevel > 0) {
        for (let i = user.ciLevel + 1; i <= user.targetCi; i++) {
          const daysFromNow = (i - user.ciLevel) * metrics.daysPerLevel;
          const estimatedDate = addMonths(new Date(), Math.round(daysFromNow / 30));
          
          futureMilestones.push({
            type: 'ci',
            level: i,
            date: estimatedDate,
            estimated: true
          });
        }
      }
    }
    
    return [...pastMilestones, ...futureMilestones].sort((a, b) => a.level - b.level);
  };
  
  const metrics = getJourneyMetrics();
  const milestones = getMilestones();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-2">Progress Analysis</h1>
      <p className="text-neutral-600 mb-6">Visualize and understand your restoration journey</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* CI Level Progress Chart */}
          <CILevelChart 
            entries={entries || []} 
            startingCi={user?.startingCi || 0} 
            isLoading={isLoadingEntries}
          />
          
          {/* Hours Worn Chart */}
          <HoursWornChart 
            entries={entries || []} 
            isLoading={isLoadingEntries}
          />
          
          {/* Method Comparison */}
          <MethodComparison 
            entries={entries || []} 
            startDate={user?.startDate}
            isLoading={isLoadingEntries}
          />
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Growth Metrics */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Growth Metrics</h2>
              
              {isLoadingUser ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-neutral-800">CI Gain Rate</div>
                      <div className="text-xs text-neutral-500">Overall progress rate</div>
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      {metrics.ciGainRate.toFixed(2)} CI/year
                    </div>
                  </div>
                  
                  {metrics.daysPerLevel > 0 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-neutral-800">Days per CI Level</div>
                        <div className="text-xs text-neutral-500">Average time to advance</div>
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        {Math.round(metrics.daysPerLevel)} days
                      </div>
                    </div>
                  )}
                  
                  {metrics.estimatedCompletion && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-neutral-800">Estimated Completion</div>
                        <div className="text-xs text-neutral-500">To reach CI-{user?.targetCi}</div>
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        {format(metrics.estimatedCompletion, 'MMM yyyy')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Milestones */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Milestones</h2>
              
              {isLoadingUser || isLoadingEntries ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center">
                      <div className="relative flex items-center justify-center">
                        <div className={`h-10 w-10 rounded-full ${
                          milestone.estimated
                            ? "bg-neutral-100 flex items-center justify-center"
                            : "bg-secondary-100 flex items-center justify-center"
                        }`}>
                          {milestone.estimated ? (
                            <span className="text-neutral-500 text-sm font-medium">{milestone.level}</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="absolute h-full w-0.5 bg-neutral-200 top-10 -z-10"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral-800">
                          {milestone.estimated ? `Target: CI-${milestone.level}` : `Reached CI-${milestone.level}`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {milestone.estimated 
                            ? `Estimated: ${format(milestone.date, 'MMMM yyyy')}`
                            : `${format(milestone.date, 'MMMM d, yyyy')} (Day ${milestone.day})`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-2">
                  No milestone data available yet
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Export Options */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">Export Data</h2>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as CSV
                </Button>
                
                <Button variant="outline" className="w-full justify-center">
                  <ArrowDown className="h-5 w-5 mr-2 text-neutral-500" />
                  Download All Photos
                </Button>
                
                <Button variant="outline" className="w-full justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
