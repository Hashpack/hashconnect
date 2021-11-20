import { IRelay } from "./relay";
import { Event } from "ts-typed-events";
import { MessageTypes, MessageUtil } from "../message";
import { MessageHandler } from "../message/message-handler";

export interface IHashConnect {
    
    /** Relay */
    relay: IRelay;

    /** Pairing event emitter */
    pairingEvent: Event<any>;
    
    /** Transaction event emitter */
    transactionEvent: Event<MessageTypes.Transaction>;
    
    /** Account info request event emitter */
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;

    /** Account info response event emitter */
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    /** Messages util for protobufs */
    messages: MessageUtil;

    /** Message event parser */
    messageParser: MessageHandler;

    /**
     * Connect to a topic and produce a topic ID for a peer
     * 
     * @param topic optional topic
     * @param metadata optional app metadata
     * 
     * @returns ConnectionState containing with topic and metadata
     */
    connect(topic?: string, metadata?: HashConnectTypes.AppMetadata): Promise<HashConnectTypes.ConnectionState>;

    /**
     * Pair with a peer
     * 
     * @param pairingStr string containing topic and meta data
     */
    pair(pairingStr: string): Promise<void>;

    /**
     * Reject a pairing request
     * 
     * @param topic topic to publish to
     * @param reason optional rejection reason
     */
    reject(topic: string, reason?: string): Promise<void>;

    /**
     * Send a transaction
     * 
     * @param topic topic to publish to
     * @param transaction transaction to send
     */
    sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<void>;

    /**
     * Send an acknowledgement of receipt
     * 
     * @param topic topic to publish to
     */
    ack(topic: string): Promise<void>

    /**
     * Initialize the client
     */
    init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<void>
}

export declare namespace HashConnectTypes {    
    
    export interface AppMetadata {
        name: string;
        description: string;
        url?: string; //insecure, lib needs to set this or can be spoofed
        icon: string;
    }

    export interface WalletMetadata {
        name: string;
        description: string;
        url?: string; //insecure, lib needs to set this or can be spoofed
        icon: string;
    }

    export interface ConnectionState {
        topic: string;
        expires: number;
        extra?: any;
    }
}