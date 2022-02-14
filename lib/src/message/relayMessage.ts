import { HashConnectTypes } from "../main";

export class RelayMessage {
    
    timestamp: number;
    type: RelayMessageType;
    data: any;
    topic: string;

    constructor(timestamp: number, type: RelayMessageType, data: any, topic: string) {
        this.timestamp = timestamp;
        this.type = type;
        this.data = data;
        this.topic = topic;
    }
}

export enum RelayMessageType {
    Transaction="Transaction",
    TransactionResponse="TransactionResponse",
    ApprovePairing="ApprovePairing",
    RejectPairing="RejectPairing",
    Acknowledge="Acknowledge",
    AdditionalAccountRequest="AdditionalAccountRequest",
    AdditionalAccountResponse="AdditionalAccountResponse"
}

export declare namespace MessageTypes {
    
    export interface BaseMessage {
        topic: string;
        id?: string;
    }    

    export interface ApprovePairing extends BaseMessage {
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
        // type: TransactionType;
        byteArray: Uint8Array | string;
        metadata: TransactionMetadata;
    }

    export class TransactionMetadata {
        accountToSign: string;
        returnTransaction: boolean;
        nftPreviewUrl?: string;
    }

    export interface TransactionResponse extends BaseMessage {
        success: boolean;
        receipt?: Uint8Array | string; 
        signedTransaction?: Uint8Array | string;
        error?: string;
    }
}



// export enum TransactionType {
//     contractCall="contractCall",
//     contractCreateInstance="contractCreateInstance",
//     contractUpdateInstance="contractUpdateInstance",
//     contractDeleteInstance="contractDeleteInstance",
//     cryptoCreateAccount="cryptoCreateAccount",
//     cryptoDelete="cryptoDelete",
//     cryptoTransfer="cryptoTransfer",
//     cryptoUpdateAccount="cryptoUpdateAccount",
//     fileAppend="fileAppend",
//     fileCreate="fileCreate",
//     fileDelete="fileDelete",
//     fileUpdate="fileUpdate",
//     systemDelete="systemDelete",
//     systemUndelete="systemUndelete",
//     freeze="freeze",
//     consensusCreateTopic="consensusCreateTopic",
//     consensusUpdateTopic="consensusUpdateTopic",
//     consensusDeleteTopic="consensusDeleteTopic",
//     consensusSubmitMessage="consensusSubmitMessage",
//     tokenCreation="tokenCreation",
//     tokenFreeze="tokenFreeze",
//     tokenUnfreeze="tokenUnfreeze",
//     tokenGrantKyc="tokenGrantKyc",
//     tokenRevokeKyc="tokenRevokeKyc",
//     tokenDeletion="tokenDeletion",
//     tokenUpdate="tokenUpdate",
//     tokenMint="tokenMint",
//     tokenBurn="tokenBurn",
//     tokenWipe="tokenWipe",
//     tokenAssociate="tokenAssociate",
//     tokenDissociate="tokenDissociate",
//     token_pause="token_pause",
//     token_unpause="token_unpause",
//     scheduleDelete="scheduleDelete",
// }