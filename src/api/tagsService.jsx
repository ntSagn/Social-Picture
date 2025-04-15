import apiClient from './apiClient';

export const tagsService = {
  getAll: () => apiClient.get('/Tags'),
  getById: (tagId) => apiClient.get(`/Tags/${tagId}`),
  getByName: (name) => apiClient.get(`/Tags/name/${name}`),
  create: (tagData) => apiClient.post('/Tags', tagData),
  delete: (tagId) => apiClient.delete(`/Tags/${tagId}`),
  getImagesByTagId: (tagId) => apiClient.get(`/Tags/images/tag/${tagId}`),
  getImagesByTagName: (tagName) => apiClient.get(`/Tags/images/name/${tagName}`),
  addTagToImage: (imageId, tagId) => apiClient.post(`/Tags/image/${imageId}/tag/${tagId}`),
  removeTagFromImage: (imageId, tagId) => apiClient.delete(`/Tags/image/${imageId}/tag/${tagId}`),
  getTagsForImage: (imageId) => apiClient.get(`/Tags/image/${imageId}`),
  getPopular: (count) => apiClient.get('/Tags/popular', { params: { count } }),
};