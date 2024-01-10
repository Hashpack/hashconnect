import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, AccountUpdateTransaction, PublicKey, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-account-update',
    templateUrl: './account-update.component.html',
    styleUrls: ['./account-update.component.scss']
})
export class AccountUpdateComponent implements OnInit {

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
        newPublicKey: ""
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

    async send() {
        let trans = await new AccountUpdateTransaction();

        trans.setAccountId(this.signingAcct);
        trans.setMaxAutomaticTokenAssociations(this.data.maxAutomaticTokenAssociations);
        trans.setAccountMemo(this.data.accountMemo);
        trans.setTransactionMemo(this.data.transMemo);
        
        if(this.data.newPublicKey != "") 
            trans.setKey(PublicKey.fromString(this.data.newPublicKey))

        
        let res = await this.HashconnectService.sendTransaction(trans, AccountId.fromString(this.signingAcct));

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        this.HashconnectService.showResultOverlay(responseData);
    }
}
