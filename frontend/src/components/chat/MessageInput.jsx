import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import { sendMessage } from '../../store/slices/messageSlice';
import { clearReplyingTo } from '../../store/slices/uiSlice';
import { getSmartReplies, clearSmartReplies } from '../../store/slices/aiSlice';
import { emitTypingStart, emitTypingStop } from '../../services/socket';

const MessageInput = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const { replyingTo } = useSelector((s) => s.ui);
  const { smartReplies } = useSelector((s) => s.ai);
  const { messages } = useSelector((s) => s.messages);

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [sending, setSending] = useState(false);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  /* ================= Smart Replies ================= */
  useEffect(() => {
    if (!activeChat || !user) return;

    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg &&
      lastMsg.sender?._id !== user._id &&
      lastMsg.messageType === 'text'
    ) {
      dispatch(
        getSmartReplies({
          chatId: activeChat._id,
          lastMessage: lastMsg.content,
        })
      );
    } else {
      dispatch(clearSmartReplies());
    }
  }, [messages, activeChat]);

  /* ================= Typing Logic ================= */
  const handleTyping = useCallback(() => {
    if (!activeChat?._id) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTypingStart(activeChat._id);
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitTypingStop(activeChat._id);
    }, 1500);
  }, [activeChat]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  /* ================= File Handling ================= */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }

    setShowEmoji(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ================= Send ================= */
  const handleSend = async (overrideText) => {
    const content = (overrideText || text).trim();
    if ((!content && !selectedFile) || !activeChat) return;

    setSending(true);

    const formData = new FormData();
    formData.append('chatId', activeChat._id);

    if (selectedFile) {
      formData.append('media', selectedFile);
      const type = selectedFile.type.startsWith('image/')
        ? 'image'
        : selectedFile.type.startsWith('video/')
        ? 'video'
        : selectedFile.type.startsWith('audio/')
        ? 'audio'
        : 'file';
      formData.append('messageType', type);
    } else {
      formData.append('messageType', 'text');
    }

    if (content) formData.append('content', content);
    if (replyingTo) formData.append('replyTo', replyingTo._id);

    try {
      await dispatch(sendMessage(formData));
      setText('');
      clearFile();
      dispatch(clearReplyingTo());
      dispatch(clearSmartReplies());
    } finally {
      setSending(false);
    }

    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    emitTypingStop(activeChat._id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  if (!activeChat) return null;

  return (
    <div className="bg-chat-sidebar border-t border-chat-border/20">

      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <div className="flex gap-2 px-3 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
          {smartReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSend(reply)}
              className="flex-shrink-0 text-xs sm:text-sm bg-chat-input hover:bg-chat-hover border border-primary-500/30 text-primary-400 px-3 py-1.5 rounded-full transition"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-chat-input border-b border-chat-border/20">
          <div className="flex-1 border-l-2 border-primary-500 pl-3 min-w-0">
            <p className="text-xs font-semibold text-primary-400 truncate">
              {replyingTo.sender?.name}
            </p>
            <p className="text-xs text-chat-secondary truncate">
              {replyingTo.content || '📷 Media'}
            </p>
          </div>
          <button
            onClick={() => dispatch(clearReplyingTo())}
            className="text-chat-secondary hover:text-chat-text flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-chat-input border-b border-chat-border/20">
          {filePreview ? (
            <img
              src={filePreview}
              alt="Preview"
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-primary-600 rounded flex items-center justify-center flex-shrink-0">
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-chat-secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={clearFile}
            className="text-chat-secondary hover:text-chat-text flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-end gap-2 px-3 sm:px-4 py-3">

        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="btn-ghost p-2 rounded-full flex-shrink-0"
          >
            😊
          </button>

          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50 w-[95vw] sm:w-auto">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="dark"
                height={350}
                width="100%"
              />
            </div>
          )}
        </div>

        {/* File */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost p-2 rounded-full flex-shrink-0"
        >
          📎
        </button>

        {/* Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="input-field resize-none max-h-32 py-2.5 leading-relaxed text-sm sm:text-base"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height =
                Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Send */}
        <button
          onClick={() => handleSend()}
          disabled={(!text.trim() && !selectedFile) || sending}
          className="btn-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>

      {/* Click Outside */}
      {showEmoji && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmoji(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;