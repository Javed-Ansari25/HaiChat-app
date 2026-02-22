import React, { useState, useMemo } from 'react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const Avatar = ({
  src,
  name = '',
  size = 'md',
  showOnline = false,
  isOnline = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

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

  // Safe fallback if wrong size passed
  const resolvedSize = sizes[size] ? size : 'md';

  const initials = useMemo(() => {
    return getInitials(name || 'User');
  }, [name]);

  const avatarColor = useMemo(() => {
    return getAvatarColor(name || 'User');
  }, [name]);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          loading="lazy"
          onError={() => setImgError(true)}
          className={`${sizes[resolvedSize]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[resolvedSize]} ${avatarColor} rounded-full flex items-center justify-center font-semibold text-white select-none`}
        >
          {initials}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[resolvedSize]} rounded-full border-2 border-chat-sidebar
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      )}
    </div>
  );
};

export default React.memo(Avatar);