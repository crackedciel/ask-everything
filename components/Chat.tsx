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
import { useAgentContext } from "@/hooks/useAgentContext";
import {Message as AIMessage} from '../app/api/types/ai'
import erc725schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import { RPC_URL } from "@/lib/constants";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { ERC725 } from "@erc725/erc725.js";
import lsp4Schema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";
import lsp8Artifact from "../lib/abis/lsp8.json";
import lsp3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

import pLimit from "p-limit";

const limit = pLimit(2);

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
          imgUrl: '',
          fullName: 'assistant',
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
          fullName: '',
          background: 'https://tools-web-components.pages.dev/images/sample-background.jpg',
          profileAddress: '0x1234567890111213141516171819202122232425',
          isLoading: false,
      });
  
  const [profileAssets, setProfileAssets] = useState<string>('');
  const [userAssets, setUserAssets] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const firstMessage = useAppSelector(state => state.chat.firstMessage);
  const messages: Message[] = useAppSelector(state => state.room.messages[roomId] || []);

  const { accounts, contextAccounts, chainId, provider } =
    useUpProvider();
  const messageListContainerRef = useRef<HTMLDivElement | null>(null);

  const isLoadingMessages = false; 
  const isOwner = accounts && contextAccounts && accounts[0] === contextAccounts[0];

  // Initialize AI hook
  const { sendMessage: sendToAI, isLoading: isAILoading, response, error: aiError } = useApi();
  
  // Get agent context from blockchain
  const { agentContext } = useAgentContext(contextAccounts?.[0], chainId || 0);

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

      console.log('sending ai message with profile', profileData)
      
      const aiMessage: Message = {
        id: `ai-${(Math.random() * 1e6)}`,
        roomId,
        content: response.content,
        address: 'Agoria', // AI identifier 
        timestamp: new Date().toISOString(),
        isAssistant: true,
        username: profileData.fullName,
        profileImage: profileData.imgUrl
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

      // Add system context if available from blockchain
      if (agentContext) {
        conversationHistory.unshift({
          role: 'system',
          content: buildSystemPrompt(agentContext),
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
  }, [dispatchAddMessage, scrollToMessageListBottom, accounts, messages, sendToAI, contextAccounts, agentContext, userData.imgUrl, userData.fullName]);

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const fetchProfileAssets = async (address: string) => {
    const erc725js = new ERC725(lsp3ProfileSchema, address, RPC_URL, {
      ipfsGateway: IPFS_GATEWAY,
    });

    try {
      if (!provider) return;
      const browserProvider = new BrowserProvider(provider);

      const balance = await browserProvider.getBalance(address);
      const receivedAssetsDataKey = await erc725js.fetchData(
        "LSP5ReceivedAssets[]",
      );
      const assets = await Promise.all(
        (receivedAssetsDataKey.value as string[]).map((value: string) =>
          limit(async () => {
            try {
              const contract = new Contract(value, lsp8Artifact.abi, browserProvider);
              const balance = await contract.balanceOf(address);

              const myAsset = new ERC725(lsp4Schema, value, RPC_URL, {
                ipfsGateway: IPFS_GATEWAY,
              });
              const tokenType = await myAsset.getData("LSP4TokenType");
              const tokenName = await myAsset.getData("LSP4TokenName");
              const assetMetadata = await myAsset.fetchData("LSP4Metadata");

              const assetImages: any[] = (
                assetMetadata.value as any
              )?.LSP4Metadata?.images.flat();
              const assetIcons: any[] = (
                assetMetadata.value as any
              )?.LSP4Metadata?.icon.flat();

              const selectedImages = (
                assetImages.length > 0 ? assetImages : assetIcons
              ).map((image: any) => {
                return image.url.replace("ipfs://", IPFS_GATEWAY + "/");
              });

              return {
                address: value,
                name: tokenName.value,
                images: selectedImages,
                type: tokenType.value,
                balance:
                  tokenType.value === 0
                    ? Number(formatEther(balance))
                    : Number(balance),
              };
            } catch (error: any) {
              return null;
            }
          }),
        ),
      );

      return {
        balance: formatEther(balance),
        assets,
      };
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const buildSystemPrompt = (
    agentContext: string
  ): string => {
    let context = '';
    if (profileData.fullName !== 'assistant') {
      context += `You are named ${profileData.fullName}\n`
    }
    if (profileAssets) {
      context += `You possess the following assets in your Lukso account: ${profileAssets}\n`
    }
     context += agentContext;

     if (userData.fullName !== '') {
      context += `\n\nThe user you are talking to is named ${userData.fullName}\n`
     }
     if (userAssets) {
      context += `The user possess the following assets in his Lukso account: ${userAssets}`
     }

     return context;
  }

  useEffect(() => {
    async function fetchProfileImage() {
        if (!contextAccounts || !contextAccounts.length) return;

        setProfileData(prev => ({ ...prev, isLoading: true }));

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

                console.log(`Fetched ${fullName}`);

                setProfileData({
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
            setProfileData(prev => ({
                ...prev,
                isLoading: false,
            }));
        }
    }

    const fetchAssets = async () => {
      if (!contextAccounts || !contextAccounts.length) return;

      try {
        const assets = await fetchProfileAssets(contextAccounts[0]);
        setProfileAssets(JSON.stringify(assets));
      } catch(e) {
        console.error(e);
      }
    }

    fetchProfileImage();
    fetchAssets();
}, [contextAccounts]);

useEffect(() => {
  async function fetchUserImage() {
      if (!accounts || !accounts.length) return;

      setUserData(prev => ({ ...prev, isLoading: true }));

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

              setUserData({
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
          setUserData(prev => ({
              ...prev,
              isLoading: false,
          }));
      }
  }

  const fetchAssets = async () => {
    if (!accounts || !accounts.length) return;

    try {
      const assets = await fetchProfileAssets(accounts[0]);
      setUserAssets(JSON.stringify(assets));
    } catch(e) {
      console.error(e);
    }
  }

  fetchUserImage();
  fetchAssets();
}, [accounts]);

  return (
    <div key={'default'} className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto">
      {isOwner && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={navigateToSettings}
            className="p-2 transition-colors text-gray-400 hover:text-gray-200"
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
          className="flex-1 overflow-y-auto p-4 pb-safe bg-gray-900/20 backdrop-blur-sm"
          style={{ 
            height: 'calc(100dvh - 80px)',
            overscrollBehavior: 'none'
          }}
        >
          <MessageList messages={messages} profileAddress={contextAccounts[0]} />
        </div>
      )}
      <div className="sticky bottom-0 left-0 right-0 border-t border-zinc-800 bg-gray-900/80 backdrop-blur-xl p-2 pt-1.5">
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