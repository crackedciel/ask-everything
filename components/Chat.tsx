"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ChatInput from "./chat/ChatInput";
import { MessageList } from "./chat/message/MessageList";
import { useUpProvider } from "./upProvider";
import { addMessage, selectAllMessages, setMessages } from "@/store/room-reducer";
import { useRef, useCallback, useEffect, useState } from "react";
import { Message } from "@/types/types";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import ERC725 from "@erc725/erc725.js";
import {Message as AIMessage} from '../app/api/types/ai'
import erc725schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

export function Chat() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roomId = 'default';
  const chatInputRef = useRef<{ clear: () => void } | null>(null);

  const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';
  const RPC_ENDPOINT_MAINNET = 'https://rpc.mainnet.lukso.network';

  const [profileData, setProfileData] = useState<{
          imgUrl: string;
          fullName: string;
          background: string;
          profileAddress: string;
          isLoading: boolean;
      }>({
          imgUrl: 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
          fullName: 'username',
          background: 'https://tools-web-components.pages.dev/images/sample-background.jpg',
          profileAddress: '0x1234567890111213141516171819202122232425',
          isLoading: false,
      });

  const [userData, setUserData] = useState<{
          imgUrl: string;
          fullName: string;
          background: string;
          profileAddress: string;
          isLoading: boolean;
      }>({
          imgUrl: 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
          fullName: 'username',
          background: 'https://tools-web-components.pages.dev/images/sample-background.jpg',
          profileAddress: '0x1234567890111213141516171819202122232425',
          isLoading: false,
      });

  const firstMessage = useAppSelector(state => state.chat.firstMessage);
  const messages: Message[] = useAppSelector(state => state.room.messages[roomId] || []);

  const { accounts, contextAccounts } =
    useUpProvider();
  const messageListContainerRef = useRef<HTMLDivElement | null>(null);

  const isLoadingMessages = false; 
  const isOwner = accounts && contextAccounts && accounts[0] === contextAccounts[0];

  // Initialize AI hook
  const { sendMessage: sendToAI, isLoading: isAILoading, response, error: aiError } = useApi();

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
  }, [dispatch, roomId]);

  const removeLoadingMessage = useCallback(() => {
    dispatch((dispatch, getState) => {
      const currentMessages = selectAllMessages(getState(), roomId);
      const newMessages = currentMessages.filter(message => !message.isLoading);
      dispatch(setMessages({roomId, messages: newMessages}));
    });
  }, [dispatch, roomId]);

  // Handle AI response
  useEffect(() => {
    if (response?.content) {
      removeLoadingMessage();
      
      const aiMessage: Message = {
        id: `ai-${(Math.random() * 1e6)}`,
        roomId,
        content: response.content,
        address: 'Agoria', // AI identifier 
        timestamp: new Date().toISOString(),
        isAssistant: true,
      };
      
      dispatchAddMessage(aiMessage);
      scrollToMessageListBottom();
    }
  }, [response, dispatchAddMessage, removeLoadingMessage, roomId, scrollToMessageListBottom]);

  // Handle AI errors
  useEffect(() => {
    if (aiError) {
      removeLoadingMessage();
      dispatch(addMessage({
        roomId,
        message: {
          roomId,
          id: `error-${(Math.random() * 1e6)}`,
          content: `${aiError}`,
          address: contextAccounts[0],
          timestamp: new Date().toISOString(),
          isError: true,
          isAssistant: true
        }
      }));
    }
  }, [aiError, dispatch, removeLoadingMessage, roomId, contextAccounts]);

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
      isAssistant: true,
      profileImage: profileData.imgUrl,
      username: profileData.fullName
    }}));
  }

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !roomId) return;

    // Add optimistic user message
    const userMessage: Message = {
      id: `user-${(Math.random() * 1e6)}`,
      roomId,
      content,
      address: accounts[0],
      timestamp: new Date().toISOString(),
      isAssistant: false,
      profileImage: userData.imgUrl,
      username: userData.fullName
    };

    dispatchAddMessage(userMessage);

    try {
      // Get chat history for context
      const conversationHistory: AIMessage[] = messages.map(msg => ({
        role: msg.isAssistant ? 'assistant' : 'user',
        content: msg.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content,
      });

      // Get agent context if available
      const agentContext = typeof window !== 'undefined' ? localStorage.getItem("agentContext") || "" : "";
      
      // Add system context if available
      if (agentContext) {
        conversationHistory.unshift({
          role: 'system',
          content: agentContext,
        });
      }

      // Send to AI
      await sendToAI(conversationHistory);

      chatInputRef.current?.clear();
    } catch (error) {
      console.error('Error sending message:', error);
      sendErrorMessage();
    } finally {
      scrollToMessageListBottom();
    }
  }, [dispatchAddMessage, scrollToMessageListBottom, accounts, messages, sendToAI, contextAccounts]);

  const navigateToSettings = () => {
    router.push('/settings');
  };

  useEffect(() => {
    async function fetchProfileImage() {
        if (!accounts || accounts.length) return;

        setProfileData(prev => ({ ...prev, isLoading: true }));

        try {
            const config = { ipfsGateway: IPFS_GATEWAY };
            const rpcEndpoint = RPC_ENDPOINT_MAINNET;
            const profile = new ERC725(erc725schema, accounts[0], rpcEndpoint, config);
            const fetchedData = await profile.fetchData('LSP3Profile');

            if (
                fetchedData?.value &&
                typeof fetchedData.value === 'object' &&
                'LSP3Profile' in fetchedData.value
            ) {
                const profileImagesIPFS = fetchedData.value.LSP3Profile.profileImage;
                const fullName = fetchedData.value.LSP3Profile.name;
                const profileBackground = fetchedData.value.LSP3Profile.backgroundImage;

                setProfileData({
                    fullName: fullName || '',
                    imgUrl: profileImagesIPFS?.[0]?.url
                        ? profileImagesIPFS[0].url.replace('ipfs://', IPFS_GATEWAY)
                        : 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
                    background: profileBackground?.[0]?.url
                        ? profileBackground[0].url.replace('ipfs://', IPFS_GATEWAY)
                        : '',
                    profileAddress: accounts[0],
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
            setProfileData(prev => ({
                ...prev,
                isLoading: false,
            }));
        }
    }

    fetchProfileImage();
}, [accounts]);

useEffect(() => {
  async function fetchUserImage() {
      if (!contextAccounts || contextAccounts.length) return;

      setUserData(prev => ({ ...prev, isLoading: true }));

      try {
          const config = { ipfsGateway: IPFS_GATEWAY };
          const rpcEndpoint = RPC_ENDPOINT_MAINNET;
          const profile = new ERC725(erc725schema, contextAccounts[0], rpcEndpoint, config);
          const fetchedData = await profile.fetchData('LSP3Profile');

          if (
              fetchedData?.value &&
              typeof fetchedData.value === 'object' &&
              'LSP3Profile' in fetchedData.value
          ) {
              const profileImagesIPFS = fetchedData.value.LSP3Profile.profileImage;
              const fullName = fetchedData.value.LSP3Profile.name;
              const profileBackground = fetchedData.value.LSP3Profile.backgroundImage;

              setUserData({
                  fullName: fullName || '',
                  imgUrl: profileImagesIPFS?.[0]?.url
                      ? profileImagesIPFS[0].url.replace('ipfs://', IPFS_GATEWAY)
                      : 'https://tools-web-components.pages.dev/images/sample-avatar.jpg',
                  background: profileBackground?.[0]?.url
                      ? profileBackground[0].url.replace('ipfs://', IPFS_GATEWAY)
                      : '',
                  profileAddress: contextAccounts[0],
                  isLoading: false,
              });
          }
      } catch (error) {
          console.error('Error fetching profile image:', error);
          setUserData(prev => ({
              ...prev,
              isLoading: false,
          }));
      }
  }

  fetchUserImage();
}, [contextAccounts]);

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
          isDisabled={isLoadingMessages || isAILoading}
          height='sm'
        />
      </div>
    </div>
  );
}