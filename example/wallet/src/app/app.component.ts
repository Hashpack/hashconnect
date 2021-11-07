import { Component } from '@angular/core';
import { EventType, WakuRelay } from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wallet';
  status = "not started";
  message = "";
  incomingMessage = "";
  private wakuRelay: WakuRelay;

  constructor() {
    this.wakuRelay = new WakuRelay();
    this.wakuRelay.attachEvent(EventType.CONNECT, (msg) => {
      console.log(msg);
      this.status = msg;
    })

    this.wakuRelay.attachEvent(EventType.MESSAGE_RECEIVED, (msg) => {
      console.log("message from peer received: "+msg);
      this.status = "message received"
      this.incomingMessage += msg + "\n";
    })
  }

  async initClient() {
    await this.wakuRelay.init();
  }

  async send() {
    this.status = "message sending...";
    await this.wakuRelay.sendMessage(this.message);
    this.status = "message sent";
  }
}
