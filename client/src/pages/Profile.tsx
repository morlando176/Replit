import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.string().refine(val => !isNaN(parseInt(val)), "Age must be a number"),
  ciLevel: z.string(),
  startingCi: z.string(),
  targetCi: z.string(),
  startDate: z.string(),
  circumference: z.string(),
  length: z.string(),
  method: z.string(),
  tension: z.string().refine(val => !isNaN(parseInt(val)), "Tension must be a number"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/1']
  });
  
  const updateUser = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const formattedData = {
        ...data,
        age: parseInt(data.age),
        ciLevel: parseInt(data.ciLevel),
        startingCi: parseInt(data.startingCi),
        targetCi: parseInt(data.targetCi),
        tension: parseInt(data.tension),
      };
      
      return apiRequest('POST', '/api/user/1', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/1'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      age: user?.age?.toString() || "",
      ciLevel: user?.ciLevel?.toString() || "0",
      startingCi: user?.startingCi?.toString() || "0",
      targetCi: user?.targetCi?.toString() || "8",
      startDate: user?.startDate ? new Date(user.startDate).toISOString().split('T')[0] : "",
      circumference: user?.circumference || "",
      length: user?.length || "",
      method: user?.method || "",
      tension: user?.tension?.toString() || "500",
    },
  });

  // Update form when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        age: user.age?.toString() || "",
        ciLevel: user.ciLevel?.toString() || "0",
        startingCi: user.startingCi?.toString() || "0",
        targetCi: user.targetCi?.toString() || "8",
        startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : "",
        circumference: user.circumference || "",
        length: user.length || "",
        method: user.method || "",
        tension: user.tension?.toString() || "500",
      });
    }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    updateUser.mutate(data);
  }

  // Generate CI level options
  const ciLevelOptions = Array.from({ length: 11 }, (_, i) => ({
    value: i.toString(),
    label: `CI-${i}`
  }));
  
  // Generate restoration method options
  const methodOptions = [
    "Manual Methods",
    "T-Tape",
    "DTR (Dual Tension Restorer)",
    "TLC Tugger",
    "FIT (Foreskin Inflation Tool)",
    "CAT II Q (Compression And Tension)",
    "Weights",
    "Hyperrestore",
    "Other Device"
  ];

  // Calculate recommended tension based on circumference
  const calculateRecommendedTension = (circumference: string) => {
    const circ = parseFloat(circumference);
    if (!isNaN(circ)) {
      return Math.round(circ * 100);
    }
    return 500; // Default
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Profile</h1>
      
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Your age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">Restoration Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ciLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current CI Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CI level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ciLevelOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startingCi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting CI Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select starting CI level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ciLevelOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="targetCi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target CI Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target CI level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ciLevelOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">Body Measurements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="circumference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Circumference (inches)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (inches)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">Restoration Method</h2>
                
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Method</FormLabel>
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
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="tension"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applied Tension (grams)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <p className="mt-1 text-sm text-neutral-500">
                          Based on your circumference ({form.watch("circumference") || "0"}"), the recommended tension is {calculateRecommendedTension(form.watch("circumference"))}g.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="px-4 py-2 bg-primary-600"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// For TypeScript
import React from "react";
