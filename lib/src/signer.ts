import {
    AccountId,
    Client,
    Executable,
    SignerSignature,
    Transaction,
    TransactionId,
    TransactionResponse,
    TransactionResponseJSON,
} from "@hashgraph/sdk";

import { DAppSigner } from "./dapp/DAppSigner";
import {
    HederaJsonRpcMethod,
    buildSignAndExecuteTransactionParams,
    buildSignMessageParams,
} from "@hashgraph/walletconnect";

export class HashConnectSigner extends DAppSigner {
    private readonly hederaClient: Client = Client.forName(this.getLedgerId().toString());

    getClient() {
        return this.hederaClient;
    }

    async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
        const signedMessages = await this.request<SignerSignature[]>({
            method: HederaJsonRpcMethod.SignMessage,
            params: buildSignMessageParams(this.getAccountId().toString(), messages),
        });

        signedMessages.forEach((signedMessage) => {
            signedMessage.signature = new Uint8Array(Object.values(signedMessage.signature));
        });

        return signedMessages;
    }

    async call<RequestT, ResponseT, OutputT>(
        request: Executable<RequestT, ResponseT, OutputT>
    ): Promise<OutputT> {
        const response = await this.request<TransactionResponseJSON>({
            method: HederaJsonRpcMethod.SignTransactionAndSend,
            params: buildSignAndExecuteTransactionParams(
                this.getAccountId().toString(),
                Transaction.fromBytes(request.toBytes())
            ),
        });

        return TransactionResponse.fromJSON(response) as OutputT;
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
