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
            include_hbar: true,
            to_hbar_amount: 1,
            from_hbar_amount: -1,
            toAcc: "0.0.572001",
            include_token: false,
            tokenTransfers: [
                {
                    tokenId: "0.0.3084461",
                    accountId: "",
                    amount: 1
                }
            ],
            include_nft: false,
            nftTransfers: [
                {
                    tokenId: "",
                    serialNumber: 0,
                    treasuryId: "",
                    toId: ""
                }
            ]
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
            .setTransactionMemo(this.memo);

        if (this.data.transfer.include_hbar) {
            trans.addHbarTransfer(this.data.transfer.toAcc, Hbar.from(this.data.transfer.to_hbar_amount, HbarUnit.Hbar))
                .addHbarTransfer(this.signingAcct, Hbar.from(this.data.transfer.from_hbar_amount, HbarUnit.Hbar))
        }

        if (this.data.transfer.include_token) {
            this.data.transfer.tokenTransfers.forEach(tokenTrans => {
                trans.addTokenTransfer(tokenTrans.tokenId, tokenTrans.accountId, tokenTrans.amount)
            })
        }

        if (this.data.transfer.include_nft) {

        }

        this.HashconnectService.sendTransaction(trans, this.signingAcct);
    }

    buildTokenAssociate() {
        let trans = new TokenAssociateTransaction()
            .setTokenIds(["0.0.13285356"])
            .setAccountId(this.signingAcct)
            .setTransactionMemo(this.memo)

        this.HashconnectService.sendTransaction(trans, this.signingAcct);
    }

    addTokenTransfer() {
        this.data.transfer.tokenTransfers.push({
            tokenId: "0.0.3084461",
            accountId: "",
            amount: 1
        })
    }

}

enum TransactionType {
    Transfer = "Transfer",
    TokenAssociate = "TokenAssociate"
}