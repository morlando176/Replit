import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// CI levels range from 0-10
const CI_LEVELS = Array.from({ length: 11 }, (_, i) => i);

// For demo, we'll use placeholder reference images that represent each CI level
// In a production app, these would be actual reference images
const CI_REFERENCE_IMAGES: Record<number, string> = {
  0: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  1: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  2: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  3: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  4: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  5: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  6: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  7: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  8: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  9: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
  10: "https://static.vecteezy.com/system/resources/thumbnails/005/411/889/small/circumcision-reconstructive-surgery-medical-concept-vector.jpg",
};

// CI descriptions for each level
const CI_DESCRIPTIONS: Record<number, string> = {
  0: "Tightly circumcised. No slack in skin when flaccid, causing discomfort when erect.",
  1: "Minimal slack in skin when flaccid, still tight when erect.",
  2: "Some slack when flaccid, still tight when erect.",
  3: "More slack when flaccid, skin covers some of glans when manipulated.",
  4: "Skin can be pulled to cover glans with manipulation, mild tension when erect.",
  5: "Skin naturally covers glans when flaccid, can be retracted easily.",
  6: "Skin covers glans naturally with overhang, some bunching behind glans when erect.",
  7: "Skin covers glans with overhang, stays in forward position without assistance.",
  8: "Natural skin coverage with consistent overhang, minimal manual adjustment needed.",
  9: "Full coverage with overhang in various conditions, approaching full restoration.",
  10: "Complete restoration. Full coverage with significant overhang, resembling intact state."
};

// Function to determine appropriate color based on CI level
const getCILevelColor = (level: number): string => {
  if (level <= 2) return "bg-red-50 text-red-600";
  if (level <= 5) return "bg-orange-50 text-orange-600";
  if (level <= 8) return "bg-green-50 text-green-600";
  return "bg-blue-50 text-blue-600";
};

interface CIReferenceGridProps {
  onSelectReference?: (ciLevel: number) => void;
}

export default function CIReferenceGrid({ onSelectReference }: CIReferenceGridProps) {
  const [selectedCILevel, setSelectedCILevel] = useState<number | null>(null);

  const handleReferenceClick = (level: number) => {
    setSelectedCILevel(level);
  };

  const handleSelect = () => {
    if (selectedCILevel !== null && onSelectReference) {
      onSelectReference(selectedCILevel);
    }
    setSelectedCILevel(null);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Coverage Index (CI) Reference</h2>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Info className="h-4 w-4" />
          <span>About CI Scale</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {CI_LEVELS.map(level => (
          <Card 
            key={level}
            className="overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary-400 hover:shadow-md"
            onClick={() => handleReferenceClick(level)}
          >
            <div className="aspect-square bg-neutral-100 relative">
              <img 
                src={CI_REFERENCE_IMAGES[level]} 
                alt={`CI-${level} Reference`}
                className="object-cover w-full h-full"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getCILevelColor(level)}`}>
                CI-{level}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Detail dialog for selected reference */}
      <Dialog open={selectedCILevel !== null} onOpenChange={() => setSelectedCILevel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              CI-{selectedCILevel} Reference
            </DialogTitle>
          </DialogHeader>
          
          {selectedCILevel !== null && (
            <div className="mt-4 space-y-4">
              <div className="aspect-square max-h-96 bg-neutral-100 rounded-lg overflow-hidden mx-auto">
                <img 
                  src={CI_REFERENCE_IMAGES[selectedCILevel]} 
                  alt={`CI-${selectedCILevel} Reference`}
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="px-2">
                <h3 className={`text-lg font-medium mb-2 ${getCILevelColor(selectedCILevel).split(' ')[1]}`}>
                  Coverage Index (CI) Level {selectedCILevel}
                </h3>
                <p className="text-neutral-700">{CI_DESCRIPTIONS[selectedCILevel]}</p>
                
                {onSelectReference && (
                  <Button 
                    className="mt-4 w-full"
                    onClick={handleSelect}
                  >
                    Use This Reference
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}