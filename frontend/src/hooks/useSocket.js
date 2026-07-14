import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId) => {
  const [lastNotification, setLastNotification] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Connect directly to the notification service WebSocket
    const socket = io('http://localhost:3004');

    socket.on('connect', () => {
      socket.emit('authenticate', userId);
    });

    socket.on('notification', (payload) => {
      setLastNotification(payload);
      
      // Auto-dismiss the toast after 4 seconds
      setTimeout(() => {
        setLastNotification(null);
      }, 4000);
    });

    socket.on('chat_message', (payload) => {
      setLastMessage(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { lastNotification, lastMessage };
};
