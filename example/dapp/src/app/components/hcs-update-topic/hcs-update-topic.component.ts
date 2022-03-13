import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { TopicUpdateTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-hcs-update-topic',
    templateUrl: './hcs-update-topic.component.html',
    styleUrls: ['./hcs-update-topic.component.scss']
})
export class HcsUpdateTopicComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    memo: string = "test memo";
    transMemo: string = "Updated topic memo";
    topicId: string = "0.0.30890260";
    signingAcct: string = "";

    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }

                if (_Button.ID === 'send') {
                    this.buildTransaction();
                }
            })
        );

        this.signingAcct = this.SigningService.acc;
    }

    async buildTransaction() {
        let trans = new TopicUpdateTransaction()
            .setTopicId(this.topicId)
            .setTopicMemo(this.transMemo)
            .setTransactionMemo(this.memo);

        let transactionBytes: Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        let res = await this.HashconnectService.sendTransaction(transactionBytes, this.signingAcct, false);

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        if(res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

        this.HashconnectService.showResultOverlay(responseData);
    }

}
