import apiClient from './apiClient';

export const usersService = {
  getAll: () => apiClient.get('/Users'),
  getById: (userId) => apiClient.get(`/Users/${userId}`),
  getByUsername: (username) => apiClient.get(`/Users/username/${username}`),
  update: (userId, userData) => {
    console.log('About to send update request with data:', userData);
    return apiClient.put(`/Users/${userId}`, userData);
  },
  changePassword: (passwordData) => apiClient.put(`/Users/change-password`, passwordData),
  delete: (userId) => apiClient.delete(`/Users/${userId}`),
  getCurrentUser: () => apiClient.get('/Users/me'),
};