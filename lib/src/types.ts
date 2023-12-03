import { SignClientTypes } from "@walletconnect/types";

export enum HashConnectConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

export interface WalletMetadata {
  name: string;
  description: string;
  icons: string[];
  url?: string;
}

export interface SessionData {
  metadata: SignClientTypes.Metadata;
  accountIds: string[];
  network: string;
  topic: string;
}

export interface UserProfile {
    accountId: string;
    network: "mainnet" | "testnet";
    currency: string;
    profilePicture: {
        tokenId: string,
        serial: number,
        thumbUrl: string,
    };
    theme: {
        tokenId: string,
        metadata: string,
        themeId: string,
    };
    username: {
        tokenId: string,
        serial: number,
        name: string,
    }
}