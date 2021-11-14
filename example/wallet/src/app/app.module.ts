import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransactionRecievedComponent } from './components/transaction-recieved/transaction-recieved.component';
import { DialogConfigModule, NgxAwesomePopupModule } from '@costlydeveloper/ngx-awesome-popup';
import { PairingRequestComponent } from './components/pairing-request/pairing-request.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionRecievedComponent,
    PairingRequestComponent
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
