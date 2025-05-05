import { WLState } from '@/types/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: WLState = {
  isWL: true,
};

export const wlSlice = createSlice({
  name: 'WL',
  initialState,
  reducers: {
    setIsWL: (state, action: PayloadAction<boolean>) => {
      state.isWL = action.payload;
    },
  },
});

export const {
  setIsWL,
} = wlSlice.actions;

export default wlSlice.reducer;