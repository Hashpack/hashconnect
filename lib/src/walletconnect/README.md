# Overview

## Under active development

This library is a work in progress and open for contribution. The final destination for the
community supported and governed helper library implementing WalletConnect will be
`@hashgraph/walletconnect`.

The main branch of this library is deprecated and was originally built utilizing the spec set
out by the
[Hedera <> WalletConnect JSON-RPC spec](https://walletconnect-specs-git-fork-hgraph-io-main-walletconnect1.vercel.app/2.0/blockchain-rpc/hedera-rpc).

There is an active discussion surrounding standardizing the "Integration of Wallet Connect 2.0
Protocol for Wallets and dApps on Hedera" via the
[HIP-820 discussion](https://github.com/hashgraph/hedera-improvement-proposal/discussions/819).

The `release/hip-820` branch of this repo is the upstream branch of this repository as we
migrate to this spec.

We are working on this library as well as the
[WalletConnect Spec PR](https://github.com/WalletConnect/walletconnect-specs/pull/117) based on
the results of
[HIP-820](https://github.com/hashgraph/hedera-improvement-proposal/pull/820/files).

Please join the discussion!

---

This package managed by the Hedera community and is intended to be a standard for ecosystem
wallets and dApp providers utilizing [WalletConnect](https://walletconnect.com) as a their
communications protocol. It utilizes the
[`@hashgraph/sdk`](https://www.npmjs.com/package/@hashgraph/sdk) and provides functions to
facilitate implementing the
[Hedera <> WalletConnect JSON-RPC spec](https://walletconnect-specs-git-fork-hgraph-io-main-walletconnect1.vercel.app/2.0/blockchain-rpc/hedera-rpc).

> WalletConnect brings the ecosystem together by enabling wallets and apps to securely connect
> and interact.
>
> -- <cite> https://walletconnect.com

This library facilitates the implementation of the **Hedera <> WalletConnect Spec** which allows
wallets and dApps to natively integrate with Hedera. It provides additional, out of network
functionality with the `hedera_signMessage` function.

In short, it uses the Hedera javascript SDK to build transactions, serialize them, send "them
over the wire" to wallets for processing and return responses back to dApps.

A message could be one of:

- a Hedera network response
- an error message
- signed transaction bytes
- signed arbitrary set of bytes

_Please note, this is distinct from the
[Implementation of Ethereum JSON-RPC APIs for Hedera](https://github.com/hashgraph/hedera-json-rpc-relay).
At the time of this writing, "the Hedera JSON-RPC relay implementation is in beta, offers
limited functionality today, and is only available to developers."_

_The relay and this library have different intentions and serve different purposes - namely
native Hedera integration vs. Ethereum compatability layers to ease developer onboarding for
those more familiar with the Ethereum ecosystem._

## Set up

To start using WalletConnect, sign up for an account at <https://cloud.walletconnect.com>. You
will use your project id when initializing client libraries.

It is important to understand core WalletConnect concepts when integrating this library. Please
reference the [WalletConnect documentation](https://docs.walletconnect.com/2.0/).

## Usage - Updates to the README are in progress

Upon successfully configuring your dApp and/or wallet to manage WalletConnect sessions, you can
use this library’s functions to easily create and handle requests for the Hedera network.

### Wallet

This library provides a Wallet class that extends the
[ Web3Wallet ](https://github.com/WalletConnect/walletconnect-monorepo/tree/v2.0/packages/web3wallet)
class provided by WalletConnect class provided by WalletConnect

#### Event Listeners

WalletConnect emits various events during a session. Listen to these events to synchronize the
state of your application:

```javascript
// Handle pairing proposals
signClient.on('session_proposal', (event) => {
  // Display session proposal to the user and decide to approve or reject
})

// Handle session requests, like signing transactions or messages
signClient.on('session_request', (event) => {
  // Process the session request
})

// Handle session deletions
signClient.on('session_delete', (event) => {
  // React to session termination
})
```

#### Pairing with dApps

Pairing establishes a connection between the wallet and a dApp. Once paired, the dApp can send
session requests to the wallet.

##### a. Pairing via URI

If a dApp shares a URI for pairing:

```javascript
await signClient.core.pairing.pair({ uri: 'RECEIVED_URI' })
```

Upon successful pairing, the `session_proposal` event will be triggered.

##### b. Pairing via QR Codes

For a better user experience, dApps often share QR codes that wallets can scan to establish a
pairing. Use a QR code scanning library to scan and obtain the URI, then proceed with pairing:

```javascript
const scannedUri = '...' // URI obtained from scanning the QR code
await signClient.core.pairing.pair({ uri: scannedUri })
```

#### Handling Session Proposals

Upon receiving a `session_proposal` event, display the proposal details to the user. Allow them
to approve or reject the session:

##### Handling Session Requests

Upon receiving a `session_request` event, process the request. For instance, if the dApp
requests a transaction to be signed:
