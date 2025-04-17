import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
  
  return (
    <NotificationContext.Provider value={{ isNotificationPanelOpen, setNotificationPanelOpen }}>
      {children}
    </NotificationContext.Provider>
  );
};