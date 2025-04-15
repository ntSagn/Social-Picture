import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api/authService';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await apiClient.get('/Users/me');
      console.log("Fetched user data:", data);
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      
      console.log("Login response:", response.data);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set user info from login response for immediate UI update
      setCurrentUser({
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
        bio: response.data.bio,
        // Add fallback values for other fields that we haven't received yet
        profilePicture: null,
        email: "",
        fullname: response.data.username,
      });
      
      // Then fetch the full user profile
      await fetchCurrentUser();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};