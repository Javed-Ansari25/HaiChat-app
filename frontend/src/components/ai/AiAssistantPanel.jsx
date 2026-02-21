import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { askAI, summarizeChat, addToAiHistory, clearAiHistory } from '../../store/slices/aiSlice';
import { toggleAiAssistant } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';

const AiAssistantPanel = () => {
  const dispatch = useDispatch();
  const { aiHistory, loading, summary } = useSelector((s) => s.ai);
  const { activeChat } = useSelector((s) => s.chat);
  const [input, setInput] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message to history first
    dispatch(addToAiHistory({ role: 'user', content: trimmed }));
    setInput(''); // Clear input immediately for good UX

    // Send to AI — errors are handled inside the slice and shown as messages
    const result = await dispatch(askAI({ message: trimmed, history: aiHistory }));
    if (askAI.rejected.match(result)) {
      // Error is already pushed to aiHistory as an assistant message by the slice
      // No need to do anything else
    }
  };

  const handleSummarize = async () => {
    if (!activeChat) return;
    setSummarizing(true);
    const result = await dispatch(summarizeChat(activeChat._id));
    if (summarizeChat.rejected.match(result)) {
      toast.error('Could not summarize. Check your GEMINI_API_KEY.');
    }
    setSummarizing(false);
  };

  return (
    <div className="flex flex-col h-full bg-chat-sidebar border-l border-chat-border/20 w-80">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-chat-header border-b border-chat-border/20">
        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-chat-text">HAI Assistant</h3>
          <p className="text-xs text-primary-500/70 font-medium">Powered by Gemini ✦ Free</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => dispatch(clearAiHistory())}
            className="btn-ghost p-1.5 rounded-full text-xs text-chat-secondary"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => dispatch(toggleAiAssistant())}
            className="btn-ghost p-1.5 rounded-full"
          >
            <svg className="w-4 h-4 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
            <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {summarizing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Summarizing...
              </span>
            ) : 'Summarize this chat'}
          </button>
        </div>
      )}

      {/* Summary Display */}
      {summary && (
        <div className="p-3 border-b border-chat-border/20">
          <p className="text-xs text-chat-secondary mb-2 font-medium">📋 Chat Summary</p>
          <div className={`bg-chat-input rounded-lg p-3 text-xs whitespace-pre-wrap leading-relaxed ${
            summary.startsWith('⚠️') ? 'text-red-400' : 'text-chat-text'
          }`}>
            {summary}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiHistory.length === 0 && (
          <div className="text-center py-8 text-chat-secondary">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm font-medium">Ask me anything!</p>
            <p className="text-xs opacity-60 mt-1">I'm powered by Google Gemini</p>
          </div>
        )}

        {aiHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : msg.isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-chat-input text-chat-text'
              }`}
            >
              {msg.role === 'assistant' && !msg.isError && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-primary-400">HAI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-chat-input rounded-xl px-4 py-3 flex items-center gap-1.5">
              <div className="typing-dot" style={{ animationDelay: '0ms' }} />
              <div className="typing-dot" style={{ animationDelay: '150ms' }} />
              <div className="typing-dot" style={{ animationDelay: '300ms' }} />
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
            placeholder="Ask HAI anything..."
            className="input-field flex-1 text-sm py-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary w-9 h-9 rounded-full p-0 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiAssistantPanel;

