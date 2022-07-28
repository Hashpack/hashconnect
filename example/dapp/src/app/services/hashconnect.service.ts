import { Injectable } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { Transaction, TransactionReceipt } from '@hashgraph/sdk';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { ResultModalComponent } from '../components/result-modal/result-modal.component';
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

    appMetadata: HashConnectTypes.AppMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }

    topic: string;
    pairingString: string;
    pairedWalletData: HashConnectTypes.WalletMetadata | null = null;
    pairedAccountIds: string[];

    async initHashconnect() {
        //create the hashconnect instance
        this.hashconnect = new HashConnect(true);
        let hcData = await this.hashconnect.init(this.appMetadata, "testnet");
        
        this.topic = hcData.topic;
        this.pairingString = hcData.pairingString;

        this.setUpEvents();
    }

    setUpEvents() {

        this.hashconnect.foundExtensionEvent.on((data) => {
            this.availableExtensions.push(data);
            console.log("Found extension", data);
        })

        this.hashconnect.foundIframeEvent.on(walletMetadata => {
            this.hashconnect.connectToIframeParent();
        })

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

            this.pairedWalletData = data.metadata;

            this.pairedAccountIds = data.accountIds;

        });


        this.hashconnect.transactionEvent.on((data) => {
            //this will not be common to be used in a dapp
            console.log("transaction event callback");
        });
    }

    async connectToExtension() {
        this.hashconnect.connectToLocalWallet();
    }


    async sendTransaction(trans: Uint8Array, acctToSign: string, return_trans: boolean = false) {
        const transaction: MessageTypes.Transaction = {
            topic: this.topic,
            byteArray: trans,
            
            metadata: {
                accountToSign: acctToSign,
                returnTransaction: return_trans,
            }
        }

        return await this.hashconnect.sendTransaction(this.topic, transaction)
    }

    async requestAccountInfo() {
        let request:MessageTypes.AdditionalAccountRequest = {
            topic: this.topic,
            network: "mainnet",
            multiAccount: true
        } 

        await this.hashconnect.requestAdditionalAccounts(this.topic, request);
    }

    clearPairings() {
        this.hashconnect.clearConnectionsAndData();
        this.pairedAccountIds = [];
        this.pairedWalletData = null;
    }

    showResultOverlay(data: any) {
            const dialogPopup = new DialogInitializer(ResultModalComponent);
    
            dialogPopup.setCustomData({ data: data });
            
            dialogPopup.setConfig({
                Width: '500px',
                LayoutType: DialogLayoutDisplay.NONE
            });
    
            dialogPopup.setButtons([
                new ButtonMaker('Done', 'send', ButtonLayoutDisplay.SUCCESS)
            ]);
    
            dialogPopup.openDialog$().subscribe(resp => { });
    }
}
