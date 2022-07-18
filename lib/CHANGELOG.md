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