import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {  Message } from '@/types/types';

interface RoomState {
  messages: {
    [roomId: string]: Message[];
  };
}

const initialState: RoomState = {
  messages: {},
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setMessages: (
      state,
      action: PayloadAction<{
        roomId: string;
        messages: Message[];
      }>
    ) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = 
        messages;
    },

    addMessage: (
      state,
      action: PayloadAction<{
        roomId: string;
        message: Message;
      }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }

      const messages = state.messages[roomId];
      const lastMessage = messages[messages.length - 1];

      // If the last message is partial, replace it
      if (lastMessage?.partial) {
        messages[messages.length - 1] = message;
        return;
      }

      // Search for the index of the loading message
      const loadingIndex = messages.findIndex(msg => msg.isLoading);

      if (loadingIndex !== -1) {
        // If a loading message exists, insert the new message just before
        messages.splice(loadingIndex, 0, message);
      } else {
        // Else, add to the end normally
        messages.push(message);
      }
    },

    addPartialMessage: (
      state,
      action: PayloadAction<{
        roomId: string;
        message: Message;
      }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }

      const messages = state.messages[roomId];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage?.partial) {
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + message.content
        };
      } else {
        messages.push({ ...message, partial: true });
      }
    },

    clearMessages: (
      state,
      action: PayloadAction<string>
    ) => {
      const roomId = action.payload;
      state.messages[roomId] = [];
    },

    clearRoomData: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      delete state.messages[roomId];
    },
  },
});

// Actions
export const {
  setMessages,
  addMessage,
  addPartialMessage,
  clearMessages,
  clearRoomData,
} = roomSlice.actions;

// Selectors
export const selectRoomMessages = (state: { room: RoomState }, roomId: string) =>
  state.room.messages[roomId] || [];

export const selectAllMessages = (state: { room: RoomState }, roomId: string) => state.room.messages[roomId] || [];

export default roomSlice.reducer;