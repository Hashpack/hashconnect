import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogConfigModule, NgxAwesomePopupModule } from '@costlydeveloper/ngx-awesome-popup';
import { PairingComponent } from './components/pairing/pairing.component';
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

@NgModule({
  declarations: [
    AppComponent,
    PairingComponent,
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
    AccountUpdateComponent
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
