import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PhotoUpload from "@/components/photos/PhotoUpload";
import PhotoGrid from "@/components/photos/PhotoGrid";
import { Filter, SortAsc, MoreVertical } from "lucide-react";

export default function Photos() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  
  const { data: photos, isLoading } = useQuery({
    queryKey: ['/api/photos/1']
  });
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/1']
  });
  
  // Filter photos based on CI level
  const filteredPhotos = !photos ? [] : 
    filter === "all" 
      ? photos 
      : photos.filter((photo: any) => photo.ciLevel === parseInt(filter));
  
  // Sort photos
  const sortedPhotos = [...filteredPhotos].sort((a: any, b: any) => {
    if (sort === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sort === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sort === "ciLevel") {
      return (b.ciLevel || 0) - (a.ciLevel || 0);
    }
    return 0;
  });
  
  // Generate CI level options for filtering
  const ciLevelOptions = Array.from({ length: 11 }, (_, i) => ({
    value: i.toString(),
    label: `CI-${i}`
  }));
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">Progress Photos</h1>
      
      <PhotoUpload userId={1} currentCiLevel={user?.ciLevel || 0} />
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Photo History</h2>
          
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
        </div>
        
        {isLoading ? (
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
          <PhotoGrid photos={sortedPhotos} />
        )}
        
        {sortedPhotos && sortedPhotos.length === 0 && !isLoading && (
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
      </div>
    </div>
  );
}
