import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  askAI,
  summarizeChat,
  addToAiHistory,
  clearAiHistory,
} from '../../store/slices/aiSlice';
import { toggleAiAssistant } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';

const AiAssistantPanel = () => {
  const dispatch = useDispatch();
  const { aiHistory = [], loading, summary } = useSelector((s) => s.ai);
  const { activeChat } = useSelector((s) => s.chat);

  const [input, setInput] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory, loading]);

  // Clear summary when chat changes
  useEffect(() => {
    if (!activeChat) return;
  }, [activeChat]);

  const handleSend = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Updated history (fix stale state issue)
    const updatedHistory = [
      ...aiHistory,
      { role: 'user', content: trimmed },
    ];

    dispatch(addToAiHistory({ role: 'user', content: trimmed }));
    setInput('');

    const result = await dispatch(
      askAI({
        message: trimmed,
        history: updatedHistory,
      })
    );

    if (askAI.rejected.match(result)) {
      console.error('AI request failed');
    }
  };

  const handleSummarize = async () => {
    if (!activeChat?._id) return;

    try {
      setSummarizing(true);
      const result = await dispatch(summarizeChat(activeChat._id));

      if (summarizeChat.rejected.match(result)) {
        toast.error('Could not summarize. Check your GEMINI_API_KEY.');
      }
    } finally {
      setSummarizing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat-sidebar border-l border-chat-border/20 w-80">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-chat-header border-b border-chat-border/20">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-chat-text">HAI Assistant</h3>
          <p className="text-xs text-primary-500/70 font-medium">
            Powered by Gemini ✦ Free
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => dispatch(clearAiHistory())}
            className="btn-ghost p-1.5 rounded-full text-xs text-chat-secondary"
            title="Clear chat"
          >
            🗑
          </button>

          <button
            onClick={() => dispatch(toggleAiAssistant())}
            className="btn-ghost p-1.5 rounded-full"
          >
            ✖
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {activeChat && (
        <div className="p-3 border-b border-chat-border/20">
          <p className="text-xs text-chat-secondary mb-2">Chat Tools</p>

          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-chat-input hover:bg-chat-hover transition-colors text-sm text-chat-text disabled:opacity-50"
          >
            {summarizing ? 'Summarizing...' : 'Summarize this chat'}
          </button>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="p-3 border-b border-chat-border/20">
          <p className="text-xs text-chat-secondary mb-2 font-medium">
            📋 Chat Summary
          </p>

          <div className="bg-chat-input rounded-lg p-3 text-xs whitespace-pre-wrap leading-relaxed text-chat-text">
            {summary}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiHistory.length === 0 && (
          <div className="text-center py-8 text-chat-secondary">
            <p className="text-sm font-medium">Ask me anything!</p>
            <p className="text-xs opacity-60 mt-1">
              I'm powered by Google Gemini
            </p>
          </div>
        )}

        {aiHistory.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : msg.isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-chat-input text-chat-text'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-chat-input rounded-xl px-4 py-3">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-chat-border/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask HAI anything..."
            className="input-field flex-1 text-sm py-2"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
          >
            {loading ? '...' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiAssistantPanel;