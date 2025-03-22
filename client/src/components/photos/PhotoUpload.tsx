import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, ImagePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { generateImageSignature, matchToCILevel } from "@/lib/photo-matching";
import CIReferenceGrid from "./CIReferenceGrid";

interface PhotoUploadProps {
  userId: number;
  currentCiLevel: number;
}

export default function PhotoUpload({ userId, currentCiLevel }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [suggestedCiLevel, setSuggestedCiLevel] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [selectedCiLevel, setSelectedCiLevel] = useState<number>(currentCiLevel);
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['/api/user', userId],
    // Ensure the query properly typecasts the response
    select: (data) => data as { id: number; startDate?: string; ciLevel?: number }
  });

  // Reset the selected CI level when currentCiLevel prop changes
  useEffect(() => {
    setSelectedCiLevel(currentCiLevel);
  }, [currentCiLevel]);
  
  // When a file is selected, analyze it and suggest a CI level
  useEffect(() => {
    async function analyzePhoto() {
      if (file) {
        try {
          // Generate a signature for the uploaded photo
          const signature = await generateImageSignature(file);
          
          // Match the signature to the closest CI level
          const matchedLevel = matchToCILevel(signature);
          
          // Set the suggested CI level
          setSuggestedCiLevel(matchedLevel);
          setSelectedCiLevel(matchedLevel);
          setShowConfirmation(true);
        } catch (error) {
          console.error('Error analyzing photo:', error);
          // If analysis fails, default to current CI level
          setSuggestedCiLevel(null);
          setSelectedCiLevel(currentCiLevel);
        }
      } else {
        setSuggestedCiLevel(null);
      }
    }
    
    analyzePhoto();
  }, [file, currentCiLevel]);
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload error:', errorData);
          throw new Error(errorData.message || 'Failed to upload photo');
        }
        
        return response.json();
      } catch (error) {
        console.error('Photo upload error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setFile(null);
      setSuggestedCiLevel(null);
      setShowConfirmation(false);
      // Use the correct user ID for invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/photos', userId] });
      toast({
        title: "Photo Uploaded",
        description: "Your progress photo has been successfully uploaded and CI level analyzed.",
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
    formData.append('ciLevel', selectedCiLevel.toString());
    
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

  const handleSelectReference = (ciLevel: number) => {
    setSelectedCiLevel(ciLevel);
    setShowReferences(false);
    setShowConfirmation(true);
  };

  const confirmCiLevel = () => {
    handleUpload();
  };

  return (
    <>
      {/* Only show CIReferenceGrid when in reference selection mode */}
      {showReferences && (
        <CIReferenceGrid onSelectReference={handleSelectReference} />
      )}
      
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
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Button 
                    onClick={() => setShowConfirmation(true)} 
                    disabled={uploadMutation.isPending}
                    className="px-4 py-2"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReferences(true)}
                    className=""
                    disabled={uploadMutation.isPending}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Choose Reference
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setFile(null)}
                    className=""
                    disabled={uploadMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
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
      
      {/* CI Level confirmation dialog */}
      <AlertDialog open={showConfirmation && file !== null} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Coverage Index Level</AlertDialogTitle>
            <AlertDialogDescription>
              {suggestedCiLevel !== null ? (
                <>
                  Based on our analysis, this photo appears to match CI-{suggestedCiLevel}.
                  <br /><br />
                  You can accept this suggestion or choose a different level.
                </>
              ) : (
                <>Please confirm the Coverage Index level for this photo.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-24 h-24 bg-neutral-100 rounded overflow-hidden">
                {file && (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div>
                <div className="mb-2">
                  <label className="text-sm font-medium mb-1 block">CI Level:</label>
                  <select 
                    value={selectedCiLevel} 
                    onChange={(e) => setSelectedCiLevel(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md w-24"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i}>CI-{i}</option>
                    ))}
                  </select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowConfirmation(false);
                    setShowReferences(true);
                  }}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Select from References
                </Button>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCiLevel}>
              Upload Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
