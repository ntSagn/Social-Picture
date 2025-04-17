import apiClient from './apiClient';

export const savedImagesService = {
  // Get current user's saved images
  getCurrentUserSaved: () => {
    return apiClient.get('/SavedImages');
  },
  
  // Get saved images by user ID
  getUserSaved: (userId) => {
    return apiClient.get(`/SavedImages/user/${userId}`);
  },
  
  // Get paginated saved images
  getPaged: (params = {}) => {
    return apiClient.get('/SavedImages/paged', { params });
  },
  
  // Save an image
  saveImage: (imageId) => {
    return apiClient.post('/SavedImages', { imageId });
  },
  
  // Unsave an image
  unsaveImage: (imageId) => {
    return apiClient.delete(`/SavedImages/${imageId}`);
  },
  
  // Check if an image is saved
  checkSaved: (imageId) => {
    return apiClient.get(`/SavedImages/check/${imageId}`);
  }
};