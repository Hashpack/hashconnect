import { Component } from '@angular/core';

import { HashconnectService } from './services/hashconnect.service';
import { SigningService } from './services/signing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp | proposer';
    status = "Initializing";
    message = "";

    constructor(
        public HashConnectService: HashconnectService,
        private SigningService: SigningService
    ) {
    }

    ngOnInit() {
        console.log("initializing hashgroid client");
        this.SigningService.init();
        this.HashConnectService.initHashconnect();
    }
}
