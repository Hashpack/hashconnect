import { IRelay } from "./relay";
import { Event } from "ts-typed-events";
import { MessageTypes, MessageUtil } from "../message";
import { MessageHandler } from "../message/message-handler";
import { PairingData } from ".";

export interface IHashConnect {
    
    /** Relay */
    relay: IRelay;

    /** Event emitters */
    foundExtensionEvent: Event<HashConnectTypes.WalletMetadata>;
    pairingEvent: Event<MessageTypes.ApprovePairing>;
    transactionEvent: Event<MessageTypes.Transaction>;
    transactionResponseEvent: Event<MessageTypes.TransactionResponse>;
    acknowledgeMessageEvent: Event<MessageTypes.Acknowledge>;
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    /** Messages util for protobufs */
    messages: MessageUtil;

    /** Message event parser */
    messageParser: MessageHandler;
    publicKeys: Record<string, Uint8Array>;

    /**
     * Initialize the client
     */
     init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata, privKey?: Uint8Array): Promise<HashConnectTypes.InitilizationData>

    /**
     * Connect to a topic and produce a topic ID for a peer
     * 
     * @param topic optional topic
     * @param metadata optional app metadata
     * 
     * @returns ConnectionState containing with topic and metadata
     */
    connect(topic?: string, privKey?: Uint8Array): Promise<HashConnectTypes.ConnectionState>;

    /**
     * Pair with a peer
     * 
     * @param pairingStr string containing topic and meta data
     */
    pair(pairingData: PairingData, accounts: string[]): Promise<HashConnectTypes.ConnectionState>;

    /**
     * Send a transaction
     * 
     * @param topic topic to publish to
     * @param transaction transaction to send
     */
    sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<string>;
    
    requestAccountInfo(topic: string, message: MessageTypes.AccountInfoRequest): Promise<string>;
    
    sendAccountInfo(topic: string, message: MessageTypes.AccountInfoResponse): Promise<string>;
    
    sendTransactionResponse(topic: string, message: MessageTypes.TransactionResponse): Promise<string>;
    
    reject(topic: string, reason: string, msg_id: string): Promise<void>;
    
    /**
     * Send an acknowledgement of receipt
     * 
     * @param topic topic to publish to
     */
    acknowledge(topic: string, pubKey: Uint8Array, mgs_id: string): Promise<void>


    
}

export declare namespace HashConnectTypes {    
    
    export interface AppMetadata {
        name: string;
        description: string;
        url?: string; //insecure, lib needs to set this or can be spoofed
        icon: string;
        publicKey?: string | Uint8Array;
    }

    export interface WalletMetadata {
        name: string;
        description: string;
        url?: string; //insecure, lib needs to set this or can be spoofed
        icon: string;
        publicKey?: string;
    }

    export interface InitilizationData {
        privKey: Uint8Array;
    }

    export interface ConnectionState {
        topic: string;
        expires: number;
    }
}