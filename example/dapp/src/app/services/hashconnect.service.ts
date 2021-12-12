import { Injectable } from '@angular/core';
import { Transaction } from '@hashgraph/sdk';
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
    privateKey: Uint8Array;
    pairedWalletData: HashConnectTypes.WalletMetadata;
    pairedAccounts: string[] = [];
    availableExtensions: HashConnectTypes.WalletMetadata[] = []

    appMetadata: HashConnectTypes.AppMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }

    async initHashconnect() {

        //create the hashconnect instance
        this.hashconnect = new HashConnect();

        //first init, store the private key in localstorage
        let initData = await this.hashconnect.init(this.appMetadata);
        this.privateKey = initData.privKey;

        //then connect, storing the new topic in localstorage
        const state = await this.hashconnect.connect();
        console.log("Received state", state);
        this.topic = state.topic;
        
        //generate a pairing string, which you can display and generate a QR code from
        this.pairingString = this.hashconnect.generatePairingString(state);

        //find any supported local wallets
        this.hashconnect.findLocalWallets();

        this.status = "Connected";

        this.setUpEvents();
    }

    setUpEvents() {

        this.hashconnect.foundExtensionEvent.on((data) => {
            this.availableExtensions.push(data);
            console.log("Found extension", data);
        })

        this.hashconnect.transactionEvent.on((data) => {
            //this will not be common to be used in a dapp
            console.log("transaction event callback");
        });

        this.hashconnect.transactionResponseEvent.on((data) => {
            console.log("transaction response", data)
        })

        this.hashconnect.accountInfoResponseEvent.on((data) => {
            console.log("Received account info", data);

            data.accountIds.forEach(id => {
                if(this.pairedAccounts.indexOf(id) == -1)
                    this.pairedAccounts.push(id);
            })
        })

        this.hashconnect.pairingEvent.on((data) => {
            console.log("Paired with wallet", data);
            this.status = "Paired";

            data.accountIds.forEach(id => {
                if(this.pairedAccounts.indexOf(id) == -1)
                    this.pairedAccounts.push(id);
            })
        })
    }

    async connectToExtension() {
        this.hashconnect.connectToLocalWallet(this.pairingString);
    }


    async sendTransaction(trans: Transaction, acctToSign: string) {
        
        let transactionBytes: Uint8Array = await this.SigningService.signAndMakeBytes(trans);

        const transaction: MessageTypes.Transaction = {
            topic: this.topic,
            byteArray: transactionBytes,
            metadata: {
                accountToSign: acctToSign,
                returnTransaction: false
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
