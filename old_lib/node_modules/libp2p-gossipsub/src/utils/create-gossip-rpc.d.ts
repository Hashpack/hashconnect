import { RPC, IRPC } from '../message/rpc';
/**
 * Create a gossipsub RPC object
 * @param {Array<RPC.IMessage>} msgs
 * @param {Partial<RPC.IControlMessage>} control
 * @returns {IRPC}
 */
export declare function createGossipRpc(msgs?: RPC.IMessage[], control?: Partial<RPC.IControlMessage>): IRPC;
