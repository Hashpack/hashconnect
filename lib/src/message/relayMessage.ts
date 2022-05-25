import { HashConnectTypes } from "../main";

export class RelayMessage {
    
    timestamp: number;
    type: RelayMessageType;
    data: any;
    topic: string;
    origin: string;

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
    AdditionalAccountResponse="AdditionalAccountResponse",
    AuthenticationRequest="AuthenticationRequest",
    AuthenticationResponse="AuthenticationResponse"
}

export declare namespace MessageTypes {
    
    export interface BaseMessage {
        topic: string;
        id?: string;
        origin?: string;
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
        byteArray: Uint8Array | string;
        metadata: TransactionMetadata;
    }

    export class TransactionMetadata {
        accountToSign: string;
        returnTransaction: boolean;
        nftPreviewUrl?: string;
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
            url: string,
            data: any
        }
    }

    export interface AuthenticationResponse extends BaseMessage {
        success: boolean;
        error?: string;
        userSignature?: Uint8Array | string;
        signedPayload?: {
            serverSignature: Uint8Array | string,
            originalPayload: {
                url: string,
                data: any
            }
        }
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