require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketManager');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);

// Connect to DB
connectDB();

// Init Socket.IO
initSocket(server);

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://hai-chat-app.vercel.app',
      'https://hai-chat-app-git-main-javedansari2k09-2089s-projects.vercel.app',
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', time: new Date() }),
);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 HAI Chat Server running on port ${PORT}`);
});
