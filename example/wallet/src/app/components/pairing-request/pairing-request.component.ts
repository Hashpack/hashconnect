import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { HashConnect } from 'hashconnect';
import { PairingData } from 'hashconnect/dist/types';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';

@Component({
    selector: 'app-pairing-request',
    templateUrl: './pairing-request.component.html',
    styleUrls: ['./pairing-request.component.scss']
})
export class PairingRequestComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
    ) { }

    subscriptions: Subscription = new Subscription();
    pairingString: string;
    pairingData: PairingData;

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
        this.HashconnectService.pairingTopic = this.pairingData.topic;
        await this.HashconnectService.approvePairing();
        this.dialogBelonging.EventsController.close();
    }

    rejectPairing() {
        this.dialogBelonging.EventsController.close();
    }

}
