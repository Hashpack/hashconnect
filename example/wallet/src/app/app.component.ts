import { Component } from '@angular/core';
import { HashConnect } from 'hashconnect';
import {
    Client,
    PrivateKey,
    HbarUnit,
    TransferTransaction,
    AccountId,
    Transaction,
    Hbar
} from "@hashgraph/sdk"
import { Transaction as HCTransaction } from 'hashconnect/dist/types';
import { HashconnectService } from './services/hashconnect.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'wallet | responder';
    status = "initializing";
    message = "";
    pairingTopic = "";
    incomingMessage = "";
    private hashconnect: HashConnect;
    private pk = "302e020100300506032b6570042204207ddd56b166a57ae4fdbfc74caebaaded7ad826cf9ac49fc40a8a63beee1c3df2";
    private acc = "0.0.2994249"
    private destAcc = "0.0.3012819";
    private client: Client;
    private transaction: any;

    constructor(
        private HashconnectService: HashconnectService
    ) {
    }

    ngOnInit() {
        this.hashconnect = new HashConnect();
        this.client = Client.forTestnet();
        this.client.setOperator(this.acc, this.pk);
        this.initHashconnect();
    }

    async initHashconnect() {

        await this.hashconnect.init();
        this.hashconnect.pairingEvent.on((data) => {
            console.log("pairing event received")
            console.log(data)
            this.message = data;
        });

        this.hashconnect.transactionEvent.on((data) => {
            console.log("transaction event callback");
            this.transaction = data;
            this.HashconnectService.recievedTransaction(data);
            // await this.onTransaction(data)
        })
        this.status = "connected";
    }

    async approvePairing() {
        if (this.pairingTopic == "") {
            this.pairingTopic = this.message;
        }

        // this currently ignores the pairing topic param
        // await this.hashconnect.sendApproval()
        console.log("subscribing: " + this.pairingTopic);
        await this.hashconnect.pair(this.pairingTopic);
        this.status = "paired";
    }

    async rejectPairing() {
        if (this.pairingTopic == "") {
            this.pairingTopic = this.message;
        }

        await this.hashconnect.reject(this.pairingTopic, "because I don't want to pair with you");
    }

    async approveTransaction() {
        console.log("Received transaction message:");
        const privKey = PrivateKey.fromString(this.pk);
        const pubKey = privKey.publicKey;

        const sig = privKey.signTransaction(Transaction.fromBytes(this.transaction.transaction) as any);

        let trans = Transaction.fromBytes(this.transaction.transaction)
        trans = await trans.addSignature(pubKey, sig);
        const val = await trans.execute(this.client);
        const rec = await val.getReceipt(this.client);
        console.log(rec.status.toString());
    }
}
