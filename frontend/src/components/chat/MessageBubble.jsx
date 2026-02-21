import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setReplyingTo } from '../../store/slices/uiSlice';
import { deleteMessage } from '../../store/slices/messageSlice';
import { getMessageStatus, formatBubbleTime, formatFileSize } from '../../utils/helpers';
import MessageStatus from '../common/MessageStatus';
import Avatar from '../common/Avatar';

const MessageBubble = ({ message, showAvatar, isGroupChat }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { activeChat } = useSelector((s) => s.chat);
  const [showActions, setShowActions] = useState(false);

  const isMine = message.sender?._id === user?._id || message.sender === user?._id;
  const status = getMessageStatus(message, user?._id, activeChat?.participants);
  const time = formatBubbleTime(message.createdAt);

  const handleDelete = () => {
    const forEveryone = isMine && window.confirm('Delete for everyone?');
    dispatch(deleteMessage({ messageId: message._id, deleteForEveryone: forEveryone }));
  };

  const handleReply = () => {
    dispatch(setReplyingTo(message));
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} my-0.5`}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-chat-border/30 max-w-xs">
          <svg className="w-3.5 h-3.5 text-chat-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
          <span className="text-chat-secondary text-xs italic">This message was deleted</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (message.messageType === 'image') {
      return (
        <div className="rounded-lg overflow-hidden">
          <img
            src={message.mediaUrl}
            alt="Image"
            className="max-w-xs max-h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.mediaUrl, '_blank')}
          />
          {message.content && <p className="text-sm mt-1 px-1">{message.content}</p>}
        </div>
      );
    }

    if (message.messageType === 'video') {
      return (
        <video
          controls
          className="max-w-xs max-h-48 rounded-lg"
          src={message.mediaUrl}
        />
      );
    }

    if (message.messageType === 'file') {
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-48">{message.fileName || 'File'}</p>
            {message.fileSize > 0 && (
              <p className="text-xs text-chat-secondary">{formatFileSize(message.fileSize)}</p>
            )}
          </div>
        </a>
      );
    }

    return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div
      className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end gap-1.5 my-0.5 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for group chats */}
      {isGroupChat && !isMine && (
        <div className="mb-1">
          {showAvatar ? (
            <Avatar src={message.sender?.avatar} name={message.sender?.name} size="xs" />
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      {/* Message actions (reply, delete) */}
      <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'} ${isMine ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={handleReply}
          className="p-1 rounded-full hover:bg-chat-border/40 text-chat-secondary"
          title="Reply"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        {isMine && (
          <button
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-chat-border/40 text-chat-secondary"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-sm message-in ${isMine ? 'msg-sent' : 'msg-received'}`}>
        {/* Sender name in group */}
        {isGroupChat && !isMine && showAvatar && (
          <p className="text-xs font-semibold text-primary-500 mb-1">{message.sender?.name}</p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="bg-black/20 border-l-2 border-primary-500 rounded-md px-2 py-1.5 mb-2">
            <p className="text-xs text-primary-400 font-medium">{message.replyTo.sender?.name}</p>
            <p className="text-xs text-chat-secondary truncate">{message.replyTo.content || '📷 Media'}</p>
          </div>
        )}

        {renderContent()}

        {/* Time + status */}
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-chat-secondary">{time}</span>
          {isMine && <MessageStatus status={status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
