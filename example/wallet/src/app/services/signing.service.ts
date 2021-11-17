import { Injectable } from '@angular/core';
import {
    Client,
    PrivateKey,
    HbarUnit,
    TransferTransaction,
    AccountId,
    Transaction,
    Hbar
} from "@hashgraph/sdk"

@Injectable({
    providedIn: 'root'
})
export class SigningService {

    pk = "302e020100300506032b6570042204207ddd56b166a57ae4fdbfc74caebaaded7ad826cf9ac49fc40a8a63beee1c3df2";
    acc = "0.0.2994249"
    destAcc = "0.0.3012819";
    client: Client;

    constructor() { }

    init() {
        this.client = Client.forTestnet();
        this.client.setOperator(this.acc, this.pk);
    }

    async approveTransaction(transaction: Uint8Array) {
        console.log("Received transaction message:");
        const privKey = PrivateKey.fromString(this.pk);
        const pubKey = privKey.publicKey;

        const sig = privKey.signTransaction(Transaction.fromBytes(transaction) as any);

        let trans = Transaction.fromBytes(transaction)
        trans = await trans.addSignature(pubKey, sig);
        const val = await trans.execute(this.client);
        const rec = await val.getReceipt(this.client);
        console.log(rec.status.toString());
    }
}
