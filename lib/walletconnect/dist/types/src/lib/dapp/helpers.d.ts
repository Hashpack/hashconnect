import { type Transaction } from '@hashgraph/sdk';
import { EngineTypes } from '@walletconnect/types';
import { HederaJsonRpcMethod } from '../shared';
/**
 * Builds parameters for signing messages.
 *
 * account ID - Hedera Account identifier in {@link https://hips.hedera.com/hip/hip-30 | HIP-30} (`<nework>:<shard>.<realm>.<num>`) form.
 * @param signerAccountId - The signer's account ID.
 * @param messages - An array of messages to be signed, each can be a Uint8Array or a string.
 * @returns An object containing signer's account ID and base64 encoded messages.
 *
 */
export declare function buildSignMessageParams(signerAccountId: string, messages: (Uint8Array | string)[]): {
    signerAccountId: string;
    messages: string[];
};
export declare function buildSignAndExecuteTransactionParams(signerAccountId: string, transaction: Transaction): {
    signerAccountId: string;
    transaction: {
        bytes: string;
    };
};
export declare function buildSignAndReturnTransactionParams(signerAccountId: string, transaction: Transaction): {
    signerAccountId: string;
    transaction: {
        bytes: string;
    };
};
type HederaSessionRequestOptions = Pick<EngineTypes.RequestParams, 'chainId' | 'topic' | 'expiry'>;
export declare class HederaSessionRequest {
    chainId: HederaSessionRequestOptions['chainId'];
    topic: HederaSessionRequestOptions['topic'];
    expiry: HederaSessionRequestOptions['expiry'];
    constructor({ chainId, topic, expiry }: HederaSessionRequestOptions);
    static create(options: HederaSessionRequestOptions): HederaSessionRequest;
    buildSignAndExecuteTransactionRequest(signerAccountId: string, transaction: Transaction): {
        chainId: string;
        topic: string;
        expiry: number | undefined;
        request: {
            method: HederaJsonRpcMethod;
            params: {
                signerAccountId: string;
                transaction: {
                    bytes: string;
                };
            };
        };
    };
    buildSignAndReturnTransactionRequest(signerAccountId: string, transaction: Transaction): {
        chainId: string;
        topic: string;
        expiry: number | undefined;
        request: {
            method: HederaJsonRpcMethod;
            params: {
                signerAccountId: string;
                transaction: {
                    bytes: string;
                };
            };
        };
    };
    buildSignMessageRequest(signerAccountId: string, messages: (Uint8Array | string)[]): {
        chainId: string;
        topic: string;
        expiry: number | undefined;
        request: {
            method: HederaJsonRpcMethod;
            params: {
                signerAccountId: string;
                messages: string[];
            };
        };
    };
}
export {};
//# sourceMappingURL=helpers.d.ts.map