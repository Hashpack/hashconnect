import { Injectable } from '@angular/core';
import { HashConnect, HashConnectTypes, MessageTypes, PairingData } from 'hashconnect';
import {
    DialogLayoutDisplay,
    DialogInitializer,
    ButtonLayoutDisplay,
    ButtonMaker
} from '@costlydeveloper/ngx-awesome-popup';
import { TransactionRecievedComponent } from '../components/transaction-recieved/transaction-recieved.component';
import { AccountInfoRequestComponent } from '../components/account-info-request/account-info-request.component';
import { DappPairing } from '../classes/dapp-pairing';

@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor(
    ) { }

    hashconnect: HashConnect;
    status: string = "Initializing";
    pairingEncodedData: string = "";
    incomingMessage = "";
    privateKey: Uint8Array;
    
    walletMetadata: HashConnectTypes.WalletMetadata = {
        name: "Example Wallet",
        description: "An example wallet",
        icon: ""
    }

    dappPairings: DappPairing[] = [];

    async initHashconnect() {
        this.hashconnect = new HashConnect();

        let initData = await this.hashconnect.init(this.walletMetadata);
        this.privateKey = initData.privKey;
        
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

        dialogPopup.openDialog$().subscribe(resp => {});
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

        dialogPopup.openDialog$().subscribe(resp => {});
    }

    ////////////////////////////////////SENDERS

    async approvePairing(topic: string, accounts: string[], dappData: PairingData) {
        this.dappPairings.push(new DappPairing(topic, accounts, dappData.metadata, dappData.pubKey as Uint8Array));

        let msg: MessageTypes.ApprovePairing = {
            metadata: this.walletMetadata,
            topic: topic,
            accountIds: accounts
        }

        console.log("subscribing: " + topic);
        await this.hashconnect.pair(topic, msg, dappData.pubKey as Uint8Array);
        this.status = "Paired";
    }

    async rejectPairing(topic: string, msg_id: string) {
        await this.hashconnect.reject(topic, "because I don't want to pair with you", msg_id);
    }

    async approveAccountInfoRequest(topic: string, accountId: string) {
        let msg: MessageTypes.AccountInfoResponse = {
            accountIds: [accountId],
            network: "mainnet",
            topic: topic
        }

        await this.hashconnect.sendAccountInfo(topic, msg);
    }

    async transactionResponse(topic: string, success: boolean, error?: string) {
        let msg: MessageTypes.TransactionResponse = {
            topic: topic,
            success: success
        }

        if(!success && error)
            msg.error = error;

        await this.hashconnect.sendTransactionResponse(topic, msg);
    }


    getDataByTopic(topic: string): DappPairing {
        let data = this.dappPairings.filter(pairing => {
            if(pairing.topic == topic) return true;
            else return false;
        })

        return data[0];
    }
}
