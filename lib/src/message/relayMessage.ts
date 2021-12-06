import { HashConnectTypes } from "../main";

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
    ApprovePairing="ApprovePairing",
    RejectPairing="RejectPairing",
    Acknowledge="Acknowledge",
    AccountInfoRequest="AccountInfoRequest",
    AccountInfoResponse="AccountInfoResponse"
}

export declare namespace MessageTypes {
    
    export interface BaseMessage {
        topic: string;
        id?: string;
    }    

    export interface ApprovePairing extends BaseMessage {
        metadata: HashConnectTypes.WalletMetadata,
        accountIds: string[]
    }

    export interface Acknowledge extends BaseMessage {
        result: boolean;
        msg_id: string;
    }

    export interface Rejected extends BaseMessage {
        reason?: string;
        msg_id: string;
    }

    

    export interface AccountInfoRequest extends BaseMessage {
        network: string;
    }

    export interface AccountInfoResponse extends BaseMessage {
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

    export class TransactionResponse {
        success: boolean;
        signedTransaction: Uint8Array | string;
        error: string;
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