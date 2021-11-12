import { Waku, WakuMessage, getBootstrapNodes } from "js-waku";
import { IRelayEvents } from "./events";
import { Event } from "ts-typed-events"
import { RelayMessage } from "./types";

/**
 * Relay interface
 */
export interface IRelay extends IRelayEvents {

    /**
     * Initialize the relay
     */
    init(): void;

    /**
     * Publish a message
     * 
     * @patam topic topic to publish to
     * @param message message to send
     */
    sendMessage(topic: string, message: string | any): Promise<void>;

    subscribe(topic: string): Promise<void>;
    unsubscribe(topic: string): Promise<void>;
}

export class WakuRelay implements IRelay {

    private waku!: Waku;
    connected: Event<any>;
    payload: Event<RelayMessage>;

    // TODO: is there a better way to do this?
    private processMessage = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => {
        this.payload.emit(wakuMessage.payload)
    }
    
    constructor() {
        this.connected = new Event<any>();
        this.payload = new Event<RelayMessage>();
    }

    async init(): Promise<void> {
        // TODO error flow
        this.waku = await Waku.create({ bootstrap: true });

        const nodes = await getBootstrapNodes();
        await Promise.all(nodes.map((addr) => this.waku.dial(addr)));
    
        console.log("Waiting for peer...");
        await this.waku.waitForConnectedPeer()
    }

    async subscribe(topic: string): Promise<void> {
        // Add observer to waku relay for the specified topic
        // TODO: make this more dynamic
        this.waku.relay.addObserver(this.processMessage, [topic])
    }

    async unsubscribe(topic: string): Promise<void> {
        this.waku.relay.unsubscribe(topic);
    }

    // TODO: determine appropriate types for sending messages, string should suffice for now
    async sendMessage(topic: string, message: any): Promise<void> {
          const wakuMessage = await WakuMessage.fromBytes(message, topic);
        
          console.log("Sending payload");
          await this.waku.relay.send(wakuMessage);
    }
}