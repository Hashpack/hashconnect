import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountAllowanceApproveTransaction, HbarAllowance, NftId, TokenAllowance, TokenId, TokenNftAllowance, Transaction, TransactionReceipt } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-allowance-approve',
    templateUrl: './allowance-approve.component.html',
    styleUrls: ['./allowance-approve.component.scss']
})
export class AllowanceApproveComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    signingAcct: string;
    spenderId = "0.0.467126";

    data: { 
        hbarAllowance: boolean,
        hbarAllowances: { ownerAccountId: string, spenderAccountId: string, amount: number }[],
        nftAllowance: boolean, 
        nftAllowances: { tokenId: string, serial: number, ownerAccountId: string, spenderAccountId: string }[], 
        tokenAllowance: boolean,
        tokenAllowances: { tokenId: string, ownerAccountId: string, spenderAccountId: string, amount: number }[]
    } = {
        hbarAllowance: false,
        hbarAllowances: [],
        nftAllowance: false,
        nftAllowances: [],
        tokenAllowance: false,
        tokenAllowances: []
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

    addHbarAllowance() {
        this.data.hbarAllowances.push({ spenderAccountId: this.spenderId, ownerAccountId: this.signingAcct, amount: 0 });
    }

    addNFTAllowance() {
        this.data.nftAllowances.push({ tokenId: "", serial: 0, ownerAccountId: this.signingAcct, spenderAccountId: this.spenderId })
    }

    addTokenAllowance() {
        this.data.tokenAllowances.push({ tokenId: "", spenderAccountId: this.spenderId, ownerAccountId: this.signingAcct, amount: 0 })
    }

    async send() {
        let trans = new AccountAllowanceApproveTransaction();

        if(this.data.hbarAllowance){
            this.data.hbarAllowances.forEach(allowance => {
                trans.approveHbarAllowance(allowance.ownerAccountId!, allowance.spenderAccountId!, allowance.amount!);
            })
        }

        if(this.data.nftAllowance){
            this.data.nftAllowances.forEach(allowance => {
                let raw = allowance.tokenId.split('.');
                let tokenId: TokenId = new TokenId(parseInt(raw[0]), parseInt(raw[1]), parseInt(raw[2]));
                let nftId = new NftId(tokenId, allowance.serial);
                trans.approveTokenNftAllowance(nftId, allowance.ownerAccountId, allowance.spenderAccountId);
            })
        }

        if(this.data.tokenAllowance){
            this.data.tokenAllowances.forEach(allowance => {
                trans.approveTokenAllowance(allowance.tokenId, allowance.ownerAccountId!, allowance.spenderAccountId!, allowance.amount!);
            })
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
