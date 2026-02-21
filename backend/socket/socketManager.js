const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

let io;
// Map: userId -> Set of socketIds (user can have multiple tabs/devices)
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
      "http://localhost:5173",
      "https://hai-chat-app.vercel.app"
    ],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('jwt='))
        ?.split('=')[1];

      if (!token) throw new Error('No token');

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) throw new Error('User not found');

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update DB status
    await User.findByIdAndUpdate(userId, { status: 'online' });

    // Broadcast online status to all
    socket.broadcast.emit('user_online', { userId, status: 'online' });

    // ─── JOIN CHAT ROOM ────────────────────────────────────────────
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`👥 ${socket.user.name} joined chat: ${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
    });

    // ─── TYPING EVENTS ─────────────────────────────────────────────
    socket.on('typing_start', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId,
        userName: socket.user.name,
      });
    });

    socket.on('typing_stop', ({ chatId }) => {
      socket.to(chatId).emit('user_stopped_typing', { chatId, userId });
    });

    // ─── MESSAGE SEEN ──────────────────────────────────────────────
    socket.on('mark_seen', ({ chatId }) => {
      socket.to(chatId).emit('messages_seen', { chatId, userId });
    });

    // ─── CALL SIGNALING (WebRTC) ────────────────────────────────────
    socket.on('call_user', ({ targetUserId, offer, callType }) => {
      io.to(targetUserId).emit('incoming_call', {
        from: userId,
        fromName: socket.user.name,
        fromAvatar: socket.user.avatar,
        offer,
        callType,
      });
    });

    socket.on('call_answer', ({ targetUserId, answer }) => {
      io.to(targetUserId).emit('call_answered', { answer, from: userId });
    });

    socket.on('ice_candidate', ({ targetUserId, candidate }) => {
      io.to(targetUserId).emit('ice_candidate', { candidate, from: userId });
    });

    socket.on('call_end', ({ targetUserId }) => {
      io.to(targetUserId).emit('call_ended', { from: userId });
    });

    // ─── DISCONNECT ────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // All connections closed - mark as offline
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen: new Date(),
          });
          socket.broadcast.emit('user_offline', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }
    });
  });

  console.log('🔥 Socket.IO initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, getOnlineUsers };
