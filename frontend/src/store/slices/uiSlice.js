import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showSidebar: true,        // Mobile: toggle sidebar
    showChatInfo: false,      // Right panel: chat details
    showNewChat: false,       // New chat modal
    showCreateGroup: false,   // Create group modal
    showProfile: false,       // Profile settings panel
    showAiAssistant: false,   // AI chat panel
    darkMode: true,           // Dark mode (default on)
    replyingTo: null,         // Message being replied to
    showEmojiPicker: false,
    isMobile: window.innerWidth < 768,
  },
  reducers: {
    toggleSidebar: (state) => { state.showSidebar = !state.showSidebar; },
    setSidebar: (state, action) => { state.showSidebar = action.payload; },
    toggleChatInfo: (state) => { state.showChatInfo = !state.showChatInfo; },
    setChatInfo: (state, action) => { state.showChatInfo = action.payload; },
    toggleNewChat: (state) => { state.showNewChat = !state.showNewChat; },
    toggleCreateGroup: (state) => { state.showCreateGroup = !state.showCreateGroup; },
    toggleProfile: (state) => { state.showProfile = !state.showProfile; },
    toggleAiAssistant: (state) => { state.showAiAssistant = !state.showAiAssistant; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setReplyingTo: (state, action) => { state.replyingTo = action.payload; },
    clearReplyingTo: (state) => { state.replyingTo = null; },
    toggleEmojiPicker: (state) => { state.showEmojiPicker = !state.showEmojiPicker; },
    closeEmojiPicker: (state) => { state.showEmojiPicker = false; },
    setIsMobile: (state, action) => { state.isMobile = action.payload; },
  },
});

export const {
  toggleSidebar, setSidebar, toggleChatInfo, setChatInfo,
  toggleNewChat, toggleCreateGroup, toggleProfile, toggleAiAssistant,
  toggleDarkMode, setReplyingTo, clearReplyingTo,
  toggleEmojiPicker, closeEmojiPicker, setIsMobile,
} = uiSlice.actions;

export default uiSlice.reducer;
