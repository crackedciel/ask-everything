'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ImageGrid from './ImageGrid';
import { Message } from '@/types/types';
import ThinkMessage from './ThinkMessage';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

interface MessageProps {
  message: Message;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isPartOfGroup?: boolean;
  isLoading?: boolean;
  profileAddress: string;
}

const ChatMessage = ({
  message,
  isFirstInGroup = false,
  isLastInGroup = false,
  isPartOfGroup = false,
  profileAddress,
}: MessageProps) => {

  const isAssistant = message.address === profileAddress;
  const isPlaceholder = message.placeholderStatus;
  const isPlaceholderInProgress = message.placeholderStatus === 'in_progress';
  const isPlaceholderFinished = message.placeholderStatus === 'finished';
  const alignment = isAssistant ? "justify-start" : "justify-end";
  const backgroundColor = isAssistant ? message.isError ? "bg-red-900/40" : "bg-gray-700/30" : "bg-gray-500/30";
  const border = isPlaceholderInProgress ? "border border-yellow-500/40" : isPlaceholderFinished ? "border border-green-700/50" : "";
  const color = isPlaceholder ? "text-white/40" : "text-white";
  const fontSize = isPlaceholder ? "text-sm" : "text-md";

  const formatUsername = (userId: string | undefined) => {
    if (userId === 'assistant') return 'Agoria';
    if (!userId) return 'User';
    return userId.split(':').slice(-1)[0].slice(4, 8);
  }

  const renderToolOutput = () => {
    if (message.isError) return renderMessage(message.toolOutput as string, "bg-red-900/40");
    if (!message.toolOutput) return;
  };

  const renderFormattedText = (content: string) => {
    // Split content by @agoria, preserving the mention
    const parts = content.split(/(@agoria)/g);
    
    return parts.map((part, index) => {
      if (part === '@agoria') {
        return <span key={index} className="text-purple-400">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderMessage = (content: string, className?: string) => {
    const trimmedContent = typeof content === 'string' ? content.trim() : content;
    const hasThinkTags = typeof trimmedContent === 'string' && trimmedContent.includes('<think>');
    
    const messageContent = hasThinkTags ? (
      <ThinkMessage content={trimmedContent} />
    ) : (
      typeof trimmedContent === 'string' ? (
        trimmedContent.split('\n').map((line, index, array) => (
          <React.Fragment key={index}>
            {renderFormattedText(line.trim())}
            {index < array.length - 1 && <br />}
          </React.Fragment>
        ))
      ) : String(trimmedContent)
    );
    
    return (
      <div className={cn(
        `max-w-3xl gap-2 backdrop-blur-md ${isPlaceholder ? "py-1 px-3" : "py-2 px-4"}`,
        backgroundColor,
        border,
        color,
        fontSize,
        isPartOfGroup ? (
          isLastInGroup && !(message.images && message.images.length) ?
            `rounded-xl rounded-tl-lg` :
            `rounded-xl ${isAssistant ? "rounded-bl-lg" : "rounded-br-lg"}`
        ) : `rounded-xl`,
        className,
      )}>
        {isPlaceholder && (
          <div className={`w-2 h-2 rounded-full ${isPlaceholderInProgress ? "animate-pulse bg-yellow-500" : "bg-green-700"}`} />
        )}
        {message.isLoading ? (
          <div className="p-2 rounded-2xl">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
              <div className="w-2 h-2 bg-white/30 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
              <div className="w-2 h-2 bg-white/30 rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
            </div>
          </div>
        ) : messageContent}
      </div>
    );
  };

  const renderMessageContent = () => (
    <div>
      {message.tool && message.toolOutput ? renderToolOutput() : renderMessage(message.content)}
    </div>
  );

  return (
    <>
      <div className={cn(
        "w-full",
        isFirstInGroup ? "mt-4" : "mt-1"
      )}>
        {isFirstInGroup && (
          <div className={cn(
            "flex w-full mb-1",
            alignment
          )}>
            <div className={cn(
              "text-xs",
              isAssistant ? "text-purple-400" : "text-gray-400",
            )}>
              {formatUsername(message.username || message.address)}
            </div>
          </div>
        )}
        <div className={cn(
          "flex w-full items-start gap-2",
          alignment
        )}>
          {isAssistant && (
            <ProfileAvatar 
              src={isAssistant ? "/images/assistant-200x200.png" : undefined}
              size="sm"
              className={isFirstInGroup ? '' : 'opacity-0'}
            />
          )}
          {renderMessageContent()}
          {!isAssistant && (
            <ProfileAvatar 
              size="sm"
              src={message.profileImage || undefined}
              className={isFirstInGroup ? '' : 'opacity-0'}
            />
          )}
        </div>
      </div>
      {message.images && message.images.length > 0 && (
        <div className={cn(
          "flex w-full",
          alignment,
          isFirstInGroup ? "mb-4" : "mb-0.5"
        )}>
          <ImageGrid images={message.images} />
        </div>
      )}
    </>
  );
};

export default ChatMessage;