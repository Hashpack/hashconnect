# HashConnect

**HashConnect v3 is public beta. API's may change or be unstable.**

**For v2 docs [go here](https://github.com/Hashpack/hashconnect/blob/5e5909c7610e759a6b52bc790fc306aac3fb7322/README.md)**

[Join the Hedera Developer Guild Discord](https://discord.gg/cP5wDCjNYb)

Hashconnect is a helper library around the Hedera WalletConnect standard, allowing dapps to easily integrate with a variety of wallets.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality.

**[Example React Integration](https://github.com/Hashpack/hashconnect/tree/main/example/react-dapp)**

- [HashConnect](#hashconnect)
  - [Project ID](#project-id)
  - [Quick Start](#quick-start)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
    - [Setup](#setup)
    - [Get Signer](#get-signer)
      - [Usage](#usage-1)
    - [Events](#events)
      - [Pairing Event](#pairing-event)
      - [Disconnect Event](#disconnect-event)
      - [Connection Status Change](#connection-status-change)
    - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Disconnecting](#disconnecting)
    - [Sending Requests](#sending-requests)
      - [Send Transaction](#send-transaction)
      - [Sign and Return](#sign-and-return)
      - [Sign Message](#sign-message)
      - [Verify Signature](#verify-signature)
    - [Transaction Receipts](#transaction-receipts)
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
    hashconnect.openPairingModal();
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

let response = await trans.executeWithSigner(signer);
```

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

When a user disconnects this event will be triggered so you can update the state of your dapp.

```js
hashconnect.disconnectionEvent.on((data) => {
    //do something
});
```

#### Connection Status Change

This event is fired when the connection status changes. This returns a `HashConnectConnectionState` [(details)](#hashconnectconnectionstate) 

```js
hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
    //do something with connection status
})
```

### Pairing

You can easily show a pairing popup containing the pairing code and a QR code by calling openPairingModal().

```js
hashconnect.openPairingModal();
```

There are a variety of optional theme properties you can pass into openPairingModal() to customize it:

- themeMode - "dark" | "light"
- backgroundColor - string (hex color)
- accentColor - string (hex color)
- accentFillColor - string (hex color)
- borderRadius - string (css border radius)

#### Pairing to extension

If the HashPack extension is found during init, it will automatically pop it up and request pairing.

### Disconnecting

Call `hashconnect.disconnect()` to disconnect.

### Sending Requests

#### Send Transaction

This request takes two parameters, **accountId** and a Hedera Transaction, signs it with the specified account ID, and executes it.

```js
let response = await hashconnect.sendTransaction(accountId, transaction);
```

**With Signer:**
```js
let signer = hashconnect.getSigner(accountId);

let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(signer);

let response = await trans.executeWithSigner(signer);
```

#### Sign and Return 

This request takes two parameters, **accountId** and a Hedera Transaction, signs it with the specified account ID, and returns a signed transaction that you can execute or send to other users for additional signatures.

```js
let response = await hashconnect.signAndReturnTransaction(accountId, transaction);
```

**With Signer:**
```js
let signer = hashconnect.getSigner(accountId);

let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(signer);

let response = await trans.signTransaction(signer);
```

#### Sign Message

This request allows you to get a signature on a generic string, which can be used for things like authentication.

```js
let signature = await hashconnect.signMessages(accountId, message);
```

**With Signer:**
```js
let signer = hashconnect.getSigner(accountId);
let signature = await signer.sign(["Hello World!"]);
```

#### Verify Signature

Once you've got the result you can call .verifyMessageSignature() to verify it was signed by the correct account. **Please note** - you will need to get the public key from a mirror node as you cannot trust the public key being returned by the user for verification purposes. You will also likely want to verify it server side.

This method will return a boolean if the signature matches the public key.

```js
let verified = hashconnect.verifyMessageSignature("Hello World!", signMessageResponse, publicKey);
```

In order to prevent messages from secretly being transactions, there is a bit of manipulation happening to the messages. If you are attempting to verify a signature yourlsef, on the backend for example, you will need to run the message you are verifying through this function first and then verify the result against the signature:

```js
prefixMessageToSign(message: string) {
    return '\x19Hedera Signed Message:\n' + message.length + message
}
```

### Transaction Receipts

The HashConnect .sendTransaction() method will automatically retrieve and return a receipt, however when using the signer flow there is one extra step to getting a receipt:

**With Signer:**
```js
let response = await trans.executeWithSigner(signer);
let receipt = await response.getReceiptWithSigner(signer);
```

<!-- #### Authenticate

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
``` -->



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