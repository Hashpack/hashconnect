export class RelayMessage {
    timestamp: number;
    type: RelayMessageType;
    data: any;

    constructor(timestamp: number, type: RelayMessageType, data: any) {
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
    }
}

export enum RelayMessageType {
    Transaction="Transaction",
    Pairing="Pairing",
    RejectPairing="RejectPairing",
    Ack="Ack",
    AccountInfoRequest="AccountInfoRequest",
    AccountInfoResponse="AccountInfoResponse"
}

export enum TransactionType {
    NFT="NFT",
    Token="Token",
    Transaction="Transaction"
}

export declare namespace MessageTypes {
    
    export interface BaseMessage {
        topic: string; //todo we should move this to RelayMessage so we dont have to include it with everything
    }
    // Messages to go through the relay

    export interface Rejected extends BaseMessage {
        reason?: string;
    }

    export interface Approval extends BaseMessage { }

    export interface Ack extends BaseMessage {
        result: boolean;
    }

    export interface Transaction extends BaseMessage {
        type: TransactionType;
        byteArray: Uint8Array | string;
        metadata?: TransactionMetadata;
    }

    export interface AccountInfoRequest extends BaseMessage {
        network: string;
    }

    export interface AccountInfoResponse extends BaseMessage {
        accountId: string;
        network: string;
    }
    
    export class TransactionMetadata {
        
    }
}