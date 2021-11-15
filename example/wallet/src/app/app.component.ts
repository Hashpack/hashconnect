import { Component } from '@angular/core';
import { HashConnect, HashConnectTypes } from 'hashconnect';
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
import { SigningService } from './services/signing.service';

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

    constructor(
        private HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) {
    }

    ngOnInit() {
        this.hashconnect = new HashConnect();
        this.SigningService.init();
        this.initHashconnect();
    }

    async initHashconnect() {
        let walletMetadata: HashConnectTypes.WalletMetadata = {
            name: "Example Wallet",
            description: "An example wallet",
            url: "",
            icon: ""
        }

        await this.hashconnect.init(walletMetadata);
        this.hashconnect.pairingEvent.on((data) => {
            console.log("pairing event received")
            console.log(data)
            this.message = data;
        });

        this.hashconnect.transactionEvent.on((data) => {
            console.log("transaction event callback");
            this.HashconnectService.recievedTransaction(data);
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

    
}
