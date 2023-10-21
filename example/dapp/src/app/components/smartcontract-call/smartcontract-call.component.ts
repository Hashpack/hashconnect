import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { ContractCallQuery, ContractFunctionParameters, Hbar } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-smartcontract-call',
    templateUrl: './smartcontract-call.component.html',
    styleUrls: ['./smartcontract-call.component.scss']
})
export class SmartcontractCallComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        public SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();
    memo: string = "";
    signingAcct: string = "";
    contractId: string = "0.0.30863001";

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
        // //this is the example contract from https://hedera.com/blog/how-to-deploy-smart-contracts-on-hedera-part-1-a-simple-getter-and-setter-contract
        // let trans = new ContractCallQuery()
        // .setContractId(this.contractId)
        // .setGas(100000)
        // .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Alice"))
        // .setMaxQueryPayment(new Hbar(0.00000001));

        // let transactionBytes: Uint8Array = await trans.toBytes();

        // let res = await this.HashconnectService.sendTransaction(transactionBytes, this.signingAcct, false, false, true);

        // //handle response
        // let responseData: any = {
        //     response: res,
        //     receipt: null
        // }

        // //todo: how to change query bytes back to query?
        // // if(res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

        // this.HashconnectService.showResultOverlay(responseData);
    }

}
