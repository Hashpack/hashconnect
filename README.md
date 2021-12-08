# Hashconnect

- [Hashconnect](#hashconnect)
  - [Intro](#intro)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Metadata](#metadata)
    - [Connecting](#connecting)
    - [Pairing](#pairing)
    - [Pairing to extension](#pairing-to-extension)
    - [Sending Requests](#sending-requests)
    - [Events](#events)
      - [FoundExtensionEvent](#foundextensionevent)
      - [PairingEvent](#pairingevent)
      - [Transaction Response](#transaction-response)
    - [Types](#types)
  - [Errors](#errors)
    - [Crypto-browserify](#crypto-browserify)
    - [Stream-browserify](#stream-browserify)
    - [DUMP_SESSION_KEYS](#dump_session_keys)

## Intro

Hashconnect is a library to connect Hedera apps to wallets, similar to web3 functionality found in the Ethereum ecosystem.

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

Hashconnect uses message relay nodes to communicate between apps. These nodes use something called a **topic ID** to publish/subscribe to. **It is your responsibility** to maintain (using localstorage or a cookie or something) topic ID's between user visits.

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

### Connecting

Call init on the Hashconnect variable, passing in the metadata you've defined.

```js
await hashconnect.init(appMetadata);
```

You then need to connect to a node, if this is the first time a user is connecting to a node you don't need to pass anything in to the connect function. If it's a returning user pass in the topic ID that the user was previously connected to.

```js
let state = await hashconnect.connect();
```

This function returns a *state* object, containing a new **topic ID** and **encryption key** (if you passed nothing in). **Make sure you store** this topic and encryption key for reuse on subsequent user visits.

### Pairing

If this is the first time a user is pairing, you will need to generate a new pairing string. If it is not the first time a user is using your app you can skip this step, as both apps will already be subscribed to the topic ID.

```js
let pairingString = hashconnect.generatePairingString(state.topic, state.encKey);
```

A pairing string is a base64 encoded string containing the topic to subscribe to and the metadata about your app.

### Pairing to extension

HashConnect has 1-click pairing with supported installed extensions. Currently the only supported wallet extension is [HashPack](https://www.hashpack.app/).

```js
hashconnect.findLocalWallets();
```

Calling this function will send a ping out, and supported wallets will return their metadata in a ```foundExtensionEvent```. You should take this metadata, and display buttons with the available extensions. More extensions will be supported in the future!

You should then call:

```js
hashconnect.connectToLocalWallet(pairingString, extensionMetadata);
```

And it will pop up a modal in the extension allowing the user to pair. 

### Sending Requests
//todo

### Events

Events are emitted by HashConnect to let you know when a request has been fufilled.

You can listen to them by calling .on() or .once() on them. All events return typed data.

#### FoundExtensionEvent

This event returns the metadata of the found extensions.

```js
hashconnect.foundExtensionEvent.once((walletMetadata) => {
    //do something with metadata
})
```

#### PairingEvent

The pairing event is triggered when a user accepts a pairing. It returns an array containing accountId's and a WalletMetadata.

```js
this.hashconnect.pairingEvent.on((pairingData) => {
    
    //example
    pairingData.accountIds.forEach(id => {
        if(this.pairedAccounts.indexOf(id) == -1)
            this.pairedAccounts.push(id);
    })
})
```

#### Transaction Response
```js
hashconnect.transactionResponseEvent.once((transactionResponse) => {
    //do something with transaction response data
})
```

### Types



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