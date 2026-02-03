// src/contexts/NotificationProvider.jsx
import React, { useState, useCallback, createContext, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    const notification = {
      id,
      message,
      type,
      duration: duration === 'persistent' ? 'persistent' : duration
    };

    setNotifications(prev => [...prev, notification]);

    if (notification.duration !== 'persistent') {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);

      return () => clearTimeout(timeout);
    }
  }, [removeNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;