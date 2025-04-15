const API_URL = 'https://localhost:7199';

/**
 * Converts a relative image path from the API to a full URL
 * @param {string} imagePath - The image path returned from API
 * @returns {string} - Complete URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/vite.svg'; // Default fallback image
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Construct the full URL
  return `${API_URL}/${path}`;
};