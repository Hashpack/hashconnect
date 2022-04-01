import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountInfoQuery, Client, PublicKey, Transaction } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        
    ) { }

    subscriptions: Subscription = new Subscription();
    signingAcct: string;

    data = {
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
        let res = await this.HashconnectService.hashconnect.authenticate(this.HashconnectService.saveData.topic, this.signingAcct);

        if(!res.success) {
            this.HashconnectService.showResultOverlay(res);
            return;
        }

        //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST PASS THE TRANSACTION BYTES TO THE SERVER AND VERIFY THERE
        // after verified on the server, generate some sort of auth token to use with your backend
        let trans = Transaction.fromBytes(res.signedTransaction as Uint8Array);

        let url = "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct;

        fetch(url, { method: "GET" }).then(async res => {
            if (res.ok) {
                let data = await res.json();
                console.log("Got account info")

                let pubKey = PublicKey.fromString(data.key.key);
                let authenticated = pubKey.verifyTransaction(trans as Transaction)

                this.HashconnectService.showResultOverlay("Authenticated: " + authenticated);
            } else {
                alert("Error getting public key")
            }
        })
        //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST PASS THE TRANSACTION BYTES TO THE SERVER AND VERIFY THERE
        
    }

}
