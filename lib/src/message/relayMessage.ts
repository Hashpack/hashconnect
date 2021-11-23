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
    contractCall="contractCall",
    contractCreateInstance="contractCreateInstance",
    contractUpdateInstance="contractUpdateInstance",
    contractDeleteInstance="contractDeleteInstance",
    cryptoCreateAccount="cryptoCreateAccount",
    cryptoDelete="cryptoDelete",
    cryptoTransfer="cryptoTransfer",
    cryptoUpdateAccount="cryptoUpdateAccount",
    fileAppend="fileAppend",
    fileCreate="fileCreate",
    fileDelete="fileDelete",
    fileUpdate="fileUpdate",
    systemDelete="systemDelete",
    systemUndelete="systemUndelete",
    freeze="freeze",
    consensusCreateTopic="consensusCreateTopic",
    consensusUpdateTopic="consensusUpdateTopic",
    consensusDeleteTopic="consensusDeleteTopic",
    consensusSubmitMessage="consensusSubmitMessage",
    tokenCreation="tokenCreation",
    tokenFreeze="tokenFreeze",
    tokenUnfreeze="tokenUnfreeze",
    tokenGrantKyc="tokenGrantKyc",
    tokenRevokeKyc="tokenRevokeKyc",
    tokenDeletion="tokenDeletion",
    tokenUpdate="tokenUpdate",
    tokenMint="tokenMint",
    tokenBurn="tokenBurn",
    tokenWipe="tokenWipe",
    tokenAssociate="tokenAssociate",
    tokenDissociate="tokenDissociate",
    token_pause="token_pause",
    token_unpause="token_unpause",
    scheduleDelete="scheduleDelete",
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