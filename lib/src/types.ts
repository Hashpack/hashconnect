import { SignClientTypes } from "@walletconnect/types";

export enum HashConnectConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

export interface DappMetadata {
  name: string;
  description: string;
  icons: string[];
  url: string;
}

export interface SessionData {
  metadata: SignClientTypes.Metadata;
  accountIds: string[];
  network: string;
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
    username: {
        tokenId: string,
        serial: number,
        name: string,
    }
}