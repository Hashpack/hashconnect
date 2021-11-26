import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Subscription } from 'rxjs';
import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { SigningService } from 'src/app/services/signing.service';
import { Transaction, TransferTransaction } from '@hashgraph/sdk';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { DappPairing } from 'src/app/classes/dapp-pairing';

@Component({
    selector: 'app-transaction-recieved',
    templateUrl: './transaction-recieved.component.html',
    styleUrls: ['./transaction-recieved.component.scss']
})
export class TransactionRecievedComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        private SigningService: SigningService,
        private HashConnectService: HashconnectService
    ) { }

    subscriptions: Subscription = new Subscription();
    transaction: MessageTypes.Transaction;
    parsedTransaction: Transaction;
    sentBy: DappPairing;
    display = {
        text: ""
    }

    ngOnInit(): void {
        this.transaction = this.dialogBelonging.CustomData.transaction;
        
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'approve') {
                    this.SigningService.approveTransaction(this.transaction.byteArray as Uint8Array);
                    this.dialogBelonging.EventsController.close();
                }
                else if (_Button.ID === 'reject') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );

        this.parsedTransaction = Transaction.fromBytes(this.transaction.byteArray as Uint8Array);
        this.sentBy = this.HashConnectService.getDataByTopic(this.transaction.topic);

        switch(true) {
            case this.parsedTransaction instanceof TransferTransaction:
                this.display.text = ""
            break;
        }
    }

}
