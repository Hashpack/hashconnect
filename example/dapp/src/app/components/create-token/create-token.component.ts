import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { CustomFee, CustomFixedFee, CustomRoyaltyFee, Hbar, HbarUnit, PublicKey, TokenCreateTransaction, TokenSupplyType, TokenType } from '@hashgraph/sdk';
import { Subscription } from 'rxjs';
import { HashconnectService } from 'src/app/services/hashconnect.service';
import { SigningService } from 'src/app/services/signing.service';

@Component({
    selector: 'app-create-token',
    templateUrl: './create-token.component.html',
    styleUrls: ['./create-token.component.scss']
})
export class CreateTokenComponent implements OnInit {

    constructor(
        @Inject('dialogBelonging') private dialogBelonging: DialogBelonging,
        public HashconnectService: HashconnectService,
        private SigningService: SigningService
    ) { }

    subscriptions: Subscription = new Subscription();

    signingAcct: string;

    type = "Fungible";
    supplyType = "Infinite";

    tokenData = {
        name: "TokenTest"+Math.random(),
        symbol: "",
        type: TokenType.FungibleCommon,
        supplyType: TokenSupplyType.Infinite,
        initialSupply: 0,
        maxSupply: 0,
        includeRoyalty: false,
        includeFixedFee: false,
        includeFractionalFee: false,
        royaltyPercent: 1,
        fixedFee: 0,
        fractionalFee: 0,
        fallbackFee: 0
    }
    

    ngOnInit(): void {
        let randNum = Math.floor(Math.random() * 500);
        this.tokenData.name = "HC-TokenTest" + randNum;
        this.tokenData.symbol = "HC-"+randNum;

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

    changeType(evt: string) {
        if(evt == "Fungible")
            this.tokenData.type = TokenType.FungibleCommon
        else
            this.tokenData.type = TokenType.NonFungibleUnique
    }

    changeSupplyType(evt: string) {
        if(evt == "Infinite")
            this.tokenData.supplyType = TokenSupplyType.Infinite;
        else
            this.tokenData.supplyType = TokenSupplyType.Finite
    }

    async send() {
        let accountInfo:any = await window.fetch("https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct, { method: "GET" });
        accountInfo = await accountInfo.json();
        let customFees: CustomFee[] = [];

        let key = await PublicKey.fromString(accountInfo.key.key)

        let trans = await new TokenCreateTransaction()
            .setTokenName(this.tokenData.name)
            .setTokenSymbol(this.tokenData.symbol)
            .setTokenType(this.tokenData.type)
            .setDecimals(0)
            .setSupplyType(this.tokenData.supplyType)
            .setInitialSupply(this.tokenData.initialSupply)
            .setTreasuryAccountId(this.signingAcct)
            .setAdminKey(key)
            .setSupplyKey(key)
            .setWipeKey(key)
            .setAutoRenewAccountId(this.signingAcct)
            
        if(this.tokenData.supplyType != TokenSupplyType.Infinite)
            trans.setMaxSupply(this.tokenData.maxSupply);
            
        if(this.tokenData.includeRoyalty){
            let fallback = await new CustomFixedFee()
            .setFeeCollectorAccountId(this.signingAcct)
            .setHbarAmount(Hbar.from(this.tokenData.fallbackFee, HbarUnit.Hbar));

            let royaltyInfo = await new CustomRoyaltyFee()
                .setNumerator(this.tokenData.royaltyPercent)
                .setDenominator(100)
                .setFeeCollectorAccountId(this.signingAcct)
                .setFallbackFee(fallback);
            
            customFees.push(royaltyInfo);
        }

        if(this.tokenData.includeFixedFee) {
            let fixedFee = await new CustomFixedFee()
            .setHbarAmount(Hbar.from(this.tokenData.fixedFee, HbarUnit.Hbar))
            .setFeeCollectorAccountId(this.signingAcct);

            customFees.push(fixedFee);
        }
        
        trans.setCustomFees(customFees);

        let transBytes:Uint8Array = await this.SigningService.makeBytes(trans, this.signingAcct);

        this.HashconnectService.sendTransaction(transBytes, this.signingAcct);
    }

}
