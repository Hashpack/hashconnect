import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./types/relay";
import { MessageUtil, MessageTypes, RelayMessage, RelayMessageType } from "./types";
import { HashConnectTypes, IHashConnect } from "./types/hashconnect";

/**
 * Main interface with hashpack
 */
export class HashConnect implements IHashConnect {

    relay: IRelay;

    // events
    pairingEvent: Event<any>;
    transactionEvent: Event<MessageTypes.Transaction>;
    accountInfoRequestEvent: Event<MessageTypes.AccountInfoRequest>;
    accountInfoResponseEvent: Event<MessageTypes.AccountInfoResponse>;

    // messages util
    messages: MessageUtil;
    metadata!:  HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;

    constructor() {
        this.relay = new WakuRelay();
        
        this.pairingEvent = new Event<any>();
        this.transactionEvent = new Event<MessageTypes.Transaction>();
        this.accountInfoRequestEvent = new Event<MessageTypes.AccountInfoRequest>();
        this.accountInfoResponseEvent = new Event<MessageTypes.AccountInfoResponse>();
        
        this.messages = new MessageUtil();

        this.setupEvents();
    }

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

    async init(metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata): Promise<void> {
        this.metadata = metadata;
        await this.relay.init();
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

    // TODO: URI/qrcode/some kind of data to pair with, this is the out of band part
    async pair(pairingStr: string) {
        
        // UUID passed into the application responding to the pairing
        // pairingstr is just the topic for now
        console.log(pairingStr);

        // Subscribe to the proposed topic to begin pairing
        await this.relay.subscribe(pairingStr);

        const approval: MessageTypes.Approval = {
            topic: pairingStr
        }

        // create protobuf message
        const payload = this.messages.prepareSimpleMessage(RelayMessageType.Pairing, approval)
        this.relay.publish(pairingStr, payload)
    }

    async reject(topic: string, reason?: string) {
        let reject: MessageTypes.Rejected = {
            topic: topic,
            reason: reason
        }
        
        // create protobuf message
        const msg = this.messages.prepareSimpleMessage(RelayMessageType.RejectPairing, reject)
        console.log("topic: "+topic);
        
        // Publish the rejection
        await this.relay.publish(topic, msg);
        
        // Unsubscribe
        await this.relay.unsubscribe(topic);

        this.pairingEvent.emit("Pairing rejected");
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

            console.log(`Message Received of type ${message.type}, sent at ${message.timestamp.toString()}`, message.data);
            
            // Should always have a topic
            const jsonMsg = JSON.parse(message.data);
            if(!jsonMsg['topic']) {
                console.error("no topic in json data");
            }

            // TODO: move and refactor this to be more elegant in terms of event handling
            switch (message.type) {
                case RelayMessageType.Pairing:
                    // TODO: differentiate approve/reject
                    console.log("approved", message.data);
                
                    this.pairingEvent.emit("pairing approved!")
                    await this.ack(jsonMsg.topic)
                break;
                case RelayMessageType.Ack:
                    console.log("acknowledged");
                break;
                case RelayMessageType.Transaction:
                    console.log("Got transaction", message)
                    
                    let transaction_data: MessageTypes.Transaction = JSON.parse(message.data);
                    transaction_data.byteArray = new Uint8Array(Buffer.from(transaction_data.byteArray as string,'base64'));
                    
                    this.transactionEvent.emit(transaction_data);
                break;
                case RelayMessageType.AccountInfoRequest:
                    console.log("Got account info request", message);

                    let request_data: MessageTypes.AccountInfoRequest = JSON.parse(message.data);

                    this.accountInfoRequestEvent.emit(request_data);
                break;
                case RelayMessageType.AccountInfoResponse:
                    console.log("Got account info response", message);

                    let response_data: MessageTypes.AccountInfoResponse = JSON.parse(message.data);

                    this.accountInfoResponseEvent.emit(response_data);
                break;
                default:
                    break;
            }
        })
    }
    
    /**
     * Send an acknowledgement of receipt
     * 
     * @param topic topic to publish to
     */
    private async ack(topic: string) {
        const ack: MessageTypes.Ack = {
            topic: topic,
            result: true
        }
        const ackPayload = this.messages.prepareSimpleMessage(RelayMessageType.Ack, ack);
        await this.relay.publish(topic, ackPayload)
    }
}