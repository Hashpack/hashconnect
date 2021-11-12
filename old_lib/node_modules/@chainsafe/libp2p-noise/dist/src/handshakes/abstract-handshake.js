"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHandshake = exports.MIN_NONCE = void 0;
const buffer_1 = require("buffer");
const x25519 = __importStar(require("@stablelib/x25519"));
const SHA256 = __importStar(require("@stablelib/sha256"));
const chacha20poly1305_1 = require("@stablelib/chacha20poly1305");
const utils_1 = require("../utils");
const logger_1 = require("../logger");
exports.MIN_NONCE = 0;
class AbstractHandshake {
    encryptWithAd(cs, ad, plaintext) {
        const e = this.encrypt(cs.k, cs.n, ad, plaintext);
        this.setNonce(cs, this.incrementNonce(cs.n));
        return e;
    }
    decryptWithAd(cs, ad, ciphertext) {
        const { plaintext, valid } = this.decrypt(cs.k, cs.n, ad, ciphertext);
        this.setNonce(cs, this.incrementNonce(cs.n));
        return { plaintext, valid };
    }
    // Cipher state related
    hasKey(cs) {
        return !this.isEmptyKey(cs.k);
    }
    setNonce(cs, nonce) {
        cs.n = nonce;
    }
    createEmptyKey() {
        return buffer_1.Buffer.alloc(32);
    }
    isEmptyKey(k) {
        const emptyKey = this.createEmptyKey();
        return emptyKey.equals(k);
    }
    incrementNonce(n) {
        return n + 1;
    }
    nonceToBytes(n) {
        const nonce = buffer_1.Buffer.alloc(12);
        nonce.writeUInt32LE(n, 4);
        return nonce;
    }
    encrypt(k, n, ad, plaintext) {
        const nonce = this.nonceToBytes(n);
        const ctx = new chacha20poly1305_1.ChaCha20Poly1305(k);
        const encryptedMessage = ctx.seal(nonce, plaintext, ad);
        return buffer_1.Buffer.from(encryptedMessage.buffer, encryptedMessage.byteOffset, encryptedMessage.length);
    }
    encryptAndHash(ss, plaintext) {
        let ciphertext;
        if (this.hasKey(ss.cs)) {
            ciphertext = this.encryptWithAd(ss.cs, ss.h, plaintext);
        }
        else {
            ciphertext = plaintext;
        }
        this.mixHash(ss, ciphertext);
        return ciphertext;
    }
    decrypt(k, n, ad, ciphertext) {
        const nonce = this.nonceToBytes(n);
        const ctx = new chacha20poly1305_1.ChaCha20Poly1305(k);
        const encryptedMessage = ctx.open(nonce, ciphertext, ad);
        if (encryptedMessage) {
            return {
                plaintext: buffer_1.Buffer.from(encryptedMessage.buffer, encryptedMessage.byteOffset, encryptedMessage.length),
                valid: true
            };
        }
        else {
            return {
                plaintext: buffer_1.Buffer.from(''),
                valid: false
            };
        }
    }
    decryptAndHash(ss, ciphertext) {
        let plaintext;
        let valid = true;
        if (this.hasKey(ss.cs)) {
            ({ plaintext, valid } = this.decryptWithAd(ss.cs, ss.h, ciphertext));
        }
        else {
            plaintext = ciphertext;
        }
        this.mixHash(ss, ciphertext);
        return { plaintext, valid };
    }
    dh(privateKey, publicKey) {
        try {
            const derivedU8 = x25519.sharedKey(privateKey, publicKey);
            const derived = buffer_1.Buffer.from(derivedU8.buffer, derivedU8.byteOffset, derivedU8.length);
            const result = buffer_1.Buffer.alloc(32);
            derived.copy(result);
            return result;
        }
        catch (e) {
            logger_1.logger(e.message);
            return buffer_1.Buffer.alloc(32);
        }
    }
    mixHash(ss, data) {
        ss.h = this.getHash(ss.h, data);
    }
    getHash(a, b) {
        const hash = SHA256.hash(buffer_1.Buffer.from([...a, ...b]));
        return buffer_1.Buffer.from(hash.buffer, hash.byteOffset, hash.length);
    }
    mixKey(ss, ikm) {
        const [ck, tempK] = utils_1.getHkdf(ss.ck, ikm);
        ss.cs = this.initializeKey(tempK);
        ss.ck = ck;
    }
    initializeKey(k) {
        const n = exports.MIN_NONCE;
        return { k, n };
    }
    // Symmetric state related
    initializeSymmetric(protocolName) {
        const protocolNameBytes = buffer_1.Buffer.from(protocolName, 'utf-8');
        const h = this.hashProtocolName(protocolNameBytes);
        const ck = h;
        const key = this.createEmptyKey();
        const cs = this.initializeKey(key);
        return { cs, ck, h };
    }
    hashProtocolName(protocolName) {
        if (protocolName.length <= 32) {
            const h = buffer_1.Buffer.alloc(32);
            protocolName.copy(h);
            return h;
        }
        else {
            return this.getHash(protocolName, buffer_1.Buffer.alloc(0));
        }
    }
    split(ss) {
        const [tempk1, tempk2] = utils_1.getHkdf(ss.ck, buffer_1.Buffer.alloc(0));
        const cs1 = this.initializeKey(tempk1);
        const cs2 = this.initializeKey(tempk2);
        return { cs1, cs2 };
    }
    writeMessageRegular(cs, payload) {
        const ciphertext = this.encryptWithAd(cs, buffer_1.Buffer.alloc(0), payload);
        const ne = this.createEmptyKey();
        const ns = buffer_1.Buffer.alloc(0);
        return { ne, ns, ciphertext };
    }
    readMessageRegular(cs, message) {
        return this.decryptWithAd(cs, buffer_1.Buffer.alloc(0), message.ciphertext);
    }
}
exports.AbstractHandshake = AbstractHandshake;
//# sourceMappingURL=abstract-handshake.js.map