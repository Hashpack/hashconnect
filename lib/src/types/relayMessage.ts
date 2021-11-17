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
    AccountInfo="AccountInfo"
}

export enum TransactionType {
    NFT="NFT",
    Token="Token",
    Transaction="Transaction"
}

export declare namespace MessageTypes {
    
    export interface BaseMessage {
        topic: string;
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

    export interface AccountInfo extends BaseMessage {
        accountId: string;
        network: string;
    }

    
    
    export class TransactionMetadata {
    
    }
}