import { LedgerId, AccountId, SignerSignature, AccountBalance, AccountInfo, TransactionRecord, Transaction, Executable, Query, TransactionResponse, TransactionId, AccountBalanceQuery, AccountInfoQuery, AccountRecordsQuery } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnect } from "../main";
import { HashConnectProvider } from "./provider";

export class HashConnectSigner implements Signer {

    private hashconnect: HashConnect;
    private provider: HashConnectProvider;
    private topicId: string;
    private accountToSign: string;

    constructor(hashconnect: HashConnect, provider: HashConnectProvider, accountToSign: string, topic: string) {
        this.hashconnect = hashconnect;
        this.provider = provider;
        this.accountToSign = accountToSign;
        this.topicId = topic;
    }

    getLedgerId(): LedgerId | null {
        return this.provider.client.ledgerId;
    };

    getAccountId():AccountId {
        return AccountId.fromString(this.accountToSign);
    };

    getNetwork() {
        let network: { [key: string]: string } = {};
        network[this.accountToSign.toString()] = this.provider.network;
        
        return network;
    };
    
    getMirrorNetwork() {
        throw new Error("Get Mirror Network not implemented in HashConnect");

        return [];
    };    
    
    sign(messages: Uint8Array[]):Promise<SignerSignature[]> {
        throw new Error("Sign messages not implemented in HashConnect");

        console.log(messages);
    };

    getAccountBalance() {
        return new AccountBalanceQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }

    getAccountInfo() {
        return new AccountInfoQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }

    getAccountRecords() {
        return new AccountRecordsQuery()
            .setAccountId(this.accountToSign)
            .execute(this.provider.client);
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        return transaction.freezeWith(this.provider.client)
    };

    checkTransaction(transaction: Transaction): Promise<Transaction> {
        throw new Error("Check transaction not implemented in HashConnect");

        console.log(transaction);
    };

    async populateTransaction(transaction: Transaction): Promise<Transaction> {
        // await this.checkTransaction(transaction);

        transaction.setTransactionId(TransactionId.generate(this.accountToSign));
        // transaction.setNodeAccountIds([]);

        return transaction;
    };

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