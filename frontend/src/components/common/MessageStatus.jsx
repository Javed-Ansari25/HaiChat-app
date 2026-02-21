import React from 'react';

// ✓ = sent, ✓✓ = delivered, ✓✓ blue = seen
const MessageStatus = ({ status }) => {
  if (!status) return null;

  if (status === 'seen') {
    return (
      <svg className="w-4 h-4 text-blue-400 inline" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.071.653a.75.75 0 0 1 .226 1.036l-6.5 10a.75.75 0 0 1-1.192.088L.153 7.653a.75.75 0 0 1 1.094-1.025L4.36 9.84 10.035.879a.75.75 0 0 1 1.036-.226z"/>
        <path d="M15.071.653a.75.75 0 0 1 .226 1.036l-6.5 10a.75.75 0 0 1-1.192.088.75.75 0 0 1 .119-1.118L14.035.879a.75.75 0 0 1 1.036-.226z"/>
      </svg>
    );
  }

  if (status === 'delivered') {
    return (
      <svg className="w-4 h-4 text-chat-secondary inline" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.071.653a.75.75 0 0 1 .226 1.036l-6.5 10a.75.75 0 0 1-1.192.088L.153 7.653a.75.75 0 0 1 1.094-1.025L4.36 9.84 10.035.879a.75.75 0 0 1 1.036-.226z"/>
        <path d="M15.071.653a.75.75 0 0 1 .226 1.036l-6.5 10a.75.75 0 0 1-1.192.088.75.75 0 0 1 .119-1.118L14.035.879a.75.75 0 0 1 1.036-.226z"/>
      </svg>
    );
  }

  // Sent - single check
  return (
    <svg className="w-3.5 h-3.5 text-chat-secondary inline" viewBox="0 0 12 11" fill="currentColor">
      <path d="M10.071.653a.75.75 0 0 1 .226 1.036l-6.5 10a.75.75 0 0 1-1.192.088L.153 7.653a.75.75 0 0 1 1.094-1.025L3.86 9.84 9.035.879a.75.75 0 0 1 1.036-.226z"/>
    </svg>
  );
};

export default MessageStatus;
