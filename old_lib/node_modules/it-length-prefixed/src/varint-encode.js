'use strict'

// @ts-ignore no types
const Varint = require('varint')
const { Buffer } = require('buffer')

/**
 * Encode the passed length `value` to the `target` buffer at the given `offset`
 *
 * @type {import('./types').LengthEncoderFunction}
 */
// @ts-ignore cannot declare expected bytes property
const varintEncode = (value, target, offset) => {
  const ret = Varint.encode(value, target, offset)
  varintEncode.bytes = Varint.encode.bytes
  // If no target, create Buffer from returned array
  return target || Buffer.from(ret)
}

module.exports = varintEncode
