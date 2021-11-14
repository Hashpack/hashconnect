import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Subscription } from 'rxjs';
import { Transaction as HCTransaction } from 'hashconnect/dist/types';

@Component({
    selector: 'app-transaction-recieved',
    templateUrl: './transaction-recieved.component.html',
    styleUrls: ['./transaction-recieved.component.scss']
})
export class TransactionRecievedComponent implements OnInit {

    constructor(@Inject('dialogBelonging') private dialogBelonging: DialogBelonging) { }

    subscriptions: Subscription = new Subscription();
    transaction: HCTransaction;

    ngOnInit(): void {
        this.transaction = this.dialogBelonging.CustomData.transaction;
        
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'approve') {
                    this.dialogBelonging.EventsController.close();
                }
                else if (_Button.ID === 'reject') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );
    }

}
