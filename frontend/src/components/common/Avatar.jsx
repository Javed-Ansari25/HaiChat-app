import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const Avatar = ({ src, name = '', size = 'md', showOnline = false, isOnline = false, className = '' }) => {
  const sizes = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  const dotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-semibold text-white`}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-chat-sidebar
            ${isOnline ? 'bg-primary-500' : 'bg-chat-secondary'}`}
        />
      )}
    </div>
  );
};

export default Avatar;
