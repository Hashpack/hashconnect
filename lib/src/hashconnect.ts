import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./types/relay";
import { MessageUtil, MessageTypes, RelayMessage, RelayMessageType, Transaction } from "./types";
import { HashConnectTypes, IHashConnect } from "./types/hashconnect";

/**
 * Main interface with hashpack
 */
export class HashConnect implements IHashConnect {

    relay: IRelay;

    // events
    pairingEvent: Event<any>;
    transactionEvent: Event<Transaction>;

    // messages util
    messages: MessageUtil;

    constructor() {
        this.relay = new WakuRelay();
        this.pairingEvent = new Event<any>();
        this.transactionEvent = new Event<Transaction>();
        this.messages = new MessageUtil();
        this.setupEvents();
    }

    async sendTransaction(topic: string, transaction: Transaction): Promise<void> {
        const meta: MessageTypes.Transaction = {
            topic: topic,
            type: transaction.type
        }
        const msg = this.messages.prepareSimpleMessage(JSON.stringify(meta), RelayMessageType.Transaction, transaction);
        await this.relay.publish(topic, msg);
    }

    async init(): Promise<void> {
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
        const payload = this.messages.prepareSimpleMessage(JSON.stringify(approval), RelayMessageType.Pairing)
        this.relay.publish(pairingStr, payload)
    }

    async reject(topic: string, reason?: string) {
        let reject: MessageTypes.Rejected = {
            topic: topic,
            reason: reason
        }
        
        // create protobuf message
        const msg = this.messages.prepareSimpleMessage(JSON.stringify(reject), RelayMessageType.RejectPairing)
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

            const message: RelayMessage = this.messages.decode(
                payload
            );
            console.log(`Message Received: ${message.data}, of type ${message.type}, sent at ${message.timestamp.toString()}`);
            
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
                    await this.ack(jsonMsg.topic);
                    // TODO: error checking
                    // If this is a transaction type it should contain a valid transaction
                    this.transactionEvent.emit(message.transaction!)
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
        const ackPayload = this.messages.prepareSimpleMessage(JSON.stringify(ack), RelayMessageType.Ack);
        await this.relay.publish(topic, ackPayload)
    }
}