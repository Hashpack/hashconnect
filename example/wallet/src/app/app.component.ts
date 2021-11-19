import { Component } from '@angular/core';
import { ButtonLayoutDisplay, ButtonMaker, DialogInitializer, DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { PairingRequestComponent } from './components/pairing-request/pairing-request.component';
import { HashconnectService } from './services/hashconnect.service';
import { SigningService } from './services/signing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'wallet | responder';    

    constructor(
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) {}

    ngOnInit() {
        this.SigningService.init();
        this.HashconnectService.initHashconnect();
    }

    
    connectToDapp() {
        const dialogPopup = new DialogInitializer(PairingRequestComponent);

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Cancel', 'cancel', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => {
            console.log('dialog response: ', resp);
        });
    }
    
}
