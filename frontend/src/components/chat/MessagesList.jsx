import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '../../store/slices/messageSlice';
import { emitMarkSeen } from '../../services/socket';
import MessageBubble from './MessageBubble';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

const DateDivider = ({ date }) => {
  const d = new Date(date);
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-chat-border/30" />
      <span className="text-xs text-chat-secondary bg-chat-bg px-2 py-0.5 rounded-full border border-chat-border/20">
        {label}
      </span>
      <div className="flex-1 h-px bg-chat-border/30" />
    </div>
  );
};

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers?.length) return null;
  return (
    <div className="flex items-end gap-1.5 mb-2 px-4">
      <div className="msg-received px-3 py-2.5 flex items-center gap-1">
        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="typing-dot" style={{ animationDelay: '150ms' }} />
        <div className="typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

const MessagesList = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { messages, loading, hasMore, typing } = useSelector((s) => s.messages);

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const pageRef = useRef(1);
  const isLoadingMore = useRef(false);

  const typingInChat = typing[activeChat?._id] || [];

  useEffect(() => {
    if (!activeChat) return;
    pageRef.current = 1;
    dispatch(fetchMessages({ chatId: activeChat._id, page: 1 }));
    emitMarkSeen(activeChat._id);
  }, [activeChat?._id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (pageRef.current === 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Infinite scroll - load older messages
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingMore.current || !hasMore) return;

    if (container.scrollTop < 80) {
      isLoadingMore.current = true;
      const prevScrollHeight = container.scrollHeight;
      pageRef.current += 1;

      dispatch(fetchMessages({ chatId: activeChat._id, page: pageRef.current })).then(() => {
        // Restore scroll position after prepending
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
          isLoadingMore.current = false;
        });
      });
    }
  }, [hasMore, activeChat]);

  // Group messages and add date dividers
  const groupedMessages = () => {
    const items = [];
    let prevDate = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);

      // Date divider
      if (!prevDate || !isSameDay(prevDate, msgDate)) {
        items.push({ type: 'date', date: msgDate, key: `date-${msg._id}` });
        prevDate = msgDate;
      }

      // Should we show avatar? (first in a sequence from same sender)
      const nextMsg = messages[idx + 1];
      const showAvatar = !nextMsg || nextMsg.sender?._id !== msg.sender?._id;

      items.push({ type: 'message', message: msg, showAvatar, key: msg._id });
    });

    return items;
  };

  if (!activeChat) return null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-2"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-chat-secondary">
          <div className="w-16 h-16 rounded-full bg-chat-input flex items-center justify-center mb-3">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs opacity-60 mt-1">Send a message to get started!</p>
        </div>
      )}

      {/* Messages */}
      {groupedMessages().map((item) => {
        if (item.type === 'date') {
          return <DateDivider key={item.key} date={item.date} />;
        }
        return (
          <MessageBubble
            key={item.key}
            message={item.message}
            showAvatar={item.showAvatar}
            isGroupChat={activeChat?.isGroupChat}
          />
        );
      })}

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingInChat} />

      {/* Bottom anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessagesList;
