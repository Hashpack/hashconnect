import { Buffer } from 'buffer'
import { AccountId, Transaction, LedgerId, Query } from '@hashgraph/sdk'
import { ProposalTypes, SessionTypes } from '@walletconnect/types'
// import { keccak256 } from 'web3-utils'

/**
 * Freezes a transaction if it is not already frozen. Transactions must
 * be frozen before they can be converted to bytes.
 *
 * @param transaction Any instance of a class that extends `Transaction`
 */
export function freezeTransaction<T extends Transaction>(transaction: T): void {
  if (!transaction.isFrozen()) {
    transaction.freeze()
  }
}

/**
 * Sets a default consensus node that a transaction will be submitted to. Node Account ID(s)
 * must be set before a transaction can be frozen. If they have already been set, this
 * function will not modify the transaction. See full list of nodes here:
 * - {@link https://docs.hedera.com/hedera/networks/testnet/testnet-nodes}
 * - {@link https://docs.hedera.com/hedera/networks/mainnet/mainnet-nodes}
 * @param transaction Any instance of a class that extends `Transaction`
 */
export function setDefaultNodeAccountIds<T extends Transaction>(transaction: T): void {
  const isNodeAccountIdNotSet =
    !transaction.nodeAccountIds || transaction.nodeAccountIds.length === 0
  if (!transaction.isFrozen() && isNodeAccountIdNotSet) {
    //TODO: add nodes
    transaction.setNodeAccountIds([new AccountId(3)])
  }
}

/**
 * Converts a transaction to bytes and then encodes as a base64 string. Will attempt
 * to set default Node Account ID and freeze the transaction before converting.
 * @param transaction Any instance of a class that extends `Transaction`
 * @returns a base64 encoded string
 */
export function transactionToBase64String<T extends Transaction>(transaction: T): string {
  setDefaultNodeAccountIds(transaction)
  freezeTransaction(transaction)
  const transactionBytes = transaction.toBytes()
  return Buffer.from(transactionBytes).toString('base64')
}

/**
 * Recreates a `Transaction` from a base64 encoded string. First decodes the string to a buffer,
 * then passes to `Transaction.fromBytes`. For greater flexibility, this function uses the base
 * `Transaction` class, but takes an optional type parameter if the type of transaction is known,
 * allowing stronger typeing.
 * @param transactionBytes string - a base64 encoded string
 * @returns `Transaction`
 * @example
 * ```js
 * const txn1 = base64StringToTransaction(bytesString)
 * const txn2 = base64StringToTransaction<TransferTransaction>(bytesString)
 * // txn1 type: Transaction
 * // txn2 type: TransferTransaction
 * ```
 */
export function base64StringToTransaction<T extends Transaction>(transactionBytes: string): T {
  const decoded = Buffer.from(transactionBytes, 'base64')
  return Transaction.fromBytes(decoded) as T
}

/**
 * Converts a query to bytes and then encodes as a base64 string.
 * @param Query
 * @returns a base64 encoded string
 */
export function queryToBase64String<T, Q extends Query<T>>(query: Q): string {
  const queryBytes = query.toBytes()
  return Buffer.from(queryBytes).toString('base64')
}

/**
 * Recreates a `Query` from a base64 encoded string. First decodes the string to a buffer,
 * then passes to `Query.fromBytes`. For greater flexibility, this function uses the base
 * `Query` class, but takes an optional type parameter if the type of query is known,
 * allowing stronger typeing.
 * @param queryBytes string - a base64 encoded string
 * @returns `Query<T>`
 */
export function base64StringToQuery<T, Q extends Query<T>>(queryBytes: string): Q {
  const decoded = Buffer.from(queryBytes, 'base64')
  return Query.fromBytes(decoded) as Q
}

/**
 * Prepares a string message for signing
 * comment and confirm discussion regarding keccak256
 * TODO: https://github.com/hashgraph/hedera-improvement-proposal/discussions/819#discussioncomment-7509931
 */
export function base64StringToMessage(message: string): Uint8Array[] {
  const decoded = Buffer.from(message, 'base64').toString('utf-8')
  // Buffer.from(keccak256('\x19Hedera Signed Message:\n' + decoded.length + decoded)),
  return [Buffer.from('\x19Hedera Signed Message:\n' + decoded.length + decoded)]
}

export function messageToBase64String(message: string): string {
  return Buffer.from(message, 'base64').toString('utf-8')
}

/**
 * A mapping of `LedgerId` to EIP chain id and CAIP-2 network name.
 * @link https://namespaces.chainagnostic.org/hedera/README
 * @link https://hips.hedera.com/hip/hip-30
 * @summary [`LedgerId`, `number` (EIP155 chain id), `string` (CAIP-2 chain id)][]
 */
export const LEDGER_ID_MAPPINGS: [LedgerId, number, string][] = [
  [LedgerId.MAINNET, 295, 'hedera:mainnet'],
  [LedgerId.TESTNET, 296, 'hedera:testnet'],
  [LedgerId.PREVIEWNET, 297, 'hedera:previewnet'],
  [LedgerId.LOCAL_NODE, 298, 'hedera:devnet'],
]
const DEFAULT_LEDGER_ID = LedgerId.LOCAL_NODE
const DEFAULT_EIP = LEDGER_ID_MAPPINGS[3][1]
const DEFAULT_CAIP = LEDGER_ID_MAPPINGS[3][2]

/**
 * Converts a EIP chain id to a LedgerId object. If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 * @param chainId number
 * @returns `LedgerId`
 */
export function EIPChainIdToLedgerId(chainId: number): LedgerId {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId, chainId_] = LEDGER_ID_MAPPINGS[i]
    if (chainId === chainId_) {
      return ledgerId
    }
  }
  return DEFAULT_LEDGER_ID
}

/**
 * Converts a LedgerId object to a EIP chain id. If no mapping is found,
 * returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 * @param ledgerId LedgerId
 * @returns `number`
 */
export function ledgerIdToEIPChainId(ledgerId: LedgerId): number {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId_, chainId] = LEDGER_ID_MAPPINGS[i]
    if (ledgerId === ledgerId_) {
      return chainId
    }
  }
  return DEFAULT_EIP
}

/**
 * Converts a network name to a EIP chain id. If no mapping is found,
 * returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 * @param networkName string
 * @returns `number`
 */
export function networkNameToEIPChainId(networkName: string): number {
  const ledgerId = LedgerId.fromString(networkName.toLowerCase())
  return ledgerIdToEIPChainId(ledgerId)
}

/**
 * Converts a CAIP chain id to a LedgerId object. If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 * @param chainId number
 * @returns `LedgerId`
 */
export function CAIPChainIdToLedgerId(chainId: string): LedgerId {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId, _, chainId_] = LEDGER_ID_MAPPINGS[i]
    if (chainId === chainId_) {
      return ledgerId
    }
  }
  return DEFAULT_LEDGER_ID
}

/**
 * Converts a LedgerId object to a CAIP chain id. If no mapping is found,
 * returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 * @param ledgerId LedgerId
 * @returns `string`
 */
export function ledgerIdToCAIPChainId(ledgerId: LedgerId): string {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId_, _, chainId] = LEDGER_ID_MAPPINGS[i]
    if (ledgerId.toString() === ledgerId_.toString()) {
      return chainId
    }
  }
  return DEFAULT_CAIP
}

/**
 * Converts a network name to a CAIP chain id. If no mapping is found,
 * returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 * @param networkName string
 * @returns `string`
 */
export function networkNameToCAIPChainId(networkName: string): string {
  const ledgerId = LedgerId.fromString(networkName.toLowerCase())
  const chainId = ledgerIdToCAIPChainId(ledgerId)
  return chainId
}

/**
 * Create a `ProposalTypes.RequiredNamespaces` object for a given ledgerId.
 * @param ledgerId LedgerId
 * @param methods string[]
 * @param events string[]
 * @returns `ProposalTypes.RequiredNamespaces`
 */
export const networkNamespaces = (
  ledgerId: LedgerId,
  methods: string[],
  events: string[],
): ProposalTypes.RequiredNamespaces => ({
  hedera: {
    chains: [ledgerIdToCAIPChainId(ledgerId)],
    methods,
    events,
  },
})

/**
 * Get the account and ledger from a `SessionTypes.Struct` object.
 * @param session SessionTypes.Struct
 * @returns `ProposalTypes.RequiredNamespaces`
 */
export const accountAndLedgerFromSession = (
  session: SessionTypes.Struct,
): { network: LedgerId; account: AccountId }[] => {
  const hederaNamespace = session.namespaces.hedera
  if (!hederaNamespace) throw new Error('No hedera namespace found')

  return hederaNamespace.accounts.map((account) => {
    const [chain, network, acc] = account.split(':')
    return {
      network: CAIPChainIdToLedgerId(chain + ':' + network),
      account: AccountId.fromString(acc),
    }
  })
}
