import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Hbar, HbarUnit, TokenAssociateTransaction, TransferTransaction } from '@hashgraph/sdk';
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

    memo: string = "";
    signingAcct: string = "";

    state: TransactionType = TransactionType.Transfer;

    data = {
        transfer: {
            amount: 1,
            toAcc: ""
        },
        tokenAssociate: {

        }
    }


    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );

        this.signingAcct = this.SigningService.acc;
    }

    buildTransaction() {
        let trans = new TransferTransaction()
            .addHbarTransfer(this.data.transfer.toAcc, Hbar.from(this.data.transfer.amount, HbarUnit.Hbar))
            .addHbarTransfer(this.signingAcct, Hbar.from(-this.data.transfer.amount, HbarUnit.Hbar))
            .setTransactionMemo(this.memo);

            this.HashconnectService.sendTransaction(trans, this.signingAcct);
    }

    buildTokenAssociate() {
        let trans = new TokenAssociateTransaction()
        .setTokenIds(["0.0.13285356"])
        .setAccountId(this.signingAcct)
        .setTransactionMemo(this.memo)

        this.HashconnectService.sendTransaction(trans, this.signingAcct);
    }

}

enum TransactionType {
    Transfer="Transfer",
    TokenAssociate="TokenAssociate"
}