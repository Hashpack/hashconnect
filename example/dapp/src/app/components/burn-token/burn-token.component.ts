import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, TokenBurnTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-burn-token',
    templateUrl: './burn-token.component.html',
    styleUrls: ['./burn-token.component.scss']
})
export class BurnTokenComponent implements OnInit {
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
        serials: [{ number: 0 }]
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
        this.data.serials.push({ number: 0 })
    }
    

    async send() {
        let trans = new TokenBurnTransaction()
        .setTokenId(this.data.tokenId);

        if(!this.data.isNft)
            trans.setAmount(this.data.amount);
        else if(this.data.isNft) {
            let serials = this.data.serials.map(serial => { return serial.number })
            trans.setSerials(serials);
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
