'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGossipRpc = void 0;
/**
 * Create a gossipsub RPC object
 * @param {Array<RPC.IMessage>} msgs
 * @param {Partial<RPC.IControlMessage>} control
 * @returns {IRPC}
 */
function createGossipRpc(msgs = [], control = {}) {
    return {
        subscriptions: [],
        msgs: msgs,
        control: Object.assign({ ihave: [], iwant: [], graft: [], prune: [] }, control)
    };
}
exports.createGossipRpc = createGossipRpc;
