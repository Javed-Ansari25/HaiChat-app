import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Format last seen timestamp
 */
export const formatLastSeen = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return `today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy');
};

/**
 * Format message timestamp (sidebar preview)
 */
export const formatMessageTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MM/dd/yy');
};

/**
 * Format message bubble time
 */
export const formatBubbleTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
};

/**
 * Get the other participant in a 1-1 chat
 */
export const getChatPartner = (chat, currentUserId) => {
  if (!chat || chat.isGroupChat) return null;
  return chat.participants?.find((p) => p._id !== currentUserId) || null;
};

/**
 * Get chat display name
 */
export const getChatName = (chat, currentUserId) => {
  if (!chat) return '';
  if (chat.isGroupChat) return chat.groupName;
  const partner = getChatPartner(chat, currentUserId);
  return partner?.name || 'Unknown';
};

/**
 * Get chat avatar
 */
export const getChatAvatar = (chat, currentUserId) => {
  if (!chat) return '';
  if (chat.isGroupChat) return chat.groupAvatar || '';
  const partner = getChatPartner(chat, currentUserId);
  return partner?.avatar || '';
};

/**
 * Get initials for avatar placeholder
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Get message status icon: sent ✓, delivered ✓✓, seen ✓✓ (blue)
 */
export const getMessageStatus = (message, currentUserId, chatParticipants) => {
  if (message.sender?._id !== currentUserId && message.sender !== currentUserId) return null;

  const seenByOthers = message.seenBy?.filter(
    (s) => (s.user?._id || s.user) !== currentUserId
  );

  if (seenByOthers?.length > 0) return 'seen';

  const otherParticipants = chatParticipants?.filter(
    (p) => (p._id || p) !== currentUserId
  );

  const deliveredToOthers = message.deliveredTo?.filter(
    (id) => id !== currentUserId
  );

  if (deliveredToOthers?.length >= (otherParticipants?.length || 1)) return 'delivered';

  return 'sent';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Generate a random color for avatar placeholder based on name
 */
export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-600',
    'bg-red-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
