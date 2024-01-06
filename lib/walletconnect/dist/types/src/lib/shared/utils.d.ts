import { AccountId, PublicKey, Transaction, LedgerId, Query, SignerSignature } from '@hashgraph/sdk';
import { ProposalTypes, SessionTypes } from '@walletconnect/types';
import { proto } from '@hashgraph/proto';
/**
 * Freezes a transaction if it is not already frozen. Transactions must
 * be frozen before they can be converted to bytes.
 *
 * @param transaction - Any instance of a class that extends `Transaction`
 */
export declare function freezeTransaction<T extends Transaction>(transaction: T): void;
/**
 * Sets default consensus nodes that a transaction will be submitted to. Node Account ID(s)
 * must be set before a transaction can be frozen. If they have already been set, this
 * function will not modify the transaction.
 * @param transaction - any instance of a class that extends `Transaction`
 *
 * @see {@link https://docs.hedera.com/hedera/networks/testnet/testnet-nodes | Full list of Testnet-nodes}
 * @see {@link https://docs.hedera.com/hedera/networks/mainnet/mainnet-nodes | Full list of Mainnet-nodes}
 */
export declare function setDefaultNodeAccountIds<T extends Transaction>(transaction: T): void;
/**
 * Converts `Transaction` to a Base64-string.
 *
 * First converts a transaction to bytes and then encodes it as a Base64-string. Will attempt
 * to set default Node Account ID and freeze the transaction before converting.
 * @param transaction - Any instance of a class that extends `Transaction`
 * @returns Base64 encoded representation of the input `Transaction` object
 */
export declare function transactionToBase64String<T extends Transaction>(transaction: T): string;
/**
 * Recreates a `Transaction` from a base64 encoded string.
 *
 * Decodes the string to a buffer,
 * then passes to `Transaction.fromBytes`. For greater flexibility, this function uses the base
 * `Transaction` class, but takes an optional type parameter if the type of transaction is known,
 * allowing stronger typeing.
 * @param transactionBytes - a base64 encoded string
 * @returns `Transaction`
 * @example
 * ```ts
 * const txn1 = base64StringToTransaction(bytesString)
 * const txn2 = base64StringToTransaction<TransferTransaction>(bytesString)
 * // txn1 type: Transaction
 * // txn2 type: TransferTransaction
 * ```
 */
export declare function base64StringToTransaction<T extends Transaction>(transactionBytes: string): T;
/**
 * Converts a `proto.SignatureMap` to a base64 encoded string.
 *
 * First converts the `proto.SignatureMap` object to a JSON.
 * Then encodes the JSON to a base64 encoded string.
 * @param signatureMap - The `proto.SignatureMap` object to be converted
 * @returns Base64-encoded string representation of the input `proto.SignatureMap`
 */
export declare function signatureMapToBase64String(signatureMap: proto.SignatureMap): string;
/**
 * Converts a Base64-encoded string to a `proto.SignatureMap`.
 * @param base64string - Base64-encoded string
 * @returns `proto.SignatureMap`
 */
export declare function base64StringToSignatureMap(base64string: string): proto.SignatureMap;
/**
 * Encodes the binary data represented by the `Uint8Array` to a Base64 string.
 * @param binary - The `Uint8Array` containing binary data to be converted
 * @returns Base64-encoded string representation of the input `Uint8Array`
 */
export declare function Uint8ArrayToBase64String(binary: Uint8Array): string;
/**
 * Converts a Base64-encoded string to a `Uint8Array`.
 * @param base64string - Base64-encoded string to be converted
 * @returns A `Uint8Array` representing the decoded binary data
 */
export declare function base64StringToUint8Array(base64string: string): Uint8Array;
/**
 * Converts a `Query` object to a Base64-encoded string.
 * First utilizes the `toBytes` method of the `Query` instance to obtain its binary `Uint8Array` representation.
 * Then encodes the binary `Uint8Array` to a Base64 string representation.
 * @param query - A `Query` object to be converted
 * @returns Base64 encoded representation of the input `Query` object
 */
export declare function queryToBase64String<T, Q extends Query<T>>(query: Q): string;
/**
 * Recreates a `Query` from a Base64-encoded string. First decodes the string to a buffer,
 * then passes to `Query.fromBytes`. For greater flexibility, this function uses the base
 * `Query` class, but takes an optional type parameter if the type of query is known,
 * allowing stronger typeing.
 * @param bytesString - Base64-encoded string
 * @returns `Query<T>`
 * @example
 * ```ts
 * const query1 = base64StringToQuery(bytesString)
 * const query2 = base64StringToQuery<AccountInfoQuery>(bytesString)
 * // query1 type: Query<any>
 * // query2 type: AccountInfoQuery
 * ```
 */
export declare function base64StringToQuery<Q extends Query<any>>(bytesString: string): Q;
export declare function prefixMessageToSign(message: string): string;
/**
 * Incorporates additional data (salt) into the message to alter the output signature.
 * This alteration ensures that passing a transaction here for signing will yield an invalid signature,
 * as the additional data modifies the signature text.
 *
 * @param message -  A plain text string
 * @returns An array of Uint8Array containing the prepared message for signing
 */
export declare function stringToSignerMessage(message: string): Uint8Array[];
/**
 * This implementation expects a plain text string, which is prefixed and then signed by a wallet.
 * Because the spec calls for 1 message to be signed and 1 signer, this function expects a single
 * signature and used the first item in the sigPair array.
 *
 * @param message -  A plain text string
 * @param base64SignatureMap -  A base64 encoded proto.SignatureMap object
 * @returns boolean - whether or not the first signature in the sigPair is valid for the message and public key
 */
export declare function verifyMessageSignature(message: string, base64SignatureMap: string, publicKey: PublicKey): boolean;
/**
 *
 * https://github.com/hashgraph/hedera-sdk-js/blob/c78512b1d43eedf1d8bf2926a5b7ed3368fc39d1/src/PublicKey.js#L258
 * a signature pair is a protobuf object with a signature and a public key, it is the responsibility of a dApp to ensure the public key matches the account id
 * @param signerSignatures - An array of `SignerSignature` objects
 * @returns `proto.SignatureMap` object
 */
export declare function signerSignaturesToSignatureMap(signerSignatures: SignerSignature[]): proto.SignatureMap;
/**
 * A mapping of `LedgerId` to EIP chain id and CAIP-2 network name.
 *
 * Structure: [`LedgerId`, `number` (EIP155 chain id), `string` (CAIP-2 chain id)][]
 *
 * @see {@link https://namespaces.chainagnostic.org/hedera/README | Hedera Namespaces}
 * @see {@link https://hips.hedera.com/hip/hip-30 | CAIP Identifiers for the Hedera Network (HIP-30)}
 */
export declare const LEDGER_ID_MAPPINGS: [LedgerId, number, string][];
/**
 * Converts an EIP chain id to a LedgerId object.
 *
 * If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 *
 * @param chainId - The EIP chain ID (number) to be converted
 * @returns A `LedgerId` corresponding to the provided chain ID
 * @example
 * ```ts
 * const localnodeLedgerId = EIPChainIdToLedgerId(298)
 * console.log(localnodeLedgerId) // LedgerId.LOCAL_NODE
 * const mainnetLedgerId = EIPChainIdToLedgerId(295)
 * console.log(mainnetLedgerId) // LedgerId.MAINNET
 * ```
 */
export declare function EIPChainIdToLedgerId(chainId: number): LedgerId;
/**
 * Converts a LedgerId object to an EIP chain id.
 *
 * If no mapping is found, returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param ledgerId - The `LedgerId` object to be converted
 * @returns A `number` representing the EIP chain id for the provided `LedgerId`
 * @example
 * ```ts
 * const previewnetChainId = ledgerIdToEIPChainId(LedgerId.PREVIEWNET)
 * console.log(previewnetChainId) // 297
 * const testnetChainId = ledgerIdToEIPChainId(LedgerId.TESTNET)
 * console.log(testnetChainId) // 296
 * ```
 */
export declare function ledgerIdToEIPChainId(ledgerId: LedgerId): number;
/**
 * Converts a network name to an EIP chain id.
 * If no mapping is found, returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param networkName - The network name (string) to be converted
 * @returns A `number` representing the EIP chain id for the provided network name
 * @example
 * ```ts
 * const mainnetChainId = networkNameToEIPChainId('mainnet')
 * console.log(mainnetChainId) // 295
 * const testnetChainId = networkNameToEIPChainId('testnet')
 * console.log(mainnetChainId) // 296
 * ```
 */
export declare function networkNameToEIPChainId(networkName: string): number;
/**
 * Converts a CAIP chain id to a LedgerId object.
 *
 * If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 *
 * @param chainId - The CAIP chain ID (string) to be converted
 * @returns A `LedgerId` corresponding to the provided CAIP chain ID
 * @example
 * ```ts
 * const previewnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Previewnet)
 * console.log(previewnetLedgerId) // LedgerId.PREVIEWNET
 * const testnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Testnet)
 * console.log(testnetLedgerId) // LedgerId.TESTNET
 * ```
 */
export declare function CAIPChainIdToLedgerId(chainId: string): LedgerId;
/**
 * Converts a LedgerId object to a CAIP chain id.
 *
 * If no mapping is found, returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param ledgerId - The `LedgerId` object to be converted
 * @returns A `string` representing the CAIP chain id for the provided `LedgerId`
 * @example
 * ```ts
 * const mainnetChainId = ledgerIdToCAIPChainId(HederaChainId.Mainnet)
 * console.log(mainnetChainId) // LedgerId.PREVIEWNET
 * const testnetChainId = ledgerIdToCAIPChainId(HederaChainId.Testnet)
 * console.log(testnetChainId) // LedgerId.TESTNET
 * ```
 */
export declare function ledgerIdToCAIPChainId(ledgerId: LedgerId): string;
/**
 * Converts a network name to a CAIP chain id.
 *
 * If no mapping is found, returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param networkName - The network name (string) to be converted
 * @returns A `string` representing the CAIP chain id for the provided network name
 * @example
 * ```ts
 * const previewnetChainId = networkNameToCAIPChainId('previewnet')
 * console.log(previewnetChainId) // HederaChainId.Previewnet
 * const devnetChainId = networkNameToCAIPChainId('devnet')
 * console.log(devnetChainId) // HederaChainId.Devnet
 * ```
 */
export declare function networkNameToCAIPChainId(networkName: string): string;
/**
 * Create a `ProposalTypes.RequiredNamespaces` object for a given ledgerId.
 *
 * @param ledgerId - The `LedgerId` for which the namespaces are created
 * @param methods - An array of strings representing methods
 * @param events - An array of strings representing events
 * @returns A `ProposalTypes.RequiredNamespaces` object
 */
export declare const networkNamespaces: (ledgerId: LedgerId, methods: string[], events: string[]) => ProposalTypes.RequiredNamespaces;
/**
 * Get the account and ledger from a `SessionTypes.Struct` object.
 *
 * @param session - The `SessionTypes.Struct` object containing namespaces
 * @returns `ProposalTypes.RequiredNamespaces` - an array of objects containing network (LedgerId) and account (AccountId)
 */
export declare const accountAndLedgerFromSession: (session: SessionTypes.Struct) => {
    network: LedgerId;
    account: AccountId;
}[];
//# sourceMappingURL=utils.d.ts.map