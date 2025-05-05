import { Room } from '@/types/types';
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  rooms: Room[];
  loadingRooms: boolean;
  error: string | null;
  firstMessage: string | null;
  model: 'deepseek' | 'llama';
}

const initialState: ChatState = {
  rooms: [],
  loadingRooms: true,
  error: null,
  firstMessage: null,
  model: 'llama',
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
      state.error = null;
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.rooms = [action.payload, ...state.rooms];
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      const index = state.rooms.findIndex(room => room.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
    },
    clearRooms: (state) => {
      state.rooms = [];
    },
    setLoadingRooms: (state, action: PayloadAction<boolean>) => {
      state.loadingRooms = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFirstMessage: (state, action: PayloadAction<string | null>) => {
      state.firstMessage = action.payload;
    },
    setModel: (state, action: PayloadAction<'deepseek' | 'llama'>) => {
      state.model = action.payload;
    },
    resetChat: () => initialState,
  },
});

export const {
  setRooms,
  addRoom,
  updateRoom,
  removeRoom,
  clearRooms,
  setLoadingRooms,
  setError,
  setFirstMessage,
  setModel,
  resetChat,
} = chatSlice.actions;

// Selectors
const selectChatState = (state: { chat: ChatState }) => state.chat;

export const selectAllRooms = createSelector(
  [selectChatState],
  (chatState) => chatState.rooms.map(room => ({ ...room }))
);

export const selectRoomById = createSelector(
  [selectAllRooms, (_state, roomId: string) => roomId],
  (rooms, roomId) => rooms.find(room => room.id === roomId)
);

export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
export const selectFirstMessage = (state: { chat: ChatState }) => state.chat.firstMessage;
export const selectModel = (state: { chat: ChatState }) => state.chat.model;
export const selectLoadingRooms = (state: { chat: ChatState }) => state.chat.loadingRooms;

export default chatSlice.reducer;