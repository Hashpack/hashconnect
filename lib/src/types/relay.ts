import { getPublicKey, Waku, WakuMessage } from "js-waku";
import { Event } from "ts-typed-events"
import { HashConnect } from "../main";

/**
 * Relay interface
 */
export interface IRelay {

    // events
    connected: Event<any>;
    payload: Event<any>;

    /**
     * Initialize the relay
     */
    init(): void;

    /**
     * Publish a message
     * 
     * @param topic topic to publish to
     * @param message message to send
     */
    publish(topic: string, message: string | any, pubKey: string): Promise<void>;

    /**
     * Subscribe to a topic
     * 
     * @param topic topic to subscribe to
     */
    subscribe(topic: string): Promise<void>;

    /**
     * Unsubscribe from a topic
     * 
     * @param topic topic to unsubscribe from
     */
    unsubscribe(topic: string): Promise<void>;

    addDecryptionKey(privKey: string): void;
}

export class WakuRelay implements IRelay {

    private waku!: Waku;

    // Events
    connected: Event<any>;
    payload: Event<any>;
    hc: HashConnect;

    // TODO: is there a better way to do this?
    private processMessage = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => {
        if (this.hc.debug) console.log("hashconnect - emitting payload");
        this.payload.emit(wakuMessage.payload)
    }

    constructor(hc: HashConnect) {
        this.connected = new Event<any>();
        this.payload = new Event<any>();
        this.hc = hc;
    }

    async init(): Promise<void> {
        // TODO error flow
        this.waku = await Waku.create({ bootstrap: { default: true } });

        // const nodes = await getBootstrapNodes();
        // await Promise.all(nodes.map((addr) => {
        //     this.waku.dial(addr)
        // }));

        // if (this.hc.debug) console.log("hashconnect - bootstrapped nodes", nodes);
        if (this.hc.debug) console.log("hashconnect - Waiting for peer...");
        await this.waku.waitForRemotePeer();
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (this.hc.debug) console.log("hashconnect - connected");
    }

    async subscribe(topic: string): Promise<void> {
        if (this.hc.debug) console.log("hashconnect - Subscribing to " + topic);
        this.waku.relay.addObserver(this.processMessage, [topic])
    }

    addDecryptionKey(privKey: string) {
        if (this.hc.debug) console.log("hashconnect - Adding decryption key \n PrivKey: " + privKey + "\n pubKey: " + Buffer.from(getPublicKey(Buffer.from(privKey, 'base64'))).toString('base64'));
        // this.waku.addDecryptionKey(Buffer.from(privKey, 'base64'))
    }

    async unsubscribe(topic: string): Promise<void> {
        if (this.hc.debug) console.log("hashconnect - Unsubscribing to " + topic)
        this.waku.relay.unsubscribe(topic);
    }

    // TODO: determine appropriate types for sending messages, string should suffice for now
    async publish(topic: string, message: any, pubKey: string): Promise<void> {
        const wakuMessage = await WakuMessage.fromBytes(message, topic);

        if (this.hc.debug) console.log("hashconnect - Sending payload to " + topic, "\n encrypted with " + pubKey);
        await this.waku.relay.send(wakuMessage);
    }
}