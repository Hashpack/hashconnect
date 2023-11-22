import { configureStore, createSlice } from "@reduxjs/toolkit";

const hashconnectSlice = createSlice({
  name: "hashconnectSlice",
  initialState: {
    isConnected: false,
    accountIds: [] as string[],
    pairingString: "",
  },
  reducers: {
    setIsConnected: (state, action: { payload: boolean }) => {
      state.isConnected = action.payload;
    },
    setAccountIds: (state, action: { payload: string[] }) => {
      state.accountIds = action.payload;
    },
    setPairingString: (state, action: { payload: string }) => {
      state.pairingString = action.payload;
    },
  },
});

// config the store
export const store = configureStore({
  reducer: {
    hashconnect: hashconnectSlice.reducer,
  },
});

export type AppStore = ReturnType<typeof store.getState>;

export const actions = {
  hashconnect: hashconnectSlice.actions,
};
