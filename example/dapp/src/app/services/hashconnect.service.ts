import { Injectable } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, LedgerId, Transaction, TransactionReceipt, TransactionResponse } from '@hashgraph/sdk';
import { DappMetadata, HashConnect, HashConnectConnectionState, SessionData, UserProfile } from 'hashconnect';
import { ResultModalComponent } from '../components/result-modal/result-modal.component';
import { SigningService } from './signing.service';
import { HashConnectSigner } from 'hashconnect/dist/signer';


@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor() { }

    hashconnect: HashConnect;

    appMetadata: DappMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icons: ["https://assets-global.website-files.com/61ce2e4bcaa2660da2bb419e/61cf5cc71c9324950d7e071d_logo-colour-white.svg"],
        url: "test.com"
    }

    state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
    pairingData: SessionData;
    userProfile: UserProfile;

    async initHashconnect(isMainnet: boolean) {
        //create the hashconnect instance
        if (isMainnet)
            this.hashconnect = new HashConnect(LedgerId.MAINNET, "980abf41b1d12f345370395151338868", this.appMetadata, true);
        else
            this.hashconnect = new HashConnect(LedgerId.TESTNET, "980abf41b1d12f345370395151338868", this.appMetadata, true);
        
        //register events
        this.setUpHashConnectEvents();

        //initialize
        await this.hashconnect.init();
    }

    setUpHashConnectEvents() {
        //This is fired when a wallet approves a pairing
        this.hashconnect.pairingEvent.on(async (newPairing) => {
            console.log("Paired with wallet", newPairing);

            this.pairingData = newPairing;

            let profile = await this.hashconnect.getUserProfile(this.pairingData.accountIds[0]);
            this.userProfile = profile;
        });

        //This is fired when a wallet disconnects
        this.hashconnect.disconnectionEvent.on((data) => {
            console.log("Disconnected from wallet", data);
            this.pairingData = null;
        });

        //This is fired when HashConnect loses connection, pairs successfully, or is starting connection
        this.hashconnect.connectionStatusChangeEvent.on((state) => {
            console.log("hashconnect state change event", state);
            this.state = state;
        })
    }


    async sendTransaction(trans: Transaction, acctToSign: AccountId) {
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
