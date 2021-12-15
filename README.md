# Hashconnect

Hashconnect is a library to connect Hedera apps to wallets, similar to web3 functionality found in the Ethereum ecosystem.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality. It also contains a demo wallet (testnet only) which can be used to test functionality during the alpha phase. 

**[View Demo](https://hashpack.github.io/hashconnect/)**

- [Hashconnect](#hashconnect)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Metadata](#metadata)
    - [First Time Connecting](#first-time-connecting)
      - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Second Time Connecting](#second-time-connecting)
    - [All Together](#all-together)
    - [Sending Requests](#sending-requests)
      - [Request Additional Accounts](#request-additional-accounts)
      - [Send Transaction](#send-transaction)
    - [Events](#events)
      - [FoundExtensionEvent](#foundextensionevent)
      - [PairingEvent](#pairingevent)
      - [Transaction Response](#transaction-response)
      - [Acknowledge Response](#acknowledge-response)
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
  - [Errors](#errors)
    - [Crypto-browserify](#crypto-browserify)
    - [Stream-browserify](#stream-browserify)
    - [DUMP_SESSION_KEYS](#dump_session_keys)

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

Hashconnect uses message relay nodes to communicate between apps. These nodes use something called a **topic ID** to publish/subscribe to. **It is your responsibility** to maintain (using localstorage or a cookie or something) topic ID's and hashconnect encryption keys between user visits.

**Pairing** is the term used to denote a connection between two apps. Generally pairing is the action of exchanging a **topic ID** and a **metadata** object.

Each message has a **message ID** that will be returned by the function used to send the message. Any events that reference a previously sent message will include the relevant **message id**, this allows you to wait for specific actions to be completed or be notified when specific messages have been rejected by the user.

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

Create a variable to hold an instance of Hashconnect

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

The url of your app is auto-populated by HashConnect, to prevent spoofing.

### First Time Connecting

Call init on the Hashconnect variable, passing in the metadata you've defined. This function returns an object containing a PrivateKey, **you should save this** for reuse on subsequent user visits.

```js
let initData = await hashconnect.init(appMetadata);
let privateKey = initData.privKey; 
```

You then need to connect to a node, if this is the first time a user is connecting to a node you don't need to pass anything in to the connect function and it will generate a new **topicID**. If it's a returning user pass in the topic ID that the user was previously connected to.

```js
let state = await hashconnect.connect();
let topic = state.topic;
```

This function returns a *state* object, containing a new **topicID** (if you passed nothing in). **Make sure you store** this topic for reuse on subsequent user visits.

Please note, it is possible to connect to more than one wallet.

#### Pairing

If this is the first time a user is pairing, you will need to generate a new pairing string. If it is not the first time a user is using your app you can skip this step and use the instructions in [Second Time Connecting](#second-time-connecting), as both apps will already be subscribed to the topic ID. Pass in the ```state``` variable from the ```.connect()``` function.

You can also specify what network you would like to request accounts for, either "testnet" or "mainnet".

```js
let pairingString = hashconnect.generatePairingString(state, "testnet");
```

A pairing string is a base64 encoded string containing the topic to subscribe to and the metadata about your app.

When the users accepts it will fire a [PairingEvent](#pairingevent).

#### Pairing to extension

HashConnect has 1-click pairing with supported installed extensions. Currently the only supported wallet extension is [HashPack](https://www.hashpack.app/).

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

When a user is returning for the second time you should automatically pair and begin listening for events. The functions from before all take optional parameters in order to reconnect.

Connecting a second time is much simpler, following the steps in [First Time Connecting](#first-time-connecting) and saving the appropriate data you simply call ```init()``` and ```connect()``` with the appropriate parameters.

```js
await hashconnect.init(appMetadata, saveData.privateKey);
await hashconnect.connect(saveData.topic, saveData.pairedWalletData!);
```

If you wanted to reconnect to multiple wallets, you could run ```.connect()``` in a loop, using a different save data structure of course. You only need to run ```init()``` once.

### All Together

So, once we put all this together this is what a rough initialization function would look like:

You can view the example app implementation [here](https://github.com/Hashpack/hashconnect/blob/main/example/dapp/src/app/services/hashconnect.service.ts).

```js

let hashconnect: HashConnect;
    
let saveData = {
    topic: "",
    pairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccounts: []
}

let appMetadata: HashConnectTypes.AppMetadata = {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://www.hashpack.app/img/logo.svg"
}

async initHashconnect() {
    //create the hashconnect instance
    hashconnect = new HashConnect();

    if(!loadLocalData()){
        //first init and store the private for later
        let initData = await hashconnect.init(appMetadata);
        saveData.privateKey = initData.privKey;

        //then connect, storing the new topic for later
        const state = await hashconnect.connect();
        saveData.topic = state.topic;
        
        //generate a pairing string, which you can display and generate a QR code from
        saveData.pairingString = hashconnect.generatePairingString(state, "testnet");
        
        //find any supported local wallets
        hashconnect.findLocalWallets();
    }
    else {
        //use loaded data for initialization + connection
        await hashconnect.init(appMetadata, saveData.privateKey);
        await hashconnect.connect(saveData.topic, saveData.pairedWalletData);
    }
}

loadLocalData(): boolean {
    let foundData = localStorage.getItem("hashconnectData");

    if(foundData){
        saveData = JSON.parse(foundData);
        return true;
    }
    else
        return false;
}


```

You'll need to add more to this code to get it working in your exact setup, but that's the jist of it!


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

    await hashconnect.requestAdditionalAccounts(saveData.topic, request);

    //you should bind a return handler here, handlers are explained more in the next section
    hashconnect.additionalAccountResponseEvent.once((data) => {
        console.log("transaction response", data)
    })
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

    await hashconnect.sendTransaction(saveData.topic, transaction)

    //you should bind a return handler here, handlers are explained more in the next section
    hashconnect.transactionResponseEvent.once((data) => {
        console.log("transaction response", data)
    })
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

#### Transaction Response
```js
hashconnect.transactionResponseEvent.once((transactionResponse) => {
    //do something with transaction response data
})
```

#### Acknowledge Response

This event returns an [Acknowledge](#messagetypesacknowledge) object. This happens after the wallet has recieved the request, generally you should consider a wallet disconnected if a request doesn't fire an acknowledgement after a few seconds and update the UI accordingly.

The object contains the ID of the message.

```js
hashconnect.acknowledge.once((acknowledgeData) => {
    //do something with acknowledge response data
})
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
    msg_id: string;
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
    signedTransaction?: Uint8Array | string;
    error?: string;
}
```


## Errors

### Crypto-browserify
```
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

If you want to include a polyfill, you need to:
        - add a fallback 'resolve.fallback: { "crypto": require.resolve("crypto-browserify") }'
        - install 'crypto-browserify'
If you don't want to include a polyfill, you can use an empty module like this:
        resolve.fallback: { "crypto": false }
```
**Fix**

```npm i crypto-browserify --save```

Then add to your tsconfig.json:

```js
"compilerOptions": {
    "paths": {
        "crypto": [
            "node_modules/crypto-browserify"
        ]
    }
}
```

### Stream-browserify

```
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

If you want to include a polyfill, you need to:
        - add a fallback 'resolve.fallback: { "stream": require.resolve("stream-browserify") }'
        - install 'stream-browserify'
If you don't want to include a polyfill, you can use an empty module like this:
        resolve.fallback: { "stream": false }
```

**Fix**

```npm i stream-browserify --save```


Then add to your tsconfig.json:

```js
"compilerOptions": {
    "paths": {
        "crypto": [
            "node_modules/stream-browserify"
        ]
    }
}
```

### DUMP_SESSION_KEYS

```
constants.js:6 Uncaught TypeError: Cannot read properties of undefined (reading 'DUMP_SESSION_KEYS')
```

**Fix**

```npm i process --save```

Add polyfill somewhere:

```js
global.process = require('process');
```

