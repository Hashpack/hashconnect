import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { TopicCreateTransaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
  selector: 'app-hcs-create-topic',
  templateUrl: './hcs-create-topic.component.html',
  styleUrls: ['./hcs-create-topic.component.scss']
})
export class HcsCreateTopicComponent implements OnInit {
    
    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    topicMemo: string = "Test topic";
    memo: string = "test memo";
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
        let trans = new TopicCreateTransaction()
        .setTopicMemo(this.topicMemo)
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
