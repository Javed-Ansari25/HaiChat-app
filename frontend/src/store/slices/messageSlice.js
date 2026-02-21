import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMessages = createAsyncThunk('messages/fetch', async ({ chatId, page = 1 }) => {
  const res = await api.get(`/messages/${chatId}?page=${page}&limit=50`);
  return { ...res.data, chatId, page };
});

export const sendMessage = createAsyncThunk('messages/send', async (formData) => {
  const res = await api.post('/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.message;
});

export const deleteMessage = createAsyncThunk('messages/delete', async ({ messageId, deleteForEveryone }) => {
  await api.delete(`/messages/${messageId}`, { data: { deleteForEveryone } });
  return { messageId, deleteForEveryone };
});

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [],
    loading: false,
    hasMore: false,
    typing: {}, // { chatId: [userId, ...] }
    currentChatId: null,
  },
  reducers: {
    addMessage: (state, action) => {
      const msg = action.payload;
      const exists = state.messages.find(m => m._id === msg._id);
      if (!exists) state.messages.push(msg);
    },
    setTyping: (state, action) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typing[chatId]) state.typing[chatId] = [];
      if (isTyping) {
        if (!state.typing[chatId].includes(userId)) state.typing[chatId].push(userId);
      } else {
        state.typing[chatId] = state.typing[chatId].filter(id => id !== userId);
      }
    },
    markSeen: (state, action) => {
      const { userId } = action.payload;
      state.messages = state.messages.map(msg => {
        const alreadySeen = msg.seenBy?.some(s => s.user === userId || s.user?._id === userId);
        if (!alreadySeen) {
          return { ...msg, seenBy: [...(msg.seenBy || []), { user: userId, seenAt: new Date() }] };
        }
        return msg;
      });
    },
    removeMessage: (state, action) => {
      const { messageId } = action.payload;
      state.messages = state.messages.map(m =>
        m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
      );
    },
    clearMessages: (state) => {
      state.messages = [];
      state.hasMore = false;
      state.currentChatId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => { state.loading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChatId = action.payload.chatId;
        if (action.payload.page === 1) {
          state.messages = action.payload.messages;
        } else {
          // Prepend older messages
          state.messages = [...action.payload.messages, ...state.messages];
        }
        state.hasMore = action.payload.pagination.page < action.payload.pagination.pages;
      })
      .addCase(fetchMessages.rejected, (state) => { state.loading = false; })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const exists = state.messages.find(m => m._id === action.payload._id);
        if (!exists) state.messages.push(action.payload);
      })

      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, deleteForEveryone } = action.payload;
        if (deleteForEveryone) {
          state.messages = state.messages.map(m =>
            m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
          );
        } else {
          state.messages = state.messages.filter(m => m._id !== messageId);
        }
      });
  },
});

export const { addMessage, setTyping, markSeen, removeMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
