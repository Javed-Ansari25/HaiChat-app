import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { setIsMobile } from '../../store/slices/uiSlice';
import { setIsMobile } from '../store/slices/uiSlice';
// import useSocket from '../../hooks/useSocket';
import useSocket from '../hooks/useSocket';

import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessagesList from '../components/chat/MessagesList';
import MessageInput from '../components/chat/MessageInput';
import WelcomeScreen from '../components/chat/WelcomeScreen';
import NewChatModal from '../components/chat/NewChatModal';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import ProfilePanel from '../components/chat/ProfilePanel';
import ChatInfoPanel from '../components/chat/ChatInfoPanel';
import AiAssistantPanel from '../components/ai/AiAssistantPanel';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.chat);
  const { showNewChat, showCreateGroup, showProfile, showChatInfo, showAiAssistant, isMobile, showSidebar } = useSelector((s) => s.ui);

  // Initialize socket connection
  useSocket();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showChatPanel = isMobile ? !showSidebar || !!activeChat : true;
  const showSidebarPanel = isMobile ? showSidebar || !activeChat : true;

  return (
    <div className="flex h-screen overflow-hidden bg-chat-bg">
      {/* Sidebar */}
      {showSidebarPanel && (
        <div className={`${isMobile ? 'w-full' : 'w-80'} flex-shrink-0 h-full`}>
          <Sidebar />
        </div>
      )}

      {/* Main Chat Area */}
      {(!isMobile || (isMobile && activeChat)) && (
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {activeChat ? (
            <>
              <ChatHeader />
              <MessagesList />
              <MessageInput />
            </>
          ) : (
            <WelcomeScreen />
          )}
        </div>
      )}

      {/* Right Panels */}
      {!isMobile && showChatInfo && activeChat && <ChatInfoPanel />}
      {!isMobile && showAiAssistant && <AiAssistantPanel />}

      {/* Modals */}
      {showNewChat && <NewChatModal />}
      {showCreateGroup && <CreateGroupModal />}
      {showProfile && <ProfilePanel />}

      {/* Mobile: right panels as overlay */}
      {isMobile && showChatInfo && activeChat && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="w-full max-w-xs">
            <ChatInfoPanel />
          </div>
        </div>
      )}

      {isMobile && showAiAssistant && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="w-full max-w-xs">
            <AiAssistantPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
