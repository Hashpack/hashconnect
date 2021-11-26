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
import { DappPairing } from '../classes/dapp-pairing';

@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor(
        private SigningService: SigningService
    ) { }

    hashconnect: HashConnect;
    status: string = "Connecting";
    pairingEncodedData: string = "";
    incomingMessage = "";
    
    walletMetadata: HashConnectTypes.WalletMetadata = {
        name: "Example Wallet",
        description: "An example wallet",
        icon: ""
    }

    dappPairings: DappPairing[] = [];

    async initHashconnect() {
        this.hashconnect = new HashConnect();

        await this.hashconnect.init(this.walletMetadata);
        
        this.hashconnect.pairingEvent.on((data) => {
            console.log("pairing event received")
            console.log(data)
        });

        this.hashconnect.transactionEvent.on(this.recievedTransactionRequest)
        this.hashconnect.accountInfoRequestEvent.on(this.accountInfoRequest);

        this.status = "Connected";
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

    async approvePairing(topic: string, accounts: string[], dappData: HashConnectTypes.AppMetadata) {
        this.dappPairings.push(new DappPairing(topic, accounts, dappData));

        let msg: MessageTypes.ApprovePairing = {
            metadata: this.walletMetadata,
            topic: topic,
            accountIds: accounts
        }

        console.log("subscribing: " + topic);
        await this.hashconnect.pair(topic, msg);
        this.status = "Paired";
    }

    async rejectPairing(topic: string) {
        await this.hashconnect.reject(topic, "because I don't want to pair with you");
    }

    async approveAccountInfoRequest(topic: string) {
        let msg: MessageTypes.AccountInfoResponse = {
            accountIds: [this.SigningService.accounts[0].id],
            network: "mainnet",
            topic: topic
        }

        await this.hashconnect.sendAccountInfo(topic, msg);
    }

    getDataByTopic(topic: string): DappPairing {
        let data = this.dappPairings.filter(pairing => {
            if(pairing.topic == topic) return true;
            else return false;
        })

        return data[0];
    }
}
