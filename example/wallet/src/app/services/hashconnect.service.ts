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
    
    walletMetadata: HashConnectTypes.WalletMetadata = {
        name: "Example Wallet",
        description: "An example wallet",
        icon: ""
    }
    
    
    saveData: {
        dappPairings: DappPairing[],
        privateKey: string
    } = {
        dappPairings: [],
        privateKey: ""
    }

    async initHashconnect() {
        this.hashconnect = new HashConnect();

        if(!this.loadLocalData()){
            let initData = await this.hashconnect.init(this.walletMetadata);
            this.saveData.privateKey = initData.privKey;
        } else {
            await this.hashconnect.init(this.walletMetadata, this.saveData.privateKey);
            this.saveData.dappPairings.forEach(async (pairing) => {
                await this.hashconnect.connect(pairing.topic, pairing.metadata);
            })
        }

        this.hashconnect.pairingEvent.on((data) => {
            console.log("pairing event received")
            console.log(data)
        });

        this.hashconnect.transactionEvent.on(this.recievedTransactionRequest)
        this.hashconnect.additionalAccountRequestEvent.on(this.accountInfoRequest);
        
        this.status = "Connected";

        this.saveLocalData();
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

    accountInfoRequest(request: MessageTypes.AdditionalAccountRequest) {
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

    async approvePairing(topic: string, accounts: string[], dappData: HashConnectTypes.PairingData) {
        this.saveData.dappPairings.push(new DappPairing(topic, accounts, dappData.metadata, dappData.metadata.publicKey as string));

        console.log("subscribing: " + topic);
        await this.hashconnect.pair(dappData, accounts, "testnet");
        this.status = "Paired";

        this.saveLocalData();
    }

    async rejectPairing(topic: string, msg_id: string) {
        await this.hashconnect.reject(topic, "because I don't want to pair with you", msg_id);
    }

    async approveAccountInfoRequest(topic: string, accountIds: string[]) {
        let msg: MessageTypes.AdditionalAccountResponse = {
            accountIds: accountIds,
            network: "mainnet",
            topic: topic
        }

        await this.hashconnect.sendAdditionalAccounts(topic, msg);

        this.saveLocalData();
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
        let data = this.saveData.dappPairings.filter(pairing => {
            if(pairing.topic == topic) return true;
            else return false;
        })

        return data[0];
    }

    saveLocalData() {
        let data = JSON.stringify(this.saveData);
        
        localStorage.setItem("hashconnectWalletData", data);
    }

    loadLocalData(): boolean {
        let foundData = localStorage.getItem("hashconnectWalletData");

        if(foundData){
            this.saveData = JSON.parse(foundData);
            console.log("Found local data", this.saveData)
            return true;
        }
        else
            return false;
    }

    clearPairings() {
        localStorage.removeItem("hashconnectWalletData");
        this.saveData.dappPairings = [];
    }
}
