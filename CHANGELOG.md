## v3.0.12
- Updated WalletConnect and HashGraph SDK

## v3.0.11
- Stopped HashPack extension from popping up on init

## v3.0.10
- Added official Hedera Wallet Connect package instead of including a locally compiled version

## v3.0.9
- Fix documentation around signer.sign()
- Trigger disconnection event when disconnecting from dapp
- Added documentation around verifying signatures

## v3.0.8
- Generate new pairing string when pairing rejected

## v3.0.7
- Added check if disconnection is in progress

## v3.0.6
- Added check if window object exists for running outside browser

## v3.0.1 - v3.0.5
- various tweaks

## v3.0.0
- refactored to use walletconnect

## v0.2.4
- wrapped a console log in if(debug)

## v0.2.2
- Fixed false pairing event when refreshing with no pairings
- Fixed not subscribing to topic on second refresh when no pairings
- Manually calling generatePairingString() now updates the pairing string in hcData
- Fixed disconnect unsubscribing from dapp topics, was only useful for wallets
  - Note, we reccommend dapps using disconnect() rather than clearConnectionsAndData(), the latter should be used for testing and resetting the state
   
## v0.2.1
- Fixed issue initializing with legacy hashconnect data

## v0.2.0
- Streamlined setup
- Added 'hideNft' option to transactions
- Made connectionStatusChangeEvent work correctly
- Added lastUsed metadata to pairing data
- Added disconnect function
- No longer need to use https to test extension connectivity
- Automatically send pairing request if embedded in an iframe

## v0.1.10
- Added iframe connection logic

## v0.1.6
- Added provider/signer (HIP-338) functionality
- Added transaction response in addition to receipt
  
## v0.1.5
- Refactored authentication to be more secure

## v0.1.4
- Added authentication functionality
  - Please see documentation for details

## v0.1.3

- Added this changelog file
- Automatically retry connection to websocket when the connection is severed - for example when the server reboots
- Added ```connectionStatusChange``` event, fires a connected/disconnected event when the server connection changes
- Converted sendTransaction and requestAdditionalAccounts to promises instead of events