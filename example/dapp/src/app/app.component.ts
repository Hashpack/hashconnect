import { Component } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { AssociateTokenComponent } from './components/associate-token/associate-token.component';
import { BurnTokenComponent } from './components/burn-token/burn-token.component';
import { CreateTokenComponent } from './components/create-token/create-token.component';
import { DeleteTokenComponent } from './components/delete-token/delete-token.component';
import { DisassociateTokenComponent } from './components/disassociate-token/disassociate-token.component';
import { MintTokenComponent } from './components/mint-token/mint-token.component';
import { PairingComponent } from './components/pairing/pairing.component';
import { SendTransactionComponent } from './components/send-transaction/send-transaction.component';

import { HashconnectService } from './services/hashconnect.service';
import { SigningService } from './services/signing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp | proposer';

    constructor(
        public HashConnectService: HashconnectService,
        private SigningService: SigningService
    ) {}

    ngOnInit() {
        this.SigningService.init();
        this.HashConnectService.initHashconnect();
    }

    pair() {
        const dialogPopup = new DialogInitializer(PairingComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }

    sendTransaction() {
        const dialogPopup = new DialogInitializer(SendTransactionComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }

    createToken() {
        const dialogPopup = new DialogInitializer(CreateTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }
    
    deleteToken() {
        const dialogPopup = new DialogInitializer(DeleteTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }

    mintToken() {
        const dialogPopup = new DialogInitializer(MintTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }
    
    burnToken() {
        const dialogPopup = new DialogInitializer(BurnTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }
    
    associateToken() {
        const dialogPopup = new DialogInitializer(AssociateTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }

    disassociateToken() {
        const dialogPopup = new DialogInitializer(DisassociateTokenComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Send', 'send', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => { });
    }
}
