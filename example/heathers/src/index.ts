import { hethers } from '@hashgraph/hethers';
import { TransferTransaction } from '@hashgraph/sdk';
import { Provider } from '@hashgraph/sdk/lib/Provider';
import { Signer } from '@hashgraph/sdk/lib/Signer';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/dist/provider/provider';
import { HashConnectSigner } from 'hashconnect/dist/provider/signer';

class HashConnectHelper {
    constructor() {
        
    }

    hashconnect: HashConnect = new HashConnect(true);

    availableExtensions: HashConnectTypes.WalletMetadata[] = []
    status: string = "Initializing";

    saveData: {
        topic: string;
        pairingString: string;
        privateKey?: string;
        pairedWalletData?: HashConnectTypes.WalletMetadata;
        pairedAccounts: string[];
    } = {
        topic: "",
        pairingString: "",
        privateKey: undefined,
        pairedWalletData: undefined,
        pairedAccounts: []
    }

    appMetadata: HashConnectTypes.AppMetadata = {
        name: "HEthers dApp Example",
        description: "An example hethers dApp",
        icon: "https://www.hashpack.app/img/logo.svg"
    }
    

    async initHashconnect() {
        //create the hashconnect instance
        this.hashconnect = new HashConnect(true);

        if(!this.loadLocalData()){
            //first init, store the private key in localstorage
            let initData = await this.hashconnect.init(this.appMetadata);
            this.saveData.privateKey = initData.privKey;

            //then connect, storing the new topic in localstorage
            const state = await this.hashconnect.connect();
            console.log("Received state", state);
            this.saveData.topic = state.topic;
            
            //generate a pairing string, which you can display and generate a QR code from
            this.saveData.pairingString = this.hashconnect.generatePairingString(state, "testnet", false);
            

            //find any supported local wallets
            this.hashconnect.findLocalWallets();

            this.status = "Connected";
        }
        else {
            await this.hashconnect.init(this.appMetadata, this.saveData.privateKey);
            await this.hashconnect.connect(this.saveData.topic, this.saveData.pairedWalletData!);

            document.getElementById("pairing")!.style.display = "none";
            document.getElementById("paired")!.style.display = "block";

            this.status = "Paired";
        }
    }

    saveDataInLocalstorage() {
        let data = JSON.stringify(this.saveData);
        
        localStorage.setItem("hashconnectData", data);
    }

    loadLocalData() :boolean {
        let foundData = localStorage.getItem("hashconnectData");

        if(foundData){
            this.saveData = JSON.parse(foundData);
            console.log("Found local data", this.saveData)
            return true;
        }
        else
            return false;
    }
}

class Example {
    constructor() {
        this.init();
    }

    hashconnectHelper = new HashConnectHelper();

    async init() {
        await this.hashconnectHelper.initHashconnect();

        if(this.hashconnectHelper.status != "Paired")
            this.waitForPairing();
        else   
            this.setUpHethers();
    }

    waitForPairing() {
        document.getElementById("pairingString")!.innerText = this.hashconnectHelper.saveData.pairingString;

        this.hashconnectHelper.hashconnect.pairingEvent.once((data) => {
            console.log("Paired with wallet", data);
            this.hashconnectHelper.status = "Paired";

            this.hashconnectHelper.saveData.pairedWalletData = data.metadata;

            data.accountIds.forEach(id => {
                if(this.hashconnectHelper.saveData.pairedAccounts.indexOf(id) == -1)
                    this.hashconnectHelper.saveData.pairedAccounts.push(id);
            })

            this.hashconnectHelper.saveDataInLocalstorage();
            this.setUpHethers();

            document.getElementById("pairing")!.style.display = "none";
            document.getElementById("paired")!.style.display = "block";
        });
    }

    async setUpHethers() {
        let provider: HashConnectProvider = this.hashconnectHelper.hashconnect.getProvider(this.hashconnectHelper.saveData.topic);
        let signer: HashConnectSigner = this.hashconnectHelper.hashconnect.getSigner(provider, "0.0.2077256", this.hashconnectHelper.saveData.topic);
        
        let trans = await new TransferTransaction()
            .addHbarTransfer("0.0.2077256", -1)
            .addHbarTransfer("0.0.2077257", 1)
            .freezeWithSigner(signer);

        let res = await trans.executeWithSigner(signer);

        console.log("AAAAAA", res);
    }
}

new Example();

