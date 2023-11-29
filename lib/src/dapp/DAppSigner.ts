// @ts-nocheck
import { Buffer } from 'buffer'
import {
  Signer,
  AccountBalance,
  AccountId,
  AccountInfo,
  Executable,
  Key,
  LedgerId,
  SignerSignature,
  Transaction,
  TransactionRecord,
} from '@hashgraph/sdk'
import { ISignClient } from '@walletconnect/types'

import {
  HederaJsonRpcMethod,
  base64StringToTransaction,
  ledgerIdToCAIPChainId,
} from '../shared'

import { buildSignAndReturnTransactionParams, buildSignMessageParams } from './helpers'

export class DAppSigner implements Signer {
  constructor(
    private readonly accountId: AccountId,
    private readonly client: ISignClient,
    public readonly topic: string,
    private readonly ledgerId: LedgerId = LedgerId.MAINNET,
  ) {}

  request<T>(request: { method: string; params: any }): Promise<T> {
    return this.client.request<T>({
      topic: this.topic,
      request,
      chainId: ledgerIdToCAIPChainId(this.ledgerId),
    })
  }

  getAccountId(): AccountId {
    return this.accountId
  }

  getAccountKey(): Key {
    throw new Error('Method not implemented.')
  }

  getLedgerId(): LedgerId {
    return this.ledgerId
  }

  getNetwork(): { [key: string]: string | AccountId } {
    throw new Error('Method not implemented.')
  }

  getMirrorNetwork(): string[] {
    throw new Error('Method not implemented.')
  }

  getAccountBalance(): Promise<AccountBalance> {
    throw new Error('Method not implemented.')
  }

  getAccountInfo(): Promise<AccountInfo> {
    throw new Error('Method not implemented.')
  }

  getAccountRecords(): Promise<TransactionRecord[]> {
    throw new Error('Method not implemented.')
  }

  async sign(
    data: Uint8Array[],
    signOptions?: Record<string, any>,
  ): Promise<SignerSignature[]> {
    throw new Error('Method not implemented.')
  }

  async signMessages(messages: (Uint8Array | string)[]): Promise<Uint8Array[]> {
    const signedMessages = await this.request<string[]>({
      method: HederaJsonRpcMethod.SignMessage,
      params: buildSignMessageParams(this.accountId.toString(), messages),
    })

    return signedMessages.map((signedMessage) => Buffer.from(signedMessage, 'base64'))
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    const signedStringTransaction = await this.request<string>({
      method: HederaJsonRpcMethod.SignTransactionBody,
      params: buildSignAndReturnTransactionParams(this.accountId.toString(), transaction),
    })

    return base64StringToTransaction(signedStringTransaction) as T
  }

  async checkTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error('Method not implemented.')
  }

  async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error('Method not implemented.')
  }

  async call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>,
  ): Promise<OutputT> {
    throw new Error('Method not implemented.')
  }
}
