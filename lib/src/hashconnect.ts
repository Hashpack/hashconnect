import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./types/relay";
import { PairingData } from "./types";
import { MessageUtil, MessageHandler, MessageTypes, RelayMessage, RelayMessageType } from "./message"
import { HashConnectTypes, IHashConnect } from "./types/hashconnect";
import { generateSymmetricKey } from 'js-waku';

/**
 * Main interface with hashpack
 */
export class HashConnect implements IHashConnect {

    relay: IRelay;

    // events
    foundExtensionEvent: Event<HashConnectTypes.WalletMetadata>;
    pairingEvent: Event<MessageTypes.ApprovePairing>;
    transactionEvent: Event<MessageTypes.Transaction>;
    transactionResponseEvent: Event<MessageTypes.TransactionResponse>;
    acknowledgeMessageEvent: Event<MessageTypes.Acknowledge>;
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    // messages util
    messageParser: MessageHandler;
    messages: MessageUtil;
    private metadata!:  HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
    encryptionKeys: Record<string, Uint8Array> = {};

    constructor() {
        this.relay = new WakuRelay();
        
        this.foundExtensionEvent = new Event<HashConnectTypes.WalletMetadata>();
        this.pairingEvent = new Event<MessageTypes.ApprovePairing>();
        this.transactionEvent = new Event<MessageTypes.Transaction>();
        this.transactionResponseEvent = new Event<MessageTypes.TransactionResponse>();
        this.acknowledgeMessageEvent = new Event<MessageTypes.Acknowledge>();
        this.accountInfoRequestEvent = new Event<MessageTypes.AccountInfoRequest>();
        this.accountInfoResponseEvent = new Event<MessageTypes.AccountInfoResponse>();
        
        this.messages = new MessageUtil();
        this.messageParser = new MessageHandler();

        this.setupEvents();
    }

    async init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<void> {
        this.metadata = metadata;
    
        if(window)
            this.metadata.url = window.location.origin;

        await this.relay.init();
    }


    async connect(topic?: string, encKey?: Uint8Array): Promise<HashConnectTypes.ConnectionState> {
        // If the topic is not valid, then create a new topic id
        if(!topic) {
            topic = this.messages.createRandomTopicId();
        }

        if(!encKey) {
            encKey = this.generateEncryptionKey();
        }

        this.encryptionKeys[topic] = encKey;

        // Create state for client application
        // TODO: peer/self public keys and encryption
        let state: HashConnectTypes.ConnectionState = {
            topic: topic,
            expires: 0,
            encKey: encKey
        }

        await this.relay.subscribe(state.topic, state.encKey);

        return state;
    }

    /**
     * Set up event connections
     */
     private setupEvents() {
        // This will listen for a payload emission from the relay
        this.relay.payload.on(async (payload) => {
            console.log("hashconnect: payload received");
            if (!payload) return;

            const message: RelayMessage = this.messages.decode(payload);

            await this.messageParser.onPayload(message, this);
        })
    }


    /**
     * Send functions
     */
    async sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<string> {
        transaction.byteArray = Buffer.from(transaction.byteArray).toString("base64");
        
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.Transaction, transaction);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);

        return msg.id;
    }

    async requestAccountInfo(topic: string, message: MessageTypes.AccountInfoRequest): Promise<string> {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoRequest, message);

        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);

        return msg.id;
    }

    async sendAccountInfo(topic: string, message: MessageTypes.AccountInfoResponse): Promise<string> {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoResponse, message);

        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);

        return msg.id;
    }

    async sendTransactionResponse(topic: string, message: MessageTypes.TransactionResponse): Promise<string> {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.TransactionResponse, message);

        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);

        return msg.id;
    }

    async pair(topic: string, message: MessageTypes.ApprovePairing, encKey: Uint8Array) {
        
        // UUID passed into the application responding to the pairing
        // topic is just the topic for now
        console.log(topic);

        // Subscribe to the proposed topic to begin pairing
        await this.relay.subscribe(topic, encKey);

        // create protobuf message
        const payload = this.messages.prepareSimpleMessage(RelayMessageType.ApprovePairing, message)
        this.relay.publish(topic, payload, encKey)
    }

    async reject(topic: string, reason: string, msg_id: string) {
        let reject: MessageTypes.Rejected = {
            reason: reason,
            topic: topic,
            msg_id: msg_id
        }
        
        // create protobuf message
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.RejectPairing, reject)
        console.log("topic: "+topic);
        
        // Publish the rejection
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
    }

    async acknowledge(topic: string, encKey: Uint8Array, msg_id: string) {
        const ack: MessageTypes.Acknowledge = {
            result: true,
            topic: topic,
            msg_id: msg_id
        }
        console.log("send acknowledge", ack)
        const ackPayload = this.messages.prepareSimpleMessage(RelayMessageType.Acknowledge, ack);
        await this.relay.publish(topic, ackPayload, encKey)
    }  
    

    /**
     * Helpers
     */

    generatePairingString(topic: string, encKey: Uint8Array) {
        let data: PairingData = {
            metadata: this.metadata,
            topic: topic,
            encKey: Buffer.from(encKey).toString('base64')
        }
        
        let pairingString: string = Buffer.from(JSON.stringify(data)).toString("base64")

        return pairingString;
    }

    decodePairingString(pairingString: string) {
        let json_string: string = Buffer.from(pairingString,'base64').toString();
        let data: PairingData = JSON.parse(json_string);
        data.encKey = Buffer.from(data.encKey as string, 'base64');

        return data;
    }

    private generateEncryptionKey(): Uint8Array {
        let key = generateSymmetricKey();
        console.log(key);
        return key;
    }

    /**
     * Local wallet stuff
     */

    findLocalWallets() {
        console.log("Finding local wallets");
        window.addEventListener("message", (event) => {
            if (event.data.type && (event.data.type == "hashconnect-query-extension-response")) {
                console.log("Local wallet metadata recieved", event.data);
                if(event.data.metadata)
                    this.foundExtensionEvent.emit(event.data.metadata);
            }
        }, false);

        setTimeout(() => {
            window.postMessage({ type: "hashconnect-query-extension" }, "*");
        }, 50);
    }

    connectToLocalWallet(pairingString: string) {
        console.log("Connecting to local wallet")

        window.postMessage({ type:"hashconnect-connect-extension", pairingString: pairingString }, "*")
    }

}