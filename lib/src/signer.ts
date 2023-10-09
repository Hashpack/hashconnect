import {
  LedgerId,
  AccountId,
  SignerSignature,
  Executable,
  Query,
  TransactionResponse,
  TransactionId,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
  Transaction,
  PublicKey,
} from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import {
  HederaSessionRequest,
  HederaSignAndExecuteTransactionResponse,
  HederaSignAndReturnTransactionResponse,
  HederaSignMessageResponse,
  base64StringToTransaction,
} from "@hgraph.io/hedera-walletconnect-utils";
import SignClient from "@walletconnect/sign-client";
import { AuthenticationHelper, SignClientHelper } from "./utils";

export class HashConnectSigner implements Signer {
  private readonly _client: Client;

  constructor(
    public readonly accountId: string,
    public readonly ledgerId: LedgerId,
    private readonly _signClient: SignClient
  ) {
    this._client = Client.forName(ledgerId.toString());
  }

  private _getSession() {
    return SignClientHelper.getSessionForAccount(
      this._signClient,
      this.ledgerId,
      this.accountId
    );
  }

  getLedgerId(): LedgerId | null {
    return this.ledgerId;
  }

  getAccountId(): AccountId {
    return AccountId.fromString(this.accountId);
  }

  getNetwork() {
    const network: { [key: string]: string } = {};
    network[this.accountId.toString()] = this.ledgerId.toString();
    return network;
  }

  getMirrorNetwork() {
    throw new Error("Get Mirror Network not implemented in HashConnect");

    return [];
  }

  async sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    const session = this._getSession();

    const payload = HederaSessionRequest.create({
      chainId: session.namespaces.hedera.chains[0],
      topic: session.topic,
    }).buildSignMessageRequest(this.accountId, messages);
    const response: HederaSignMessageResponse = await this._signClient.request(
      payload
    );

    const publicKey = await AuthenticationHelper.getPublicKey(
      this.ledgerId,
      this.accountId
    );
    return response.signatures.map((signature) => {
      return new SignerSignature({
        publicKey,
        signature: Buffer.from(signature, "base64"),
        accountId: this.getAccountId(),
      });
    });
  }

  getAccountBalance() {
    return new AccountBalanceQuery()
      .setAccountId(this.accountId)
      .execute(this._client);
  }

  getAccountInfo() {
    return new AccountInfoQuery()
      .setAccountId(this.accountId)
      .execute(this._client);
  }

  getAccountRecords() {
    return new AccountRecordsQuery()
      .setAccountId(this.accountId)
      .execute(this._client);
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    const session = this._getSession();

    const payload = HederaSessionRequest.create({
      chainId: session.namespaces.hedera.chains[0],
      topic: session.topic,
    }).buildSignAndReturnTransactionRequest(
      this.accountId,
      Transaction.fromBytes(transaction.toBytes())
    );
    const response: HederaSignAndReturnTransactionResponse =
      await this._signClient.request(payload);

    return base64StringToTransaction<T>(response.transaction.bytes);
  }

  checkTransaction<T extends Transaction>(transaction: T): Promise<T> {
    throw new Error("Check transaction not implemented in HashConnect");

    console.log(transaction);
  }

  async populateTransaction<T extends Transaction>(transaction: T): Promise<T> {
    // await this.checkTransaction(transaction);

    transaction.setTransactionId(TransactionId.generate(this.accountId));
    transaction.freezeWith(this._client);
    // transaction.setNodeAccountIds([]);

    return transaction;
  }

  async call<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Promise<OutputT> {
    const session = this._getSession();

    if (
      !session.namespaces.hedera.chains ||
      session.namespaces.hedera.chains.length <= 0
    ) {
      throw new Error(
        "Signer could not find the chain in the sign client's session's hedera namespace"
      );
    }

    const payload = HederaSessionRequest.create({
      chainId: session.namespaces.hedera.chains[0],
      topic: session.topic,
    }).buildSignAndExecuteTransactionRequest(
      this.accountId,
      Transaction.fromBytes(request.toBytes())
    );
    const response: HederaSignAndExecuteTransactionResponse =
      await this._signClient.request(payload);

    return TransactionResponse.fromJSON(response.response) as OutputT;
  }

  private getBytesOf<RequestT, ResponseT, OutputT>(
    request: Executable<RequestT, ResponseT, OutputT>
  ): Uint8Array {
    let transaction = request as unknown as Transaction;
    let query;

    if (!transaction) query = request as unknown as Query<any>;

    if (!transaction && !query)
      throw new Error(
        "Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet."
      );

    if (transaction) return (request as unknown as Transaction).toBytes();
    else return (request as unknown as Query<any>).toBytes();
  }
}
