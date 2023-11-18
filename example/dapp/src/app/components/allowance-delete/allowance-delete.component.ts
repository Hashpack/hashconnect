import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountAllowanceDeleteTransaction, NftId, TokenId, Transaction, TransactionReceipt } from '@hashgraph/sdk';
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
    spenderId = "0.0.3183101";

    data: {
        maxAutomaticTokenAssociations: 0,
        key: string,
        accountMemo: string,
        transMemo: string,
        newPublicKey: string,
        nftAllowance: boolean, 
        nftAllowances: { tokenId: string, serial: number, ownerAccountId: string, spenderAccountId: string }[], 
    } = {
        maxAutomaticTokenAssociations: 0,
        key: "",
        accountMemo: "",
        transMemo: "",
        newPublicKey: "",
        nftAllowance: false,
        nftAllowances: [],
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

    addNFTAllowance() {
        this.data.nftAllowances.push({ tokenId: "", serial: 0, ownerAccountId: this.signingAcct, spenderAccountId: this.spenderId })
    }

    async send() {
        let trans = new AccountAllowanceDeleteTransaction();

        for(let allowance of this.data.nftAllowances) {
            trans.deleteAllTokenNftAllowances(new NftId(TokenId.fromString(allowance.tokenId), allowance.serial), this.signingAcct)
        }

        let transBytes: Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        let res = await this.HashconnectService.sendTransaction(transBytes, this.signingAcct);

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        if (res.success) responseData.receipt = TransactionReceipt.fromBytes(res.receipt as Uint8Array);

        this.HashconnectService.showResultOverlay(responseData);
    }


}
