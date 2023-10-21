import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, TokenFreezeTransaction, TokenRevokeKycTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-token-freeze-account',
    templateUrl: './token-freeze-account.component.html',
    styleUrls: ['./token-freeze-account.component.scss']
})
export class TokenFreezeAccountComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    signingAcct: string;

    data = {
        tokenId: "",
        accountId: ""
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
        let trans = await new TokenFreezeTransaction()
            .setTokenId(this.data.tokenId)
            .setAccountId(this.data.accountId);

        let res = await this.HashconnectService.sendTransaction(trans, AccountId.fromString(this.signingAcct));

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        this.HashconnectService.showResultOverlay(responseData);
    }

}
