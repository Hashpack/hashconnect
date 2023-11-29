//@ts-nocheck
import { type Transaction } from '@hashgraph/sdk'
import { EngineTypes } from '@walletconnect/types'
import { HederaJsonRpcMethod, transactionToBase64String } from '../shared'

export function buildSignMessageParams(
  signerAccountId: string,
  messages: (Uint8Array | string)[],
): any {
  return {
    signerAccountId,
    messages: messages.map((message) => Buffer.from(message).toString('base64')),
  }
}

function _buildTransactionParams(signerAccountId: string, transaction: Transaction) {
  return {
    signerAccountId,
    transaction: {
      bytes: transactionToBase64String(transaction),
    },
  }
}

export function buildSignAndExecuteTransactionParams(
  signerAccountId: string,
  transaction: Transaction,
): any {
  return _buildTransactionParams(signerAccountId, transaction)
}

export function buildSignAndReturnTransactionParams(
  signerAccountId: string,
  transaction: Transaction,
): any {
  return _buildTransactionParams(signerAccountId, transaction)
}

type HederaSessionRequestOptions = Pick<
  EngineTypes.RequestParams,
  'chainId' | 'topic' | 'expiry'
>
export class HederaSessionRequest {
  public chainId: HederaSessionRequestOptions['chainId']
  public topic: HederaSessionRequestOptions['topic']
  public expiry: HederaSessionRequestOptions['expiry']

  constructor({ chainId, topic, expiry }: HederaSessionRequestOptions) {
    this.chainId = chainId
    this.topic = topic
    this.expiry = expiry
  }

  public static create(options: HederaSessionRequestOptions) {
    return new HederaSessionRequest(options)
  }

  public buildSignAndExecuteTransactionRequest(
    signerAccountId: string,
    transaction: Transaction,
  ) {
    return {
      chainId: this.chainId,
      topic: this.topic,
      expiry: this.expiry,
      request: {
        method: HederaJsonRpcMethod.SignTransactionAndSend,
        params: buildSignAndExecuteTransactionParams(signerAccountId, transaction),
      },
    }
  }

  public buildSignAndReturnTransactionRequest(
    signerAccountId: string,
    transaction: Transaction,
  ) {
    return {
      chainId: this.chainId,
      topic: this.topic,
      expiry: this.expiry,
      request: {
        method: HederaJsonRpcMethod.SignTransactionBody,
        params: buildSignAndReturnTransactionParams(signerAccountId, transaction),
      },
    }
  }

  public buildSignMessageRequest(signerAccountId: string, messages: (Uint8Array | string)[]) {
    return {
      chainId: this.chainId,
      topic: this.topic,
      expiry: this.expiry,
      request: {
        method: HederaJsonRpcMethod.SignMessage,
        params: buildSignMessageParams(signerAccountId, messages),
      },
    }
  }
}
