import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const trackingEntrySchema = z.object({
  methodUsed: z.string().min(1, "Method is required"),
  hoursWorn: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 24, "Hours must be between 0 and 24"),
  tensionUsed: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Tension must be a positive number"),
  comfortLevel: z.string(),
  notes: z.string().optional(),
});

type TrackingFormValues = z.infer<typeof trackingEntrySchema>;

interface EntryFormProps {
  userId: number;
  date: Date;
  defaultMethod: string;
  defaultTension: number;
  daysSinceStart: number;
}

export default function EntryForm({ 
  userId, 
  date, 
  defaultMethod, 
  defaultTension,
  daysSinceStart
}: EntryFormProps) {
  const { toast } = useToast();
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  // Fetch existing entry for this date, but only when it's actually selected
  const { 
    data: existingEntry, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/tracking/${userId}/${formattedDate}`],
    // If API returns 404, just return null instead of throwing
    retry: false,
    enabled: !!formattedDate, // Only run the query when we have a date
    staleTime: 0 // Consider data stale immediately so it refetches when date changes
  });
  
  const createOrUpdateEntry = useMutation({
    mutationFn: async (data: TrackingFormValues) => {
      const formattedData = {
        userId,
        date: formattedDate,
        methodUsed: data.methodUsed,
        hoursWorn: parseInt(data.hoursWorn),
        tensionUsed: parseInt(data.tensionUsed),
        comfortLevel: parseInt(data.comfortLevel),
        notes: data.notes,
        day: daysSinceStart
      };
      
      if (existingEntry) {
        return apiRequest('PUT', `/api/tracking/${existingEntry.id}`, formattedData);
      } else {
        return apiRequest('POST', '/api/tracking', formattedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking/1'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tracking/${userId}/${formattedDate}`] });
      toast({
        title: "Entry Saved",
        description: "Your tracking entry has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save tracking entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingEntrySchema),
    defaultValues: {
      methodUsed: defaultMethod,
      hoursWorn: "0",
      tensionUsed: defaultTension.toString(),
      comfortLevel: "3",
      notes: "",
    },
  });

  // Update form with existing entry data when loaded
  useEffect(() => {
    if (existingEntry) {
      form.reset({
        methodUsed: existingEntry.methodUsed,
        hoursWorn: existingEntry.hoursWorn.toString(),
        tensionUsed: existingEntry.tensionUsed?.toString() || defaultTension.toString(),
        comfortLevel: existingEntry.comfortLevel?.toString() || "3",
        notes: existingEntry.notes || "",
      });
    } else if (!isLoading && !isError) {
      // Reset to defaults if no entry exists
      form.reset({
        methodUsed: defaultMethod,
        hoursWorn: "0",
        tensionUsed: defaultTension.toString(),
        comfortLevel: "3",
        notes: "",
      });
    }
  }, [existingEntry, isLoading, isError, form, defaultMethod, defaultTension]);

  function onSubmit(data: TrackingFormValues) {
    createOrUpdateEntry.mutate(data);
  }

  // Generate method options
  const methodOptions = [
    "Manual Methods",
    "T-Tape",
    "DTR (Dual Tension Restorer)",
    "TLC Tugger",
    "FIT (Foreskin Inflation Tool)",
    "CAT II Q (Compression And Tension)",
    "Weights",
    "Hyperrestore",
    "Other Device",
    "Rest Day"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          {format(date, 'MMMM d, yyyy')} Entry
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="methodUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method Used</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {methodOptions.map(method => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hoursWorn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worn</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tensionUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tension Used (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="comfortLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comfort Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select comfort level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">Very Comfortable (5)</SelectItem>
                        <SelectItem value="4">Comfortable (4)</SelectItem>
                        <SelectItem value="3">Neutral (3)</SelectItem>
                        <SelectItem value="2">Uncomfortable (2)</SelectItem>
                        <SelectItem value="1">Very Uncomfortable (1)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any observations or notes for the day..." 
                      className="resize-none" 
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-neutral-500">
                Day {daysSinceStart} of restoration
              </div>
              <Button 
                type="submit" 
                disabled={createOrUpdateEntry.isPending}
              >
                {createOrUpdateEntry.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
