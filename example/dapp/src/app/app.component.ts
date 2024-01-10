import { Component } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { AccountUpdateComponent } from './components/account-update/account-update.component';
import { AllowanceApproveComponent } from './components/allowance-approve/allowance-approve.component';
import { AllowanceDeleteComponent } from './components/allowance-delete/allowance-delete.component';
import { AssociateTokenComponent } from './components/associate-token/associate-token.component';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { BurnTokenComponent } from './components/burn-token/burn-token.component';
import { CreateTokenComponent } from './components/create-token/create-token.component';
import { DeleteTokenComponent } from './components/delete-token/delete-token.component';
import { DisassociateTokenComponent } from './components/disassociate-token/disassociate-token.component';
import { FileAppendComponent } from './components/file-append/file-append.component';
import { FileCreateComponent } from './components/file-create/file-create.component';
import { HcsCreateTopicComponent } from './components/hcs-create-topic/hcs-create-topic.component';
import { HcsDeleteTopicComponent } from './components/hcs-delete-topic/hcs-delete-topic.component';
import { HcsSubmitMessageComponent } from './components/hcs-submit-message/hcs-submit-message.component';
import { HcsUpdateTopicComponent } from './components/hcs-update-topic/hcs-update-topic.component';
import { MintTokenComponent } from './components/mint-token/mint-token.component';
import { PauseTokenComponent } from './components/pause-token/pause-token.component';
import { PrngTransactionComponent } from './components/prng-transaction/prng-transaction.component';
import { SendTransactionComponent } from './components/send-transaction/send-transaction.component';
import { SignComponent } from './components/sign/sign.component';
import { SmartcontractCallComponent } from './components/smartcontract-call/smartcontract-call.component';
import { SmartcontractCreateComponent } from './components/smartcontract-create/smartcontract-create.component';
import { SmartcontractDeleteComponent } from './components/smartcontract-delete/smartcontract-delete.component';
import { SmartcontractExecuteComponent } from './components/smartcontract-execute/smartcontract-execute.component';
import { TokenFeeUpdateComponent } from './components/token-fee-update/token-fee-update.component';
import { TokenFreezeAccountComponent } from './components/token-freeze-account/token-freeze-account.component';
import { TokenKycGrantComponent } from './components/token-kyc-grant/token-kyc-grant.component';
import { TokenKycRevokeComponent } from './components/token-kyc-revoke/token-kyc-revoke.component';
import { TokenUnfreezeAccountComponent } from './components/token-unfreeze-account/token-unfreeze-account.component';
import { UnpauseTokenComponent } from './components/unpause-token/unpause-token.component';
import { WipeTokenComponent } from './components/wipe-token/wipe-token.component';

import { HashconnectService } from './services/hashconnect.service';
import { SigningService } from './services/signing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp | proposer';
    viewData = false;
    isMainnet = false;

    constructor(
        public HashConnectService: HashconnectService,
        private SigningService: SigningService
    ) {}

    ngOnInit() {
        this.SigningService.init();
        this.HashConnectService.initHashconnect(false);
    }

    async toggleMainnet() {
        await this.HashConnectService.disconnect();
        await this.HashConnectService.initHashconnect(this.isMainnet);
    }

    pair() {
        // const dialogPopup = new DialogInitializer(PairingComponent);

        // dialogPopup.setConfig({
        //     Width: '500px',
        //     LayoutType: DialogLayoutDisplay.NONE
        // });

        // dialogPopup.setButtons([
        //     new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        // ]);

        // dialogPopup.openDialog$().subscribe(resp => { });
        this.HashConnectService.hashconnect.openPairingModal();
    }

    auth() {
        const dialogPopup = new DialogInitializer(AuthenticateComponent);
        this.doPopupStuff(dialogPopup);
    }

    sign() {
        const dialogPopup = new DialogInitializer(SignComponent);
        this.doPopupStuff(dialogPopup);
    }

    sendTransaction() {
        const dialogPopup = new DialogInitializer(SendTransactionComponent);
        this.doPopupStuff(dialogPopup);
    }

    createToken() {
        const dialogPopup = new DialogInitializer(CreateTokenComponent);
        this.doPopupStuff(dialogPopup);
    }
    
    deleteToken() {
        const dialogPopup = new DialogInitializer(DeleteTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    mintToken() {
        const dialogPopup = new DialogInitializer(MintTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    pauseToken() {
        const dialogPopup = new DialogInitializer(PauseTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    unpauseToken() {
        const dialogPopup = new DialogInitializer(UnpauseTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    wipeToken() {
        const dialogPopup = new DialogInitializer(WipeTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    kycGrant() {
        const dialogPopup = new DialogInitializer(TokenKycGrantComponent);
        this.doPopupStuff(dialogPopup);
    }

    kycRevoke() {
        const dialogPopup = new DialogInitializer(TokenKycRevokeComponent);
        this.doPopupStuff(dialogPopup);
    }
    
    freezeToken() {
        const dialogPopup = new DialogInitializer(TokenFreezeAccountComponent);
        this.doPopupStuff(dialogPopup);
    }

    unfreezeToken() {
        const dialogPopup = new DialogInitializer(TokenUnfreezeAccountComponent);
        this.doPopupStuff(dialogPopup);
    }
    
    burnToken() {
        const dialogPopup = new DialogInitializer(BurnTokenComponent);
        this.doPopupStuff(dialogPopup);
    }
    
    associateToken() {
        const dialogPopup = new DialogInitializer(AssociateTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    disassociateToken() {
        const dialogPopup = new DialogInitializer(DisassociateTokenComponent);
        this.doPopupStuff(dialogPopup);
    }

    smartcontractCreate() {
        const dialogPopup = new DialogInitializer(SmartcontractCreateComponent);
        this.doPopupStuff(dialogPopup);
    }

    smartcontractCall() {
        const dialogPopup = new DialogInitializer(SmartcontractCallComponent);
        this.doPopupStuff(dialogPopup);
    }

    smartcontractExecute() {
        const dialogPopup = new DialogInitializer(SmartcontractExecuteComponent);
        this.doPopupStuff(dialogPopup);
    }

    smartcontractDelete() {
        const dialogPopup = new DialogInitializer(SmartcontractDeleteComponent);
        this.doPopupStuff(dialogPopup);
    }

    fileCreate() {
        const dialogPopup = new DialogInitializer(FileCreateComponent);
        this.doPopupStuff(dialogPopup);
    }

    fileAppend() {
        const dialogPopup = new DialogInitializer(FileAppendComponent);
        this.doPopupStuff(dialogPopup);
    }

    hcsCreateTopic() {
        const dialogPopup = new DialogInitializer(HcsCreateTopicComponent);
        this.doPopupStuff(dialogPopup);
    }

    hcsDeleteTopic() {
        const dialogPopup = new DialogInitializer(HcsDeleteTopicComponent);
        this.doPopupStuff(dialogPopup);
    }

    hcsUpdateTopic() {
        const dialogPopup = new DialogInitializer(HcsUpdateTopicComponent);
        this.doPopupStuff(dialogPopup);
    }

    hcsSubmitMessage() {
        const dialogPopup = new DialogInitializer(HcsSubmitMessageComponent);
        this.doPopupStuff(dialogPopup);
    }

    accountUpdate() {
        const dialogPopup = new DialogInitializer(AccountUpdateComponent);
        this.doPopupStuff(dialogPopup);
    }

    allowanceApprove() {
        const dialogPopup = new DialogInitializer(AllowanceApproveComponent);
        this.doPopupStuff(dialogPopup);
    }

    allowanceDelete() {
        const dialogPopup = new DialogInitializer(AllowanceDeleteComponent);
        this.doPopupStuff(dialogPopup);
    }

    prngTrans() {
        const dialogPopup = new DialogInitializer(PrngTransactionComponent);
        this.doPopupStuff(dialogPopup);
    }

    tokenFeeUpdate() {
        const dialogPopup = new DialogInitializer(TokenFeeUpdateComponent);
        this.doPopupStuff(dialogPopup);
    }


    doPopupStuff(dialogPopup: DialogInitializer) {
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

    async getUserProfile() {
        let profile = await this.HashConnectService.hashconnect.getUserProfile(this.HashConnectService.pairingData.accountIds[0]);
    
        if(profile)
            this.HashConnectService.userProfile = profile;
        
        console.log("Got profile", profile)
    }
}
