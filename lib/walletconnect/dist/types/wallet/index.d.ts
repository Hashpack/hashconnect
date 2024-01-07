import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { SessionTypes } from '@walletconnect/types';
import { Wallet as HederaWallet, AccountId, Transaction, Query } from '@hashgraph/sdk';
import { HederaChainId, HederaSessionEvent, HederaJsonRpcMethod } from '../shared';
import { proto } from '@hashgraph/proto';
import Provider from './provider';
import type { HederaNativeWallet } from './types';
export default class Wallet extends Web3Wallet implements HederaNativeWallet {
    chains: HederaChainId[] | string[];
    methods: string[];
    sessionEvents: HederaSessionEvent[] | string[];
    constructor(opts: Web3WalletTypes.Options, chains?: HederaChainId[] | string[], methods?: string[], sessionEvents?: HederaSessionEvent[] | string[]);
    static create(projectId: string, metadata: Web3WalletTypes.Metadata, chains?: HederaChainId[], methods?: string[], sessionEvents?: HederaSessionEvent[] | string[]): Promise<Wallet>;
    getHederaWallet(chainId: HederaChainId, accountId: AccountId | string, privateKey: string, _provider?: Provider): HederaWallet;
    buildAndApproveSession(accounts: string[], { id, params }: Web3WalletTypes.SessionProposal): Promise<SessionTypes.Struct>;
    validateParam(name: string, value: any, expectedType: string): void;
    parseSessionRequest(event: Web3WalletTypes.SessionRequest, shouldThrow?: boolean): {
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
    hedera_getNodeAddresses(id: number, topic: string, _: any, // ignore this param to be consistent call signature with other functions
    signer: HederaWallet): Promise<void>;
    hedera_executeTransaction(id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    hedera_signMessage(id: number, topic: string, body: string, signer: HederaWallet): Promise<void>;
    hedera_signAndExecuteQuery(id: number, topic: string, body: Query<any>, signer: HederaWallet): Promise<void>;
    hedera_signAndExecuteTransaction(id: number, topic: string, body: Transaction, signer: HederaWallet): Promise<void>;
    hedera_signTransaction(id: number, topic: string, body: proto.TransactionBody, signer: HederaWallet): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map