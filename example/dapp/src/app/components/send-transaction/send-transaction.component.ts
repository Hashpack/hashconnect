import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Hbar, HbarUnit, TransferTransaction } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-send-transaction',
    templateUrl: './send-transaction.component.html',
    styleUrls: ['./send-transaction.component.scss']
})
export class SendTransactionComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    amount: number = 1;
    memo: string = "";
    fromAcc: string = "";
    toAcc: string;


    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );

        this.toAcc = this.SigningService.acc;
    }

    buildTransaction() {
        let trans = new TransferTransaction()
            .addHbarTransfer(this.toAcc, Hbar.from(this.amount, HbarUnit.Hbar))
            .addHbarTransfer(this.fromAcc, Hbar.from(-this.amount, HbarUnit.Hbar))
            .setTransactionMemo(this.memo);

            this.HashconnectService.sendTransaction(trans, this.fromAcc);
    }

}
