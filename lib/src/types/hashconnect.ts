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
    publicKeys: Record<string, string>;
    
    /**
     * Initialize the client
     */
     init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata, privKey?: string): Promise<HashConnectTypes.InitilizationData>

    /**
     * Connect to a topic and produce a topic ID for a peer
     * 
     * @param topic optional topic
     * @param metadata optional app metadata
     * 
     * @returns ConnectionState containing with topic and metadata
     */
    connect(topic?: string, metadataToConnect?: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<HashConnectTypes.ConnectionState>;
    
    /**
     * Pair with a peer
     * 
     * @param pairingStr string containing topic and meta data
     */
    pair(pairingData: PairingData, accounts: string[], network: string): Promise<HashConnectTypes.ConnectionState>;

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
    acknowledge(topic: string, pubKey: string, mgs_id: string): Promise<void>

    /**
     * Generate a pairing string
     * 
     * @param state the state object from .connect()
     * @param network either 'testnet' or 'mainnet'
     */
    generatePairingString(state: HashConnectTypes.ConnectionState, network: string): string;
}

export declare namespace HashConnectTypes {    
    
    export interface AppMetadata {
        name: string;
        description: string;
        url?: string;
        icon: string;
        publicKey?: string;
    }

    export interface WalletMetadata {
        name: string;
        description: string;
        url?: string;
        icon: string;
        publicKey?: string;
    }

    export interface InitilizationData {
        privKey: string;
    }

    export interface ConnectionState {
        topic: string;
        expires: number;
    }
}