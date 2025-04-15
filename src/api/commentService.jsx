import apiClient from './apiClient';

export const commentService = {
  getByImageId: (imageId) => {
    return apiClient.get(`/Comments/image/${imageId}`);
  },
  
  getById: (id) => {
    return apiClient.get(`/Comments/${id}`);
  },
  
  create: (data) => {
    return apiClient.post('/Comments', data);
  },
  
  update: (id, content) => {
    return apiClient.put(`/Comments/${id}`, { content });
  },
  
  delete: (id) => {
    return apiClient.delete(`/Comments/${id}`);
  },
  
  getReplies: (commentId) => {
    return apiClient.get(`/Comments/${commentId}/replies`);
  }
};