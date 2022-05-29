import { Event } from "ts-typed-events"
import { HashConnectConnectionState } from ".";
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
    init(): Promise<void>;

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

    addDecryptionKey(privKey: string, topic: string): void;
}

export class WebSocketRelay implements IRelay {

    private socket: WebSocket;

    // Events
    connected: Event<any>;
    payload: Event<any>;
    hc: HashConnect;
    subscribedTopics: string[] = [];

    // TODO: is there a better way to do this?
    private processMessage(e: MessageEvent<any>) {
        if (this.hc.debug) console.log("hashconnect - emitting payload");
        this.payload.emit(JSON.parse(e.data))
    }

    constructor(hc: HashConnect) {
        this.connected = new Event<any>();
        this.payload = new Event<any>();
        this.hc = hc;
    }

    async init(): Promise<void> {
        // TODO error flow
        return new Promise((resolve) => {
            this.connectToSocket(() => {
                resolve();
            })
        });
    }

    connectToSocket(callback: () => void) {
        // this.socket = new WebSocket('ws://localhost:9001');
        this.socket = new WebSocket('wss://hashconnect.hashpack.app');

        this.socket.onopen = () => {
            if (this.hc.debug) console.log("hashconnect - connected");

            this.hc.connectionStatusChange.emit(HashConnectConnectionState.Connected);
            callback();
        };

        this.socket.onclose = () => {
            console.log("hashconnect - disconnected")
            this.hc.connectionStatusChange.emit(HashConnectConnectionState.Disconnected);
            setTimeout(() => {
                this.reconnect();
            }, 300);
        }
    }

    reconnect() {
        if (this.hc.debug) console.log("hashconnect - reconnecting...")

        this.connectToSocket(async () => {
            for(let topic of this.subscribedTopics) {
                await this.subscribe(topic);
            }

            if (this.hc.debug) console.log("hashconnect - reconnected")
        })
    }

    async subscribe(topic: string): Promise<void> {
        if (this.hc.debug) console.log("hashconnect - Subscribing to topic id " + topic);

        if(this.subscribedTopics.indexOf(topic) == -1) this.subscribedTopics.push(topic);

        this.socket.send(JSON.stringify({ action: 'sub', topic: topic }));

        this.socket.onmessage = (e) => {
            console.log("process", e)
            this.processMessage(e);
        };
    }

    addDecryptionKey(privKey: string, topic: string) {
        console.log("hashconnect - Adding decryption key \n PrivKey: " + privKey);
        if (this.hc.debug) console.log("hashconnect - Adding decryption key \n PrivKey: " + privKey);
        this.hc.publicKeys[topic] = privKey;
    }

    async unsubscribe(topic: string): Promise<void> {
        if (this.hc.debug) console.log("hashconnect - Unsubscribing to " + topic);

        this.socket.send(JSON.stringify({ action: "unsub", topic: topic }))
    }

    // TODO: determine appropriate types for sending messages, string should suffice for now
    async publish(topic: string, message: any, pubKey: string): Promise<void> {
        const msg = {
            action: "pub",
            payload: JSON.stringify(message), //todo: remove this stringify after people have updated
            topic: topic
        }

        if (this.hc.debug) console.log("hashconnect - Sending payload to " + topic, "\n encrypted with " + pubKey);
        await this.socket.send(JSON.stringify(msg));
    }
}