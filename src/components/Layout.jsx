import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, searchQuery, onSearchChange, onSearchSubmit, isSearchPage }) => {
  const { currentUser } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Listen for custom event from notification panel
  useEffect(() => {
    const handleNotificationToggle = (e) => {
      setIsNotificationOpen(e.detail.isOpen);
    };
    
    window.addEventListener('notification-panel-toggle', handleNotificationToggle);
    
    return () => {
      window.removeEventListener('notification-panel-toggle', handleNotificationToggle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pass search props to Header */}
      <Header 
        isSearchPage={isSearchPage}
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
      />
      
      <div className="flex">
        {/* Show sidebar only for authenticated users */}
        {currentUser && (
          <div className="w-64 fixed h-full pt-16 z-10">
            <Sidebar />
          </div>
        )}
        
        {/* Main content area with padding when sidebar is shown and transition for notification panel */}
        <main 
          className={`flex-1 ${currentUser ? 'ml-10' : ''} pt-16 px-4 transition-all duration-300`}
          style={{ 
            marginLeft: isNotificationOpen ? '320px' : '0'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;