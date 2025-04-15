import React, { useState, useEffect, useRef } from 'react';
import { Check, MoreVertical, X, Trash2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [activeNotificationId, setActiveNotificationId] = useState(null);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveNotificationId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      { 
        id: 1, 
        type: 'like', 
        content: 'user123 liked your photo',
        imageUrl: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        isRead: false,
        referenceId: 1 // Image ID
      },
      { 
        id: 2, 
        type: 'comment', 
        content: 'nature_lover commented: "Beautiful shot!"',
        imageUrl: 'https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        isRead: false,
        referenceId: 2 // Image ID
      },
      { 
        id: 3, 
        type: 'follow', 
        content: 'photo_enthusiast started following you',
        imageUrl: null,
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        isRead: true,
        referenceId: 21 // User ID
      },
      { 
        id: 4, 
        type: 'like', 
        content: 'travel_explorer liked your photo',
        imageUrl: 'https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        isRead: true,
        referenceId: 3 // Image ID
      },
      { 
        id: 5, 
        type: 'comment', 
        content: 'art_lover commented: "Great composition!"',
        imageUrl: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        isRead: false,
        referenceId: 1 // Image ID
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
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

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    
    // Navigate based on notification type
    if (notification.type === 'like' || notification.type === 'comment') {
      navigate(`/image/${notification.referenceId}`);
    } else if (notification.type === 'follow') {
      // In a real app, navigate to user profile
      // For now, just close the notification panel
      navigate(`/profile/${notification.referenceId}`);
    }
    
    if (!notification.isRead && onClose) {
      // Don't close panel when clicking a notification
      // onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prevNotifications => 
      prevNotifications.filter(n => n.id !== id)
    );
    setActiveNotificationId(null);
  };

  const toggleMoreOptions = (id, e) => {
    e.stopPropagation();
    setActiveNotificationId(activeNotificationId === id ? null : id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed left-16 top-0 h-full w-80 bg-white shadow-lg z-20 pt-16 overflow-y-auto">
      <div className="p-4">
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
          {notifications.length > 0 ? (
            <div className="divide-y mt-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`relative p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-red-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.imageUrl ? (
                        <img 
                          src={notification.imageUrl} 
                          alt="" 
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 text-xs">User</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded-full" 
                        onClick={(e) => toggleMoreOptions(notification.id, e)}
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                      
                      {activeNotificationId === notification.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10">
                          <div className="py-1">
                            <button 
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
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