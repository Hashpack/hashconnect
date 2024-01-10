import { Component, Inject, OnInit } from '@angular/core';
import { DialogBelonging } from '@costlydeveloper/ngx-awesome-popup';
import { CustomFee, CustomFixedFee, CustomFractionalFee, CustomRoyaltyFee, Hbar, HbarUnit, PublicKey, TokenCreateTransaction, TokenSupplyType, TokenType, TransactionReceipt, Timestamp, AccountId } from '@hashgraph/sdk';
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
        fixedTokenId: "",
        fractionalFee: {
            percent: 0,
            max: 0,
            min: 0
        },
        fallbackFee: 0,
        decimals: 0
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
        // let accountInfo:any = await window.fetch("https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct, { method: "GET" });
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
            
        if(this.tokenData.supplyType != TokenSupplyType.Infinite){
            trans.setMaxSupply(this.tokenData.maxSupply);
        }

        if(this.tokenData.type == TokenType.FungibleCommon){
            trans.setDecimals(this.tokenData.decimals);
        }
            
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

        if(this.tokenData.includeFractionalFee){
            let fractional = await new CustomFractionalFee()
            .setFeeCollectorAccountId(this.signingAcct)
            .setNumerator(this.tokenData.fractionalFee.percent)
            .setDenominator(100)
            .setMax(this.tokenData.fractionalFee.max)
            .setMin(this.tokenData.fractionalFee.min)
            
            customFees.push(fractional);
        }

        if(this.tokenData.includeFixedFee) {
            let fixedFee = await new CustomFixedFee()
            .setFeeCollectorAccountId(this.signingAcct);

            if(this.tokenData.fixedTokenId && this.tokenData.fixedTokenId != ""){
                fixedFee.setDenominatingTokenId(this.tokenData.fixedTokenId);
                fixedFee.setAmount(this.tokenData.fixedFee);
            }
            else
                fixedFee.setHbarAmount(Hbar.from(this.tokenData.fixedFee, HbarUnit.Hbar))

            customFees.push(fixedFee);
        }
        
        trans.setCustomFees(customFees);

        // Set expiry in 90 days

        const ninetyDaysSeconds = 60*60*24*90
        const secondsNow = Math.round(Date.now() / 1000)
        const timestamp = secondsNow + ninetyDaysSeconds
        const timestampObj = new Timestamp(timestamp, 0)
        console.log({timestamp})
        console.log({timestampObj})
        trans.setExpirationTime(timestampObj)
        trans.setAutoRenewPeriod(ninetyDaysSeconds)


        let res = await this.HashconnectService.sendTransaction(trans, AccountId.fromString(this.signingAcct));

        //handle response
        let responseData: any = {
            response: res,
            receipt: null
        }

        this.HashconnectService.showResultOverlay(responseData);
    }

}
