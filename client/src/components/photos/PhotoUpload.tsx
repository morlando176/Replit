import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PhotoUploadProps {
  userId: number;
  currentCiLevel: number;
}

export default function PhotoUpload({ userId, currentCiLevel }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user/1']
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/photos/1'] });
      toast({
        title: "Photo Uploaded",
        description: "Your progress photo has been successfully uploaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId.toString());
    formData.append('date', new Date().toISOString());
    formData.append('ciLevel', currentCiLevel.toString());
    
    // Calculate days since start date if available
    if (user?.startDate) {
      const startDate = new Date(user.startDate);
      const today = new Date();
      const daysSinceStart = differenceInDays(today, startDate);
      formData.append('day', daysSinceStart.toString());
    }
    
    uploadMutation.mutate(formData);
  };

  const openFileDialog = () => {
    document.getElementById('photo-upload')?.click();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Upload New Photo</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'border-primary-400 bg-primary-50' : 'border-neutral-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-neutral-100 rounded flex items-center justify-center">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="ml-4 text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-neutral-500">{Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
              
              <Button 
                onClick={handleUpload} 
                disabled={uploadMutation.isPending}
                className="px-4 py-2"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                className="ml-2"
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <CloudUpload className="mx-auto h-12 w-12 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-600">Drag and drop your photo here, or click to select</p>
              <p className="text-xs text-neutral-500 mt-1">Your photos are stored securely and never shared</p>
              
              <Button 
                onClick={openFileDialog}
                className="mt-4 px-4 py-2"
              >
                Select Photo
              </Button>
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
