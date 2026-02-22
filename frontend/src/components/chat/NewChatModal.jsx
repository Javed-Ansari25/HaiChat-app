import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleNewChat } from '../../store/slices/uiSlice';
import { accessChat } from '../../store/slices/chatSlice';
import api from '../../services/api';
import Avatar from '../common/Avatar';

const NewChatModal = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length > 0) {
        searchUsers(search);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const searchUsers = async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${q}`);
      setUsers(res.data.users);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId) => {
    await dispatch(accessChat(userId));
    dispatch(toggleNewChat());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch(toggleNewChat())}
      />

      {/* Modal */}
      <div
        className="
          relative 
          bg-chat-header 
          rounded-xl sm:rounded-2xl
          w-full 
          max-w-md 
          h-[85vh] sm:h-auto
          sm:max-h-[80vh]
          shadow-2xl 
          border border-chat-border/30 
          flex flex-col
          fade-in
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-chat-border/20 flex-shrink-0">
          <h2 className="text-sm sm:text-base font-semibold text-chat-text flex-1">
            New Chat
          </h2>
          <button
            onClick={() => dispatch(toggleNewChat())}
            className="btn-ghost p-1.5 rounded-full"
          >
            <svg
              className="w-5 h-5 text-chat-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chat-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && search && users.length === 0 && (
            <div className="text-center py-8 text-chat-secondary px-4">
              <p className="text-sm">No users found</p>
            </div>
          )}

          {!loading && !search && (
            <div className="text-center py-8 text-chat-secondary px-6">
              <svg
                className="w-10 h-10 mx-auto mb-2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm">
                Search for people to chat with
              </p>
            </div>
          )}

          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleSelectUser(u._id)}
              className="
                w-full 
                flex items-center gap-3 
                px-4 sm:px-5 
                py-3 
                hover:bg-chat-hover 
                transition-colors 
                text-left
              "
            >
              <Avatar
                src={u.avatar}
                name={u.name}
                size="md"
                showOnline
                isOnline={u.status === 'online'}
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-chat-text text-sm truncate">
                  {u.name}
                </p>
                <p className="text-xs text-chat-secondary truncate">
                  {u.email}
                </p>
              </div>

              {u.status === 'online' && (
                <span className="text-xs text-primary-500 whitespace-nowrap">
                  online
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;