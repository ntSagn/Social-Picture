import apiClient from './apiClient';

export const commentLikeService = {
  getLikesByComment: (commentId) => 
    apiClient.get(`/CommentLikes/comment/${commentId}`),
  
  like: (commentId) => 
    apiClient.post(`/CommentLikes/comment/${commentId}`),
  
  unlike: (commentId) => 
    apiClient.delete(`/CommentLikes/comment/${commentId}`),
  
  checkLike: (commentId) => 
    apiClient.get(`/CommentLikes/check/${commentId}`),
  
  getLikesCount: (commentId) => 
    apiClient.get(`/CommentLikes/count/${commentId}`),
};

export default commentLikeService;