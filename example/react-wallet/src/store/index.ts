import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

const privateKeysSlice = createSlice({
  name: "privateKeysSlice",
  initialState: {
    mainnetPrivateKeys: [] as {
      accId: string;
      pk: string;
    }[],
    testnetPrivateKeys: [] as {
      accId: string;
      pk: string;
    }[],
  },
  reducers: {
    addMainnetKey: (
      state,
      action: { payload: { pk: string; accId: string } }
    ) => {
      if (
        state.mainnetPrivateKeys.findIndex(
          (pk) => pk.accId === action.payload.accId
        ) === -1
      ) {
        state.mainnetPrivateKeys = [
          ...state.mainnetPrivateKeys,
          action.payload,
        ];
      }
    },
    addTestnetKey: (
      state,
      action: { payload: { pk: string; accId: string } }
    ) => {
      if (
        state.testnetPrivateKeys.findIndex(
          (pk) => pk.accId === action.payload.accId
        ) === -1
      ) {
        state.testnetPrivateKeys = [
          ...state.testnetPrivateKeys,
          action.payload,
        ];
      }
    },
    restorePks: (
      state,
      action: {
        payload: {
          mainnetPrivateKeys: { pk: string; accId: string }[];
          testnetPrivateKeys: { pk: string; accId: string }[];
        };
      }
    ) => ({
      ...state,
      mainnetPrivateKeys: action.payload.mainnetPrivateKeys,
      testnetPrivateKeys: action.payload.testnetPrivateKeys,
    }),
  },
});

// config the store
export const store = configureStore({
  reducer: {
    privateKeys: privateKeysSlice.reducer,
  },
});

export type AppStore = ReturnType<typeof store.getState>;

export const actions = {
  privateKeys: privateKeysSlice.actions,
};
