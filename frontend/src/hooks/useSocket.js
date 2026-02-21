import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initSocket, getSocket } from '../services/socket';
import { addMessage, setTyping, markSeen, removeMessage } from '../store/slices/messageSlice';
import { setUserOnline, updateChatLastMessage, addNewChat } from '../store/slices/chatSlice';

const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!user) return;

    const socket = initSocket(document.cookie);

    // ─── User Status Events ─────────────────────────────
    socket.on('user_online', ({ userId }) => {
      dispatch(setUserOnline({ userId, status: 'online' }));
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      dispatch(setUserOnline({ userId, status: 'offline', lastSeen }));
    });

    // ─── Message Events ─────────────────────────────────
    socket.on('new_message', ({ message, chatId }) => {
      dispatch(addMessage(message));
      dispatch(updateChatLastMessage({ chatId, message }));
    });

    socket.on('message_deleted', ({ messageId, chatId, deleteForEveryone }) => {
      if (deleteForEveryone) {
        dispatch(removeMessage({ messageId }));
      }
    });

    // ─── Typing Events ──────────────────────────────────
    socket.on('user_typing', ({ chatId, userId }) => {
      dispatch(setTyping({ chatId, userId, isTyping: true }));
    });

    socket.on('user_stopped_typing', ({ chatId, userId }) => {
      dispatch(setTyping({ chatId, userId, isTyping: false }));
    });

    // ─── Seen Events ────────────────────────────────────
    socket.on('messages_seen', ({ chatId, userId }) => {
      if (activeChat?._id === chatId) {
        dispatch(markSeen({ userId }));
      }
    });

    return () => {
      const s = getSocket();
      if (s) {
        s.off('user_online');
        s.off('user_offline');
        s.off('new_message');
        s.off('message_deleted');
        s.off('user_typing');
        s.off('user_stopped_typing');
        s.off('messages_seen');
      }
    };
  }, [user, dispatch]);

  return getSocket();
};

export default useSocket;
