import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  parse
} from "date-fns";

/**
 * Calculate the number of days since the start date
 */
export const calculateDaysSinceStart = (startDate: Date | string | undefined): number => {
  if (!startDate) return 0;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const today = new Date();
  
  return Math.floor(differenceInDays(today, start)) + 1;
};

/**
 * Format a date for display
 */
export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
};

/**
 * Format a date for API requests
 */
export const formatApiDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Calculate estimated completion date based on progress rate
 */
export const calculateEstimatedCompletion = (
  currentLevel: number,
  targetLevel: number,
  startDate: Date | string,
  startLevel: number
): Date | null => {
  if (currentLevel >= targetLevel || !startDate) return null;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const today = new Date();
  const daysSoFar = differenceInDays(today, start);
  
  // Handle case where no progress has been made yet
  if (currentLevel <= startLevel || daysSoFar === 0) {
    // Return a reasonable default - 3 years from start
    return addDays(start, 365 * 3);
  }
  
  // Calculate days per level based on progress so far
  const levelsGained = currentLevel - startLevel;
  const daysPerLevel = daysSoFar / levelsGained;
  
  // Calculate remaining levels and days
  const levelsRemaining = targetLevel - currentLevel;
  const daysRemaining = daysPerLevel * levelsRemaining;
  
  return addDays(today, daysRemaining);
};

/**
 * Check if a date is within a range
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  const day = startOfDay(date);
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  
  return (
    (isAfter(day, start) || isEqual(day, start)) && 
    (isBefore(day, end) || isEqual(day, end))
  );
};
