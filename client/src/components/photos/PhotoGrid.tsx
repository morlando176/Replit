import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Photo {
  id: number;
  date: string;
  ciLevel: number;
  day: number;
  filename: string;
}

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { toast } = useToast();
  
  const deletePhotoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/photos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos/1'] });
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from your collection.",
      });
      setPhotoToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the photo. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    setPhotoToDelete(id);
  };

  const confirmDelete = () => {
    if (photoToDelete !== null) {
      deletePhotoMutation.mutate(photoToDelete);
    }
  };

  const viewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-200 group">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 bg-neutral-100 relative">
                <img 
                  src={`/uploads/${photo.filename}`} 
                  alt={`Progress from ${format(new Date(photo.date), 'MMM d, yyyy')}`}
                  className="object-cover w-full h-full"
                  onClick={() => viewPhoto(photo)}
                />
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 bg-white rounded-full shadow-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => viewPhoto(photo)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(photo.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-800">
                  {format(new Date(photo.date), 'MMM d, yyyy')}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  photo.ciLevel > 0 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-neutral-600 bg-neutral-100'
                }`}>
                  CI-{photo.ciLevel}
                </span>
              </div>
              {photo.day !== undefined && (
                <p className="text-xs text-neutral-500 mt-1">Day {photo.day}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={photoToDelete !== null} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Photo Viewer Dialog */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Photo from {selectedPhoto && format(new Date(selectedPhoto.date), 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="mt-2">
              <div className="aspect-w-4 aspect-h-3 bg-neutral-100 rounded-lg overflow-hidden">
                <img 
                  src={`/uploads/${selectedPhoto.filename}`} 
                  alt={`Progress from ${format(new Date(selectedPhoto.date), 'MMM d, yyyy')}`}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">CI Level: </span>
                  <span className="text-primary-600 font-medium">CI-{selectedPhoto.ciLevel}</span>
                </div>
                
                {selectedPhoto.day !== undefined && (
                  <div className="text-neutral-500">Day {selectedPhoto.day} of restoration</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
