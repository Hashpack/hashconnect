import { Component } from '@angular/core';
import { HashConnect, HashConnectTypes, MessageTypes, RelayMessageType, TransactionType } from 'hashconnect';
import {
    Client,
    PrivateKey,
    HbarUnit,
    TransferTransaction,
    Transaction,
    AccountId,
    Hbar
} from "@hashgraph/sdk"

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp | proposer';
    status = "Initializing";
    message = "";
    topic = "";
    pairingString: string = "";
    private hashconnect: HashConnect;
    private pk = "302e020100300506032b65700422042093e3a32a53b0878429043643be0c992cec4f3e2aba8ccbde9905192e9326e0d2";
    private acc = "0.0.572001"
    // private destAcc = "0.0.627028";
    // private destKey = "302e020100300506032b657004220420344c6a0da6028b9dfc4274b89cf365dfca3995ad2f037ac39ccb13e04cd760fc"
    // private pk = "302e020100300506032b6570042204200540e00115d8f6b3d418134dfbac03c906a29eb4434c858a1ce574acff517e90";
    // private acc = "0.0.3012819"
    private destAcc = "0.0.2994249";
    // private destKey = "302e020100300506032b6570042204207ddd56b166a57ae4fdbfc74caebaaded7ad826cf9ac49fc40a8a63beee1c3df2"
    private client: Client;

    constructor() {
    }

    ngOnInit() {
        this.hashconnect = new HashConnect();
        console.log("initializing hashgroid client");
        this.client = Client.forTestnet();
        this.client.setOperator(this.acc, this.pk);
        this.initHashconnect();
    }

    async initHashconnect() {

        let appMetadata: HashConnectTypes.AppMetadata = {
            name: "dApp Example",
            description: "An example hedera dApp",
            icon: ""
        }

        await this.hashconnect.init(appMetadata);

        const state = await this.hashconnect.connect();
        console.log("Received state", state);
        this.topic = state.topic;
        
        this.pairingString = this.hashconnect.generatePairingString(this.topic);

        this.hashconnect.findLocalWallets();

        this.status = "Connected";

        this.hashconnect.pairingEvent.on((data) => {
            console.log("Pairing event callback ");
            console.log(data)
            this.status = data;
        })

        this.hashconnect.transactionEvent.on((data) => {
            console.log("transaction event callback");
        });

        this.hashconnect.accountInfoResponseEvent.on((data) => {
            console.log("Received account info", data);
        })
    }

    async proposePairing() {
        this.status = "Proposing pair"
        // Use the pairing topic in hashconnect, this will eventually be a random string of hex or a UUID
        
    }

    async createTrans() {
        let amount = 1;
        let memo = "we are sending across the wire";
        const privKey = PrivateKey.fromString(this.pk);
        const pubKey = privKey.publicKey;

        console.log(pubKey);
        let nodeId = [];
        nodeId.push(new AccountId(3))

        // DAPP requests a transfer of hbar to their account from the target account
        let trans = new TransferTransaction()
            .addHbarTransfer(this.acc, Hbar.from(amount, HbarUnit.Hbar))
            .addHbarTransfer(this.destAcc, Hbar.from(-amount, HbarUnit.Hbar))
            .setTransactionMemo(memo)
            .setNodeAccountIds(nodeId);

        trans = await trans.freezeWith(this.client);

        let transBytes = trans.toBytes();

        const sig = await privKey.signTransaction(Transaction.fromBytes(transBytes) as any);

        const out = trans.addSignature(pubKey, sig);
        console.log(out.getSignatures());

        const outBytes = out.toBytes();

        console.log("Transaction bytes", outBytes);

        const transaction: MessageTypes.Transaction = {
            topic: this.topic,
            byteArray: outBytes,
            type: TransactionType.Transaction,
        }

        await this.hashconnect.sendTransaction(this.topic, transaction)
    }


    async requestAccountInfo() {
        let request:MessageTypes.AccountInfoRequest = {
            topic: this.topic,
            network: "mainnet"
        } 

        await this.hashconnect.requestAccountInfo(this.topic, request);
    }

}
