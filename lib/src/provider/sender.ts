import {
    HashConnect,
} from '../hashconnect';
import { AccountId } from "@hashgraph/sdk";
import { MessageTypes } from '../main';

export class HashConnectProviderSender {
    public constructor(
        private readonly hashconnect: HashConnect,
        private readonly topicId: string
    ) { }

    public send(accountId: AccountId, message: Uint8Array, returnTransaction: boolean): Promise<MessageTypes.TransactionResponse> {
        const transaction = {
            byteArray: message,
            metadata: {
                accountToSign: accountId.toString(),
                returnTransaction: returnTransaction,
            },
            topic: this.topicId,
        };

        return this.hashconnect.sendTransaction(this.topicId, transaction);
    }
}