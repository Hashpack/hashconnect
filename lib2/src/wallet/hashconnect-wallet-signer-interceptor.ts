import { Signer } from "@hashgraph/sdk";
import { MessageTypes } from "../types";

/**
 * The interceptor is used to intercept the signing process of the HashConnect signer to give the wallet a chance to approve or reject the signing request.
 * The interceptor is called before the signing process starts.
 * The interceptor can return a Promise that resolves to a boolean value.
 * If the Promise resolves to true, the signing process will continue.
 * If the Promise resolves to false, the signing process will be aborted.
 * If the Promise rejects, the signing process will be aborted.
 * @param signingRequest The signing request that is about to be signed.
 * @returns A Promise that resolves to a boolean value.
 * @category Wallet
 */
export type HashConnectWalletSignerInterceptor = (
  signingRequest:
    | MessageTypes.Transaction
    | MessageTypes.SigningRequest
    | MessageTypes.AuthenticationRequest
) => Promise<boolean>;
