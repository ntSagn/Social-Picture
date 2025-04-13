import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Search from './pages/Search';
import ImageDetail from './pages/ImageDetail';
import Profile from './pages/Profile';
import UploadImage from './pages/UploadImage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import { getCurrentUser } from './services/auth';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const user = getCurrentUser();

  // Helper function to check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    if (requiredRole === 'ADMIN') return user.role === 'ADMIN';
    if (requiredRole === 'MANAGER') return user.role === 'MANAGER' || user.role === 'ADMIN';
    if (requiredRole === 'USER') return user.role === 'USER' || user.role === 'MANAGER' || user.role === 'ADMIN';
    
    return false;
  };

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Feed /> : <Home />} />
          <Route path="/explore" element={<Feed />} />
          <Route path="/search" element={<Search />} />
          <Route path="/image/:imageId" element={<ImageDetail />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/upload" element={user ? <UploadImage /> : <Navigate to="/" />} />
          <Route path="/admin" element={hasRole('ADMIN') ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/manage-reports" element={hasRole('MANAGER') ? <ManagerDashboard /> : <Navigate to="/" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Home />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;