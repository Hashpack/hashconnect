export enum HashConnectConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

export declare namespace HashConnectTypes {
  export interface WalletMetadata {
    name: string;
    description: string;
    icons: string[];
    url?: string;
  }
}

export declare namespace MessageTypes {
  export interface SessionData {
    metadata: HashConnectTypes.WalletMetadata;
    accountIds: string[];
    network: string;
    topic: string;
  }
}


export interface UserProfile {
    accountId: string;
    network: "mainnet" | "testnet";
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