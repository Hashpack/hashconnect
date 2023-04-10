import { LedgerId } from "@hashgraph/sdk";

export enum HashConnectConnectionState {
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Paired = "Paired",
}

export declare namespace HashConnectTypes {
  export interface AppMetadata {
    name: string;
    description: string;
    icons: string[];
    url?: string;
  }

  export interface WalletMetadata {
    name: string;
    description: string;
    icons: string[];
    url?: string;
  }

  export interface InitilizationData {
    topic: string;
    pairingString: string;
    encryptionKey: string;
    savedPairings: SavedPairingData[];
  }

  export interface PairingStringData {
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
    topic: string;
    network: string;
    multiAccount: boolean;
    origin?: string;
  }

  export interface SavedPairingData {
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
    topic: string;
    encryptionKey?: string;
    network: string;
    origin?: string;
    accountIds: string[];
    lastUsed: number;
  }
}

export declare namespace MessageTypes {
  export interface BaseMessage {
    topic: string;
    id?: string;
    origin?: string;
  }

  export interface PairingProposal {
    proposalId: number;
    ledgerId: LedgerId;
    metadata: HashConnectTypes.AppMetadata;
  }

  //todo: this is kind of redundant, should only be saved pairing data?
  export interface ApprovePairing extends BaseMessage {
    pairingData?: HashConnectTypes.SavedPairingData;
    metadata: HashConnectTypes.WalletMetadata;
    accountIds: string[];
    network: string;
  }

  export interface Acknowledge extends BaseMessage {
    result: boolean;
    msg_id: string;
  }

  export interface Rejected extends BaseMessage {
    reason?: string;
    msg_id: string;
  }

  export interface AdditionalAccountRequest extends BaseMessage {
    network: string;
    multiAccount: boolean;
  }

  export interface AdditionalAccountResponse extends BaseMessage {
    accountIds: string[];
    network: string;
  }

  export interface Transaction extends BaseMessage {
    byteArray: Uint8Array | string;
    metadata: TransactionMetadata;
  }

  export class TransactionMetadata {
    accountToSign: string;
    returnTransaction: boolean;
    hideNft?: boolean;
    getRecord?: boolean;
  }

  export interface TransactionResponse extends BaseMessage {
    success: boolean;
    response?: object | string;
    receipt?: Uint8Array | string;
    record?: Uint8Array | string;
    signedTransaction?: Uint8Array | string;
    error?: string;
  }

  export interface AuthenticationRequest extends BaseMessage {
    accountToSign: string;
    serverSigningAccount: string;
    serverSignature: Uint8Array | string;
    payload: {
      url: string;
      data: any;
    };
  }

  export interface AuthenticationResponse extends BaseMessage {
    success: boolean;
    error?: string;
    userSignature?: Uint8Array | string;
    signedPayload?: {
      serverSignature: Uint8Array | string;
      originalPayload: {
        url: string;
        data: any;
      };
    };
  }

  export interface SigningRequest extends BaseMessage {
    accountToSign: string;
    payload: string | object;
  }

  export interface SigningResponse extends BaseMessage {
    success: boolean;
    error?: string;
    userSignature?: Uint8Array | string;
    signedPayload?: string | object;
  }
}
