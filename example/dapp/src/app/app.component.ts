import { Component } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { PairingComponent } from './components/pairing/pairing.component';

import { HashconnectService } from './services/hashconnect.service';
import { SigningService } from './services/signing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'dapp | proposer';

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

    pair() {
        const dialogPopup = new DialogInitializer(PairingComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => {});
    }
}
