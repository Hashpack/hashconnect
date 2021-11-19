import { Injectable } from '@angular/core';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import {
    DialogLayoutDisplay,
    DialogInitializer,
    ButtonLayoutDisplay,
    ButtonMaker
} from '@costlydeveloper/ngx-awesome-popup';
import { TransactionRecievedComponent } from '../components/transaction-recieved/transaction-recieved.component';
import { AccountInfoRequestComponent } from '../components/account-info-request/account-info-request.component';
import { SigningService } from './signing.service';

@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor(
        private SigningService: SigningService
    ) { }

    hashconnect: HashConnect;
    status: string = "";
    pairingTopic: string = "";
    incomingMessage = "";

    async initHashconnect() {
        this.hashconnect = new HashConnect();

        let walletMetadata: HashConnectTypes.WalletMetadata = {
            name: "Example Wallet",
            description: "An example wallet",
            icon: ""
        }

        await this.hashconnect.init(walletMetadata);
        
        this.hashconnect.pairingEvent.on((data) => {
            console.log("pairing event received")
            console.log(data)
        });

        this.hashconnect.transactionEvent.on(this.recievedTransactionRequest)
        this.hashconnect.accountInfoRequestEvent.on(this.accountInfoRequest);

        this.status = "connected";
    }

    ////////////////////////////////////RECIEVERS

    recievedTransactionRequest(transaction: MessageTypes.Transaction) {
        const dialogPopup = new DialogInitializer(TransactionRecievedComponent);

        dialogPopup.setCustomData({ transaction: transaction }); // optional

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Approve', 'approve', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Reject', 'reject', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => {
            console.log('dialog response: ', resp);
        });
    }

    accountInfoRequest(request: MessageTypes.AccountInfoRequest) {
        const dialogPopup = new DialogInitializer(AccountInfoRequestComponent);

        dialogPopup.setCustomData({ request: request }); // optional

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Approve', 'approve', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Reject', 'reject', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => {
            console.log('dialog response: ', resp);
        });
    }

    ////////////////////////////////////SENDERS

    async approvePairing() {
        if (this.pairingTopic == "") {
            return;
        }

        // this currently ignores the pairing topic param
        // await this.hashconnect.sendApproval()
        console.log("subscribing: " + this.pairingTopic);
        await this.hashconnect.pair(this.pairingTopic);
        this.status = "paired";
    }

    async rejectPairing() {
        if (this.pairingTopic == "") {
            return;
        }

        await this.hashconnect.reject(this.pairingTopic, "because I don't want to pair with you");
    }

    async approveAccountInfoRequest() {
        let msg: MessageTypes.AccountInfoResponse = {
            accountId: this.SigningService.acc,
            network: "mainnet",
            topic: this.pairingTopic
        }

        await this.hashconnect.sendAccountInfo(this.pairingTopic, msg);
    }
}
