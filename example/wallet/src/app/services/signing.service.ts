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

    accounts: Array<{id: string, privKey: string, name: string}> = [
        {
            name: "Test account 1",
            id: "0.0.15655453",
            privKey: "302e020100300506032b657004220420688bd6bb6b7490af29c87a333de741081acd0bad1b5c5b617e1864b62a3b57d4"
        },
        {
            name: "Test Account 2",
            id: "0.0.15655455",
            privKey: "302e020100300506032b6570042204201f374a73fdb1f4a04b0e2f76f94e2543d2c6f5f43dd121948a176722bcea20a7"
        }
    ]

    client: Client;

    constructor() { }

    init() {
        
    }

    async approveTransaction(transaction: Uint8Array, accountToSign: string) {
        let account: {id: string, privKey: string, name: string} = this.accounts.find(account => account.id == accountToSign )!
        
        this.client = Client.forTestnet();
        this.client.setOperator(account.id, account.privKey);

        console.log("Received transaction message:");
        const privKey = PrivateKey.fromString(account.privKey);
        const pubKey = privKey.publicKey;

        const sig = privKey.signTransaction(Transaction.fromBytes(transaction) as any);

        let trans = Transaction.fromBytes(transaction)
        trans = await trans.addSignature(pubKey, sig);
        const val = await trans.execute(this.client);
        const rec = await val.getReceipt(this.client);
        console.log(rec.status.toString());
    }
}
