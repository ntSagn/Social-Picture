import React, { useState, useEffect, useRef } from 'react';
import { Check, MoreVertical, X, Trash2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../api/notificationService';
import defaultProfilePicture from '../assets/default-avatar.png';

function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotificationId, setActiveNotificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Emit custom event when panel opens or closes
  useEffect(() => {
    const event = new CustomEvent('notification-panel-toggle', { 
      detail: { isOpen } 
    });
    window.dispatchEvent(event);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Only handle clicks that are truly outside the dropdown menu
      const isClickInsideButton = event.target.closest('button');
      const isClickInsideDropdown = event.target.closest('.dropdown-menu');
      
      if (!isClickInsideButton && !isClickInsideDropdown) {
        setActiveNotificationId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Get notifications summary for the current user
      const response = await notificationsService.getAll();
      const unreadCountResponse = await notificationsService.getUnreadCount();

      console.log('API Response Structure:', response);
      console.log(unreadCountResponse.data);
      // Check if response is an array directly (for backward compatibility)
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(unreadCountResponse.data);
      } 
      // Check for expected summary structure
      else if (response && response.data.recentNotifications) {
        setNotifications(response.data.recentNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      } 
      // Response is an object but with different structure
      else if (response && typeof response === 'object') {
        console.log('Unexpected response format, trying to adapt...');
        
        // If the response itself might be what we want
        if (response.notificationId) {
          setNotifications([response]); // Treat single notification as array
          setUnreadCount(response.isRead ? 0 : 1);
        } else {
          // Try to find an array property that might contain notifications
          const possibleArrayProps = Object.values(response).find(val => Array.isArray(val));
          if (possibleArrayProps) {
            console.log('Found array in response:', possibleArrayProps);
            setNotifications(possibleArrayProps);
            setUnreadCount(possibleArrayProps.filter(n => !n.isRead).length || 0);
          } else {
            console.error('Cannot find notifications array in response:', response);
            setNotifications([]);
            setUnreadCount(0);
          }
        }
      } else {
        console.error('Invalid response format:', response);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Handle timezone difference by working with UTC values
    const dateUTC = Date.UTC(
      date.getUTCFullYear(), 
      date.getUTCMonth(), 
      date.getUTCDate(), 
      date.getUTCHours(), 
      date.getUTCMinutes(), 
      date.getUTCSeconds()
    );
    
    const nowUTC = Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      now.getUTCHours(), 
      now.getUTCMinutes(), 
      now.getUTCSeconds()
    );
    
    const diffInSeconds = Math.floor((nowUTC - dateUTC) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        // Use the correct method from notificationsService
        await notificationsService.markAsRead(notification.notificationId);
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
          )
        );
        // Decrease unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    if (notification.type === 0) { // like
      navigate(`/image/${notification.referenceId}`);
    } else if (notification.type === 1) { // comment
      navigate(`/image/${notification.referenceId}`);
    } else if (notification.type === 3) { // follow
      navigate(`/profile/${notification.referenceId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Use the correct method from notificationsService
      await notificationsService.markAllAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    try {
      e.stopPropagation();
      console.log('Deleting notification:', id);
      
      // Call the delete API
      await notificationsService.delete(id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.notificationId !== id)
      );
      
      // Close the dropdown
      setActiveNotificationId(null);
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleMoreOptions = (id, e) => {
    e.stopPropagation();
    setActiveNotificationId(activeNotificationId === id ? null : id);
  };

  if (!isOpen) return null;
  

  return (
    <div className="fixed left-16 top-0 h-full w-80 bg-white shadow-lg z-20 pt-16 overflow-y-auto overflow-x-hidden">
      <div className="h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full cursor-pointer hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className='relative top-0 left-42 flex items-center hover:text-red-600 hover:font-bold'>
          <Check size={16} className='text-red-400 cursor-pointer' />
          <button className='text-sm text-red-400 cursor-pointer' onClick={handleMarkAllAsRead}>
            Mark all as read 
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y mt-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.notificationId} 
                  className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-red-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.senderProfilePicture ? (
                        <img 
                          src={notification.senderProfilePicture} 
                          alt="" 
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <img 
                          src={defaultProfilePicture} 
                          alt="" 
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.createdAt)}</p>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded-full" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMoreOptions(notification.notificationId, e)
                        }}
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                      
                      {activeNotificationId === notification.notificationId && (
                        <div 
                        className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button 
                            onClick={(e) => {
                              // e.stopPropagation();
                              handleDeleteNotification(notification.notificationId, e);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Trash2 size={16} className="mr-2" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-600"></span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="bg-gray-100 p-4 rounded-full">
                <Bell size={24} className="text-gray-400" />
              </div>
              <p className="mt-4 text-gray-500 text-center">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;