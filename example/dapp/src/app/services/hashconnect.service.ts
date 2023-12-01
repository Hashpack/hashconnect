import { Injectable } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, LedgerId, Transaction, TransactionReceipt } from '@hashgraph/sdk';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState, UserProfile } from 'hashconnect/dist/types';
import { ResultModalComponent } from '../components/result-modal/result-modal.component';
import { SigningService } from './signing.service';


@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor() { }

    hashconnect: HashConnect;

    appMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icons: ["https://www.hashpack.app/img/logo.svg"],
        url: "test.com"
    }

    availableExtension: HashConnectTypes.WalletMetadata;
    
    state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
    topic: string;
    pairingString?: string;
    pairingData: MessageTypes.SessionData;
    userProfile: UserProfile;

    async initHashconnect(isMainnet: boolean) {
        //create the hashconnect instance
        if (isMainnet)
            this.hashconnect = new HashConnect(LedgerId.MAINNET, "bfa190dbe93fcf30377b932b31129d05", this.appMetadata, true);
        else
            this.hashconnect = new HashConnect(LedgerId.TESTNET, "bfa190dbe93fcf30377b932b31129d05", this.appMetadata, true);
        
        //register events
        this.setUpHashConnectEvents();

        //initialize and use returned data
        await this.hashconnect.init();
    }

    setUpHashConnectEvents() {
        //This is fired when a wallet approves a pairing
        this.hashconnect.pairingEvent.on(async (data) => {
            console.log("Paired with wallet", data);

            this.pairingData = data;

            let profile = await this.hashconnect.getUserProfile(this.pairingData.accountIds[0]);
            this.userProfile = profile;
        });

        //This is fired when a wallet disconnects
        this.hashconnect.disconnectionEvent.on((data) => {
            console.log("Disconnected from wallet", data);
        });

        //This is fired when HashConnect loses connection, pairs successfully, or is starting connection
        this.hashconnect.connectionStatusChangeEvent.on((state) => {
            console.log("hashconnect state change event", state);
            this.state = state;
        })
    }

    async connectToExtension() {
        //this will automatically pop up a pairing request in the HashPack extension
        this.hashconnect.connectToLocalWallet();
    }


    async sendTransaction(trans: Transaction, acctToSign: AccountId, return_trans: boolean = false, hideNfts: boolean = false, getRecord: boolean = false) {
        // const transaction: MessageTypes.Transaction = {
        //     topic: this.topic,
        //     byteArray: trans,
            
        //     metadata: {
        //         accountToSign: acctToSign,
        //         returnTransaction: return_trans,
        //         hideNft: hideNfts,
        //         getRecord: getRecord
        //     }
        // }

        return await this.hashconnect.sendTransaction(acctToSign, trans)
    }

    async disconnect() {
        await this.hashconnect.disconnect();

        this.pairingData = null;
        this.userProfile = null;

        // await this.hashconnect.init();
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
