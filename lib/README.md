# Hashconnect
test
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

