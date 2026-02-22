import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleNewChat } from '../../store/slices/uiSlice';

const WelcomeScreen = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-12 py-10 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 sm:w-64 h-40 sm:h-64 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-3xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center p-3">
          <img
            src="/logo.png"
            alt="HAI Chat Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-chat-text mb-2">
        HAI Chat
      </h2>

      {/* Subtitle */}
      <p className="text-chat-secondary text-sm sm:text-base max-w-xs sm:max-w-md leading-relaxed mb-6">
        Send and receive messages without keeping your phone online.
        Use HAI Chat on any device.
      </p>

      {/* Feature chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-xs sm:max-w-md mb-8">
        {[
          'End-to-end secure',
          'AI-powered',
          'Real-time',
          'Media sharing',
          'Group chats',
        ].map((f) => (
          <span
            key={f}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-chat-input border border-chat-border/30 text-chat-secondary"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={() => dispatch(toggleNewChat())}
        className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
      >
        Start a Conversation
      </button>

      {/* Footer text */}
      <p className="text-xs sm:text-sm text-chat-secondary mt-5 flex items-center gap-1.5">
        <svg
          className="w-4 h-4 text-primary-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Your messages are encrypted
      </p>
    </div>
  );
};

export default WelcomeScreen;