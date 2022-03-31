import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
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

        debugger
    }

}
