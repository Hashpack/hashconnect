import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogConfigModule, NgxAwesomePopupModule } from '@costlydeveloper/ngx-awesome-popup';
import { AccountInfoComponent } from './components/account-info/account-info.component';
import { SendTransactionComponent } from './components/send-transaction/send-transaction.component';
import { AssociateTokenComponent } from './components/associate-token/associate-token.component';
import { DisassociateTokenComponent } from './components/disassociate-token/disassociate-token.component';
import { CreateTokenComponent } from './components/create-token/create-token.component';
import { DeleteTokenComponent } from './components/delete-token/delete-token.component';
import { MintTokenComponent } from './components/mint-token/mint-token.component';
import { BurnTokenComponent } from './components/burn-token/burn-token.component';
import { SmartcontractCreateComponent } from './components/smartcontract-create/smartcontract-create.component';
import { FileCreateComponent } from './components/file-create/file-create.component';
import { SmartcontractCallComponent } from './components/smartcontract-call/smartcontract-call.component';
import { SmartcontractExecuteComponent } from './components/smartcontract-execute/smartcontract-execute.component';
import { HcsCreateTopicComponent } from './components/hcs-create-topic/hcs-create-topic.component';
import { HcsSubmitMessageComponent } from './components/hcs-submit-message/hcs-submit-message.component';
import { HcsDeleteTopicComponent } from './components/hcs-delete-topic/hcs-delete-topic.component';
import { HcsUpdateTopicComponent } from './components/hcs-update-topic/hcs-update-topic.component';
import { SmartcontractDeleteComponent } from './components/smartcontract-delete/smartcontract-delete.component';
import { ResultModalComponent } from './components/result-modal/result-modal.component';
import { FileAppendComponent } from './components/file-append/file-append.component';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { AccountUpdateComponent } from './components/account-update/account-update.component';
import { AllowanceApproveComponent } from './components/allowance-approve/allowance-approve.component';
import { AllowanceDeleteComponent } from './components/allowance-delete/allowance-delete.component';
import { SignComponent } from './components/sign/sign.component';
import { PauseTokenComponent } from './components/pause-token/pause-token.component';
import { UnpauseTokenComponent } from './components/unpause-token/unpause-token.component';
import { WipeTokenComponent } from './components/wipe-token/wipe-token.component';
import { TokenKycGrantComponent } from './components/token-kyc-grant/token-kyc-grant.component';
import { TokenKycRevokeComponent } from './components/token-kyc-revoke/token-kyc-revoke.component';
import { TokenFreezeAccountComponent } from './components/token-freeze-account/token-freeze-account.component';
import { TokenUnfreezeAccountComponent } from './components/token-unfreeze-account/token-unfreeze-account.component';
import { PrngTransactionComponent } from './components/prng-transaction/prng-transaction.component';
import { TokenFeeUpdateComponent } from './components/token-fee-update/token-fee-update.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountInfoComponent,
    SendTransactionComponent,
    AssociateTokenComponent,
    DisassociateTokenComponent,
    CreateTokenComponent,
    DeleteTokenComponent,
    MintTokenComponent,
    BurnTokenComponent,
    SmartcontractCreateComponent,
    FileCreateComponent,
    SmartcontractCallComponent,
    SmartcontractExecuteComponent,
    HcsCreateTopicComponent,
    HcsSubmitMessageComponent,
    HcsDeleteTopicComponent,
    HcsUpdateTopicComponent,
    SmartcontractDeleteComponent,
    ResultModalComponent,
    FileAppendComponent,
    AuthenticateComponent,
    AccountUpdateComponent,
    AllowanceApproveComponent,
    AllowanceDeleteComponent,
    SignComponent,
    PauseTokenComponent,
    UnpauseTokenComponent,
    WipeTokenComponent,
    TokenKycGrantComponent,
    TokenKycRevokeComponent,
    TokenFreezeAccountComponent,
    TokenUnfreezeAccountComponent,
    PrngTransactionComponent,
    TokenFeeUpdateComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxAwesomePopupModule.forRoot(),
    DialogConfigModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
