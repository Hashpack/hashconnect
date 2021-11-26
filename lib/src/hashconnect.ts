import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./types/relay";
import { PairingData } from "./types";
import { MessageUtil, MessageHandler, MessageTypes, RelayMessage, RelayMessageType } from "./message"
import { HashConnectTypes, IHashConnect } from "./types/hashconnect";

/**
 * Main interface with hashpack
 */
export class HashConnect implements IHashConnect {

    relay: IRelay;

    // events
    pairingEvent: Event<MessageTypes.ApprovePairing>;
    transactionEvent: Event<MessageTypes.Transaction>;
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    // messages util
    messageParser: MessageHandler;
    messages: MessageUtil;
    private metadata!:  HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;

    constructor() {
        this.relay = new WakuRelay();
        
        this.pairingEvent = new Event<MessageTypes.ApprovePairing>();
        this.transactionEvent = new Event<MessageTypes.Transaction>();
        this.accountInfoRequestEvent = new Event<MessageTypes.AccountInfoRequest>();
        this.accountInfoResponseEvent = new Event<MessageTypes.AccountInfoResponse>();
        
        this.messages = new MessageUtil();
        this.messageParser = new MessageHandler();

        this.setupEvents();
    }

    async init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<void> {
        this.metadata = metadata;
        this.metadata.url = window.location.origin;

        await this.relay.init();
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
    async sendTransaction(topic: string, transaction: MessageTypes.Transaction): Promise<void> {
        transaction.byteArray = Buffer.from(transaction.byteArray).toString("base64");
        
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.Transaction, transaction);
        await this.relay.publish(topic, msg);
    }

    async requestAccountInfo(topic: string, message: MessageTypes.AccountInfoRequest) {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoRequest, message);

        await this.relay.publish(topic, msg);
    }

    async sendAccountInfo(topic: string, message: MessageTypes.AccountInfoResponse) {
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.AccountInfoResponse, message);

        await this.relay.publish(topic, msg);
    }

    async connect(topic?: string, metadata?: HashConnectTypes.AppMetadata): Promise<HashConnectTypes.ConnectionState> {
        // If the topic is not valid, then create a new topic id
        if(!topic) {
            topic = this.messages.createRandomTopicId();
        }

        if(!metadata) {
            console.log("metadata unused yet");
        }
        
        // Create state for client application
        // TODO: peer/self public keys and encryption
        let state: HashConnectTypes.ConnectionState = {
            topic: topic,
            expires: 0,
            extra: "some extra data"
        }

        await this.relay.subscribe(state.topic);

        return state;        
    }

    async pair(topic: string, message: MessageTypes.ApprovePairing) {
        
        // UUID passed into the application responding to the pairing
        // topic is just the topic for now
        console.log(topic);

        // Subscribe to the proposed topic to begin pairing
        await this.relay.subscribe(topic);

        // create protobuf message
        const payload = this.messages.prepareSimpleMessage(RelayMessageType.ApprovePairing, message)
        this.relay.publish(topic, payload)
    }

    async reject(topic: string, reason?: string) {
        let reject: MessageTypes.Rejected = {
            reason: reason,
            topic: topic
        }
        
        // create protobuf message
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.RejectPairing, reject)
        console.log("topic: "+topic);
        
        // Publish the rejection
        await this.relay.publish(topic, msg);
    }

    async ack(topic: string) {
        const ack: MessageTypes.Ack = {
            result: true,
            topic: topic
        }
        const ackPayload = this.messages.prepareSimpleMessage(RelayMessageType.Ack, ack);
        await this.relay.publish(topic, ackPayload)
    }  
    

    /**
     * Helpers
     */

    generatePairingString(topic: string) {
        let data: PairingData = {
            metadata: this.metadata,
            topic: topic
        }

        let pairingString: string = Buffer.from(JSON.stringify(data)).toString("base64")

        return pairingString;
    }

    decodePairingString(pairingString: string) {
        let json_string: string = Buffer.from(pairingString,'base64').toString();
        let data: PairingData = JSON.parse(json_string);

        return data;
    }

    /**
     * Local wallet stuff
     */

    findLocalWallets() {
        console.log("Finding local wallets");
        window.addEventListener("message", (event) => {
            if (event.data.type && (event.data.type == "hashconnect-query-extension-response")) {
                console.log("Local wallet metadata recieved", event.data);
            }
        }, false);

        setTimeout(() => {
            window.postMessage({ type: "hashconnect-query-extension" }, "*");
        }, 50);
    }

}