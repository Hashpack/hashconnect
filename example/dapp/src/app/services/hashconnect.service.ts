import { Injectable } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { Transaction, TransactionReceipt } from '@hashgraph/sdk';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/types';
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

    appMetadata: HashConnectTypes.AppMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }

    availableExtension: HashConnectTypes.WalletMetadata;
    
    state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
    topic: string;
    pairingString: string;
    pairedWalletData: HashConnectTypes.WalletMetadata | null = null;
    pairedAccountIds: string[];

    async initHashconnect() {
        //create the hashconnect instance
        this.hashconnect = new HashConnect(true);
        this.setUpHashConnectEvents();
        let initData = await this.hashconnect.init(this.appMetadata, "testnet", false);
        
        this.topic = initData.topic;
        this.pairingString = initData.pairingString;
    }

    setUpHashConnectEvents() {
        //This is fired when a extension is found
        this.hashconnect.foundExtensionEvent.on((data) => {
            console.log("Found extension", data);
            this.availableExtension = data;
        })

        //This is fired when a wallet approves a pairing
        this.hashconnect.pairingEvent.on((data) => {
            console.log("Paired with wallet", data);

            this.pairedWalletData = data.metadata;
            this.pairedAccountIds = data.accountIds;
        });

        //This is fired when HashConnect loses connection, pairs successfully, or is starting connection
        this.hashconnect.connectionStatusChangeEvent.on((state) => {
            console.log("hashconnect state change event", state);
            this.state = state;
        })

        //This is fired when an iframe parent responds with wallet data
        this.hashconnect.foundIframeEvent.on(walletMetadata => {
            this.hashconnect.connectToIframeParent();
        })
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
                hideNft: false
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
