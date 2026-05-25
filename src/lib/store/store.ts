import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiSlice } from './api/apiSlice';
import { publicApi } from './api/publicApi';
import authReducer from './slices/authSlice';
import type { AuthState } from './slices/authSlice';

const persistConfig = {
  key: 'auth', // Key for localStorage
  storage,
  // No whitelist needed when persisting a single reducer
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: persistedAuthReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [publicApi.reducerPath]: publicApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }).concat(apiSlice.middleware).concat(publicApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
// Override the `auth` slice type to strip redux-persist's PersistPartial wrapper,
// which would otherwise make all auth fields appear as `| undefined` to TypeScript.
export type RootState = Omit<ReturnType<AppStore['getState']>, 'auth'> & { auth: AuthState };
export type AppDispatch = AppStore['dispatch'];

