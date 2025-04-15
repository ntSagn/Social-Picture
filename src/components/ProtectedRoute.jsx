import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // If authenticated, render children
  return children;
};

export default ProtectedRoute;