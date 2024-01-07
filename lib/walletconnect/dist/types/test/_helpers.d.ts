import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk';
export declare const projectId = "ce06497abf4102004138a10edd29c921";
export declare const walletMetadata: {
    name: string;
    url: string;
    description: string;
    icons: string[];
};
export declare const dAppMetadata: {
    name: string;
    url: string;
    description: string;
    icons: string[];
};
export declare const requestId = 1;
export declare const requestTopic = "test-topic";
export declare const defaultAccountNumber = 12345;
export declare const defaultNodeId = 3;
export declare const testUserAccountId: AccountId;
export declare const testNodeAccountId: AccountId;
/** Fixed to a specific timestamp */
export declare const testTransactionId: TransactionId;
type Options = {
    setNodeAccountIds?: boolean;
    setTransactionId?: boolean;
    freeze?: boolean;
    operatorAccountId?: number;
};
export declare function prepareTestTransaction<T extends Transaction = Transaction>(transaction: T, options?: Options): T;
export declare const testPrivateKeyECDSA = "3030020100300706052b8104000a042204203ce31ffad30d6db47c315bbea08232aad2266d8800a12aa3d8a812486e782759";
export declare const testPrivateKeyED25519 = "302e020100300506032b657004220420133eefea772add1f995c96bccf42b08b76daf67665f0c4c5ae308fae9275c142";
export declare function useJsonFixture(filename: string): any;
export declare function writeJsonFixture(filename: string, data: any): void;
export {};
//# sourceMappingURL=_helpers.d.ts.map