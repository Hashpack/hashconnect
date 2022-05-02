import {
    AccountBalanceQuery, AccountId, AccountInfoQuery,
    AccountRecordsQuery, Client, Provider, Query,
    Transaction, TransactionId, TransactionReceiptQuery,
    TransactionResponse
} from '@hashgraph/sdk';
import Executable from '@hashgraph/sdk/lib/Executable';
import { HashConnect } from '../main';

export class HashConnectProvider implements Provider {
    client: Client;
    private hashconnect: HashConnect;
    network: string;
    topicId: string;
    accountToSign: string;

    public constructor(networkName: string, hashconnect: HashConnect, topicId: string, accountToSign: string) {
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = Client.forName(networkName);
        this.topicId = topicId;
        this.accountToSign = accountToSign;
    }

    getLedgerId() {
        return this.client.ledgerId;
    }

    getNetwork() {
        return this.client.network;
    }

    getMirrorNetwork() {
        throw new Error("Get Mirror Network not implemented in HashConnect provider");

        return [];
    };

    getAccountBalance(accountId: AccountId | string) {
        return new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getAccountInfo(accountId: AccountId | string) {
        return new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getAccountRecords(accountId: AccountId | string) {
        return new AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }

    getTransactionReceipt(transactionId: TransactionId | string) {
        return new TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this.client);
    }

    waitForReceipt(response: TransactionResponse) {
        return new TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(this.client);
    }

    async sendRequest<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        const transaction = {
            byteArray: this.getBytesOf(request),
            metadata: {
                accountToSign: this.accountToSign.toString(),
                returnTransaction: false,
            },
            topic: this.topicId,
        };

        let res = await this.hashconnect.sendTransaction(this.topicId, transaction);
        
        let response: TransactionResponse = res.response as TransactionResponse;
        
        return (response as unknown) as OutputT;
            throw new Error(`We only know how to forward Transactions and Queries.`);
    }

    private getBytesOf<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Uint8Array {
        let transaction = (request as unknown) as Transaction;
        let query;

        if (!transaction)
            query = (request as unknown) as Query<any>;

        if (!transaction && !query)
            throw new Error("Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet.");

        if (transaction)
            return ((request as unknown) as Transaction).toBytes();
        else
            return ((request as unknown) as Query<any>).toBytes();
    }
}