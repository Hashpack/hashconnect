import { Component } from '@angular/core';
import { HashConnect } from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dapp | proposer';
  status = "not started";
  message = "";
  incomingMessage = "";
  private hashconnect: HashConnect;

  constructor() {
    this.hashconnect = new HashConnect();
  }

  async initClient() {
    await this.hashconnect.init();
    this.status = "connected"

    this.hashconnect.pairingEvent.on((data) => {
      console.log("Pairing event callback ");
      console.log(data)
      this.status = data;
    })
  }

  async proposePairing() {
    this.status = "Proposing pair"
    // Use the pairing topic in hashconnect, this will eventually be a random string of hex or a UUID
    const state = await this.hashconnect.connect();
    console.log("Received state", state);

    this.incomingMessage = state.topic; 
  }
}
