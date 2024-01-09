import {
    AccountBalance,
    AccountBalanceQuery,
    AccountId,
    Client,
    Executable,
    PublicKey,
    Query,
    SignerSignature,
    Transaction,
    TransactionId,
    TransactionReceiptQuery,
    TransactionResponse,
    TransactionResponseJSON,
} from "@hashgraph/sdk";
import { proto } from '@hashgraph/proto'

import { DAppSigner } from "./dapp/DAppSigner";

import {
    HederaJsonRpcMethod,
    Uint8ArrayToBase64String,
    base64StringToSignatureMap,
    transactionToBase64String,
} from "@hashgraph/walletconnect";


export class HashConnectSigner extends DAppSigner {
    private readonly hederaClient: Client = Client.forName(this.getLedgerId().toString());

    private openExtension() {
        window.postMessage(
            {
                type: "hashconnect-send-local-transaction",
                transaction: null,
                origin: null
            },
            "*"
        );
    }

    getClient() {
        return this.hederaClient;
    }

    async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
        this.openExtension();

        const signedMessages = await this.request<{ signatureMap: string }>({
            method: HederaJsonRpcMethod.SignMessage,
            params: {
                signerAccountId: "hedera:" + this.getLedgerId() + ":" + this.getAccountId().toString(),
                message: Buffer.from(messages[0]).toString()
            }
        });

        let sigmap = base64StringToSignatureMap(signedMessages.signatureMap);
        
        let signerSignature = new SignerSignature({
            accountId: this.getAccountId(),
            publicKey: PublicKey.fromBytes(sigmap.sigPair[0].pubKeyPrefix as Uint8Array),
            signature: sigmap.sigPair[0].ed25519 as Uint8Array || sigmap.sigPair[0].ECDSASecp256k1 as Uint8Array
        })

        return [signerSignature];
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        this.openExtension();

        //@ts-ignore
        let transactionBody = transaction._makeTransactionBody(AccountId.fromString('0.0.3'));
        let base64Body = Uint8ArrayToBase64String(proto.TransactionBody.encode(transactionBody).finish());

        const signedStringTransaction = await this.request<string>({
            method: HederaJsonRpcMethod.SignTransaction,
            params: {
                signerAccountId: "hedera:" + this.getLedgerId() + ":" + this.getAccountId().toString(),
                transactionBody: base64Body
            }
        })

        return signedStringTransaction as unknown as T;
    }

    async call<RequestT, ResponseT, OutputT>(
        request: Executable<RequestT, ResponseT, OutputT>
    ): Promise<OutputT> {
        try {
            let transaction = Transaction.fromBytes(request.toBytes())
            if (transaction) {
                this.openExtension();

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
            try {
                let query = Query.fromBytes(request.toBytes())
    
                if(query instanceof TransactionReceiptQuery) {
                    let receipt = await query.execute(this.hederaClient);
                    return receipt as OutputT;
                } else if (query) {
                    throw new Error("Query not supported - use a mirror node instead");
                }
            } catch {
                throw error;
            }
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