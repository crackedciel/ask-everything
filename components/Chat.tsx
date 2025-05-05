"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ChatInput from "./chat/ChatInput";
import { MessageList } from "./chat/message/MessageList";
import { useUpProvider } from "./upProvider";
import {  addMessage, selectAllMessages, setMessages } from "@/store/room-reducer";
import { useRef, useCallback } from "react";
import { Message } from "@/types/types";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function Chat() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roomId = 'default';
  const chatInputRef = useRef<{ clear: () => void } | null>(null);

  const firstMessage = useAppSelector(state => state.chat.firstMessage);
  const messages: Message[] = useAppSelector(state => state.room.messages[roomId] || []);

  const { accounts, contextAccounts } =
    useUpProvider();
  const messageListContainerRef = useRef<HTMLDivElement | null>(null);

  const isLoadingMessages = false; 
  const isOwner = accounts && contextAccounts && accounts[0] === contextAccounts[0];

  const scrollToMessageListBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messageListContainerRef.current?.scrollTo({
        top: messageListContainerRef.current.scrollHeight,
        behavior,
      });
    }, 100);
  }, []);

  const dispatchAddMessage = useCallback((message: Message) => {
    dispatch(addMessage({ message, roomId }));
  }, [dispatch]);

  const removeLoadingMessage = useCallback(() => {
    dispatch((dispatch, getState) => {
      const currentMessages = selectAllMessages(getState(), roomId);
      const newMessages = currentMessages.filter(message => !message.isLoading);
      dispatch(setMessages({roomId, messages: newMessages}));
    });
  }, [dispatch]);

  const sendErrorMessage = () => {
    removeLoadingMessage();
    dispatch(addMessage({
      roomId,
      message: {
        roomId,
      id: `error-${(Math.random() * 1e6)}`,
      content: 'An error occurred while sending the message, please try again.',
      address: contextAccounts[0],
      timestamp: new Date().toISOString(),
      isError: true,
      isAssistant: true
    }}));
  }

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || !roomId) return;

    // Add optimistic user message
    const userMessage: Message = {
      id: `user-${(Math.random() * 1e6)}`,
      roomId,
      content,
      address: accounts[0],
      timestamp: new Date().toISOString(),
      isAssistant: false,
    };

    dispatchAddMessage(userMessage);

    try {
      // Here would go the code to send to the AI with context
      // If we had an AI API integration, we would use:
      // const agentContext = typeof window !== 'undefined' ? localStorage.getItem("agentContext") || "" : "";
      // sendToAI(content, agentContext);

      chatInputRef.current?.clear();
    } catch (error) {
      console.error('Error sending message:', error);
      sendErrorMessage();
    } finally {
      scrollToMessageListBottom();
    }
  }, [dispatchAddMessage, scrollToMessageListBottom, accounts]);

  const navigateToSettings = () => {
    router.push('/settings');
  };

  return (
    <div key={'default'} className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto">
      {isOwner && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={navigateToSettings}
            className="p-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700 transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      )}
      
      {isLoadingMessages ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-gray-800 rounded-full" />
        </div>
      ) : (
        <div 
          ref={messageListContainerRef} 
          className="flex-1 overflow-y-auto p-4 pb-safe"
          style={{ 
            height: 'calc(100dvh - 80px)',
            overscrollBehavior: 'none'
          }}
        >
          <MessageList messages={messages} profileAddress={contextAccounts[0]} />
        </div>
      )}
      <div className="sticky bottom-0 left-0 right-0 border-t border-zinc-800 bg-black p-1">
        <ChatInput
          ref={chatInputRef}
          onSend={handleSendMessage}
          placeholder="Type a message..."
          isDisabled={isLoadingMessages}
          height='sm'
        />
      </div>
    </div>
  );
}
