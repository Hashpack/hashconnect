import {
  AccountId,
  Client,
  LedgerId,
  Signer,
  SignerSignature,
  Transaction,
} from "@hashgraph/sdk";
import { PrivateKeyResolver } from "./private-key-resolver";
import { HashConnectWalletSignerInterceptor } from "./hashconnect-wallet-signer-interceptor";
import { HashConnectTypes } from "../types";

export class HashconnectWalletSignerFactory {
  private static readonly _dummyMainnetClient = Client.forMainnet();
  private static readonly _dummyTestnetClient = Client.forTestnet();
  private static readonly _dummyPreviewClient = Client.forPreviewnet();

  static async createSigner(
    dappMetadata: HashConnectTypes.AppMetadata,
    ledgerId: LedgerId,
    accountId: AccountId,
    signerInterceptor: HashConnectWalletSignerInterceptor,
    pkResolver: PrivateKeyResolver,
    debug = false
  ): Promise<Signer> {
    const pk = await pkResolver(ledgerId, accountId);
    if (!pk) {
      throw new Error("No private key found for account");
    }

    const signer: Signer = {
      getLedgerId: () => ledgerId,
      getAccountId: () => accountId,
      getNetwork: () => {
        if (ledgerId === LedgerId.PREVIEWNET) {
          return HashconnectWalletSignerFactory._dummyPreviewClient.network;
        } else if (ledgerId === LedgerId.TESTNET) {
          return HashconnectWalletSignerFactory._dummyTestnetClient.network;
        } else if (ledgerId === LedgerId.MAINNET) {
          return HashconnectWalletSignerFactory._dummyMainnetClient.network;
        } else {
          throw new Error("Unknown ledger id");
        }
      },
      getMirrorNetwork: () => {
        if (ledgerId === LedgerId.PREVIEWNET) {
          return HashconnectWalletSignerFactory._dummyPreviewClient
            .mirrorNetwork;
        } else if (ledgerId === LedgerId.TESTNET) {
          return HashconnectWalletSignerFactory._dummyTestnetClient
            .mirrorNetwork;
        } else if (ledgerId === LedgerId.MAINNET) {
          return HashconnectWalletSignerFactory._dummyMainnetClient
            .mirrorNetwork;
        } else {
          throw new Error("Unknown ledger id");
        }
      },
      sign: async (messages: Uint8Array[]) => {
        if (debug) {
          console.log("hashconnect - Signer.sign executing", messages);
        }

        const accountIdStr = accountId.toString();
        const shouldSign = await signerInterceptor({
          accountToSign: accountIdStr,
          payload: messages,
          topic: "",
          metadata: {
            accountToSign: accountIdStr,
            returnTransaction: true,
          },
        });

        if (!shouldSign) {
          throw new Error("Signing request rejected by user");
        }

        const response = messages.map(
          (message) =>
            new SignerSignature({
              publicKey: pk.publicKey,
              signature: pk.sign(message),
              accountId: accountId,
            })
        );
        if (debug) {
          console.log("hashconnect - Signer.sign response", response);
        }
        return response;
      },
      getAccountBalance: () => {
        throw new Error("Method not implemented.");
      },
      getAccountInfo: () => {
        throw new Error("Method not implemented.");
      },
      getAccountRecords: () => {
        throw new Error("Method not implemented.");
      },
      signTransaction: async <T extends Transaction>(request: T) => {
        if (debug) {
          console.log(
            "hashconnect - Signer.signTransaction executing",
            request
          );
        }

        const shouldSign = await signerInterceptor({
          byteArray: request.toBytes(),
          topic: "",
          metadata: {
            accountToSign: accountId.toString(),
            returnTransaction: true,
          },
        });

        if (!shouldSign) {
          throw new Error("Signing request rejected by user");
        }

        const response = (await request.sign(pk)) as T;
        if (debug) {
          console.log(
            "hashconnect - Signer.signTransaction response",
            response
          );
        }
        return response;
      },
      checkTransaction: () => {
        throw new Error("Method not implemented.");
      },
      populateTransaction: () => {
        throw new Error("Method not implemented.");
      },
      call: async (request) => {
        if (debug) {
          console.log("hashconnect - Signer.call executing", request);
        }

        const shouldSign = await signerInterceptor({
          byteArray: request.toBytes(),
          topic: "",
          metadata: {
            accountToSign: accountId.toString(),
            returnTransaction: true,
          },
        });

        if (!shouldSign) {
          throw new Error("Signing request rejected by user");
        }

        const client = Client.forName(ledgerId.toString().toLowerCase());
        client.setOperator(accountId.toString(), pk.toStringRaw());
        const response = await request.execute(client);
        if (debug) {
          console.log("hashconnect - Signer.call response", response);
        }
        return response;
      },
    };
    return signer;
  }
}
