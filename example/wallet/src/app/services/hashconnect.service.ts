import { Injectable } from '@angular/core';
import { Transaction as HCTransaction } from 'hashconnect/dist/types';
import {
    DialogLayoutDisplay,
    DialogInitializer,
    ButtonLayoutDisplay,
    ButtonMaker
} from '@costlydeveloper/ngx-awesome-popup';
import { TransactionRecievedComponent } from '../components/transaction-recieved/transaction-recieved.component';

@Injectable({
    providedIn: 'root'
})
export class HashconnectService {

    constructor() { }

    recievedTransaction(transaction: HCTransaction) {
        const dialogPopup = new DialogInitializer(TransactionRecievedComponent);

        dialogPopup.setCustomData({ transaction: transaction }); // optional

        dialogPopup.setConfig({
            Width: '500px',
            LayoutType: DialogLayoutDisplay.NONE
        });

        dialogPopup.setButtons([
            new ButtonMaker('Approve', 'approve', ButtonLayoutDisplay.SUCCESS),
            new ButtonMaker('Reject', 'reject', ButtonLayoutDisplay.DANGER)
        ]);

        dialogPopup.openDialog$().subscribe(resp => {
            console.log('dialog response: ', resp);
        });
    }
}
