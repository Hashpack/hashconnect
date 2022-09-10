import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
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
        let res = await this.HashconnectService.hashconnect.sign(this.HashconnectService.topic, this.signingAcct, { test: "ABC" });
        
        this.HashconnectService.showResultOverlay(res);
    }
}
