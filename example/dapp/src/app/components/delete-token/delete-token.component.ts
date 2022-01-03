import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { TokenDeleteTransaction } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-delete-token',
    templateUrl: './delete-token.component.html',
    styleUrls: ['./delete-token.component.scss']
})
export class DeleteTokenComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    signingAcct: string;

    data = {
        tokenId: ""
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
        let trans = await new TokenDeleteTransaction()
        .setTokenId(this.data.tokenId)

        let transBytes:Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        this.HashconnectService.sendTransaction(transBytes, this.signingAcct);
    }

}
