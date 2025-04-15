import apiClient from './apiClient';

export const searchService = {
  searchImages: (params) => apiClient.get('/Search/images', { params }),
  searchUsers: (params) => apiClient.get('/Search/users', { params }),
  searchCombined: (params) => apiClient.get('/Search', { params }),
};