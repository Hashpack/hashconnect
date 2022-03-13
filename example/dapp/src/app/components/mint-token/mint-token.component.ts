import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { TokenMintTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-mint-token',
    templateUrl: './mint-token.component.html',
    styleUrls: ['./mint-token.component.scss']
})
export class MintTokenComponent implements OnInit {

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
        metadata: ""
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
        let trans = await new TokenMintTransaction()
            .setTokenId(this.data.tokenId);

        if(!this.data.isNft)
            trans.setAmount(this.data.amount);
        else if(this.data.isNft){
            let n = 0;
            while (n < this.data.amount) {
                trans.addMetadata(new Uint8Array(Buffer.from(this.data.metadata)));
                n++;
            }
        }

        let transBytes:Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        let res = await this.HashconnectService.sendTransaction(transBytes, this.signingAcct);

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        if(res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

        this.HashconnectService.showResultOverlay(responseData);
    }

}
