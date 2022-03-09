import { Component } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { AssociateTokenComponent } from './components/associate-token/associate-token.component';
import { BurnTokenComponent } from './components/burn-token/burn-token.component';
import { CreateTokenComponent } from './components/create-token/create-token.component';
import { DeleteTokenComponent } from './components/delete-token/delete-token.component';
import { DisassociateTokenComponent } from './components/disassociate-token/disassociate-token.component';
import { FileCreateComponent } from './components/file-create/file-create.component';
import { HcsCreateTopicComponent } from './components/hcs-create-topic/hcs-create-topic.component';
import { HcsDeleteTopicComponent } from './components/hcs-delete-topic/hcs-delete-topic.component';
import { HcsSubmitMessageComponent } from './components/hcs-submit-message/hcs-submit-message.component';
import { MintTokenComponent } from './components/mint-token/mint-token.component';
import { PairingComponent } from './components/pairing/pairing.component';
import { SendTransactionComponent } from './components/send-transaction/send-transaction.component';
import { SmartcontractCallComponent } from './components/smartcontract-call/smartcontract-call.component';
import { SmartcontractCreateComponent } from './components/smartcontract-create/smartcontract-create.component';
import { SmartcontractExecuteComponent } from './components/smartcontract-execute/smartcontract-execute.component';

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

    smartcontractCreate() {
        const dialogPopup = new DialogInitializer(SmartcontractCreateComponent);

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

    smartcontractCall() {
        const dialogPopup = new DialogInitializer(SmartcontractCallComponent);

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

    smartcontractExecute() {
        const dialogPopup = new DialogInitializer(SmartcontractExecuteComponent);

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

    fileCreate() {
        const dialogPopup = new DialogInitializer(FileCreateComponent);

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


    hcsCreateTopic() {
        const dialogPopup = new DialogInitializer(HcsCreateTopicComponent);

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

    hcsDeleteTopic() {
        const dialogPopup = new DialogInitializer(HcsDeleteTopicComponent);

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

    hcsSubmitMessage() {
        const dialogPopup = new DialogInitializer(HcsSubmitMessageComponent);

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
