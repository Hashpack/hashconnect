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

@NgModule({
  declarations: [
    AppComponent,
    PairingComponent,
    AccountInfoComponent,
    SendTransactionComponent,
    AssociateTokenComponent,
    DisassociateTokenComponent,
    CreateTokenComponent
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
