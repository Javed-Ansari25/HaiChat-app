import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, setActiveChat, accessChat } from '../../store/slices/chatSlice';
import { clearMessages } from '../../store/slices/messageSlice';
import { toggleNewChat, toggleCreateGroup, toggleProfile, toggleAiAssistant } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { joinChat, leaveChat } from '../../services/socket';
import Avatar from '../common/Avatar';
import {
  getChatName, getChatAvatar, getChatPartner, formatMessageTime, getInitials
} from '../../utils/helpers';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { chats, activeChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { loading } = useSelector((s) => s.chat);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, []);

  const filteredChats = chats.filter((chat) => {
    const name = getChatName(chat, user?._id);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleChatClick = (chat) => {
    if (activeChat?._id) leaveChat(activeChat._id);
    dispatch(setActiveChat(chat));
    dispatch(clearMessages());
    joinChat(chat._id);
  };

  const handleLogout = () => dispatch(logout());

  const getLastMessagePreview = (chat) => {
    const msg = chat.lastMessage;
    if (!msg) return '';
    if (msg.isDeleted) return '🚫 This message was deleted';
    if (msg.messageType === 'image') return '📷 Photo';
    if (msg.messageType === 'video') return '🎥 Video';
    if (msg.messageType === 'audio') return '🎵 Audio';
    if (msg.messageType === 'file') return `📎 ${msg.fileName || 'File'}`;
    return msg.content || '';
  };

  const getPartnerStatus = (chat) => {
    if (chat.isGroupChat) return null;
    const partner = getChatPartner(chat, user?._id);
    return partner?.status;
  };

  return (
    <div className="flex flex-col h-full bg-chat-sidebar border-r border-chat-border/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-chat-header border-b border-chat-border/20">
        <button
          onClick={() => dispatch(toggleProfile())}
          className="hover:opacity-80 transition-opacity"
        >
          <Avatar src={user?.avatar} name={user?.name} size="md" />
        </button>

        <h1 className="text-base font-semibold text-chat-text">HAI Chat</h1>

        <div className="flex items-center gap-1">
          {/* AI Assistant Button */}
          <button
            onClick={() => dispatch(toggleAiAssistant())}
            className="btn-ghost p-2 rounded-full"
            title="AI Assistant"
          >
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          {/* New Group */}
          <button
            onClick={() => dispatch(toggleCreateGroup())}
            className="btn-ghost p-2 rounded-full"
            title="New Group"
          >
            <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* New Chat */}
          <button
            onClick={() => dispatch(toggleNewChat())}
            className="btn-ghost p-2 rounded-full"
            title="New Chat"
          >
            <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-ghost p-2 rounded-full"
            title="Logout"
          >
            <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-chat-sidebar">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-chat-secondary">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No chats yet</p>
            <button
              onClick={() => dispatch(toggleNewChat())}
              className="mt-2 text-primary-500 text-sm hover:underline"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChat?._id === chat._id;
            const chatName = getChatName(chat, user?._id);
            const chatAvatar = getChatAvatar(chat, user?._id);
            const partnerStatus = getPartnerStatus(chat);
            const isOnline = partnerStatus === 'online';
            const preview = getLastMessagePreview(chat);
            const time = formatMessageTime(chat.lastMessage?.createdAt || chat.updatedAt);

            return (
              <button
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-chat-border/10 transition-colors text-left
                  ${isActive ? 'bg-chat-hover' : 'hover:bg-chat-hover/50'}`}
              >
                <Avatar
                  src={chatAvatar}
                  name={chatName}
                  size="md"
                  showOnline={!chat.isGroupChat}
                  isOnline={isOnline}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-chat-text text-sm truncate">{chatName}</span>
                    <span className="text-xs text-chat-secondary ml-2 flex-shrink-0">{time}</span>
                  </div>
                  <p className="text-xs text-chat-secondary truncate mt-0.5">{preview}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
