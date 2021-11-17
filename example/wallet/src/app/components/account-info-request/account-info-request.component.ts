import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { MessageTypes } from 'hashconnect';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';

@Component({
  selector: 'app-account-info-request',
  templateUrl: './account-info-request.component.html',
  styleUrls: ['./account-info-request.component.scss']
})
export class AccountInfoRequestComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        private HashConnectService: HashconnectService
    ) { }

    subscriptions: Subscription = new Subscription();
    request: MessageTypes.AccountInfoRequest;

    ngOnInit(): void {
        this.request = this.dialogBelonging.CustomData.request;
        
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'approve') {
                    this.HashConnectService.approveAccountInfoRequest();
                    this.dialogBelonging.EventsController.close();
                }
                else if (_Button.ID === 'reject') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );
    }

}
