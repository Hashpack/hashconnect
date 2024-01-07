import { type Transaction } from '@hashgraph/sdk';
import { EngineTypes } from '@walletconnect/types';
import { HederaJsonRpcMethod } from '../shared';
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