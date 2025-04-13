import React, { useState } from 'react'
import { Home, Upload, Bell, Settings, User, Shield } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import NotificationPanel from './NotificationPanel'
import { getCurrentUser } from '../services/auth'

function Sidebar() {
  const location = useLocation()
  const path = location.pathname
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const user = getCurrentUser()
  
  const isActive = (route) => {
    if (route === '/' && path === '/') return true;
    if (route === '/upload' && path === '/upload') return true;
    if (route === '/notifications' && path.startsWith('/notifications')) return true;
    if (route === '/profile' && path.startsWith('/profile')) return true;
    if (route === '/admin' && path === '/admin') return true;
    if (route === '/manage-reports' && path === '/manage-reports') return true;
    return false;
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-16 bg-white shadow-md z-40">
        <div className="flex flex-col h-full justify-between">
          {/* Logo */}
          <div className="p-4">
            <Link to="/">
              <img src="/vite.svg" alt="Logo" className="h-8 mx-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col items-center space-y-6 mt-4">
            {/* Home Button */}
            <Link 
              to="/" 
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-black' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              {isActive('/') ? (
                <>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                  <Home size={24} className="transition-transform duration-200 transform scale-110" />
                </>
              ) : (
                <Home size={24} />
              )}
            </Link>
            
            {/* Upload Button */}
            <Link 
              to="/upload" 
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                isActive('/upload') 
                  ? 'text-black' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              {isActive('/upload') ? (
                <>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                  <Upload size={24} className="transition-transform duration-200 transform scale-110" />
                </>
              ) : (
                <Upload size={24} />
              )}
            </Link>
            
            {/* Notifications Button */}
            <button
              onClick={() => setNotificationPanelOpen(!isNotificationPanelOpen)}
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                isNotificationPanelOpen 
                  ? 'text-black' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              {isNotificationPanelOpen ? (
                <>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                  <Bell size={24} className="transition-transform duration-200 transform scale-110" />
                </>
              ) : (
                <>
                  <Bell size={24} />
                  {/* Optional: Add a notification indicator dot */}
                  <span className="absolute top-3 right-3 h-2 w-2 bg-red-600 rounded-full"></span>
                </>
              )}
            </button>
            
            {/* Admin Dashboard Button - visible only to admins */}
            {user && user.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                  isActive('/admin') 
                    ? 'text-black' 
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                {isActive('/admin') ? (
                  <>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                    <Shield size={24} className="transition-transform duration-200 transform scale-110" />
                  </>
                ) : (
                  <Shield size={24} />
                )}
              </Link>
            )}
            
            {/* Manager Dashboard Button - visible to managers and admins */}
            {user && (user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <Link 
                to="/manage-reports" 
                className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                  isActive('/manage-reports') 
                    ? 'text-black' 
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                {isActive('/manage-reports') ? (
                  <>
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                    <Settings size={24} className="transition-transform duration-200 transform scale-110" />
                  </>
                ) : (
                  <Settings size={24} />
                )}
              </Link>
            )}
          </nav>

          {/* Profile */}
          <div className="py-4">
            <Link 
              to="/profile" 
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${
                isActive('/profile') 
                  ? 'text-black' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-100'
              }`}
            >
              {isActive('/profile') ? (
                <>
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                  <User size={24} className="transition-transform duration-200 transform scale-110" />
                </>
              ) : (
                <User size={24} />
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Notification Panel - now positioned right beside the sidebar */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Add this to push content right when notification panel is open */}
      <div className={`transition-all duration-300 ${isNotificationPanelOpen ? 'ml-[304px]' : 'ml-16'}`}></div>
    </>
  );
}

export default Sidebar;