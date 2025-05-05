'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/types';
import ChatMessage from './ChatMessage';

interface MessageGroupProps {
  messages: Message[];
  className?: string;
  profileAddress: string;
}

export const MessageGroup: React.FC<MessageGroupProps> = ({
  messages,
  className,
  profileAddress
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {messages.map((message, index) => {

        return (
          <ChatMessage
            key={message.id}
            message={message}
            isFirstInGroup={index === 0}
            isLastInGroup={index === messages.length - 1}
            isPartOfGroup={messages.length > 1}
            profileAddress={profileAddress}
          />
        );
      })}
    </div>
  );
};