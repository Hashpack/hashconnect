import {
    AccountBalance,
    AccountBalanceQuery,
    AccountId,
    Client,
    Executable,
    Query,
    SignerSignature,
    Transaction,
    TransactionId,
    TransactionResponse,
    TransactionResponseJSON,
} from "@hashgraph/sdk";

import { DAppSigner } from "./dapp/DAppSigner";

import {
    HederaJsonRpcMethod,
    transactionToBase64String,
} from "@hashgraph/walletconnect";


export class HashConnectSigner extends DAppSigner {
    private readonly hederaClient: Client = Client.forName(this.getLedgerId().toString());

    getClient() {
        return this.hederaClient;
    }

    async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
        const signedMessages = await this.request<SignerSignature[]>({
            method: HederaJsonRpcMethod.SignMessage,
            params: {
                signerAccountId: "hedera:" + this.getLedgerId() + ":" + this.getAccountId().toString(),
                message: Buffer.from(messages[0]).toString()
            }
        });

        debugger

        return signedMessages;
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        const signedStringTransaction = await this.request<string>({
            method: HederaJsonRpcMethod.SignTransaction,
            params: {
                signerAccountId: "hedera:" + this.getLedgerId() + ":" + this.getAccountId().toString(),
                transactionList: transactionToBase64String(transaction)
            }
        })

        return signedStringTransaction as unknown as T;
    }

    async call<RequestT, ResponseT, OutputT>(
        request: Executable<RequestT, ResponseT, OutputT>
    ): Promise<OutputT> {
        debugger
        try {
            let transaction = Transaction.fromBytes(request.toBytes())
            if (transaction) {
                debugger
                const response = await this.request<TransactionResponseJSON>({
                    method: HederaJsonRpcMethod.SignAndExecuteTransaction,
                    params: {
                        signerAccountId: "hedera:" + this.getLedgerId() + ":" + this.getAccountId().toString(),
                        transactionList: transactionToBase64String(transaction)
                    }
                });

                return TransactionResponse.fromJSON(response) as OutputT;
            }
        } catch (error) {
            throw error;
        }

        try {
            let query = Query.fromBytes(request.toBytes())

            if (query) {
                throw new Error("Query not supported - use a mirror node instead");
            }
        } catch {

        }

        throw new Error("Unsupported request type");
    }

    async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
        return transaction
            .setNodeAccountIds(
                Object.values(this.getClient().network).map((o) =>
                    typeof o === "string" ? AccountId.fromString(o) : o
                )
            )
            .setTransactionId(TransactionId.generate(this.getAccountId()));
    }
}