import { Component } from '@angular/core';
import { HashConnect } from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dapp';
  status = "not started";
  message = "";
  incomingMessage = "";
  private hashconnect: HashConnect;

  constructor() {
    this.hashconnect = new HashConnect();
    this.hashconnect.events.connected.on((msg) => {
      console.log(msg);
      this.status = msg;
    });

    

    this.hashconnect.events.messageReceived.on((msg) => {
      console.log("message from peer received: "+msg);
      this.status = "message received"
      this.incomingMessage += msg + "\n";
    })
  }

  async initClient() {
    await this.hashconnect.connect();
  }

  async send() {
    this.status = "message sending...";
    await this.hashconnect.sendMessage(this.message);
    this.status = "message sent";
  }
}
