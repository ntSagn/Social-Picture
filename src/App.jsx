import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Feed from './pages/Feed';
import ImageDetail from './pages/ImageDetail';
import Profile from './pages/Profile';
import UploadImage from './pages/UploadImage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagement from './pages/admin/UserManagement';

function App() {
  const { currentUser, loading } = useAuth() || { currentUser: null, loading: true };

  // Helper function to check if user has required role
  const hasRole = (requiredRole) => {
    if (!currentUser) return false;

    if (requiredRole === 'ADMIN') return currentUser.role === 2;
    if (requiredRole === 'MANAGER') return currentUser.role === 1 || currentUser.role === 2;
    if (requiredRole === 'USER') return currentUser.role === 0 || currentUser.role === 1 || currentUser.role === 2;

    return false;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }


  return (
    <NotificationProvider>
      <Routes>
        {/* Home route: Show Home for guests, Feed for authenticated users */}
        <Route path="/" element={currentUser ? <Feed /> : <Home />} />

        {/* These routes are accessible to all users */}
        <Route path="/explore" element={<Feed />} />
        <Route path="/image/:imageId" element={<ImageDetail />} />

        {/* Protected routes - only for authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadImage />
            </ProtectedRoute>
          }
        />

        {/* Role-based routes */}
        <Route
          path="/admin"
          element={
            (hasRole("ADMIN")) ?
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
              : <Navigate to="/" />
          }
        />

        <Route
          path="/user-management"
          element={
            (hasRole("ADMIN")) ?
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
              : <Navigate to="/" />
          }
        />

        <Route
          path="/manage-reports"
          element={
            hasRole('MANAGER') ?
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
              : <Navigate to="/" />
          }
        />

        {/* Redirect to feed if already logged in */}
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Home />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;