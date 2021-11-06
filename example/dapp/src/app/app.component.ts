import { Component } from '@angular/core';
import { event, initWaku, sendMessage } from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dapp';
  status = "not started";
  message = "";

  constructor() {

  }

  async initClient() {
    await initWaku();
    this.status = "initialized";
  }

  async send() {
    this.status = "message sending...";
    await sendMessage(this.message);
    this.status = "message sent";
  }
}
