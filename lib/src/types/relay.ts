import { Waku, WakuMessage, getBootstrapNodes } from "js-waku";
import { Event } from "ts-typed-events"

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
    publish(topic: string, message: string | any, pubKey: Uint8Array): Promise<void>;

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

    addDecryptionKey(privKey: Uint8Array): void;
}

export class WakuRelay implements IRelay {

    private waku!: Waku;
    
    // Events
    connected: Event<any>;
    payload: Event<any>;

    // TODO: is there a better way to do this?
    private processMessage = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => {
        console.log("emitting payload");
        this.payload.emit(wakuMessage.payload)
    }
    
    constructor() {
        this.connected = new Event<any>();
        this.payload = new Event<any>();
    }

    async init(): Promise<void> {
        // TODO error flow
        this.waku = await Waku.create({ bootstrap: true });

        const nodes = await getBootstrapNodes();
        await Promise.all(nodes.map((addr) => this.waku.dial(addr)));
    
        console.log("Waiting for peer...");
        await this.waku.waitForConnectedPeer()

        console.log("connected");
    }

    async subscribe(topic: string): Promise<void> {
        this.waku.relay.addObserver(this.processMessage, [topic])
    }

    addDecryptionKey(privKey: Uint8Array){
        this.waku.addDecryptionKey(privKey)
    }

    async unsubscribe(topic: string): Promise<void> {
        this.waku.relay.unsubscribe(topic);
    }

    // TODO: determine appropriate types for sending messages, string should suffice for now
    async publish(topic: string, message: any, pubKey: Uint8Array): Promise<void> {
          const wakuMessage = await WakuMessage.fromBytes(message, topic, { encPublicKey: pubKey });
        
          console.log("Sending payload");
          await this.waku.relay.send(wakuMessage);
    }
}