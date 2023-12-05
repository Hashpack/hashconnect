import { Buffer } from "buffer";
import {
    Client,
    Executable,
    SignerSignature,
    Transaction,
    TransactionResponse,
    TransactionResponseJSON,
} from "@hashgraph/sdk";

import { AuthenticationHelper } from "./utils";
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
}
