import { configureStore } from '@reduxjs/toolkit';

import chatReducer from '@/store/chat-reducer';
import wlReducer from '@/store/wl-reducer';
import roomReducer from '@/store/room-reducer';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    wl: wlReducer,
    room: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
