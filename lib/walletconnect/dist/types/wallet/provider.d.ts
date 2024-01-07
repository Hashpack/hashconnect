import { Client, type AccountId, type Executable, type Provider as HederaWalletProvider, type TransactionId, type TransactionResponse, type TransactionReceipt } from '@hashgraph/sdk';
export default class Provider implements HederaWalletProvider {
    private client;
    constructor(client: Client);
    static fromClient(client: Client): Provider;
    getLedgerId(): import("@hashgraph/sdk/lib/LedgerId").default | null;
    getNetwork(): {
        [key: string]: string | AccountId;
    };
    getMirrorNetwork(): string[];
    getAccountBalance(accountId: AccountId | string): Promise<import("@hashgraph/sdk").AccountBalance>;
    getAccountInfo(accountId: AccountId | string): Promise<import("@hashgraph/sdk").AccountInfo>;
    getAccountRecords(accountId: string | AccountId): Promise<import("@hashgraph/sdk").TransactionRecord[]>;
    getTransactionReceipt(transactionId: TransactionId | string): Promise<TransactionReceipt>;
    waitForReceipt(response: TransactionResponse): Promise<TransactionReceipt>;
    call<Request, Response, Output>(request: Executable<Request, Response, Output>): Promise<Output>;
}
//# sourceMappingURL=provider.d.ts.map