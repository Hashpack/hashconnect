import { HashConnectEvents } from "./events";
import { IRelay, WakuRelay } from "./relay";

/**
 * Main interface with hashpack
 */
 export class HashConnect {
    /** Relay */
    private relay: IRelay;
    
    /** Events container */
    events: HashConnectEvents;

    constructor() {
        this.relay = new WakuRelay();
        this.events = new HashConnectEvents(this.relay)
    }

    async connect() {
        await this.relay.init();
    }

    async sendMessage(message: any) {
        await this.relay.sendMessage(message);
    }
}