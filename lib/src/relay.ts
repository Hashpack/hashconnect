import { Waku, WakuMessage, getBootstrapNodes } from "js-waku";
import { Event } from "ts-typed-events";
const protons = require('protons');

// TODO: provide explicit methods on relay to remove the need to pass in EventTypes?
export enum EventType {
    CONNECT,
    MESSAGE_RECEIVED
}

export abstract class Relay {

    constructor() {
        console.log("relay initialized");
    }

    abstract attachEvent(eventType: EventType, callback: (data: any) => void): void;
}

export class WakuRelay extends Relay {

    private waku!: Waku;
    private contentTopic: string = "/waku/2/default-waku/proto"

    // TODO: Figure out the types here for messages
    private connectEvent = new Event<string>()
    private messageEvent = new Event<string>()

    // TODO: is there a better way to do this?
    private processMessage = async (wakuMessage: { payloadAsUtf8: any; payload: any; }) => {
        if (!wakuMessage.payload) return;
    
        const { timestamp, text } = this.proto.SimpleChatMessage.decode(
          wakuMessage.payload
        );
  
        console.log(`Message Received: ${text}, sent at ${timestamp.toString()}`);
        // Emit mesage
        this.messageEvent.emit(`${text}`)
    }

    // This message format will probably need to change as the library develops
    private proto = protons(`
    message SimpleChatMessage {
      uint64 timestamp = 1;
      string text = 2;
    }
    `);
    constructor() {
        super()
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
        this.connectEvent.emit("Connected")
    }

    attachEvent(eventType: EventType, callback: (data: any) => void) {
        // TODO: check for callbacks already present on events
        switch(eventType) {
            case EventType.CONNECT:
                this.connectEvent.on(callback);
                break;
            case EventType.MESSAGE_RECEIVED:
                this.messageEvent.on(callback);
                break
            default:
                console.log("Default break statement");
                break;
        }
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