import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import PhotoUpload from "@/components/photos/PhotoUpload";
import PhotoGrid from "@/components/photos/PhotoGrid";
import CIReferenceGrid from "@/components/photos/CIReferenceGrid";
import { Filter, SortAsc, Grid, ImageIcon, CloudUpload, Info, Upload } from "lucide-react";

export default function Photos() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [activeTab, setActiveTab] = useState("history");
  
  // Default to user ID 1 for prototype
  const userId = 1;
  
  const { data: userPhotos, isLoading: isLoadingUserPhotos } = useQuery({
    queryKey: ['/api/photos', userId],
    // Ensure the query properly typecasts the response
    select: (data) => data as any[]
  });
  
  const { data: referencePhotos, isLoading: isLoadingReferencePhotos } = useQuery({
    queryKey: ['/api/reference-photos'],
    // Ensure the query properly typecasts the response
    select: (data) => data as any[]
  });
  
  const { data: user } = useQuery({
    queryKey: ['/api/user', userId],
    // Ensure the query properly typecasts the response
    select: (data) => data as { id: number; ciLevel?: number; startDate?: string }
  });
  
  // Upload reference photo mutation
  const uploadReferenceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Add isReference flag
      formData.append('isReference', 'true');
      
      // Use fetch directly since apiRequest doesn't support FormData
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload reference photo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/reference-photos'] });
    }
  });
  
  // Filter photos based on CI level
  const filteredUserPhotos = !userPhotos ? [] : 
    filter === "all" 
      ? userPhotos 
      : userPhotos.filter((photo: any) => photo.ciLevel === parseInt(filter));
  
  // Sort photos
  const sortedUserPhotos = filteredUserPhotos ? [...filteredUserPhotos].sort((a: any, b: any) => {
    if (sort === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sort === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sort === "ciLevel") {
      return (b.ciLevel || 0) - (a.ciLevel || 0);
    }
    return 0;
  }) : [];
  
  // Generate CI level options for filtering
  const ciLevelOptions = Array.from({ length: 11 }, (_, i) => ({
    value: i.toString(),
    label: `CI-${i}`
  }));
  
  // Handle reference photo upload
  const handleReferencePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', userId.toString());
      formData.append('date', new Date().toISOString());
      formData.append('ciLevel', '1'); // Default to CI-1, can be changed later
      
      uploadReferenceMutation.mutate(formData);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Progress Photos</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Your Photos
            </TabsTrigger>
            <TabsTrigger value="reference" className="flex items-center">
              <Grid className="h-4 w-4 mr-2" />
              CI Reference Guide
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "history" && (
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    All CI Levels
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>By CI Level</DropdownMenuItem>
                  {ciLevelOptions.map(option => (
                    <DropdownMenuItem 
                      key={option.value} 
                      className="pl-6"
                      onClick={() => setFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSort("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("ciLevel")}>
                    By CI Level
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <TabsContent value="history" className="mt-0">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Photos</h2>
            <div className="flex gap-2">
              {/* Reference Photos Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    View CI Reference Photos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Coverage Index (CI) Reference Guide</DialogTitle>
                    <DialogDescription>
                      Compare your photos to these reference levels to track your progress on the Coverage Index (CI) scale from CI-0 (tightly circumcised) to CI-10 (fully restored).
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <CIReferenceGrid />
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Upload User Photo Button */}
              <Button 
                onClick={() => document.getElementById('photo-upload-top')?.click()}
                className="flex items-center"
                variant="default"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                Upload Your Photo
              </Button>
              <input
                type="file"
                id="photo-upload-top"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // Manually forward the file to the PhotoUpload component's file input
                    const photoUploadInput = document.getElementById('photo-upload') as HTMLInputElement;
                    if (photoUploadInput) {
                      // Create a DataTransfer object
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(e.target.files[0]);
                      
                      // Set the files to the photo-upload input
                      photoUploadInput.files = dataTransfer.files;
                      
                      // Trigger a change event
                      const event = new Event('change', { bubbles: true });
                      photoUploadInput.dispatchEvent(event);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Photo upload component only in the history tab */}
          <PhotoUpload userId={userId} currentCiLevel={user?.ciLevel || 0} />

          {isLoadingUserPhotos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-3 w-12 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <PhotoGrid photos={sortedUserPhotos} userId={userId} />
          )}
          
          {sortedUserPhotos && sortedUserPhotos.length === 0 && !isLoadingUserPhotos && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-neutral-500">No photos found</p>
                {filter !== "all" && (
                  <Button 
                    variant="link" 
                    onClick={() => setFilter("all")}
                    className="mt-2"
                  >
                    Clear filter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="reference" className="mt-0">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">CI Reference Guide</h2>
            <Button 
              onClick={() => document.getElementById('reference-photo-upload')?.click()}
              className="flex items-center"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Reference Photo
            </Button>
            <input
              type="file"
              id="reference-photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleReferencePhotoUpload}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Coverage Index (CI) Reference Guide</CardTitle>
              <CardDescription>
                The Coverage Index (CI) is a standardized scale used to measure foreskin restoration progress from CI-0 (tightly circumcised) to CI-10 (fully restored).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CIReferenceGrid />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
