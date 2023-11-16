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
