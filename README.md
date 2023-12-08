# Hashconnect

**HashConnect v3 is current in pre-release. API's may change or be unstable.**

Hashconnect is a helper library around the Hedera WalletConnect standard, allowing dapps to easily integrate with a variety of wallets.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality.

**[View Demo](https://hashpack.github.io/hashconnect/)**

**[Example React Integration](https://github.com/rajatK012/hashconnectWalletConnect)**

- [Hashconnect](#hashconnect)
  - [Project ID](#project-id)
  - [Quick Start](#quick-start)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Setup](#setup)
    - [Events](#events)
      - [Pairing Event](#pairing-event)
      - [Disconnect Event](#disconnect-event)
      - [Connection Status Change](#connection-status-change)
    - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Disconnecting](#disconnecting)
    - [Sending Requests](#sending-requests)
      - [Send Transaction](#send-transaction)
      - [Sign](#sign)
      - [Authenticate](#authenticate)
    - [Provider/Signer](#providersigner)
      - [Get Provider](#get-provider)
      - [Get Signer](#get-signer)
    - [Types](#types)
        - [HashConnectConnectionState](#hashconnectconnectionstate)
        - [SessionData](#sessiondata)

## Project ID

Before doing anything you will need a WalletConnect project ID. You can get one by going to [WalletConnect Cloud](https://cloud.walletconnect.com/) and setting up a project. 

## Quick Start

This is what you need to start using HashConnect, it will be explained in detail in the subsequent documentation.

```js
import { HashConnect, HashConnectConnectionState, SessionData } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

const appMetadata = {
    name: "<Your dapp name>",
    description: "<Your dapp description>",
    icons: ["<Image url>"],
    url: "<Dapp url>"
}

let hashconnect: HashConnect;
let state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
let pairingData: SessionData;

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
    hashconnect.pairingEvent.on((newPairing) => {
        pairingData = newPairing;
    })

    hashconnect.disconnectionEvent.on((data) => {
        pairingData = null;
    });

    hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
        state = connectionStatus;
    })
}

sendTransaction(accountId: string, transaction: Transaction) {
    hashconnect.sendTransaction(accountId, transaction).then(response => {
        //handle success
    }).catch(err => {
        //handle error
    })
}
```

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

HashConnect also providers other sorts of helpers, like user profile fetching and token gating.

## Usage

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


### Disconnecting

Call `hashconnect.disconnect()` to disconnect.

### Sending Requests

#### Send Transaction

This request takes two parameters, **accountId** and a Hedera Transaction.

```js
await hashconnect.sendTransaction(accountId, transaction);
```


#### Sign

This request allows you to get a signature on a generic piece of data. You can send a string or object.

```js
await hashconnect.sign(signingAcct, dataToSign);
```


#### Authenticate

You can authenticate a message came from the expected dapp and was signed by the expected user using `hashconnect.hashpackAuthenticate()`.

This method will validate that the `serverSignature` was signed using the `serverSigningAccount`'s private key, submit the payload for signing in the user's wallet, and then validate that the user's signature matches the expected signature.

```js
const { isValid, error } = await hashconnect.hashpackAuthenticate(
    accountId,
    serverSigningAccount,
    serverSignature,
    payload: {
        url: 'https://example.dapp';
        data: {}
    }
);
```

### Get Signer

Pass the accountId of a paired account to get a signer back, this allows you to interact with HashConnect using a simpler API.

```js
signer = hashconnect.getSigner(AccountId.fromString('0.0.12345'));
```

#### Usage

```js
const signer = hashconnect.getSigner(fromAccount);

let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(signer);

let res = await trans.executeWithSigner(signer);
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

##### SessionData

```js
export interface SessionData {
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  accountIds: string[];
  network: string;
}
```