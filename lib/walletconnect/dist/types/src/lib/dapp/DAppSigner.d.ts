import { Signer, AccountBalance, AccountId, AccountInfo, Executable, Key, LedgerId, SignerSignature, Transaction, TransactionRecord } from '@hashgraph/sdk';
import type { ISignClient } from '@walletconnect/types';
export declare class DAppSigner implements Signer {
    private readonly accountId;
    private readonly signClient;
    readonly topic: string;
    private readonly ledgerId;
    constructor(accountId: AccountId, signClient: ISignClient, topic: string, ledgerId?: LedgerId);
    request<T>(request: {
        method: string;
        params: any;
    }): Promise<T>;
    getAccountId(): AccountId;
    getAccountKey(): Key;
    getLedgerId(): LedgerId;
    getNetwork(): {
        [key: string]: string | AccountId;
    };
    getMirrorNetwork(): string[];
    getAccountBalance(): Promise<AccountBalance>;
    getAccountInfo(): Promise<AccountInfo>;
    getAccountRecords(): Promise<TransactionRecord[]>;
    sign(data: Uint8Array[], signOptions?: Record<string, any>): Promise<SignerSignature[]>;
    checkTransaction<T extends Transaction>(transaction: T): Promise<T>;
    populateTransaction<T extends Transaction>(transaction: T): Promise<T>;
    signTransaction<T extends Transaction>(transaction: T): Promise<T>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
}
//# sourceMappingURL=DAppSigner.d.ts.map