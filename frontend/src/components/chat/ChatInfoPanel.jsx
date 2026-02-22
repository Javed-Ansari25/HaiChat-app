import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChatInfo } from '../../store/slices/uiSlice';
import { summarizeChat } from '../../store/slices/aiSlice';
import { getChatName, getChatAvatar, getChatPartner, formatLastSeen } from '../../utils/helpers';
import Avatar from '../common/Avatar';

const ChatInfoPanel = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);

  if (!activeChat) return null;

  const chatName = getChatName(activeChat, user?._id);
  const chatAvatar = getChatAvatar(activeChat, user?._id);
  const partner = getChatPartner(activeChat, user?._id);
  const isOnline = partner?.status === 'online';

  return (
  <div className="flex flex-col h-full bg-chat-sidebar border-l border-chat-border/20 w-full sm:w-72 max-w-sm">

    {/* Header */}
    <div className="flex items-center gap-3 px-3 sm:px-4 h-14 sm:h-16 bg-chat-header border-b border-chat-border/20">
      <button
        onClick={() => dispatch(setChatInfo(false))}
        className="btn-ghost p-2 rounded-full"
      >
        <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="font-semibold text-chat-text text-sm sm:text-base truncate">
        {activeChat.isGroupChat ? 'Group Info' : 'Contact Info'}
      </h2>
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto">

      {/* Profile Section */}
      <div className="flex flex-col items-center py-5 sm:py-6 px-4 bg-gradient-to-b from-chat-header/50 to-transparent border-b border-chat-border/20">
        <Avatar
          src={chatAvatar}
          name={chatName}
          size="xl"
          showOnline={!activeChat.isGroupChat}
          isOnline={isOnline}
        />

        <h3 className="text-base sm:text-lg font-semibold text-chat-text mt-3 text-center break-words">
          {chatName}
        </h3>

        {!activeChat.isGroupChat && (
          <p className={`text-xs mt-1 ${isOnline ? 'text-primary-500' : 'text-chat-secondary'}`}>
            {isOnline
              ? 'online'
              : partner?.lastSeen
              ? `last seen ${formatLastSeen(partner.lastSeen)}`
              : 'offline'}
          </p>
        )}

        {activeChat.isGroupChat && (
          <p className="text-xs text-chat-secondary mt-1">
            {activeChat.participants?.length} members
          </p>
        )}
      </div>

      {/* Info Section */}
      {!activeChat.isGroupChat && partner?.bio && (
        <div className="p-4 border-b border-chat-border/20">
          <p className="text-xs text-chat-secondary mb-1">About</p>
          <p className="text-sm text-chat-text break-words">
            {partner.bio}
          </p>
        </div>
      )}

      {activeChat.isGroupChat && (
        <>
          {activeChat.groupDescription && (
            <div className="p-4 border-b border-chat-border/20">
              <p className="text-xs text-chat-secondary mb-1">Description</p>
              <p className="text-sm text-chat-text break-words">
                {activeChat.groupDescription}
              </p>
            </div>
          )}

          {/* Members */}
          <div className="p-4">
            <p className="text-xs text-chat-secondary mb-3">Members</p>

            <div className="space-y-3">
              {activeChat.participants?.map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <Avatar
                    src={p.avatar}
                    name={p.name}
                    size="sm"
                    showOnline
                    isOnline={p.status === 'online'}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-chat-text truncate">
                      {p._id === user?._id ? 'You' : p.name}
                    </p>
                    <p className="text-xs text-chat-secondary">
                      {activeChat.groupAdmin === p._id ||
                      activeChat.groupAdmin?._id === p._id
                        ? 'Admin'
                        : 'Member'}
                    </p>
                  </div>

                  {p.status === 'online' && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

    {/* Sticky Bottom AI Button */}
    <div className="p-4 border-t border-chat-border/20">
      <button
        onClick={() => dispatch(summarizeChat(activeChat._id))}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-chat-input hover:bg-chat-hover transition-colors text-sm sm:text-base text-chat-text"
      >
        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Summarize Chat
      </button>
    </div>
  </div>
);
};

export default ChatInfoPanel;
