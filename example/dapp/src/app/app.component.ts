import { Component } from '@angular/core';
// import { initWaku, currentMessage, sendMessage } from 'hashconnect';
import { test } from 'hashconnect2';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp';
    status = "not started"
    message = ""
    incomingMessage = "";

    constructor() {
        test("aaa");
    //   console.log(initWaku);
        // currentMessage.subscribe((msg) => this.incomingMessage += msg + "\n")
    }

    async initClient() {
        // await initWaku();
        this.status = "initialized"
      }
    
      async send() {
        this.status = "message sending..."
        // await sendMessage(this.message);
        this.status = "message sent"
      }
}
