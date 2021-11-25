import { Component, Inject, OnInit } from '@angular/core';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { AwesomeQR } from 'awesome-qr';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-pairing',
    templateUrl: './pairing.component.html',
    styleUrls: ['./pairing.component.scss']
})
export class PairingComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        private HashconnectService: HashconnectService
    ) { }

    subscriptions: Subscription = new Subscription();
    qr_url: string = "";

    ngOnInit(): void {
        this.subscriptions.add(
            this.dialogBelonging.EventsController.onButtonClick$.subscribe((_Button) => {
                if (_Button.ID === 'cancel') {
                    this.dialogBelonging.EventsController.close();
                }
            })
        );

        this.HashconnectService.hashconnect.pairingEvent.on((data) => {
            console.log("Pairing event callback ");
            console.log(data)
        })

        new AwesomeQR({
            text: this.HashconnectService.pairingString,
            size: 400,
            margin: 16,
            maskPattern: 110,
            colorLight: "#fff",
            // colorDark: "#1F1D2B"
        }).draw().then((dataURL) => {
            if (dataURL)
                this.qr_url = dataURL.toString();
        });
    }

}
