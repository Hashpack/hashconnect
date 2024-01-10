import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountInfoQuery, Client, PrivateKey, PublicKey, Transaction } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
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
        //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST SIGN THE PAYLOAD IN YOUR BACKEND
        // // after verified on the server, generate some sort of auth token to use with your backend
        // let payload = { url: "test.com", data: { token: "fufhr9e84hf9w8fehw9e8fhwo9e8fw938fw3o98fhjw3of" } };

        // let signing_data = this.SigningService.signData(payload);

        // //this line you should do client side, after generating the signed payload on the server
        // let res = await this.HashconnectService.hashconnect.authenticate(this.HashconnectService.topic, this.signingAcct, signing_data.serverSigningAccount, signing_data.signature, payload);

        // if(!res.success) {
        //     this.HashconnectService.showResultOverlay(res);
        //     return;
        // }

        // let url = "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct;

        // fetch(url, { method: "GET" }).then(async accountInfoResponse => {
        //     if (accountInfoResponse.ok) {
        //         let data = await accountInfoResponse.json();
        //         console.log("Got account info", data);

        //         if(!res.signedPayload) return; 
                
        //             let server_key_verified = this.SigningService.verifyData(res.signedPayload.originalPayload, this.SigningService.publicKey, res.signedPayload.serverSignature as Uint8Array);
        //             let user_key_verified = this.SigningService.verifyData(res.signedPayload, data.key.key, res.userSignature as Uint8Array);

        //         if(server_key_verified && user_key_verified)
        //             this.HashconnectService.showResultOverlay("Authenticated: true");
        //         else 
        //             this.HashconnectService.showResultOverlay("Authenticated: false");
        //     } else {
        //         alert("Error getting public key")
        //     }
        // })
        // //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST PASS THE TRANSACTION BYTES TO THE SERVER AND VERIFY THERE
        
    }

}
