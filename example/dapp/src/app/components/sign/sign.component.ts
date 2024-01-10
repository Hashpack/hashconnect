import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { AccountId, PublicKey } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignComponent implements OnInit {

  constructor(
    @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
    public HashconnectService: HashconnectService,
  ) { }

  subscriptions: Subscription = new Subscription();
    signingAcct: string;

    data = {
        message: "Hello World!",
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
        let res = await this.HashconnectService.hashconnect.signMessages(AccountId.fromString(this.signingAcct), this.data.message);
        
        let accountInfo = await fetch("https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct);
        let accountInfoJson = await accountInfo.json();
        let publicKey = PublicKey.fromString(accountInfoJson.key.key);

        let verified = this.HashconnectService.hashconnect.verifyMessageSignature(this.data.message, res, publicKey);
        
        this.HashconnectService.showResultOverlay({ verified, res });
    }
}
