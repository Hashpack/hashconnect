import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { MessageTypes } from 'hashconnect';
import { Subscription } from 'rxjs';
import { DappPairing } from 'src/app/classes/dapp-pairing';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
  selector: 'app-account-info-request',
  templateUrl: './account-info-request.component.html',
  styleUrls: ['./account-info-request.component.scss']
})
export class AccountInfoRequestComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        private HashConnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    request: MessageTypes.AdditionalAccountRequest;
    sentBy: DappPairing;
    selectedAccounts: string[] = [];
    
    ngOnInit(): void {
        this.request = this.dialogBelonging.CustomData.request;
        this.sentBy = this.HashConnectService.getDataByTopic(this.request.topic);

        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'approve') {
                    this.HashConnectService.approveAccountInfoRequest(this.request.topic, this.selectedAccounts);
                    this.dialogBelonging.EventsController.close();
                }
                else if (_Button.ID === 'reject') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );
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
