'use strict'

// @ts-ignore no types
const Varint = require('varint')
const { Buffer } = require('buffer')

/**
 * @param {any} bl
 */
const toBufferProxy = bl => new Proxy({}, {
  get: (_, prop) => {
    // @ts-ignore magic
    return prop[0] === 'l' ? bl[prop] : bl.get(parseInt(prop))
  }
})

/**
 * @type {import('./types').LengthDecoderFunction}
 */
// @ts-ignore cannot declare expected bytes property
const varintDecode = data => {
  const len = Varint.decode(Buffer.isBuffer(data) ? data : toBufferProxy(data))
  varintDecode.bytes = Varint.decode.bytes
  return len
}

module.exports = varintDecode
