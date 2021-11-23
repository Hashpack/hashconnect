import { Injectable } from '@angular/core';
import { HashConnect, HashConnectTypes, MessageTypes, TransactionType } from 'hashconnect';
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
    topic: string = "";
    pairingString: string = "";
    

    async initHashconnect() {

        this.hashconnect = new HashConnect();

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

        this.setUpEvents();
    }

    setUpEvents() {
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


    async createTrans() {
        
        let transactionBytes: Uint8Array = await this.SigningService.createTransaction();

        const transaction: MessageTypes.Transaction = {
            topic: this.topic,
            byteArray: transactionBytes,
            type: TransactionType.cryptoTransfer,
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
