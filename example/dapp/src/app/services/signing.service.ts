import { Injectable } from '@angular/core';
import {
    Client,
    PrivateKey,
    HbarUnit,
    TransferTransaction,
    Transaction,
    AccountId,
    Hbar
} from "@hashgraph/sdk"

@Injectable({
    providedIn: 'root'
})
export class SigningService {

    constructor() { }

    client: Client;
    pk = "302e020100300506032b65700422042093e3a32a53b0878429043643be0c992cec4f3e2aba8ccbde9905192e9326e0d2";
    acc = "0.0.572001";

    async init() {
        this.client = Client.forTestnet();
        this.client.setOperator(this.acc, this.pk);
    }

    async createTransaction(destAcc: string) {
        let amount = 1;
        let memo = "we are sending across the wire";
        const privKey = PrivateKey.fromString(this.pk);
        const pubKey = privKey.publicKey;

        let nodeId = [];
        nodeId.push(new AccountId(3))

        // DAPP requests a transfer of hbar to their account from the target account
        let trans = new TransferTransaction()
            .addHbarTransfer(this.acc, Hbar.from(amount, HbarUnit.Hbar))
            .addHbarTransfer(destAcc, Hbar.from(-amount, HbarUnit.Hbar))
            .setTransactionMemo(memo)
            .setNodeAccountIds(nodeId);

        trans = await trans.freezeWith(this.client);

        let transBytes = trans.toBytes();

        const sig = await privKey.signTransaction(Transaction.fromBytes(transBytes) as any);

        const out = trans.addSignature(pubKey, sig);

        const outBytes = out.toBytes();
        
        console.log("Transaction bytes", outBytes);

        return outBytes;

    }
}
