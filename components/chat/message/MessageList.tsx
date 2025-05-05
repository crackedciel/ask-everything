'use client';

import React from 'react';
import { MessageGroup } from './MessageGroup';
import { Message } from '@/types/types';

interface MessageListProps {
  messages: Message[];
  profileAddress: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  profileAddress
}) => {
  // Group consecutive messages by the same sender
  const groupedMessages = messages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup[0].address === message.address) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, [] as Message[][]);

  return groupedMessages.length ? groupedMessages.map((group: Message[], index: number) => (
    <MessageGroup
      key={`${group[0].address}-${index}`}
      messages={group}
      profileAddress={profileAddress}
    />
  )) : (
    <div className="flex justify-center items-center h-full">
      <div className="text-center text-gray-600">No messages yet</div>
    </div>
  );
};