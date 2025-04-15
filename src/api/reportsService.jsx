import apiClient from './apiClient';

export const reportsService = {
  getAll: (params = {}) => {
    return apiClient.get('/Reports', { params });
  },
  
  getById: (id) => {
    return apiClient.get(`/Reports/${id}`);
  },
  
  getByImageId: (imageId) => {
    return apiClient.get(`/Reports/image/${imageId}`);
  },
  
  getMyReports: () => {
    return apiClient.get('/Reports/my-reports');
  },
  
  createReport: (data) => {
    return apiClient.post('/Reports', data);
  },
  
  resolveReport: (id, resolution) => {
    return apiClient.put(`/Reports/${id}/resolve`, resolution);
  },
  
  getPendingCount: () => {
    return apiClient.get('/Reports/pending-count');
  }
};