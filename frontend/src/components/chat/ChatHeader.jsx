import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChatInfo, setSidebar } from '../../store/slices/uiSlice';
import { getChatName, getChatAvatar, getChatPartner, formatLastSeen } from '../../utils/helpers';
import Avatar from '../common/Avatar';

const ChatHeader = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { typing } = useSelector((s) => s.messages);

  if (!activeChat) return null;

  const chatName = getChatName(activeChat, user?._id);
  const chatAvatar = getChatAvatar(activeChat, user?._id);
  const partner = getChatPartner(activeChat, user?._id);
  const isOnline = partner?.status === 'online';
  const typingUsers = typing[activeChat._id] || [];
  const isTyping = typingUsers.length > 0;

  const getSubtitle = () => {
    if (isTyping) return 'typing...';
    if (activeChat.isGroupChat) {
      const names = activeChat.participants
        ?.slice(0, 3)
        .map((p) => p.name?.split(' ')[0])
        .join(', ');
      return names || `${activeChat.participants?.length} members`;
    }
    if (isOnline) return 'online';
    if (partner?.lastSeen) return `last seen ${formatLastSeen(partner.lastSeen)}`;
    return 'offline';
  };

 return (
  <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-chat-header border-b border-chat-border/20 h-14 sm:h-16">

    {/* Left Section */}
    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">

      {/* Mobile Back Button */}
      <button
        className="md:hidden btn-ghost p-2 rounded-full -ml-1"
        onClick={() => dispatch(setSidebar(true))}
      >
        <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Chat Info Button */}
      <button
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
        onClick={() => dispatch(toggleChatInfo())}
      >
        <Avatar
          src={chatAvatar}
          name={chatName}
          size="sm"
          showOnline={!activeChat.isGroupChat}
          isOnline={isOnline}
        />

        <div className="min-w-0">
          <h2 className="font-semibold text-chat-text text-sm sm:text-base truncate">
            {chatName}
          </h2>

          <p
            className={`text-[11px] sm:text-xs truncate ${
              isTyping ? 'text-primary-500' : 'text-chat-secondary'
            }`}
          >
            {getSubtitle()}
          </p>
        </div>
      </button>
    </div>

    {/* Right Action Buttons */}
    <div className="flex items-center gap-1 sm:gap-2">

      <button
        className="btn-ghost p-2 rounded-full"
        title="Search"
      >
        <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <button
        onClick={() => dispatch(toggleChatInfo())}
        className="btn-ghost p-2 rounded-full"
        title="Chat info"
      >
        <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

    </div>
  </div>
);
};

export default ChatHeader;
