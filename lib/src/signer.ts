import {
  LedgerId,
  AccountId,
  SignerSignature,
  AccountBalance,
  AccountInfo,
  TransactionRecord,
  Executable,
  Query,
  TransactionResponse,
  TransactionId,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  Client,
} from "@hashgraph/sdk";
import { Signer, Transaction } from "@hashgraph/sdk/lib/Signer";
import SignClient from "@walletconnect/sign-client";

export class HashConnectSigner implements Signer {
  private readonly _client: Client;

  constructor(
    public readonly accountId: string,
    public readonly ledgerId: LedgerId,
    private readonly _signClient: SignClient
  ) {
    this._client = Client.forName(ledgerId.toString());
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

  sign(messages: Uint8Array[]): Promise<SignerSignature[]> {
    throw new Error("Sign messages not implemented in HashConnect");

    console.log(messages);
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
    return transaction.freezeWith(this._client);
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
    const session = this._signClient.session.getAll()[0];
    if (!session) {
      throw new Error("Signer could not find session on sign client");
    }

    if (!session.namespaces.hedera) {
      throw new Error(
        "Signer could not find the hedera namespace in the sign client's session"
      );
    }

    if (
      !session.namespaces.hedera.chains ||
      session.namespaces.hedera.chains.length <= 0
    ) {
      throw new Error(
        "Signer could not find the chain in the sign client's session's hedera namespace"
      );
    }

    const transactionBytes = request.toBytes();
    const transactionBytesBase64Encoded =
      Buffer.from(transactionBytes).toString("base64");

    const response = await this._signClient.request({
      chainId: session.namespaces.hedera.chains[0],
      topic: session.topic,
      request: {
        method: "hedera_signAndExecuteTransaction",
        params: {
          transaction: {
            bytes: transactionBytesBase64Encoded,
          },
        },
      },
    });

    console.log({
      responseFromSendingSignClientRequest: response,
    });

    return response as any;
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
