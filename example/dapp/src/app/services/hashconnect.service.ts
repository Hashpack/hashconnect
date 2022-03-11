import { Injectable } from '@angular/core';
import { Transaction, TransactionReceipt } from '@hashgraph/sdk';
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
    
    availableExtensions: HashConnectTypes.WalletMetadata[] = []

    saveData: {
        topic: string;
        pairingString: string;
        privateKey?: string;
        pairedWalletData?: HashConnectTypes.WalletMetadata;
        pairedAccounts: string[];
    } = {
        topic: "",
        pairingString: "",
        privateKey: undefined,
        pairedWalletData: undefined,
        pairedAccounts: []
    }

    appMetadata: HashConnectTypes.AppMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }

    async initHashconnect() {
        //create the hashconnect instance
        this.hashconnect = new HashConnect(true);

        if(!this.loadLocalData()){
            //first init, store the private key in localstorage
            let initData = await this.hashconnect.init(this.appMetadata);
            this.saveData.privateKey = initData.privKey;

            //then connect, storing the new topic in localstorage
            const state = await this.hashconnect.connect();
            console.log("Received state", state);
            this.saveData.topic = state.topic;
            
            //generate a pairing string, which you can display and generate a QR code from
            this.saveData.pairingString = this.hashconnect.generatePairingString(state, "testnet", true);
            
            //find any supported local wallets
            this.hashconnect.findLocalWallets();

            this.status = "Connected";
        }
        else {
            await this.hashconnect.init(this.appMetadata, this.saveData.privateKey);
            await this.hashconnect.connect(this.saveData.topic, this.saveData.pairedWalletData!);

            this.status = "Paired";
        }

        this.setUpEvents();
    }

    setUpEvents() {

        this.hashconnect.foundExtensionEvent.on((data) => {
            this.availableExtensions.push(data);
            console.log("Found extension", data);
        })

        // this.hashconnect.transactionResponseEvent.on((data) => {
        //     // console.log("transaction response", data)
        //     if(data.success && !data.signedTransaction)
        //         console.log(TransactionReceipt.fromBytes(data.receipt as Uint8Array));
        //     else if(data.success && data.signedTransaction)
        //         console.log(Transaction.fromBytes(data.signedTransaction as Uint8Array));
        // })

        // this.hashconnect.additionalAccountResponseEvent.on((data) => {
        //     console.log("Received account info", data);
            
        //     data.accountIds.forEach(id => {
        //         if(this.saveData.pairedAccounts.indexOf(id) == -1)
        //             this.saveData.pairedAccounts.push(id);
        //     })
        // })

        this.hashconnect.pairingEvent.on((data) => {
            console.log("Paired with wallet", data);
            this.status = "Paired";

            this.saveData.pairedWalletData = data.metadata;

            data.accountIds.forEach(id => {
                if(this.saveData.pairedAccounts.indexOf(id) == -1)
                    this.saveData.pairedAccounts.push(id);
            })

            this.saveDataInLocalstorage();
        });


        this.hashconnect.transactionEvent.on((data) => {
            //this will not be common to be used in a dapp
            console.log("transaction event callback");
        });
    }

    async connectToExtension() {
        this.hashconnect.connectToLocalWallet(this.saveData.pairingString);
    }


    async sendTransaction(trans: Uint8Array, acctToSign: string, return_trans: boolean = false) {
        

        const transaction: MessageTypes.Transaction = {
            topic: this.saveData.topic,
            byteArray: trans,
            
            metadata: {
                accountToSign: acctToSign,
                returnTransaction: return_trans
            }
        }

        return await this.hashconnect.sendTransaction(this.saveData.topic, transaction)
    }

    async requestAccountInfo() {
        let request:MessageTypes.AdditionalAccountRequest = {
            topic: this.saveData.topic,
            network: "mainnet",
            multiAccount: true
        } 

        await this.hashconnect.requestAdditionalAccounts(this.saveData.topic, request);
    }

    saveDataInLocalstorage() {
        let data = JSON.stringify(this.saveData);
        
        localStorage.setItem("hashconnectData", data);
    }

    loadLocalData() :boolean {
        let foundData = localStorage.getItem("hashconnectData");

        if(foundData){
            this.saveData = JSON.parse(foundData);
            console.log("Found local data", this.saveData)
            return true;
        }
        else
            return false;
    }

    clearPairings() {
        this.saveData.pairedAccounts = [];
        this.saveData.pairedWalletData = undefined;
        this.status = "Connected";
        localStorage.removeItem("hashconnectData");
    }
}
