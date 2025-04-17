import React, { useState, useEffect } from 'react'
import { Home, Upload, Bell, Settings, User, Shield, UserPlus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import NotificationPanel from './NotificationPanel'
import { usersService } from '../api/usersService'
import { notificationsService } from '../api/notificationService'

function Sidebar() {
  const location = useLocation()
  const path = location.pathname
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user data asynchronously
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await usersService.getCurrentUser();
        console.log("Sidebar user data:", userData);
        setUser(userData.data || userData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user in sidebar:", err);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsService.getUnreadCount();
        setUnreadNotificationsCount(response.data || 0);
      } catch (err) {
        console.error("Error fetching unread notifications count:", err);
      }
    };

    if (user) {
      fetchUnreadCount();

      // Set up a periodic check for new notifications
      const intervalId = setInterval(fetchUnreadCount, 60000); // every minute

      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Listen for notification panel toggle events
  useEffect(() => {
    const handleNotificationUpdate = async () => {
      try {
        const response = await notificationsService.getUnreadCount();
        setUnreadNotificationsCount(response.data || 0);
      } catch (err) {
        console.error("Error updating unread count:", err);
      }
    };

    window.addEventListener('notification-read', handleNotificationUpdate);
    window.addEventListener('notification-panel-close', handleNotificationUpdate);

    return () => {
      window.removeEventListener('notification-read', handleNotificationUpdate);
      window.removeEventListener('notification-panel-close', handleNotificationUpdate);
    };
  }, []);

  // Update notifications count when panel closes
  useEffect(() => {
    if (!isNotificationPanelOpen) {
      const updateCount = async () => {
        try {
          const response = await notificationsService.getUnreadCount();
          setUnreadNotificationsCount(response.data || 0);
        } catch (err) {
          console.error("Error updating unread count:", err);
        }
      };

      updateCount();
    }
  }, [isNotificationPanelOpen]);
  
  const isActive = (route) => {
    if (route === '/' && path === '/') return true;
    if (route === '/upload' && path === '/upload') return true;
    if (route === '/notifications' && path.startsWith('/notifications')) return true;
    if (route === '/profile' && path.startsWith('/profile')) return true;
    if (route === '/admin' && path === '/admin') return true;
    if (route === '/manage-reports' && path === '/manage-reports') return true;
    if (route === '/user-management' && path === '/user-management') return true;
    return false;
  };

  // Helper function to check user roles consistently
  const hasRole = (requiredRole) => {
    if (!user) return false;

    if (requiredRole === 'ADMIN') return user.role === 2;
    if (requiredRole === 'MANAGER') return user.role === 1;
    if (requiredRole === 'USER') return user.role === 0 || user.role === 1 || user.role === 2;

    return false;
  };

  // Show simplified sidebar while loading
  if (loading) {
    return (
      <div className="fixed left-0 top-0 h-full w-16 bg-white shadow-md">
        <div className="flex flex-col h-full justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8 mb-4 border-t-red-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // If no user, show limited sidebar
  if (!user) {
    return (
      <div className="fixed left-0 top-0 h-full w-16 bg-white shadow-md">
        <div className="flex flex-col h-full justify-between">
          <nav className="flex-1 flex flex-col items-center space-y-6 mt-20">
            <Link
              to="/"
              className="relative w-full flex justify-center py-3 text-gray-700 hover:text-black hover:bg-gray-100"
            >
              <Home size={24} />
            </Link>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-16 bg-white shadow-md">
        <div className="flex flex-col h-full justify-between">
          {/* Navigation */}
          <nav className="flex-1 flex flex-col items-center space-y-6 mt-20">
            {/* Home Button */}
            <Link
              to="/"
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/')
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
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/upload')
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
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isNotificationPanelOpen
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
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-3 right-3 h-2 w-2 bg-red-600 rounded-full"></span>
                  )}
                </>
              )}
            </button>

            {/* ---------- ADMIN SECTION ---------- */}
            {hasRole('ADMIN') && (
              <>
                {/* Admin Dashboard Button */}
                <Link
                  to="/admin"
                  className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/admin')
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

                {/* User Management Button - Admin only */}
                <Link
                  to="/user-management"
                  className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/user-management')
                      ? 'text-black'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                    }`}
                >
                  {isActive('/user-management') ? (
                    <>
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-full"></span>
                      <UserPlus size={24} className="transition-transform duration-200 transform scale-110" />
                    </>
                  ) : (
                    <UserPlus size={24} />
                  )}
                </Link>
              </>
            )}

            {/* Manager Dashboard Button - visible to managers and admins */}
            {hasRole('MANAGER') && (
              <Link
                to="/manage-reports"
                className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/manage-reports')
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
              className={`relative w-full flex justify-center py-3 transition-colors duration-200 ${isActive('/profile')
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
        onNotificationsRead={() => setUnreadNotificationsCount(0)}
      />

      {/* Add this to push content right when notification panel is open */}
      <div className={`transition-all duration-300 ${isNotificationPanelOpen ? 'ml-[304px]' : 'ml-16'}`}></div>
    </>
  );
}

export default Sidebar;