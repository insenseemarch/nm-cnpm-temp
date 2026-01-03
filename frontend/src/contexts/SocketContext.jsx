import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getCurrentFamilyId, getFamilies } from '../services/familyService';

const SocketContext = createContext(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
    });

    setSocket(newSocket);

    // Connection handlers
    newSocket.on('connect', () => {
      setIsConnected(true);

      // Join family rooms after successful connection
      joinFamilyRooms(newSocket);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    // Listen for new notifications
    newSocket.on('new-notification', (notification) => {
      addNotification(notification);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [addNotification]);

  // Join family rooms based on user's families
  const joinFamilyRooms = async (socketInstance) => {
    try {
      const families = await getFamilies();
      const familyIds = families.map((f) => f.id);

      socketInstance.emit('join-families', familyIds);
    } catch (error) {
      console.error('Failed to get user families for socket rooms:', error);
    }
  };

  // Re-join family rooms when current family changes
  useEffect(() => {
    if (socket && isConnected) {
      joinFamilyRooms(socket);
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
