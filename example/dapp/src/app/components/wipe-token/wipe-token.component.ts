import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, TokenWipeTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
  selector: 'app-wipe-token',
  templateUrl: './wipe-token.component.html',
  styleUrls: ['./wipe-token.component.scss']
})
export class WipeTokenComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    signingAcct: string;

    data = {
        tokenId: "",
        amount: 1,
        isNft: false,
        serial: 0,
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
        let trans = await new TokenWipeTransaction()
            .setTokenId(this.data.tokenId)
            .setAccountId(this.data.accountId);

        if(!this.data.isNft)
            trans.setAmount(this.data.amount);
        else if(this.data.isNft){
            trans.setSerials([this.data.serial])
        }

        let res = await this.HashconnectService.sendTransaction(trans, AccountId.fromString(this.signingAcct));

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        this.HashconnectService.showResultOverlay(responseData);
    }

}
