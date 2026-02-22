import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout } from '../../store/slices/authSlice';
import { toggleProfile } from '../../store/slices/uiSlice';
import Avatar from '../common/Avatar';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const [aiEnabled, setAiEnabled] = useState(user?.aiEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile({ ...form, aiEnabled }));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Avatar updated!');
      window.location.reload();
    } catch {
      toast.error('Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => dispatch(toggleProfile())}
      />

      {/* Panel */}
      <div className="
        relative ml-auto 
        w-full sm:w-96 md:w-[380px] 
        h-full 
        bg-chat-sidebar 
        shadow-2xl 
        border-l border-chat-border/20 
        flex flex-col 
        animate-slideInRight
      ">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-chat-header border-b border-chat-border/20">
          <button
            onClick={() => dispatch(toggleProfile())}
            className="p-2 rounded-full hover:bg-chat-hover transition"
          >
            <svg
              className="w-5 h-5 text-chat-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="font-semibold text-chat-text text-base">
            Profile
          </h2>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center py-8 px-4 border-b border-chat-border/20 bg-gradient-to-b from-chat-header to-chat-sidebar">
          <button
            className="relative group"
            onClick={() => fileRef.current?.click()}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="xl"
            />

            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <p className="text-sm text-chat-secondary mt-3 text-center">
            Tap to change photo
          </p>
        </div>

        {/* Form Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs text-chat-secondary mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="input-field w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs text-chat-secondary mb-1.5">
              About
            </label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
              rows={3}
              maxLength={100}
              className="input-field resize-none w-full"
            />
            <p className="text-xs text-chat-secondary text-right mt-1">
              {form.bio.length}/100
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-chat-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="input-field opacity-60 cursor-not-allowed w-full"
            />
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-3 bg-chat-input rounded-lg">
            <div>
              <p className="text-sm font-medium text-chat-text">
                AI Features
              </p>
              <p className="text-xs text-chat-secondary">
                Smart replies & assistant
              </p>
            </div>

            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative w-11 h-6 rounded-full transition ${
                aiEnabled ? 'bg-primary-500' : 'bg-chat-border'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  aiEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Logout */}
          <button
            onClick={() => dispatch(logout())}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;