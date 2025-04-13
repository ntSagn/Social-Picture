import React, { useContext } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { NotificationContext } from '../contexts/NotificationContext';

function Layout({ children }) {
  const { isNotificationPanelOpen } = useContext(NotificationContext);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className={`transition-all duration-300 ease-in-out w-full ${isNotificationPanelOpen ? 'ml-[288px]' : 'ml-16'}`}>
        <Header />
        <main className="pt-20 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;