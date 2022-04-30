import {
    AccountBalanceQuery, AccountId, AccountInfoQuery,
    AccountRecordsQuery, Client, Provider, Query,
    Transaction, TransactionId, TransactionReceiptQuery,
    TransactionResponse
} from '@hashgraph/sdk';
import Executable from '@hashgraph/sdk/lib/Executable';
import { HashConnect } from '../main';
import { HashConnectProviderSender } from './sender';

export class HashConnectProvider implements Provider {
    client: Client;
    private hashconnect: HashConnect;
    private sender: HashConnectProviderSender;
    private network: string;

    public constructor(
        networkName: string,
        topicId: string,
        hashconnect: HashConnect) {
            
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = Client.forName(networkName);
        this.sender = new HashConnectProviderSender(this.hashconnect, topicId);
    }

    getLedgerId() {
        return this.client.ledgerId;
    }

    getNetwork() {
        return this.client.network;
    }

    getMirrorNetwork: () => string[];

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
        const requestBytes = this.getBytesOf(request);
        const { signedTransaction, error } = await this.sender.send(request._operator!.accountId, requestBytes, false);

        if (error) {
            throw new Error(`There was an issue while signing the request: ${error}`);
        } else if (request instanceof Transaction) {
            const sdkSignedTransaction = Transaction.fromBytes(signedTransaction as Uint8Array);

            return (sdkSignedTransaction.execute(this.client) as unknown) as Promise<OutputT>;
        } else if (request instanceof Query) {
            // TODO: execute query somehow?
            const sdkSignedTransaction = Query.fromBytes(signedTransaction as Uint8Array);

            return (sdkSignedTransaction.execute(this.client) as unknown) as Promise<OutputT>;

        } else {
            throw new Error(`We only know how to forward Transactions and Queries.`);
        }
    }

    private getBytesOf<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Uint8Array {
        if (request instanceof Transaction || request instanceof Query) {
            return request.toBytes();
        } else {
            throw new Error("Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet.");
        }
    }
}