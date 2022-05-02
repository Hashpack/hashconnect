import { hethers } from '@hashgraph/hethers';
import { TransferTransaction } from '@hashgraph/sdk';
import { Provider } from '@hashgraph/sdk/lib/Provider';
import { Signer } from '@hashgraph/sdk/lib/Signer';
import { HashConnectHelper } from './hashconnectHelper';
import { HashConnectProvider } from 'hashconnect/dist/provider/provider';
import { HashConnectSigner } from 'hashconnect/dist/provider/signer';

class Example {
    constructor() {
        this.init();
    }

    hashconnectHelper = new HashConnectHelper();
    provider: HashConnectProvider;
    signer: HashConnectSigner;

    async init() {
        await this.hashconnectHelper.initHashconnect();

        if (this.hashconnectHelper.status != "Paired")
            this.waitForPairing();
        else
            this.setUpExample();
    }

    waitForPairing() {
        document.getElementById("pairingString")!.innerText = this.hashconnectHelper.saveData.pairingString;

        this.hashconnectHelper.hashconnect.pairingEvent.once((data) => {
            console.log("Paired with wallet", data);
            this.hashconnectHelper.status = "Paired";

            this.hashconnectHelper.saveData.pairedWalletData = data.metadata;

            data.accountIds.forEach(id => {
                if (this.hashconnectHelper.saveData.pairedAccounts.indexOf(id) == -1)
                    this.hashconnectHelper.saveData.pairedAccounts.push(id);
            })

            this.hashconnectHelper.saveDataInLocalstorage();
            this.setUpExample();

            document.getElementById("pairing")!.style.display = "none";
            document.getElementById("paired")!.style.display = "block";
        });
    }

    setUpExample() {
        this.provider = this.hashconnectHelper.hashconnect.getProvider("testnet", this.hashconnectHelper.saveData.topic, this.hashconnectHelper.saveData.pairedAccounts[0]);
        this.signer = this.hashconnectHelper.hashconnect.getSigner(this.provider);

        //demo event listeners
        document.getElementById('testTransaction')!.onclick = this.TransactionTest;
        document.getElementById('accountBalance')!.onclick = this.AccountBalanceTest;
    }

    TransactionTest = async () => {
        let trans = await new TransferTransaction()
            .addHbarTransfer(this.hashconnectHelper.saveData.pairedAccounts[0], -1)
            .addHbarTransfer("0.0.2077257", 1)
            .freezeWithSigner(this.signer);

        let res = await trans.executeWithSigner(this.signer);

        console.log("transaction success", res);
    }

    AccountBalanceTest = async () => {
        let res = await this.provider.getAccountBalance(this.hashconnectHelper.saveData.pairedAccounts[0]);

        console.log("got account balance", res);
    }
}

new Example();

