import apiClient from './apiClient';

export const searchService = {
  // Combined search for both users and images
  search: (query, limit = 5) => 
    apiClient.get(`/Search?query=${query}&limit=${limit}`),
  
  // Search only images
  searchImages: (query, page = 1, pageSize = 10) => 
    apiClient.get(`/Search/images?query=${query}&page=${page}&pageSize=${pageSize}`),
  
  // Search only users
  searchUsers: (query, page = 1, pageSize = 10) => 
    apiClient.get(`/Search/users?query=${query}&page=${page}&pageSize=${pageSize}`)
};

export default searchService;