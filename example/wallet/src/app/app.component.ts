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
  message = "";
  pairingTopic = "";
  incomingMessage = "";
  private hashconnect: HashConnect;

  constructor() {
    this.hashconnect = new HashConnect();
  }

  async initClient() {
    await this.hashconnect.init();
    this.hashconnect.pairingEvent.on((data) => {
      console.log("pairing event received")
      console.log(data)
      this.message = data;
    });
    this.status = "connected";
  }

  async send() {
    // wallet is responder
  }

  async approvePairing() {
    if(this.pairingTopic == "") {
      this.pairingTopic = this.message;
    }
    
    // this currently ignores the pairing topic param
    // await this.hashconnect.sendApproval()
    console.log("subscribing: "+this.pairingTopic);
    await this.hashconnect.pair(this.pairingTopic)
  }

  async rejectPairing() {
    if(this.pairingTopic == "") {
      this.pairingTopic = this.message;
    }
    
    await this.hashconnect.reject(this.pairingTopic, "because I don't want to pair with you");
  }
}
