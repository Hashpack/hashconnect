export class RelayMessage {
    timestamp: number;
    type: RelayMessageType;
    data: any;
    transaction?: MessageTypes.Transaction;

    constructor(timestamp: number, type: RelayMessageType, data: any, trans?: MessageTypes.Transaction) {
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
        this.transaction = trans;
    }
}

export enum RelayMessageType {
    Transaction="Transaction",
    Pairing="Pairing",
    RejectPairing="RejectPairing",
    Ack="Ack",
    AccountInfo="AccountInfo"
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
        transaction: Uint8Array;
        metadata?: TransactionMetadata;
    }

    export interface AccountInfo extends BaseMessage {
        accountId: string;
        network: string;
    }

    export enum TransactionType {
        NFT="NFT",
        Token="Token",
        Transaction="Transaction"
    }
    
    export class TransactionMetadata {
    
    }
}