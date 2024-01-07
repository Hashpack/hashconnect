import { JsonRpcResult } from '@walletconnect/jsonrpc-types';
import { EngineTypes } from '@walletconnect/types';
import type { TransactionResponseJSON } from '@hashgraph/sdk';
import { HederaJsonRpcMethod } from './methods';
/**
 * Defines various types and interfaces for Hedera JSON-RPC methods.
 */
export type GetNodeAddressesParams = undefined;
export interface GetNodeAddressesRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.GetNodeAddresses;
        params: GetNodeAddressesParams;
    };
}
export interface GetNodeAddressesResult extends JsonRpcResult<{
    nodes: string[];
}> {
}
export interface GetNodeAddresesResponse extends EngineTypes.RespondParams {
    response: GetNodeAddressesResult;
}
export interface ExecuteTransactionParams {
    transactionList: string;
}
export interface ExecuteTransactionRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.ExecuteTransaction;
        params: ExecuteTransactionParams;
    };
}
export interface ExecuteTransactionResult extends JsonRpcResult<TransactionResponseJSON> {
}
export interface ExecuteTransactionResponse extends EngineTypes.RespondParams {
    response: ExecuteTransactionResult;
}
export interface SignMessageParams {
    signerAccountId: string;
    message: string;
}
export interface SignMessageRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.SignMessage;
        params: SignMessageParams;
    };
}
export interface SignMessageResult extends JsonRpcResult<{
    signatureMap: string;
}> {
}
export interface SignMessageResponse extends EngineTypes.RespondParams {
    response: SignMessageResult;
}
export interface SignAndExecuteQueryParams {
    signerAccountId: string;
    query: string;
}
export interface SignAndExecuteQueryRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.SignAndExecuteQuery;
        params: SignAndExecuteQueryParams;
    };
}
export interface SignAndExecuteQueryResult extends JsonRpcResult<{
    response: string;
}> {
}
export interface SignAndExecuteQueryResponse extends EngineTypes.RespondParams {
    response: SignAndExecuteQueryResult;
}
export interface SignAndExecuteTransactionParams {
    signerAccountId: string;
    transactionList: string;
}
export interface SignAndExecuteTransactionRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.SignAndExecuteTransaction;
        params: SignAndExecuteTransactionParams;
    };
}
export interface SignAndExecuteTransactionResult extends JsonRpcResult<TransactionResponseJSON> {
}
export interface SignAndExecuteTransactionResponse extends EngineTypes.RespondParams {
    response: SignAndExecuteTransactionResult;
}
export interface SignTransactionParams {
    signerAccountId: string;
    transactionList: string;
}
export interface SignTransactionRequest extends EngineTypes.RequestParams {
    request: {
        method: HederaJsonRpcMethod.SignTransaction;
        params: SignTransactionParams;
    };
}
export interface SignTransactionResult extends JsonRpcResult<{
    signatureMap: string;
}> {
}
export interface SignTransactionResponse extends EngineTypes.RespondParams {
    response: SignTransactionResult;
}
//# sourceMappingURL=payloads.d.ts.map