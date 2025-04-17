import apiClient from './apiClient';

export const notificationsService = {
  getAll: (params) => apiClient.get('/Notifications', { params }),
  getById: (notificationId) => apiClient.get(`/Notifications/${notificationId}`),
  markAsRead: (notificationId) => apiClient.put(`/Notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.put('/Notifications/mark-all-read'),
  getUnreadCount: () => apiClient.get('/Notifications/unread-count'),
  getSummary: () => apiClient.get('/Notifications/summary'),
  delete: (notificationId) => apiClient.delete(`/Notifications/${notificationId}`),
};