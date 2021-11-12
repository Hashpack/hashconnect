'use strict'

const { Multiaddr } = require('multiaddr')

/**
 * @typedef {import('./types').MatchesFunction} MatchesFunction
 * @typedef {import('./types').PartialMatchesFunction} PartialMatchesFunction
 * @typedef {import('./types').Mafmt} Mafmt
 */

/*
 * Valid combinations
 */
const DNS4 = base('dns4')
const DNS6 = base('dns6')
const DNSADDR = base('dnsaddr')
const DNS = or(
  base('dns'),
  DNSADDR,
  DNS4,
  DNS6
)

const IP = or(base('ip4'), base('ip6'))
const TCP = or(
  and(IP, base('tcp')),
  and(DNS, base('tcp'))
)
const UDP = and(IP, base('udp'))
const UTP = and(UDP, base('utp'))

const QUIC = and(UDP, base('quic'))

const WebSockets = or(
  and(TCP, base('ws')),
  and(DNS, base('ws'))
)

const WebSocketsSecure = or(
  and(TCP, base('wss')),
  and(DNS, base('wss'))
)

const HTTP = or(
  and(TCP, base('http')),
  and(IP, base('http')),
  and(DNS, base('http'))
)

const HTTPS = or(
  and(TCP, base('https')),
  and(IP, base('https')),
  and(DNS, base('https'))
)

const WebRTCStar = or(
  and(WebSockets, base('p2p-webrtc-star'), base('p2p')),
  and(WebSocketsSecure, base('p2p-webrtc-star'), base('p2p')),
  and(WebSockets, base('p2p-webrtc-star')),
  and(WebSocketsSecure, base('p2p-webrtc-star'))
)

const WebSocketStar = or(
  and(WebSockets, base('p2p-websocket-star'), base('p2p')),
  and(WebSocketsSecure, base('p2p-websocket-star'), base('p2p')),
  and(WebSockets, base('p2p-websocket-star')),
  and(WebSocketsSecure, base('p2p-websocket-star'))
)

const WebRTCDirect = or(
  and(HTTP, base('p2p-webrtc-direct'), base('p2p')),
  and(HTTPS, base('p2p-webrtc-direct'), base('p2p')),
  and(HTTP, base('p2p-webrtc-direct')),
  and(HTTPS, base('p2p-webrtc-direct'))
)

const Reliable = or(
  WebSockets,
  WebSocketsSecure,
  HTTP,
  HTTPS,
  WebRTCStar,
  WebRTCDirect,
  TCP,
  UTP,
  QUIC,
  DNS
)

// Unlike ws-star, stardust can run over any transport thus removing the requirement for websockets (but don't even think about running a stardust server over webrtc-star ;) )
const Stardust = or(
  and(Reliable, base('p2p-stardust'), base('p2p')),
  and(Reliable, base('p2p-stardust'))
)

const _P2P = or(
  and(Reliable, base('p2p')),
  WebRTCStar,
  WebRTCDirect,
  base('p2p')
)

const _Circuit = or(
  and(_P2P, base('p2p-circuit'), _P2P),
  and(_P2P, base('p2p-circuit')),
  and(base('p2p-circuit'), _P2P),
  and(Reliable, base('p2p-circuit')),
  and(base('p2p-circuit'), Reliable),
  base('p2p-circuit')
)

const CircuitRecursive = () => or(
  and(_Circuit, CircuitRecursive),
  _Circuit
)

const Circuit = CircuitRecursive()

const P2P = or(
  and(Circuit, _P2P, Circuit),
  and(_P2P, Circuit),
  and(Circuit, _P2P),
  Circuit,
  _P2P
)

module.exports = {
  DNS,
  DNS4,
  DNS6,
  DNSADDR,
  IP,
  TCP,
  UDP,
  QUIC,
  UTP,
  HTTP,
  HTTPS,
  WebSockets,
  WebSocketsSecure,
  WebSocketStar,
  WebRTCStar,
  WebRTCDirect,
  Reliable,
  Stardust,
  Circuit,
  P2P,
  IPFS: P2P
}

/*
 * Validation funcs
 */

/**
 * @param {PartialMatchesFunction} partialMatch
 */
function makeMatchesFunction (partialMatch) {
  /**
   * @type {MatchesFunction}
   */
  function matches (a) {
    if (!Multiaddr.isMultiaddr(a)) {
      try {
        a = new Multiaddr(a)
      } catch (err) { // catch error
        return false // also if it's invalid it's propably not matching as well so return false
      }
    }
    const out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }

    if (out === true || out === false) {
      return out
    }

    return out.length === 0
  }

  return matches
}

/**
 * @param {Array<Mafmt | (() => Mafmt)>} args
 * @returns {Mafmt}
 */
function and (...args) {
  /**
   * @type {PartialMatchesFunction}
   */
  function partialMatch (a) {
    if (a.length < args.length) {
      return null
    }

    /** @type {boolean | string[] | null} */
    let out = a

    args.some((arg) => {
      out = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)

      if (Array.isArray(out)) {
        a = out
      }

      if (out === null) {
        return true
      }

      return false
    })

    return out
  }

  return {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: makeMatchesFunction(partialMatch),
    partialMatch: partialMatch
  }
}

/**
 * @param {Array<Mafmt | (() => Mafmt)>} args
 * @returns {Mafmt}
 */
function or (...args) {
  /**
   * @type {PartialMatchesFunction}
   */
  function partialMatch (a) {
    let out = null
    args.some((arg) => {
      const res = typeof arg === 'function'
        ? arg().partialMatch(a)
        : arg.partialMatch(a)
      if (res) {
        out = res
        return true
      }
      return false
    })

    return out
  }

  const result = {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: makeMatchesFunction(partialMatch),
    partialMatch: partialMatch
  }

  return result
}

/**
 * @param {string} n
 * @returns {Mafmt}
 */
function base (n) {
  const name = n

  /**
   * @type {MatchesFunction}
   */
  function matches (a) {
    let ma

    if (typeof a === 'string' || a instanceof Uint8Array) {
      try {
        ma = new Multiaddr(a)
      } catch (err) { // catch error
        return false // also if it's invalid it's probably not matching as well so return false
      }
    } else {
      ma = a
    }

    const pnames = ma.protoNames()
    if (pnames.length === 1 && pnames[0] === name) {
      return true
    }
    return false
  }

  /**
   * @type {PartialMatchesFunction}
   */
  function partialMatch (protos) {
    if (protos.length === 0) {
      return null
    }

    if (protos[0] === name) {
      return protos.slice(1)
    }
    return null
  }

  return {
    toString: function () { return name },
    matches: matches,
    partialMatch: partialMatch
  }
}
