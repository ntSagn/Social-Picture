import apiClient from './apiClient';

export const authService = {
  register: (userData) => 
    apiClient.post('/Auth/register', userData),
  
  login: (credentials) => 
    apiClient.post('/Auth/login', credentials),
};

export default authService;