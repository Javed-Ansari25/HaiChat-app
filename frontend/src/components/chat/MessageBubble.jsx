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

  const isMine =
    message.sender?._id === user?._id ||
    message.sender === user?._id;

  const status = getMessageStatus(
    message,
    user?._id,
    activeChat?.participants
  );

  const time = formatBubbleTime(message.createdAt);

  const handleDelete = () => {
    const forEveryone =
      isMine && window.confirm('Delete for everyone?');
    dispatch(
      deleteMessage({
        messageId: message._id,
        deleteForEveryone: forEveryone,
      })
    );
  };

  const handleReply = () => {
    dispatch(setReplyingTo(message));
  };

  /* ================= Deleted Message ================= */
  if (message.isDeleted) {
    return (
      <div
        className={`flex ${
          isMine ? 'justify-end' : 'justify-start'
        } my-1 px-2 sm:px-4`}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-chat-border/30 max-w-[85%] sm:max-w-xs">
          <span className="text-chat-secondary text-xs italic">
            This message was deleted
          </span>
        </div>
      </div>
    );
  }

  /* ================= Render Content ================= */
  const renderContent = () => {
    if (message.messageType === 'image') {
      return (
        <div className="rounded-lg overflow-hidden">
          <img
            src={message.mediaUrl}
            alt="Image"
            className="w-full max-w-[250px] sm:max-w-xs max-h-72 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
            onClick={() =>
              window.open(message.mediaUrl, '_blank')
            }
          />
          {message.content && (
            <p className="text-sm mt-1 break-words">
              {message.content}
            </p>
          )}
        </div>
      );
    }

    if (message.messageType === 'video') {
      return (
        <video
          controls
          className="w-full max-w-[250px] sm:max-w-xs max-h-60 rounded-lg"
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
          className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition w-full"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            📄
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {message.fileName || 'File'}
            </p>
            {message.fileSize > 0 && (
              <p className="text-xs text-chat-secondary">
                {formatFileSize(message.fileSize)}
              </p>
            )}
          </div>
        </a>
      );
    }

    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  /* ================= Main Return ================= */
  return (
    <div
      className={`flex ${
        isMine ? 'flex-row-reverse' : 'flex-row'
      } items-end gap-2 my-1 px-2 sm:px-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {isGroupChat && !isMine && (
        <div className="mb-1">
          {showAvatar ? (
            <Avatar
              src={message.sender?.avatar}
              name={message.sender?.name}
              size="xs"
            />
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      {/* Actions */}
      <div
        className={`flex items-center gap-1 transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        } ${isMine ? 'flex-row-reverse' : ''}`}
      >
        <button
          onClick={handleReply}
          className="p-1 rounded-full hover:bg-chat-border/40 text-chat-secondary"
        >
          ↩
        </button>

        {isMine && (
          <button
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-chat-border/40 text-chat-secondary"
          >
            🗑
          </button>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`w-fit max-w-[85%] sm:max-w-md md:max-w-lg px-3 py-2 rounded-2xl shadow-sm ${
          isMine
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-chat-border text-white rounded-bl-none'
        }`}
      >
        {/* Sender Name */}
        {isGroupChat && !isMine && showAvatar && (
          <p className="text-xs font-semibold text-primary-400 mb-1">
            {message.sender?.name}
          </p>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className="bg-black/20 border-l-2 border-primary-500 rounded-md px-2 py-1 mb-2">
            <p className="text-xs font-medium text-primary-400">
              {message.replyTo.sender?.name}
            </p>
            <p className="text-xs truncate text-chat-secondary">
              {message.replyTo.content || '📷 Media'}
            </p>
          </div>
        )}

        {renderContent()}

        {/* Time + Status */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isMine ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[10px] opacity-70">
            {time}
          </span>
          {isMine && <MessageStatus status={status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;