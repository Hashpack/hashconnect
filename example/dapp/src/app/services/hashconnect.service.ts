import { Injectable } from '@angular/core';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { SigningService } from './signing.service';


@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor(
        private SigningService: SigningService
    ) { }

    hashconnect: HashConnect;
    status: string = "Initializing";
    topic: string = "";
    pairingString: string = "";
    pairedData: MessageTypes.AccountInfoResponse
    appMetadata: HashConnectTypes.AppMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }

    async initHashconnect() {

        this.hashconnect = new HashConnect();

        await this.hashconnect.init(this.appMetadata);

        const state = await this.hashconnect.connect();
        console.log("Received state", state);
        this.topic = state.topic;
        
        this.pairingString = this.hashconnect.generatePairingString(this.topic);

        this.hashconnect.findLocalWallets();

        this.status = "Connected";

        this.setUpEvents();
    }

    setUpEvents() {

        this.hashconnect.transactionEvent.on((data) => {
            console.log("transaction event callback");
        });

        this.hashconnect.accountInfoResponseEvent.on((data) => {
            console.log("Received account info", data);

        })

        this.hashconnect.pairingEvent.on((data) => {
            console.log("Paired with wallet", data);
            this.status = "Paired";
        })
    }


    async createTrans() {
        
        let transactionBytes: Uint8Array = await this.SigningService.createTransaction();

        const transaction: MessageTypes.Transaction = {
            topic: this.topic,
            byteArray: transactionBytes,
            metadata: {
                accountToSign: this.pairedData.accountIds[0]
            }
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
