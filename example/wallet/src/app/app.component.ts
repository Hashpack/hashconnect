import { Component } from '@angular/core';
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

    

    
}
