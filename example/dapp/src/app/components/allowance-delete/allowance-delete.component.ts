import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountAllowanceDeleteTransaction, AccountId, NftId, TokenId, Transaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-allowance-delete',
    templateUrl: './allowance-delete.component.html',
    styleUrls: ['./allowance-delete.component.scss']
})
export class AllowanceDeleteComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    signingAcct: string;
    data = {
        maxAutomaticTokenAssociations: 0,
        key: "",
        accountMemo: "",
        transMemo: "",
        newPublicKey: "",
        tokenId: "",
        serials: []
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }

                if (_Button.ID === 'send') {
                    this.send();
                }
            })
        );
    }

    addSerial() {
        this.data.serials.push(0);
    }

    removeSerial(index: number) {
        this.data.serials.splice(index, 1);
    }

    async send() {
        let trans = new AccountAllowanceDeleteTransaction();

        for(let serial of this.data.serials) {
            trans.deleteAllTokenNftAllowances(new NftId(TokenId.fromString(this.data.tokenId), serial), this.signingAcct)
        }

        let frozenTrans = await this.SigningService.freezeTransaction(trans, this.signingAcct);

        let res = await this.HashconnectService.sendTransaction(frozenTrans, AccountId.fromString(this.signingAcct));

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        this.HashconnectService.showResultOverlay(responseData);
    }


}
