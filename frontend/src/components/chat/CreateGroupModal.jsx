import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createGroupChat } from '../../store/slices/chatSlice';
import { toggleCreateGroup } from '../../store/slices/uiSlice';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

const CreateGroupModal = () => {
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) searchUsers(search);
      else setUsers([]);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const searchUsers = async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${q}`);
      setUsers(res.data.users.filter(u => !selected.find(s => s._id === u._id)));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (user) => {
    setSelected(prev => {
      const exists = prev.find(u => u._id === user._id);
      return exists ? prev.filter(u => u._id !== user._id) : [...prev, user];
    });
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error('Group name is required');
    if (selected.length < 2) return toast.error('Add at least 2 members');

    setCreating(true);
    try {
      await dispatch(createGroupChat({
        groupName: groupName.trim(),
        participants: selected.map(u => u._id),
      }));
      toast.success(`Group "${groupName}" created!`);
      dispatch(toggleCreateGroup());
    } catch {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 py-6">
    
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => dispatch(toggleCreateGroup())}
    />

    {/* Modal */}
    <div className="relative w-full max-w-md sm:max-w-lg bg-chat-header rounded-2xl shadow-2xl border border-chat-border/30 flex flex-col max-h-[90dvh]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 h-14 border-b border-chat-border/20 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-semibold text-chat-text flex-1">
          Create Group
        </h2>
        <button
          onClick={() => dispatch(toggleCreateGroup())}
          className="btn-ghost p-2 rounded-full"
        >
          <svg className="w-5 h-5 text-chat-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        <div className="p-4 space-y-3">

          {/* Group Name */}
          <input
            autoFocus
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input-field w-full"
          />

          {/* Selected Members */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map(u => (
                <button
                  key={u._id}
                  onClick={() => toggleSelect(u)}
                  className="flex items-center gap-1.5 bg-primary-500/20 border border-primary-500/30 text-primary-400 px-2.5 py-1 rounded-full text-xs"
                >
                  <Avatar src={u.avatar} name={u.name} size="xs" />
                  <span className="truncate max-w-[80px]">
                    {u.name.split(' ')[0]}
                  </span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            placeholder="Add people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* User List */}
        <div className="max-h-60 sm:max-h-72 overflow-y-auto border-t border-chat-border/20">
          {users.map(u => (
            <button
              key={u._id}
              onClick={() => toggleSelect(u)}
              className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-chat-hover transition-colors text-left"
            >
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-chat-text truncate">
                  {u.name}
                </p>
                <p className="text-xs text-chat-secondary truncate">
                  {u.email}
                </p>
              </div>

              {selected.find(s => s._id === u._id) && (
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-chat-border/20 flex-shrink-0">
        <button
          onClick={handleCreate}
          disabled={creating || !groupName.trim() || selected.length < 2}
          className="btn-primary w-full py-2.5 sm:py-3 text-sm sm:text-base"
        >
          {creating
            ? 'Creating...'
            : `Create Group (${selected.length} members)`}
        </button>
      </div>

    </div>
  </div>
);
};

export default CreateGroupModal;
