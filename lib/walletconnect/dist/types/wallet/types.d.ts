import type { Web3WalletTypes } from '@walletconnect/web3wallet';
import type { SessionTypes } from '@walletconnect/types';
import type { Transaction, Query, AccountId, Wallet as HederaWallet } from '@hashgraph/sdk';
import { proto } from '@hashgraph/proto';
import type { HederaJsonRpcMethod, HederaChainId } from '../shared';
import type Provider from './provider';
export interface HederaNativeWallet {
    buildAndApproveSession(accounts: string[], { id, params }: Web3WalletTypes.SessionProposal): Promise<SessionTypes.Struct>;
    parseSessionRequest(event: Web3WalletTypes.SessionRequest, shouldThrow: boolean): {
        method: HederaJsonRpcMethod;
        chainId: HederaChainId;
        id: number;
        topic: string;
        body?: Transaction | Query<any> | string | undefined;
        accountId?: AccountId;
    };
    executeSessionRequest(event: Web3WalletTypes.SessionRequest, hederaWallet: HederaWallet): Promise<void>;
    rejectSessionRequest(event: Web3WalletTypes.SessionRequest, error: {
        code: number;
        message: string;
    }): Promise<void>;
    getHederaWallet(chainId: HederaChainId, accountId: AccountId | string, privateKey: string, _provider?: Provider): HederaWallet;
    [HederaJsonRpcMethod.GetNodeAddresses](id: number, topic: string, _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet): Promise<void>;
    [HederaJsonRpcMethod.ExecuteTransaction](id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    [HederaJsonRpcMethod.SignMessage](id: number, topic: string, body: string, signer: HederaWallet): Promise<void>;
    [HederaJsonRpcMethod.SignAndExecuteQuery](id: number, topic: string, body: Query<any>, signer: HederaWallet): Promise<void>;
    [HederaJsonRpcMethod.SignAndExecuteTransaction](id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    [HederaJsonRpcMethod.SignTransaction](id: number, topic: string, body: proto.TransactionBody, signer: HederaWallet): Promise<void>;
}
export interface HederaEvmCompatibleWallet {
}
//# sourceMappingURL=types.d.ts.map