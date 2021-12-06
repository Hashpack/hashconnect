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
    - [Events](#events)
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

### Connecting

Call init on the Hashconnect variable, passing in the metadata you've defined.

```js
await hashconnect.init(appMetadata);
```

You then need to connect to a node, if this is the first time a user is connecting to a node you don't need to pass anything in to the connect function. If it's a returning user pass in the topic ID that the user was previously connected to.

```js
let state = await this.hashconnect.connect();
```

This function returns a *state* object, containing a new topic ID (if you passed nothing in). Make sure you store this topic for reuse on subsequent user visits.

### Pairing

If this is the first time a user is pairing, you will need to generate a new pairing string. If it is not the first time a user is using your app you can skip this step, as both apps will already be subscribed to the topic ID.

```js
let pairingString = this.hashconnect.generatePairingString(this.topic);
```

A pairing string is a base64 encoded string containing the topic to subscribe to and the metadata about your app.

**todo: add section about this.hashconnect.findLocalWallets();**

### Events

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