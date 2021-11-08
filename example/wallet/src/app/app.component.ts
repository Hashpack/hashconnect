import { Component } from '@angular/core';
import { HashConnect } from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wallet | responder';
  status = "not started";
  message = "/my-first-pair/pairing";
  incomingMessage = "";
  pairingTopic = "/my-first-pair/pairing";
  private hashconnect: HashConnect;

  constructor() {
    this.hashconnect = new HashConnect();
  }

  async initClient() {
    await this.hashconnect.connect();
    this.hashconnect.pairingEvent.on((data) => {
      console.log("pairing event received")
      console.log(data)
    });
    this.status = "connected";
  }

  async send() {
    // wallet is responder
  }

  async subscribe() {
    // this currently ignores the pairing topic param
    await this.hashconnect.pair(this.pairingTopic)
  }

  async approvePairing() {
    // this currently ignores the pairing topic param
    // await this.hashconnect.sendApproval()
    await this.hashconnect.pair(this.pairingTopic)
  }

  async rejectPairing() {
    await this.hashconnect.reject();
  }
}
