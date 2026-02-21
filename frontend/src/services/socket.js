import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Convenience methods
export const joinChat = (chatId) => socket?.emit('join_chat', chatId);
export const leaveChat = (chatId) => socket?.emit('leave_chat', chatId);
export const emitTypingStart = (chatId) => socket?.emit('typing_start', { chatId });
export const emitTypingStop = (chatId) => socket?.emit('typing_stop', { chatId });
export const emitMarkSeen = (chatId) => socket?.emit('mark_seen', { chatId });
