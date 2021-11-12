# where are we?

> environment detection

## Install

```console
$ npm install wherearewe
```

## Usage

```javascript
const where = require('wherearewe')

console.info(where)
// {
//  isTest: boolean,
//  isElectron: boolean,
//  isElectronMain: boolean,
//  isElectronRenderer: boolean,
//  isNode: boolean,
//  isBrowser: boolean, // Detects browser main thread  **NOT** web worker or service worker
//  isWebWorker: boolean,
//  isEnvWithDom: boolean
//}
```
