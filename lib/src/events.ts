import { Event } from "ts-typed-events";

export interface IRelayEvents {
    connected: Event<any>;
    payload: Event<any>;
}
 
// relay sends/receives data -> something parses it -> notifies listeners
//