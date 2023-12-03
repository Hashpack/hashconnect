# Hashconnect

**HashConnect v3 is current in pre-release. API's may change or be unstable.**

Hashconnect is a library to connect Hedera apps to wallets, similar to web3 functionality found in the Ethereum ecosystem.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality.

**[View Demo](https://hashpack.github.io/hashconnect/)**

**[Example React Integration](https://github.com/rajatK012/hashconnectWalletConnect)**

- [Hashconnect](#hashconnect)
  - [Quick Start](#quick-start)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Project ID](#project-id)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Setup](#setup)
    - [Events](#events)
      - [Pairing Event](#pairing-event)
      - [Disconnect Event](#disconnect-event)
      - [Connection Status Change](#connection-status-change)
    - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Second Time Connecting](#second-time-connecting)
    - [Disconnecting](#disconnecting)
    - [Sending Requests](#sending-requests)
      - [Send Transaction](#send-transaction)
      - [Sign](#sign)
      - [Authenticate](#authenticate)
    - [Provider/Signer](#providersigner)
      - [Get Provider](#get-provider)
      - [Get Signer](#get-signer)
        - [Usage](#usage-1)
    - [Types](#types)
        - [HashConnectConnectionState](#hashconnectconnectionstate)


## Quick Start

This is what you need to start using HashConnect, it will be explained in detail in the subsequent documentation.

```js
import { HashConnect } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

const appMetadata = {
    name: "<Your dapp name>",
    description: "<Your dapp description>",
    icons: ["<Image url>"],
    url: "<Dapp url>"
}

let hashconnect: HashConnect;

async init() {
    //create the hashconnect instance
    hashconnect = new HashConnect(LedgerId.MAINNET, "<Your project ID>", appMetadata, true);

    //register events
    setUpHashConnectEvents();

    //initialize
    await hashconnect.init();

    //open pairing modal
    hashconnect.openModal();
}

setUpHashConnectEvents() {
    hashconnect.pairingEvent.on((pairingData) => {
        //do something
    })

    hashconnect.disconnectionEvent.on((data) => {
        //do something
    });

    hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
        //do something with connection status
    })
    
}
```

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

HashConnect also providers other sorts of helpers, like user profile fetching and token gating.

## Usage

### Project ID

Before doing anything you will need a WalletConnect project ID. You can get one by going to [WalletConnect Cloud](https://cloud.walletconnect.com/) and setting up a project. 

### Installation

```js
npm i hashconnect --save
```

### Initialization

Import the library like you would any npm package

```js
import { HashConnect } from 'hashconnect';
```

Create a metadata object that contains information about your dapp.

```js
const appMetadata = {
    name: "<Your dapp name>",
    description: "<Your dapp description>",
    icons: ["<Image url>"],
    url: "<Dapp url>"
}
```

Create a variable to hold an instance of Hashconnect, and pass in the network, project id, metadata, and a boolean to enable debug mode.

```js
let hashconnect = new HashConnect(LedgerId.MAINNET, "<Your project ID>", appMetadata, true);
```

Note: The LedgerId is from the HashGraph SDK, which you can import by doing this:

```js
import { LedgerId } from '@hashgraph/sdk';
```

### Setup

After creating the HashConnect object, set up events, and then call the init function with your parameters.

```js

//register events
setUpHashConnectEvents();

//initialize and use returned data
let initData = await hashconnect.init();
```


**Make sure you register your events before calling init** - as some events will fire immediately after calling init.

### Events

Events are emitted by HashConnect to let you know when a request has been fufilled.

#### Pairing Event

The pairing event is triggered when a user accepts a pairing or an existing pairing is found.

```js
hashconnect.pairingEvent.on((pairingData) => {
    //do something
})
```

#### Disconnect Event

When a user disconnects in the wallet this event will be triggered so you can update the state of your dapp.

```js
hashconnect.disconnectionEvent.on((data) => {
    //do something
});
```

#### Connection Status Change

This event is fired if the connection status changes, this should only really happen if the server goes down. HashConnect will automatically try to reconnect, once reconnected this event will fire again. This returns a `HashConnectConnectionState` [(details)](#hashconnectconnectionstate) 

```js
hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
    //do something with connection status
})
```

### Pairing

You can easily show a pairing popup containing the pairing code and a QR code by calling showModal().

```js
hashconnect.openModal();
```

#### Pairing to extension

If the HashPack extension is found during init, it will automatically pop it up and request pairing.

### Second Time Connecting

When calling init HashConnect will automatically reconnect to any previously connected pairings. This will trigger a PairingEvent for each existing pairing.

### Disconnecting

Call `hashconnect.disconnect(topic)` to disconnect a pairing. You can then access the new list of current pairings from `hashconnect.hcData.savedPairings`.

### Sending Requests

#### Send Transaction

This request takes two parameters, **accountId** and a Hedera Transaction.

```js
await hashconnect.sendTransaction(accountId, transaction);
```

**Example Implementation:**

```js
async sendTransaction(trans: Transaction, acctToSign: string) {     
    let transactionBytes: Uint8Array = await SigningService.signAndMakeBytes(trans);

    const transaction: MessageTypes.Transaction = {
        topic: initData.topic,
        byteArray: transactionBytes,
        metadata: {
            accountToSign: acctToSign,
            returnTransaction: false,
            hideNft: false
        }
    }

    let response = await hashconnect.sendTransaction(initData.topic, transaction)
}
```

#### Sign

This request allows you to get a signature on a generic piece of data. You can send a string or object.

```js
await hashconnect.sign(initData.topic, signingAcct, dataToSign);
```

It will return a [SigningResponse](#messagetypessigningresponse)


#### Authenticate

This request sends an authentication response to the wallet which can be used to generate an authentication token for use with a backend system.

The expected use of this is as follows:
- generate a payload and signature on the server, this payload should contain a single-use code you can validate later
- send that payload and signature to the frontend
- send to the users wallet
- receive a new payload back along with the users signature of the new payload
- send this payload and user signature to your backend
- use this in your auth flow

This returns a [AuthenticationResponse](#messagetypesauthenticationresponse)

```js
await hashconnect.authenticate(topic, signingAcct, serverSigningAccount, serverSignature, payload);
```

**Example Implementation:**

```js
async send() {
    //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST SIGN THE PAYLOAD IN YOUR BACKEND
    // after verified on the server, generate some sort of auth token to use with your backend
    let payload = { url: "test.com", data: { token: "fufhr9e84hf9w8fehw9e8fhwo9e8fw938fw3o98fhjw3of" } };

    let signing_data = this.SigningService.signData(payload);

    //this line you should do client side, after generating the signed payload on the server
    let res = await this.HashconnectService.hashconnect.authenticate(this.HashconnectService.initData.topic, this.signingAcct, signing_data.serverSigningAccount, signing_data.signature, payload);
    //send res to backend for validation
    
    //THE FOLLOWING IS SERVER SIDE ONLY
    let url = "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct;

    fetch(url, { method: "GET" }).then(async accountInfoResponse => {
        if (accountInfoResponse.ok) {
            let data = await accountInfoResponse.json();
            console.log("Got account info", data);

            if(!res.signedPayload) return; 
            
                let server_key_verified = this.SigningService.verifyData(res.signedPayload.originalPayload, this.SigningService.publicKey, res.signedPayload.serverSignature as Uint8Array);
                let user_key_verified = this.SigningService.verifyData(res.signedPayload, data.key.key, res.userSignature as Uint8Array);

            if(server_key_verified && user_key_verified)
                //authenticated
            else 
                //not authenticated
        } else {
            alert("Error getting public key")
        }
    })
    //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST PASS THE TRANSACTION BYTES TO THE SERVER AND VERIFY THERE
    
}
```

### Provider/Signer

In accordance with [HIP-338](https://hips.hedera.com/hip/hip-338) and [hethers.js](https://docs.hedera.com/hethers/getting-started) we have added provider/signer support.

You need to initialize HashConnect normally, then once you have your ```hashconnect``` variable you can use the ```.getProvider()``` and ```.getSigner()``` methods.

#### Get Provider

Just pass in these couple variables, and you'll get a provider back! 

This allows you to interact using the API's [detailed here](https://docs.hedera.com/hethers/application-programming-interface/providers/provider).

```js
provider = hashconnect.getProvider(network, topic, accountId);
```

Example Usage

```js
let balance = await provider.getAccountBalance(accountId);
```

#### Get Signer

Pass the provider into this method to get a signer back, this allows you to interact with HashConnect using a simpler API.

```js
signer = hashconnect.getSigner(provider);
```

##### Usage

```js
let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(this.signer);

let res = await trans.executeWithSigner(this.signer);
```

### Types

##### HashConnectConnectionState

```js 
export enum HashConnectConnectionState {
    Connecting="Connecting",
    Connected="Connected",
    Disconnected="Disconnected",
    Paired="Paired"
}
```