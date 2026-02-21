import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const getSmartReplies = createAsyncThunk(
  'ai/smartReplies',
  async ({ chatId, lastMessage }, { rejectWithValue }) => {
    try {
      const res = await api.post('/ai/smart-replies', { chatId, lastMessage });
      return res.data.suggestions ?? [];
    } catch (err) {
      // Smart replies are optional — never block the UI on failure
      return rejectWithValue([]);
    }
  }
);

export const askAI = createAsyncThunk(
  'ai/ask',
  async ({ message, history }, { rejectWithValue }) => {
    try {
      const res = await api.post('/ai/chat', { message, history });
      return res.data.response ?? 'Sorry, I could not get a response.';
    } catch (err) {
      const msg = err.response?.data?.message || 'AI service error. Check your GEMINI_API_KEY in backend .env';
      return rejectWithValue(msg);
    }
  }
);

export const summarizeChat = createAsyncThunk(
  'ai/summarize',
  async (chatId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/ai/summarize/${chatId}`);
      return res.data.summary ?? '';
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to summarize chat.';
      return rejectWithValue(msg);
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    smartReplies: [],
    aiHistory: [],
    summary: '',
    error: null,
    loading: false,
    smartRepliesLoading: false,
  },
  reducers: {
    clearSmartReplies: (state) => { state.smartReplies = []; },
    addToAiHistory: (state, action) => { state.aiHistory.push(action.payload); },
    clearAiHistory: (state) => { state.aiHistory = []; state.summary = ''; state.error = null; },
    clearAiError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Smart replies — silent failure, never show error to user
      .addCase(getSmartReplies.pending, (state) => { state.smartRepliesLoading = true; })
      .addCase(getSmartReplies.fulfilled, (state, action) => {
        state.smartRepliesLoading = false;
        state.smartReplies = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getSmartReplies.rejected, (state) => {
        state.smartRepliesLoading = false;
        state.smartReplies = [];
      })

      // AI chat assistant
      .addCase(askAI.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(askAI.fulfilled, (state, action) => {
        state.loading = false;
        state.aiHistory.push({ role: 'assistant', content: action.payload });
      })
      .addCase(askAI.rejected, (state, action) => {
        state.loading = false;
        // Push the error as an assistant message so user sees it in the chat panel
        state.aiHistory.push({
          role: 'assistant',
          content: `⚠️ ${action.payload || 'Something went wrong. Please try again.'}`,
          isError: true,
        });
      })

      // Summarize
      .addCase(summarizeChat.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(summarizeChat.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(summarizeChat.rejected, (state, action) => {
        state.loading = false;
        state.summary = `⚠️ ${action.payload || 'Failed to summarize.'}`;
      });
  },
});

export const { clearSmartReplies, addToAiHistory, clearAiHistory, clearAiError } = aiSlice.actions;
export default aiSlice.reducer;