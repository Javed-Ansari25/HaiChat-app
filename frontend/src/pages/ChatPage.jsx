import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsMobile, toggleSidebar } from '../store/slices/uiSlice';
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
  const {
    showNewChat,
    showCreateGroup,
    showProfile,
    showChatInfo,
    showAiAssistant,
    isMobile,
    showSidebar
  } = useSelector((s) => s.ui);

  // ─── Initialize socket
  useSocket();

  // ─── Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
    };
    handleResize(); // first load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // ─── Decide what to show
  const showChatPanel = isMobile ? !showSidebar || !!activeChat : true;
  const showSidebarPanel = isMobile ? showSidebar || !activeChat : true;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-chat-bg relative">

      {/* ─── Sidebar Overlay for Mobile */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => dispatch(toggleSidebar(false))}
        />
      )}

      {/* Sidebar */}
{showSidebarPanel && (
  <div
    className={`
      ${isMobile ? 'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex justify-start' : 'w-80'}
      h-full
    `}
  >
    <div className={`${isMobile ? 'w-full max-w-xs sm:max-w-sm' : ''} h-full bg-chat-sidebar relative`}>
      <Sidebar />
    </div>
  </div>
)}

      {/* ─── Main Chat Area */}
      {showChatPanel && (
        <div
          className="flex-1 flex flex-col min-w-0 h-full"
          onClick={() => {
            // Auto-hide sidebar on mobile when chat area clicked
            if (isMobile && showSidebar) dispatch(toggleSidebar(false));
          }}
        >
          {activeChat ? (
            <>
              <ChatHeader />
              <div className="flex-1 overflow-hidden">
                <MessagesList />
              </div>
              <MessageInput />
            </>
          ) : (
            <WelcomeScreen />
          )}
        </div>
      )}

      {/* ─── Right Panels - Desktop */}
      {!isMobile && showChatInfo && activeChat && (
        <div className="w-80 border-l border-chat-border h-full">
          <ChatInfoPanel />
        </div>
      )}
      {!isMobile && showAiAssistant && (
        <div className="w-80 border-l border-chat-border h-full">
          <AiAssistantPanel />
        </div>
      )}

      {/* ─── Modals */}
      {showNewChat && <NewChatModal />}
      {showCreateGroup && <CreateGroupModal />}
      {showProfile && <ProfilePanel />}

      {/* ─── Right Panels Mobile Overlay */}
      {isMobile && showChatInfo && activeChat && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm h-full bg-chat-bg">
            <ChatInfoPanel />
          </div>
        </div>
      )}
      {isMobile && showAiAssistant && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm h-full bg-chat-bg">
            <AiAssistantPanel />
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;