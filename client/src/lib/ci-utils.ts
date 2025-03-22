/**
 * Coverage Index (CI) descriptions
 */
export const CI_DESCRIPTIONS = {
  0: "No coverage at all; the glans is fully exposed at all times",
  1: "Some shaft skin bunching near the corona but no real coverage",
  2: "The glans is partially covered when flaccid, but it retracts with any movement",
  3: "About half of the glans is covered when flaccid, but it does not stay in place",
  4: "The glans is mostly covered when flaccid, but the skin does not stay over it reliably",
  5: "The glans is fully covered when flaccid, but the coverage is loose and retracts easily",
  6: "The glans remains covered most of the time when flaccid, with some overhang starting",
  7: "Noticeable overhang of the foreskin when flaccid; retracts when erect",
  8: "A significant overhang when flaccid, with some partial coverage when erect",
  9: "Full coverage when flaccid, and the foreskin stays partially forward when erect",
  10: "Complete, reliable coverage when both flaccid and erect, resembling a natural foreskin"
};

/**
 * Get CI percentage increase from start
 */
export const getCIPercentIncrease = (ciLevel: number): { min: number, max: number } => {
  const percentages = {
    0: { min: 0, max: 0 },
    1: { min: 3, max: 7 },
    2: { min: 10, max: 13 },
    3: { min: 17, max: 20 },
    4: { min: 23, max: 27 },
    5: { min: 30, max: 33 },
    6: { min: 40, max: 47 },
    7: { min: 53, max: 60 },
    8: { min: 70, max: 80 },
    9: { min: 90, max: 100 },
    10: { min: 110, max: 120 }
  };
  
  return percentages[ciLevel as keyof typeof percentages] || { min: 0, max: 0 };
};

/**
 * Calculate estimated skin area requirements based on circumference
 */
export const calculateSkinRequirements = (
  circumference: number, 
  targetCI: number
): { additionalSkin: number, totalSkin: number, percentIncrease: number } => {
  // Base calculation assumes 6-inch length
  const baseLength = 6; // inches
  const startingSurfaceArea = circumference * baseLength; // square inches
  
  // Get percentage increase for target CI
  const { min, max } = getCIPercentIncrease(targetCI);
  const avgPercentIncrease = (min + max) / 2;
  
  // Calculate additional skin needed
  const additionalSkin = (startingSurfaceArea * avgPercentIncrease) / 100;
  const totalSkin = startingSurfaceArea + additionalSkin;
  
  return {
    additionalSkin,
    totalSkin,
    percentIncrease: avgPercentIncrease
  };
};

/**
 * Calculate optimal tension based on circumference
 */
export const calculateOptimalTension = (circumference: number): number => {
  // Based on the calculation described in the document:
  // 500g is optimal for 5-inch circumference
  return Math.round(100 * circumference);
};

/**
 * Get progress percentage between two CI levels
 */
export const getProgressPercentage = (
  currentCI: number,
  startCI: number,
  targetCI: number
): number => {
  if (currentCI >= targetCI) return 100;
  if (currentCI <= startCI) return 0;
  
  const totalLevels = targetCI - startCI;
  const levelsCompleted = currentCI - startCI;
  
  return Math.round((levelsCompleted / totalLevels) * 100);
};

/**
 * Get CI level color class for styling
 */
export const getCILevelColorClass = (ciLevel: number): string => {
  if (ciLevel <= 0) return "text-neutral-600 bg-neutral-100";
  if (ciLevel >= 9) return "text-green-600 bg-green-50";
  return "text-primary-600 bg-primary-50";
};
