import { Waku, WakuMessage, getBootstrapNodes } from "js-waku";
import { IRelayEvents } from "./events";
import { Event } from "ts-typed-events"

const protons = require('protons');

/**
 * Relay interface
 */
export interface IRelay extends IRelayEvents {

    /**
     * Initialize the relay
     */
    init(): void;

    /**
     * Send a message
     * 
     * @param message message to send
     */
    sendMessage(message: string | any): Promise<void>;
}

export class WakuRelay implements IRelay {

    private waku!: Waku;
    private contentTopic: string = "/waku/2/default-waku/proto"
    connected: Event<any>;
    messageReceived: Event<any>;

    // TODO: is there a better way to do this?
    private processMessage = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => {
        if (!wakuMessage.payload) return;
    
        const { timestamp, text } = this.proto.SimpleChatMessage.decode(
          wakuMessage.payload
        );
  
        console.log(`Message Received: ${text}, sent at ${timestamp.toString()}`);
        // Emit mesage
        this.messageReceived.emit(`${text}`)
    }

    // This message format and how it's stored will probably need to change as the library develops
    private proto = protons(`
    message SimpleChatMessage {
      uint64 timestamp = 1;
      string text = 2;
    }
    `);
    constructor() {
        this.connected = new Event<any>();
        this.messageReceived = new Event<any>();
    }

    // /**
    //  * Set a content topic
    //  * @param topic topic to set
    //  */
    // setContentTopic(topic: string) {
    //     // TODO: sanitize
    //     if(!topic) {
    //         console.log("topic must be a valid string");
    //     }
    //     this.contentTopic = topic;
    // }

    async init() {
        // TODO error flow
        this.waku = await Waku.create({ bootstrap: true });

        const nodes = await getBootstrapNodes();
        await Promise.all(nodes.map((addr) => this.waku.dial(addr)));
    
        console.log("Waiting for peer...");
        await this.waku.waitForConnectedPeer()

        this.waku.relay.addObserver(this.processMessage, [this.contentTopic])
        console.log("init done");
        this.connected.emit("Connected")
    }

    // TODO: determine appropriate types for sending messages, string should suffice for now
    async sendMessage(message: string | any): Promise<void> {
        const payload = this.proto.SimpleChatMessage.encode({
            timestamp: Date.now(),
            text: message
          });
      
          const wakuMessage = await WakuMessage.fromBytes(payload, this.contentTopic);
      
          console.log("Sending payload");
          await this.waku.relay.send(wakuMessage);
    }
}