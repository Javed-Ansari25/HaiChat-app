import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const res = await api.get('/chats');
  return res.data.chats;
});

export const accessChat = createAsyncThunk('chat/accessChat', async (userId) => {
  const res = await api.post('/chats/access', { userId });
  return res.data.chat;
});

export const createGroupChat = createAsyncThunk('chat/createGroupChat', async (data) => {
  const res = await api.post('/chats/group', data);
  return res.data.chat;
});

export const updateGroupChat = createAsyncThunk('chat/updateGroupChat', async ({ chatId, data }) => {
  const res = await api.put(`/chats/group/${chatId}`, data);
  return res.data.chat;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    loading: false,
    onlineUsers: {}, // { userId: true/false }
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    setUserOnline: (state, action) => {
      const { userId, status, lastSeen } = action.payload;
      state.onlineUsers[userId] = status === 'online';
      // Update in chats list
      state.chats = state.chats.map(chat => ({
        ...chat,
        participants: chat.participants.map(p =>
          p._id === userId ? { ...p, status, lastSeen: lastSeen || p.lastSeen } : p
        ),
      }));
      if (state.activeChat) {
        state.activeChat = {
          ...state.activeChat,
          participants: state.activeChat.participants.map(p =>
            p._id === userId ? { ...p, status, lastSeen: lastSeen || p.lastSeen } : p
          ),
        };
      }
    },
    updateChatLastMessage: (state, action) => {
      const { chatId, message } = action.payload;
      state.chats = state.chats.map(chat =>
        chat._id === chatId ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString() } : chat
      );
      // Re-sort chats by last activity
      state.chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },
    addNewChat: (state, action) => {
      const exists = state.chats.find(c => c._id === action.payload._id);
      if (!exists) state.chats.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => { state.loading = true; })
      .addCase(fetchChats.fulfilled, (state, action) => { state.loading = false; state.chats = action.payload; })
      .addCase(fetchChats.rejected, (state) => { state.loading = false; })

      .addCase(accessChat.fulfilled, (state, action) => {
        const exists = state.chats.find(c => c._id === action.payload._id);
        if (!exists) state.chats.unshift(action.payload);
        state.activeChat = action.payload;
      })

      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.activeChat = action.payload;
      });
  },
});

export const { setActiveChat, setUserOnline, updateChatLastMessage, addNewChat } = chatSlice.actions;
export default chatSlice.reducer;
