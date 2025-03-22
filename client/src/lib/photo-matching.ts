/**
 * This module contains utilities for matching user photos with CI reference photos
 * 
 * In a production app, this would use image recognition or ML-based matching,
 * but for this prototype we'll simulate the matching process
 */

// Simulated reference image color histograms for each CI level (0-10)
// In a real app, these would be actual image signatures derived from the reference photos
const CI_REFERENCE_SIGNATURES: Record<number, number[]> = {
  0: [0.2, 0.3, 0.5, 0.7, 0.2, 0.1],
  1: [0.3, 0.4, 0.6, 0.6, 0.3, 0.2],
  2: [0.4, 0.5, 0.5, 0.5, 0.4, 0.3],
  3: [0.5, 0.6, 0.4, 0.4, 0.5, 0.4],
  4: [0.6, 0.5, 0.3, 0.3, 0.6, 0.5],
  5: [0.7, 0.4, 0.4, 0.2, 0.7, 0.6],
  6: [0.8, 0.3, 0.5, 0.3, 0.8, 0.7],
  7: [0.7, 0.2, 0.6, 0.4, 0.7, 0.8],
  8: [0.6, 0.3, 0.7, 0.5, 0.6, 0.9],
  9: [0.5, 0.4, 0.8, 0.6, 0.5, 1.0],
  10: [0.4, 0.5, 0.9, 0.7, 0.4, 0.8]
};

/**
 * Generate a simulated image signature from a user-uploaded photo
 * In a real application, this would analyze the actual image data
 * @param file The user's uploaded photo file
 * @returns A simulated image signature array
 */
export async function generateImageSignature(file: File): Promise<number[]> {
  // In a real app, we would analyze the image here
  // For the prototype, we'll generate a random signature influenced by the file size
  const randomBase = Math.sin(file.size % 100) * 0.5 + 0.5; // Generate a value between 0-1
  
  return [
    0.3 + randomBase * 0.5,
    0.4 + (1 - randomBase) * 0.4,
    0.5 + randomBase * 0.3,
    0.6 + (1 - randomBase) * 0.2,
    0.7 + randomBase * 0.2,
    0.8 + (1 - randomBase) * 0.1
  ];
}

/**
 * Calculate the Euclidean distance between two signatures
 * Lower distance = more similar
 */
function calculateDistance(signature1: number[], signature2: number[]): number {
  if (signature1.length !== signature2.length) {
    throw new Error('Signatures must have the same dimensions');
  }
  
  // Calculate Euclidean distance
  let sum = 0;
  for (let i = 0; i < signature1.length; i++) {
    sum += Math.pow(signature1[i] - signature2[i], 2);
  }
  
  return Math.sqrt(sum);
}

/**
 * Match an uploaded photo to the closest CI reference level
 * @param signature The signature of the uploaded photo
 * @returns The best matching CI level (0-10)
 */
export function matchToCILevel(signature: number[]): number {
  let bestMatch = 0;
  let bestDistance = Number.MAX_VALUE;
  
  // Compare with each reference signature
  for (let level = 0; level <= 10; level++) {
    const refSignature = CI_REFERENCE_SIGNATURES[level];
    const distance = calculateDistance(signature, refSignature);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = level;
    }
  }
  
  return bestMatch;
}