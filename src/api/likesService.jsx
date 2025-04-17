import apiClient from './apiClient';

export const likesService = {
  getByImage: (imageId) => {
    return apiClient.get(`/Likes/image/${imageId}`);
  },
  
  getUserLikedImages: (userId) => {
    return apiClient.get(`/Likes/user/${userId || 'me'}`);
  },
  
  like: (imageId) => {
    return apiClient.post(`/Likes/image/${imageId}`);
  },
  
  unlike: (imageId) => {
    return apiClient.delete(`/Likes/image/${imageId}`);
  },
  
  checkLike: (imageId) => {
    return apiClient.get(`/Likes/check/${imageId}`);
  }
};