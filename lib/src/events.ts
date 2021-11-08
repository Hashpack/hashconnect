import { Event } from "ts-typed-events";

export class HashConnectEvents implements IRelayEvents {
    connected: Event<any>;
    messageReceived: Event<any>;

    constructor(relayEvents: IRelayEvents) {
        this.connected = relayEvents.connected;
        this.messageReceived = relayEvents.messageReceived;
    }
}

export interface IRelayEvents {
    
    connected: Event<any>;
    messageReceived: Event<any>;
}
