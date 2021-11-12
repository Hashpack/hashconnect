/// <reference types="node" />
export declare const kdf: (secret: Buffer, outputLength: number) => Promise<Buffer>
/**
 * Compute the public key for a given private key.
 *
 * @param {Buffer} privateKey - A 32-byte private key
 * @return {Promise<Buffer>} A promise that resolve with the 65-byte public key or reject on wrong private key.
 * @function
 */
export declare const getPublic: (privateKey: Buffer) => Promise<Buffer>
/**
 * Create an ECDSA signature.
 *
 * @param {Buffer} privateKey - A 32-byte private key
 * @param {Buffer} msg - The message being signed, no more than 32 bytes
 * @return {Promise.<Buffer>} A promise that resolves with the signature and rejects on bad key or message.
 */
export declare const sign: (privateKey: Buffer, msg: Buffer) => Promise<Buffer>
/**
 * Verify an ECDSA signature.
 *
 * @param {Buffer} publicKey - A 65-byte public key
 * @param {Buffer} msg - The message being verified
 * @param {Buffer} sig - The signature
 * @return {Promise.<true>} A promise that resolves on correct signature and rejects on bad key or signature
 */
export declare const verify: (publicKey: Buffer, msg: Buffer, sig: Buffer) => Promise<true>
/**
 * Derive shared secret for given private and public keys.
 *
 * @param {Buffer} privateKey - Sender's private key (32 bytes)
 * @param {Buffer} publicKey - Recipient's public key (65 bytes)
 * @return {Promise.<Buffer>} A promise that resolves with the derived shared secret (Px, 32 bytes) and rejects on bad key
 */
export declare const derive: (privateKey: Buffer, publicKey: Buffer) => Promise<Buffer>
/**
 * Encrypt message for given recepient's public key.
 *
 * @param {Buffer} publicKeyTo - Recipient's public key (65 bytes)
 * @param {Buffer} msg - The message being encrypted
 * @param {?{?iv: Buffer, ?ephemPrivateKey: Buffer}} opts - You may also specify initialization vector (16 bytes) and ephemeral private key (32 bytes) to get deterministic results.
 * @return {Promise.<Buffer>} - A promise that resolves with the ECIES structure serialized
 */
export declare const encrypt: (publicKeyTo: Buffer, msg: Buffer, opts?: {
  iv?: Buffer | undefined
  ephemPrivateKey?: Buffer | undefined
} | undefined) => Promise<Buffer>
/**
 * Decrypt message using given private key.
 *
 * @param {Buffer} privateKey - A 32-byte private key of recepient of the message
 * @param {Ecies} encrypted - ECIES serialized structure (result of ECIES encryption)
 * @return {Promise.<Buffer>} - A promise that resolves with the plaintext on successful decryption and rejects on failure
 */
export declare const decrypt: (privateKey: Buffer, encrypted: Buffer) => Promise<Buffer>
/**
 * From Ethereum's ECIES key path implementation, a Path should be a string formatted like `m/0'/0/0`
 * where the first part after the `m` is the account, the second is the scope and the last the key index.
 *
 * NB: Account and scope shouldn't go over 2^16-1 (65535), keyIndex shouldn't go over 2^21-1 (2097151) in order to
 * to respect the current valueOf() algorithm on all devices.
 */
export interface Path {
  readonly account: string
  readonly scope: string
  readonly keyIndex: string
}
export declare const Path: (account: string, scope: string, keyIndex: string) => Path
/**
 * KeyPath takes a path string and handles path manipulation (such as parsing it to a Path or getting the next path value)
 */
export interface KeyPath {
  readonly value: string
  parse: () => Path
  next: (increment?: number) => KeyPath
  valueOf: () => number
}
/**
* Build an immutable key path
*
* @param {string} value - The path string
* @returns an instance of KeyPath
* @throws invalid value for path
* @throws invalid path with value exceeding its limits
*/
export declare const KeyPath: (value: string) => KeyPath
