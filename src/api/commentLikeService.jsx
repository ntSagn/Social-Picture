import apiClient from './apiClient';

export const commentLikesService = {
  getUsersWhoLiked: (commentId) => apiClient.get(`/CommentLikes/comment/${commentId}`),
  like: (commentId) => apiClient.post(`/CommentLikes/comment/${commentId}`),
  unlike: (commentId) => apiClient.delete(`/CommentLikes/comment/${commentId}`),
  checkIfLiked: (commentId) => apiClient.get(`/CommentLikes/check/${commentId}`),
  getCount: (commentId) => apiClient.get(`/CommentLikes/count/${commentId}`),
};