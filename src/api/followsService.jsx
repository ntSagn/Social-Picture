import apiClient from './apiClient';

export const followsService = {
  getFollowers: (userId) => {
    return apiClient.get(`/Follows/followers/${userId}`);
  },
  
  getFollowing: (userId) => {
    return apiClient.get(`/Follows/following/${userId}`);
  },
  
  follow: (followingId) => {
    return apiClient.post(`/Follows/${followingId}`);
  },
  
  unfollow: (followingId) => {
    return apiClient.delete(`/Follows/${followingId}`);
  },
  
  checkFollowing: (followingId) => {
    return apiClient.get(`/Follows/check/${followingId}`);
  },
  
  getCounts: (userId) => {
    return apiClient.get(`/Follows/counts/${userId}`);
  }
};