const { Server } = require('socket.io');

let io;
const activeUsers = new Map(); // Map<userId, Set<socketId>>

const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('authenticate', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);
      console.log(`User ${userId} authenticated on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId && activeUsers.has(socket.userId)) {
        activeUsers.get(socket.userId).delete(socket.id);
        if (activeUsers.get(socket.userId).size === 0) {
          activeUsers.delete(socket.userId);
        }
      }
    });
  });
};

const emitToUser = (userId, eventName, payload) => {
  if (io && activeUsers.has(userId)) {
    const socketIds = activeUsers.get(userId);
    for (const socketId of socketIds) {
      io.to(socketId).emit(eventName, payload);
    }
  }
};

const getActiveUsers = () => {
  return Array.from(activeUsers.keys());
};

module.exports = { initSocketServer, emitToUser, getActiveUsers };
