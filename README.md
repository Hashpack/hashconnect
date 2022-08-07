# Hashconnect

Hashconnect is a library to connect Hedera apps to wallets, similar to web3 functionality found in the Ethereum ecosystem.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality. It also contains a demo wallet (testnet only) which can be used to test functionality during the alpha phase. 

**[View Demo](https://hashpack.github.io/hashconnect/)**

**[Example React Integration](https://github.com/rajatK012/hashconnectWalletConnect)**

- [Hashconnect](#hashconnect)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Metadata](#metadata)
    - [Setup](#setup)
    - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Second Time Connecting](#second-time-connecting)
    - [Disconnecting](#disconnecting)
    - [Sending Requests](#sending-requests)
      - [Request Additional Accounts](#request-additional-accounts)
      - [Send Transaction](#send-transaction)
      - [Authenticate](#authenticate)
    - [Events](#events)
      - [FoundExtensionEvent](#foundextensionevent)
      - [PairingEvent](#pairingevent)
      - [Acknowledge Response](#acknowledge-response)
      - [Connection Status Change](#connection-status-change)
    - [Provider/Signer](#providersigner)
      - [Get Provider](#get-provider)
      - [Get Signer](#get-signer)
    - [Types](#types)
      - [HashConnectTypes](#hashconnecttypes)
        - [HashConnectTypes.AppMetadata](#hashconnecttypesappmetadata)
        - [HashConnectTypes.WalletMetadata](#hashconnecttypeswalletmetadata)
        - [HashConnectTypes.InitilizationData](#hashconnecttypesinitilizationdata)
        - [HashConnectTypes.ConnectionState](#hashconnecttypesconnectionstate)
      - [MessageTypes](#messagetypes)
        - [MessageTypes.BaseMessage](#messagetypesbasemessage)
        - [MessageTypes.Acknowledge](#messagetypesacknowledge)
        - [MessageTypes.Rejected](#messagetypesrejected)
        - [MessageTypes.ApprovePairing](#messagetypesapprovepairing)
        - [MessageTypes.AdditionalAccountRequest](#messagetypesadditionalaccountrequest)
        - [MessageTypes.AdditionalAccountResponse](#messagetypesadditionalaccountresponse)
        - [MessageTypes.Transaction](#messagetypestransaction)
        - [MessageTypes.TransactionMetadata](#messagetypestransactionmetadata)
        - [MessageTypes.TransactionResponse](#messagetypestransactionresponse)
        - [MessageTypes.AuthenticationRequest](#messagetypesauthenticationrequest)
        - [MessageTypes.AuthenticationResponse](#messagetypesauthenticationresponse)

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

Hashconnect uses message relay nodes to communicate between apps. These nodes use something called a **topic ID** to publish/subscribe to.


## Usage

We recommend getting familiar with how [async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) works before using Hashconnect. We also **strongly** suggest using Typescript.

### Installation

```
npm i hashconnect --save
```

### Initialization

Import the library like you would any npm package

```js
import { HashConnect } from 'hashconnect';
```

Create a variable to hold an instance of Hashconnect, pass `true` to this to enable debug mode.

```js
let hashconnect = new HashConnect();
```

### Metadata
You need to define some metadata so wallets can display what app is requesting an action from the user. 

```js
let appMetadata: HashConnectTypes.AppMetadata = {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://absolute.url/to/icon.png"
}
```

The url of your app is auto-populated by HashConnect to prevent spoofing.

### Setup

All you need to do is create the HashConnect object, set up events, and then call the init function with your parameters.

```js
//create the hashconnect instance
let hashconnect = new HashConnect(true);

//register events
setUpHashConnectEvents();

//initialize and use returned data
let initData = await this.hashconnect.init(appMetadata, "testnet", false);
```

The init function will return your pairing code and any previously connected pairings as an array of `SavedPairingData`.

Make sure you register your events before calling init - as some events will fire immediately after calling init.

### Pairing


#### Pairing to extension

HashConnect has 1-click pairing with supported installed extensions. Currently the only supported wallet extension is [HashPack](https://www.hashpack.app/).

**Please note - this only works in SSL secured environments (https urls)**

```js
hashconnect.findLocalWallets();
```

Calling this function will send a ping out, and supported wallets will return their metadata in a ```foundExtensionEvent``` [(details)](#foundextensionevent). You should take this metadata, and display buttons with the available extensions. More extensions will be supported in the future!

You should then call:

```js
hashconnect.connectToLocalWallet(pairingString, extensionMetadata);
```

And it will pop up a modal in the extension allowing the user to pair. 

### Second Time Connecting


### Disconnecting

### Sending Requests

All requests return a ID string, this can be used to track the request through acknowlege and approval/rejection events (next section).

#### Request Additional Accounts

This request takes two parameters, **topicID** and [AdditionalAccountRequest](#messagetypesadditionalaccountrequest
). It is used to request additional accounts *after* the initial pairing.

```js
await hashconnect.requestAdditionalAccounts(saveData.topic, request);
```

**Example Implementation:**

```js
async requestAdditionalAccounts(network: string) {
    let request:MessageTypes.AdditionalAccountRequest = {
        topic: saveData.topic,
        network: network
    } 

    let response = await hashconnect.requestAdditionalAccounts(saveData.topic, request);
}
```

#### Send Transaction

This request takes two parameters, **topicID** and [Transaction](#messagetypestransaction
).

```js
await hashconnect.sendTransaction(saveData.topic, transaction);
```

**Example Implementation:**

```js
async sendTransaction(trans: Transaction, acctToSign: string) {     
    let transactionBytes: Uint8Array = await SigningService.signAndMakeBytes(trans);

    const transaction: MessageTypes.Transaction = {
        topic: saveData.topic,
        byteArray: transactionBytes,
        metadata: {
            accountToSign: acctToSign,
            returnTransaction: false
        }
    }

    let response = await hashconnect.sendTransaction(saveData.topic, transaction)
}
```

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
    let res = await this.HashconnectService.hashconnect.authenticate(this.HashconnectService.saveData.topic, this.signingAcct, signing_data.serverSigningAccount, signing_data.signature, payload);
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


### Events

Events are emitted by HashConnect to let you know when a request has been fufilled.

You can listen to them by calling .on() or .once() on them. All events return [typed](#types) data.

#### FoundExtensionEvent

This event returns the metadata of the found extensions, will fire once for each extension.

```js
hashconnect.foundExtensionEvent.once((walletMetadata) => {
    //do something with metadata
})
```

#### PairingEvent

The pairing event is triggered when a user accepts a pairing. It returns an [ApprovePairing](#messagetypesapprovepairing) object containing accountId's and a [WalletMetadata](#hashconnecttypeswalletmetadata).

```js
hashconnect.pairingEvent.once((pairingData) => {
    //example
    pairingData.accountIds.forEach(id => {
        if(pairedAccounts.indexOf(id) == -1)
            pairedAccounts.push(id);
    })
})
```

#### Acknowledge Response

This event returns an [Acknowledge](#messagetypesacknowledge) object. This happens after the wallet has recieved the request, generally you should consider a wallet disconnected if a request doesn't fire an acknowledgement after a few seconds and update the UI accordingly.

The object contains the ID of the message.

```js
hashconnect.acknowledgeMessageEvent.once((acknowledgeData) => {
    //do something with acknowledge response data
})
```

#### Connection Status Change

This event is fired if the connection status changes, this should only really happen if the server goes down. HashConnect will automatically try to reconnect, once reconnected this event will fire again.

```js
hashconnect.connectionStatusChange.once((connectionStatus) => {
    //do something with connection status
})
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

Usage

```js
let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(this.signer);

let res = await trans.executeWithSigner(this.signer);
```

### Types

#### HashConnectTypes

##### HashConnectTypes.AppMetadata
```js 
export interface AppMetadata {
    name: string;
    description: string;
    url?: string;
    icon: string;
    publicKey?: string;
}
```

##### HashConnectTypes.WalletMetadata

```js 
export interface WalletMetadata {
    name: string;
    description: string;
    url?: string;
    icon: string;
    publicKey?: string;
}
```

##### HashConnectTypes.InitilizationData

```js 
export interface InitilizationData {
    privKey: string;
}
```

##### HashConnectTypes.ConnectionState

```js 
export interface ConnectionState {
    topic: string;
    expires: number;
}
```

#### MessageTypes

All messages types inherit topicID and ID from ```BaseMessage```

##### MessageTypes.BaseMessage

```js
export interface BaseMessage {
    topic: string;
    id: string;
}   
```

##### MessageTypes.Acknowledge

```js
export interface Acknowledge extends BaseMessage {
    result: boolean;
    msg_id: string; //id of the message being acknowledged
}
```

##### MessageTypes.Rejected

```js
export interface Rejected extends BaseMessage {
    reason?: string;
    msg_id: string;
}
```

##### MessageTypes.ApprovePairing

```js 

export interface ApprovePairing extends BaseMessage {
    metadata: HashConnectTypes.WalletMetadata;
    accountIds: string[];
    network: string;
}
```

##### MessageTypes.AdditionalAccountRequest

```js
export interface AdditionalAccountRequest extends BaseMessage {
    network: string;
    multiAccount: boolean;
}
```

##### MessageTypes.AdditionalAccountResponse

```js
export interface AdditionalAccountResponse extends BaseMessage {
    accountIds: string[];
    network: string;
}
```

##### MessageTypes.Transaction

```js
export interface Transaction extends BaseMessage {
    byteArray: Uint8Array | string;
    metadata: TransactionMetadata;
}
```

##### MessageTypes.TransactionMetadata

```js
export class TransactionMetadata extends BaseMessage {
    accountToSign: string;
    returnTransaction: boolean; //set to true if you want the wallet to return a signed transaction instead of executing it
    nftPreviewUrl?: string;
}
```

##### MessageTypes.TransactionResponse

```js

export interface TransactionResponse extends BaseMessage {
    success: boolean;
    receipt?: Uint8Array | string; //returns receipt on success
    signedTransaction?: Uint8Array | string; //will return signed transaction rather than executing if returnTransaction in request is true
    error?: string; //error code on response
}
```

##### MessageTypes.AuthenticationRequest
```js
export interface AuthenticationRequest extends BaseMessage {
    accountToSign: string;
    serverSigningAccount: string;
    serverSignature: Uint8Array | string;
    payload: {
        url: string,
        data: any
    }
}
```

##### MessageTypes.AuthenticationResponse

```js
export interface AuthenticationResponse extends BaseMessage {
    success: boolean;
    error?: string;
    userSignature?: Uint8Array | string;
    signedPayload?: {
        serverSignature: Uint8Array | string,
        originalPayload: {
            url: string,
            data: any
        }
    }
}
```