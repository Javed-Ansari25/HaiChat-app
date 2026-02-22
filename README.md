# HAI Chat 💬

A modern, real-time chat application built with the MERN stack + Socket.IO. Features WhatsApp-like UI, AI-powered assistance, group chats, media sharing, and more.

---

## 🌍 Live 

🚀 **Frontend (Vercel):**  
👉 https://hai-chat-app.vercel.app/

Experience real-time messaging, AI features, and group chats live.

---

## ✨ Features

| Category | Features |
|---|---|
| **Authentication** | Register, Login, Logout, JWT (HttpOnly cookies), Protected routes |
| **Real-time** | Socket.IO messaging, typing indicators, online/offline status, read receipts |
| **Chats** | 1-on-1 chat, Group chat, Create/manage groups, Admin controls |
| **Messages** | Text, Images, Videos, Files, Emoji picker, Reply to message, Delete message |
| **AI Features** | Smart reply suggestions, AI assistant (HAI), Chat summarization, Sentiment analysis |
| **Media** | Cloudinary uploads for images, videos, files, and avatars |
| **UI/UX** | WhatsApp-inspired dark UI, Mobile responsive, Infinite scroll, Smooth animations |

---

## 🏗️ Tech Stack

**Frontend:** React.js (Vite) · Tailwind CSS · Redux Toolkit · React Router · Socket.IO Client · Axios · Emoji Picker React

**Backend:** Node.js · Express.js · MongoDB + Mongoose · Socket.IO · JWT · bcryptjs · Cloudinary · Gemini

---

## 📁 Project Structure

```
hai-chat/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js     # Register, login, logout
│   │   ├── userController.js     # Search, profile, avatar
│   │   ├── chatController.js     # 1-on-1 & group chat CRUD
│   │   ├── messageController.js  # Send, fetch, delete messages
│   │   └── aiController.js       # OpenAI: smart replies, summary, sentiment
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # User schema + bcrypt
│   │   ├── Chat.js               # Chat schema
│   │   └── Message.js            # Message schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── aiRoutes.js
│   │   └── uploadRoutes.js
│   ├── socket/
│   │   └── socketManager.js      # Socket.IO server + event handlers
│   ├── utils/
│   │   └── jwt.js                # Token generation + verification
│   └── server.js                 # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── chat/
        │   │   ├── Sidebar.jsx         # Chat list + navigation
        │   │   ├── ChatHeader.jsx      # Active chat header
        │   │   ├── MessagesList.jsx    # Scrollable messages + pagination
        │   │   ├── MessageBubble.jsx   # Individual message rendering
        │   │   ├── MessageInput.jsx    # Text input + file + emoji
        │   │   ├── NewChatModal.jsx    # User search to start chat
        │   │   ├── CreateGroupModal.jsx
        │   │   ├── ChatInfoPanel.jsx   # Right panel: contact/group info
        │   │   ├── ProfilePanel.jsx    # Current user settings
        │   │   └── WelcomeScreen.jsx   # Empty state
        │   ├── ai/
        │   │   └── AiAssistantPanel.jsx  # AI chat + summarize
        │   └── common/
        │       ├── Avatar.jsx            # Avatar with online indicator
        │       └── MessageStatus.jsx     # ✓ ✓✓ read receipts
        ├── hooks/
        │   └── useSocket.js      # Socket event listener hook
        ├── pages/
        │   ├── AuthPage.jsx      # Login + Register
        │   └── ChatPage.jsx      # Main chat layout
        ├── services/
        │   ├── api.js            # Axios instance
        │   └── socket.js         # Socket.IO client singleton
        ├── store/
        │   ├── index.js          # Redux store
        │   └── slices/
        │       ├── authSlice.js
        │       ├── chatSlice.js
        │       ├── messageSlice.js
        │       ├── uiSlice.js
        │       └── aiSlice.js
        └── utils/
            └── helpers.js        # Date, name, status utils
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- OpenAI API key (optional, for AI features)

---

## 🌐 API Reference

### Auth Routes (`/api/auth`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login |
| POST | `/logout` | Logout (clears cookie) |
| GET | `/me` | Get current user |

### User Routes (`/api/users`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/search?q=name` | Search users |
| GET | `/:id` | Get user by ID |
| PUT | `/profile` | Update profile |
| PUT | `/avatar` | Upload avatar |

### Chat Routes (`/api/chats`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/access` | Open/create 1-on-1 chat |
| GET | `/` | Get all my chats |
| GET | `/:chatId` | Get single chat |
| POST | `/group` | Create group chat |
| PUT | `/group/:chatId` | Update group |
| DELETE | `/group/:chatId/leave` | Leave group |

### Message Routes (`/api/messages`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Send message (with optional file) |
| GET | `/:chatId` | Get messages (paginated) |
| DELETE | `/:messageId` | Delete message |
| PUT | `/:chatId/seen` | Mark as seen |

### AI Routes (`/api/ai`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/smart-replies` | Get 3 reply suggestions |
| POST | `/chat` | Chat with AI assistant |
| POST | `/summarize/:chatId` | Summarize chat |
| POST | `/sentiment` | Analyze message tone |

---

## ⚡ Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `chatId` | Join chat room |
| `leave_chat` | `chatId` | Leave chat room |
| `typing_start` | `{ chatId }` | Started typing |
| `typing_stop` | `{ chatId }` | Stopped typing |
| `mark_seen` | `{ chatId }` | Mark messages as seen |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ message, chatId }` | New message received |
| `message_deleted` | `{ messageId, chatId }` | Message deleted |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId, lastSeen }` | User went offline |
| `user_typing` | `{ chatId, userId, userName }` | User is typing |
| `user_stopped_typing` | `{ chatId, userId }` | User stopped typing |
| `messages_seen` | `{ chatId, userId }` | Messages marked as seen |

---

## 🤖 AI Features

All AI features require an `OPENAI_API_KEY` in your backend `.env`. If not configured, features gracefully degrade with fallback responses.

| Feature | How It Works |
|---------|-------------|
| **Smart Replies** | After receiving a message, 3 quick reply chips appear at the top of the input |
| **AI Assistant (HAI)** | Click the ⚡ icon in the sidebar to open a dedicated AI chat panel |
| **Chat Summary** | Open chat info panel → "AI Summarize Chat" to get bullet-point summary |
| **Sentiment Analysis** | Call `POST /api/ai/sentiment` with `{ text }` to analyze tone |

---

## 📱 Mobile Support

The app is fully responsive:
- On **desktop**: sidebar + chat + optional right panels shown simultaneously
- On **mobile**: sidebar and chat area toggle between each other
- All modals are mobile-optimized with touch-friendly targets

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 rounds)
- JWT stored in **HttpOnly cookies** (not localStorage)
- All routes protected by **JWT middleware**
- **CORS** configured for specific client origin
- File uploads validated by **Multer + Cloudinary**

---

Built with ❤️ using MERN + Socket.IO + Gemini
