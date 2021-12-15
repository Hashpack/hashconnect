import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { HashConnect, HashConnectTypes } from 'hashconnect';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-pairing-request',
    templateUrl: './pairing-request.component.html',
    styleUrls: ['./pairing-request.component.scss']
})
export class PairingRequestComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    pairingString: string;
    pairingData: HashConnectTypes.PairingData;
    selectedAccounts: string[] = [];

    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );
    }

    parsePairingString() {
        this.pairingData = this.HashconnectService.hashconnect.decodePairingString(this.pairingString);
    }

    async approvePairing() {
        await this.HashconnectService.approvePairing(this.pairingData.topic, this.selectedAccounts, this.pairingData);
        this.dialogBelonging.EventsController.close();
    }

    rejectPairing() {
        this.dialogBelonging.EventsController.close();
    }

    checkbox(event: any, accId: string) {
        if(event.target.checked)
            this.selectedAccounts.push(accId);
        else {
            this.selectedAccounts = this.selectedAccounts.filter(id => id != accId);
        }

        console.log(this.selectedAccounts);

    }

}
