import apiClient from './apiClient';

export const imagesService = {
  // Get all images with optional filtering
  getAll: async (params) => {
    try {
      const response = await apiClient.get('/Images', { params });
      // Ensure we return the array of images
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data : 
              (response.data.items || response.data.images || [])
      };
    } catch (error) {
      console.error('Error in imagesService.getAll:', error);
      throw error;
    }
  },
  
  // Get single image by ID
  getById: (imageId) => apiClient.get(`/Images/${imageId}`),
  
  // Create a new image
  create: (formData) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };
    return apiClient.post('/Images', formData, config);
  },
  
  // Update an existing image
  update: (imageId, imageData) => apiClient.put(`/Images/${imageId}`, imageData),
  
  // Delete an image
  delete: (imageId) => apiClient.delete(`/Images/${imageId}`),
};

export default imagesService;