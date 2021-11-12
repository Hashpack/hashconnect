import { Event } from "ts-typed-events";
import { IRelay, WakuRelay } from "./relay";
import { Pairing, RelayMessage, RelayMessageType, Transaction } from "./types";

const protons = require('protons');

/**
 * Main interface with hashpack
 */
export class HashConnect {
    /** Relay */
    private relay: IRelay;

    pairingEvent: Event<any>;
    transactionEvent: Event<Transaction>;

    // TODO: move this 
    private proto = protons(`
    message SimpleMessage {
      uint64 timestamp = 1;
      string type = 2;
      string data = 3;
    }
    `);
    // TODO: change this to be random hex/uuid
    private topic = "/my-first-pairing/pairing";

    constructor() {
        this.relay = new WakuRelay();
        this.pairingEvent = new Event<any>();
        this.transactionEvent = new Event<Transaction>();
        this.setupEvents();
    }

    async connect() {
        await this.relay.init();
    }

    async proposePairing() {
        // First step in pairing is subscribing to a topic, this would then be shared with the wallet
        // TODO: this will be a random hex string or UUID

        // this subscribes to the specified topic with the function defined in relay
        await this.relay.subscribe(this.topic);
        console.log("pairing proposed");
        this.pairingEvent.emit("The pairing has been proposed")
    }

    // TODO: URI/qrcode/some kind of data to pair with, this is the out of band part
    // TODO: break out into approve/reject
    // this is called by the responder/wallet 
    async pair(uri: string) {
        // TODO: this will be a random hex string or UUID 
        console.log("subscribing to paired topic " + uri);
        await this.relay.subscribe(this.topic)
        // await new Promise(f => setTimeout(f, 1000))
        // for now use an arbitrary topic set here
        const approval: Pairing.Approval = {
            topic: this.topic
        }

        const payload = this.prepareMessage(JSON.stringify(approval), "approval")
        await this.relay.sendMessage(this.topic, payload)
    }

    async reject() {
        console.log("pairing rejected");
        const rejected: Pairing.Rejected = {
            topic: this.topic,
            reason: "We are rejecting you for various reasons kkthxbai"
        }
        const payload = this.prepareMessage(JSON.stringify(rejected), "rejected");
        await this.relay.sendMessage(this.topic, payload)
        this.relay.unsubscribe(this.topic)
    }

    /**
     * Set up event connections
     */
    private setupEvents() {
        // THis will listen for a payload emission from the relay
        this.relay.payload.on(async (payload) => {
            console.log("hashconnect: payload received");
            if (!payload) return;

            const message: RelayMessage = this.proto.SimpleMessage.decode(
                payload
            );
            debugger
            console.log(`Message Received: ${message.data}, of type ${message.type}, sent at ${message.timestamp.toString()}`);

            // TODO: move and refactor this to be more elegant in terms of event handling
            switch (message.type) {
                case RelayMessageType.Pairing:
                    console.log("approved", message);
                    this.pairingEvent.emit("pairing approved!")
                    await this.ack()
                    break;
                // case "ack":
                //     console.log("acknowledged");
                //     break;
                // case "rejected":
                //     console.log("rejected");
                //     this.pairingEvent.emit("rejected");
                //     break;
                case RelayMessageType.Transaction:
                    console.log("Got transaction", message)
                    break;
                default:
                    break;
            }
            console.log(message)

        })
    }

    // FOR DEBUGGING
    async send(msg: string) {
        const ack: Pairing.Approval = {
            topic: msg
        }
        this.relay.sendMessage(this.topic, this.prepareMessage(JSON.stringify(ack), RelayMessageType.Transaction));
    }

    // Move to a pairing/session construct
    private async ack() {
        const ack: Pairing.Acknowledgement = {
            result: true
        }
        const ackPayload = this.prepareMessage(JSON.stringify(ack), RelayMessageType.Pairing);
        await this.relay.sendMessage(this.topic, ackPayload)
    }

    /**
     * Compiles the simple protobuf with the specified paramaters 
     * 
     * @param message message to prepare
     * @param type type of message 
     * @returns protobuf message
     */
    private prepareMessage(data: any, type: RelayMessageType) {
        return this.proto.SimpleMessage.encode(new RelayMessage(
            Date.now(),
            type,
            data
        ));
    }
}