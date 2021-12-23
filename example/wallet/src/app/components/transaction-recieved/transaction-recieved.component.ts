import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Subscription } from 'rxjs';
import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { SigningService } from 'src/app/services/signing.service';
import { Hbar, TokenAssociateTransaction, TokenDissociateTransaction, Transaction, TransferTransaction } from '@hashgraph/sdk';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { DappPairing } from 'src/app/classes/dapp-pairing';
import TokenTransferAccountMap from '@hashgraph/sdk/lib/account/TokenTransferAccountMap';

@Component({
    selector: 'app-transaction-recieved',
    templateUrl: './transaction-recieved.component.html',
    styleUrls: ['./transaction-recieved.component.scss']
})
export class TransactionRecievedComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        private SigningService: SigningService,
        private HashConnectService: HashconnectService
    ) { }

    subscriptions: Subscription = new Subscription();
    transaction: MessageTypes.Transaction;
    parsedTransaction: Transaction;
    sentBy: DappPairing;

    type: DisplayTypes;
    
    display: any = {
        hbarTransfers: [],
        nftTransfers: [],
        tokenTransfers: [],
        tokenAssociateIds: [],
        tokenDisassociateIds: []
    }

    ngOnInit(): void {
        this.transaction = this.dialogBelonging.CustomData.transaction;
        
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'approve') {
                    this.SigningService.approveTransaction(this.transaction.byteArray as Uint8Array, this.transaction.metadata.accountToSign, this.transaction.topic);
                    this.dialogBelonging.EventsController.close();
                }
                else if (_Button.ID === 'reject') {
                    this.dialogBelonging.EventsController.close();
                    this.HashConnectService.transactionResponse(this.transaction.topic, false, "User rejected")
                }
            })
        );

        this.parsedTransaction = Transaction.fromBytes(this.transaction.byteArray as Uint8Array);
        this.sentBy = this.HashConnectService.getDataByTopic(this.transaction.topic);

        switch(true) {
            case this.parsedTransaction instanceof TransferTransaction:
                this.type = DisplayTypes.Transfer;

                let trans: TransferTransaction =  this.parsedTransaction as TransferTransaction;

                trans.hbarTransfers._map.forEach((value: Hbar, key: string, map: Map<string, Hbar>) => {
                    this.display.hbarTransfers.push({ account: key, value: value});
                })

                trans.tokenTransfers._map.forEach((transfers: TokenTransferAccountMap, tokenId: string) => {
                    let tokenTransferData: any = { tokenId: tokenId, transfers: []};

                    transfers._map.forEach((value: Long, key: string) => {
                        tokenTransferData.transfers.push({ accountId: key, amount: value.toString() })
                    })

                    this.display.tokenTransfers.push(tokenTransferData);
                })

            break;
            case this.parsedTransaction instanceof TokenAssociateTransaction:
                this.type = DisplayTypes.TokenAssociate;

                let assTrans: TokenAssociateTransaction = this.parsedTransaction as TokenAssociateTransaction;
                
                assTrans.tokenIds?.forEach(token => {
                    this.display.tokenAssociateIds.push(token.toString());
                })
            break;
            case this.parsedTransaction instanceof TokenDissociateTransaction:
                this.type = DisplayTypes.TokenDisassociate;

                let disassTrans: TokenDissociateTransaction = this.parsedTransaction as TokenDissociateTransaction;
                
                disassTrans.tokenIds?.forEach(token => {
                    this.display.tokenDisassociateIds.push(token.toString());
                })
            break;
        }
    }
}

enum DisplayTypes {
    Transfer="Transfer",
    TokenAssociate="TokenAssociate",
    TokenDisassociate="TokenDisassociate",
    TokenCreate="TokenCreate"
}
