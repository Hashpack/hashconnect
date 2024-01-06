import { Event } from "ts-typed-events";
import {
    AccountId,
    LedgerId,
    SignerSignature,
    Transaction,
    TransactionId,
    TransactionResponse,
} from "@hashgraph/sdk";
import {
    HashConnectConnectionState,
    SessionData,
    UserProfile,
} from "./types";
import Core from "@walletconnect/core";
import SignClient from "@walletconnect/sign-client";
import {
    ISignClient,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

import AuthClient from "@walletconnect/auth-client";
import { HashConnectSigner } from "./signer";
import { AuthenticationHelper, SignClientHelper } from "./utils";
import { HederaJsonRpcMethod, HederaChainId, networkNamespaces } from "@hashgraph/walletconnect";
import { WalletConnectModal } from '@walletconnect/modal';

import { UserProfileHelper } from "./profiles";

global.Buffer = global.Buffer || require("buffer").Buffer;

/**
 * Main interface with hashpack
 */
export class HashConnect {
    readonly connectionStatusChangeEvent =
        new Event<HashConnectConnectionState>();
    readonly pairingEvent = new Event<SessionData>();
    readonly disconnectionEvent = new Event<void>();

    private readonly approveEvent = new Event<void>();

    private core?: Core;
    private _signClient?: ISignClient;
    private _authClient?: AuthClient;

    private _pairingString?: string;

    getUserProfile = UserProfileHelper.getUserProfile;
    getMultipleUserProfiles = UserProfileHelper.getMultipleUserProfiles;

    get pairingString() {
        return this._pairingString;
    }

    get connectedAccountIds(): AccountId[] {
        const accountIds: AccountId[] = [];

        if (!this._signClient) {
            return accountIds;
        }

        const sessions = this._signClient.session.getAll();
        for (let i = 0; i < sessions.length; i++) {
            const session = sessions[i];
            if (session.namespaces.hedera?.accounts?.length > 0) {
                for (let j = 0; j < session.namespaces.hedera.accounts.length; j++) {
                    const accountStr = session.namespaces.hedera.accounts[j];
                    const accountStrParts = accountStr.split(":");
                    accountIds.push(
                        AccountId.fromString(accountStrParts[accountStrParts.length - 1])
                    );
                }
            }
        }

        return accountIds;
    }

    async init(): Promise<void> {
        this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Disconnected);
        if (this._debug) console.log("hashconnect - Initializing");

        if (typeof window !== "undefined") {
            this.metadata.url = window.location.origin;
        } else if (!this.metadata.url) {
            throw new Error("metadata.url must be defined if not running hashconnect within a browser");
        }

        if (!this.core || !this._signClient || !this._authClient) {
            this.core = new Core({
                projectId: this.projectId,
            });

            if (!this._signClient)
                this._signClient = await SignClient.init({
                    core: this.core,
                    metadata: this.metadata,
                });
            if (!this._authClient)
                this._authClient = await AuthClient.init({
                    metadata: this.metadata,
                    core: this.core,
                    projectId: this.projectId,
                });

            // add delay for race condition in SignClient.init that causes .connect to never resolve
            // await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
        }

        this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);

        if (this._debug) console.log("hashconnect - Initialized");
        if (this._debug) console.log("hashconnect - connecting");

        await this.generatePairingString();

        let existing_sessions = this._signClient.session.getAll();

        if (existing_sessions.length > 0) {

            if (this._debug) console.log("hashconnect - Existing sessions found", existing_sessions);

            for (let i = 0; i < existing_sessions.length; i++) {
                const session = existing_sessions[i];

                this.pairingEvent.emit({
                    metadata: session.peer.metadata,
                    accountIds: this.connectedAccountIds.map((a) => a.toString()),
                    network: this.ledgerId.toString(),
                });
            }

            this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Paired);
        } else {
            this.findLocalWallets();
        }

        this._signClient.events.addListener('session_delete', event => {
            if (this._debug) console.log("hashconnect - Session deleted", event);

            this.disconnectionEvent.emit(event);

            let existing_sessions = this._signClient!.session.getAll();

            if (existing_sessions.length === 0)
                this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);
        });
    }

    private _setupEvents() {
        window.addEventListener(
            "message",
            (event) => {
                //if found iframe parent, connect to it
                if (event.data.type && event.data.type == "hashconnect-iframe-response") {
                    if (this._debug) console.log("hashconnect - iFrame wallet metadata recieved", event.data);
                    if (event.data.metadata) this._connectToIframeParent();
                } else if (event.data.type && event.data.type == "hashconnect-query-extension-response") { //if found extension, connect to it
                    if (this._debug) console.log("hashconnect - Local wallet metadata recieved", event.data);
                    if (event.data.metadata) this.connectToExtension();
                }
            },
            false
        );
    }

    constructor(
        readonly ledgerId: LedgerId,
        private readonly projectId: string,
        private readonly metadata: SignClientTypes.Metadata,
        private readonly _debug: boolean = false
    ) {
        this._setupEvents();
    }

    getSigner(accountId: AccountId): HashConnectSigner {
        if (!this._signClient) throw new Error("No sign client");

        const session = SignClientHelper.getSessionForAccount(
            this._signClient,
            this.ledgerId,
            accountId.toString()
        );

        if (!session) throw new Error("No session found for account");

        return new HashConnectSigner(
            accountId,
            this._signClient,
            session.topic,
            this.ledgerId
        );
    }

    

    async disconnect() {
        if (!this._signClient) return;

        await Promise.all(
            this._signClient.session.getAll().map(async (session) => {
                await this._signClient?.disconnect({
                    topic: session.topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                });
            })
        );

        this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);

        await this.generatePairingString();

        setTimeout(async () => {
            await this._connectToIframeParent();
        }, 5000)
    }

    /**
     * Send a transaction to hashpack for signing and execution
     * @param accountId
     * @param transaction
     * @returns
     * @example
     * ```ts
     * const transactionResponse = await hashconnect.sendTransaction(
     *  accountId,
     *  transaction
     * );
     * ```
     * @category Transactions
     */
    async sendTransaction(
        accountId: AccountId,
        transaction: Transaction
    ): Promise<TransactionResponse> {
        const signer = this.getSigner(accountId);
 
        if(!transaction.isFrozen()) {
            let transId = TransactionId.generate(accountId)
            let temp_client = signer.getClient();
            transaction.setTransactionId(transId);
            transaction.setNodeAccountIds(Object.values(temp_client.network).map(accId => typeof(accId) === "string" ? AccountId.fromString(accId) : accId));
            transaction.freeze();
        }

        return await signer.call(transaction);
    }

    /**
     * Sign a message. This is a convenience method that calls `getSigner` and then `sign` on the signer
     * @param accountId
     * @param message
     * @returns
     * @example
     * ```ts
     * const signerSignature = await hashconnect.signMessage(
     *   accountId,
     *   ["Hello World"]
     * );
     */
    async signMessages(
        accountId: AccountId,
        message: string[]
    ): Promise<SignerSignature[]> {
        const signer = this.getSigner(accountId);
        return await signer.sign(message.map((m) => Buffer.from(m)));
    }

    /**
     * Sign a transaction. This is a convenience method that calls `getSigner` and then `signTransaction` on the signer
     * @param accountId
     * @param transaction
     * @returns
     * @example
     * ```ts
     * const transaction = new TransferTransaction()
     *  .addHbarTransfer(accountId, new Hbar(-1))
     *  .addHbarTransfer(toAccountId, new Hbar(1))
     *  .setNodeAccountIds(nodeAccoutIds)
     *  .setTransactionId(TransactionId.generate(accountId))
     *  .freeze();
     * const signedTransaction = await hashconnect.signTransaction(
     *  accountId,
     *  transaction
     * );
     * ```
     * @category Transactions
     */
    async signTransaction(
        accountId: AccountId,
        transaction: Transaction
    ): Promise<Transaction> {
        const signer = this.getSigner(accountId);
        return await signer.signTransaction(transaction);
    }

    /**
     * Verify the server signature of an authentication request and generate a signature for the account
     * @param accountId
     * @param serverSigningAccount
     * @param serverSignature
     * @param payload
     * @returns
     * @example
     * ```ts
     * const { accountSignature } = await hashconnect.authenticate(
     *   accountId,
     *   serverSigningAccountId,
     *   serverSignature,
     *   {
     *     url: "https://example.com",
     *     data: { foo: "bar" },
     *   }
     * );
     * ```
     * @category Authentication
     */
    async hashpackAuthenticate(
        accountId: AccountId,
        serverSigningAccount: AccountId,
        serverSignature: Uint8Array,
        payload: { url: string; data: any }
    ) {
        if (!this._signClient)
            throw new Error("No sign client");

        const signature = await SignClientHelper.sendAuthenticationRequest(
            this._signClient,
            this.ledgerId,
            serverSigningAccount,
            serverSignature,
            accountId.toString(),
            payload
        );

        const result = await AuthenticationHelper.verifyAuthenticationSignatures(
            this.ledgerId,
            accountId.toString(),
            signature,
            serverSigningAccount.toString(),
            serverSignature,
            payload
        );

        return {
            ...result,
            accountId: accountId.toString(),
            accountSignature: signature,
            serverSigningAccount: serverSigningAccount.toString(),
            serverSignature,
        };
    }

    /**
     * Local wallet stuff
     */

    private async findLocalWallets() {
        if (typeof window === "undefined") {
            if (this._debug) console.log("hashconnect - Cancel findLocalWallets - no window object");
            return;
        }

        if (this._debug) console.log("hashconnect - Finding local wallets");

        // wait for pairing string to be set
        if (!this._pairingString) {
            await new Promise<void>((resolve) => {
                const intervalHandle = setInterval(() => {
                    if (this._pairingString) {
                        resolve();
                        clearInterval(intervalHandle);
                    }
                }, 250);
            });
        }

        setTimeout(() => {
            window.postMessage({ type: "hashconnect-query-extension" }, "*");

            if (window.parent)
                window.parent.postMessage({ type: "hashconnect-iframe-query" }, "*");
        }, 50);
    }

    private async connectToExtension() {
        if (typeof window === "undefined") {
            if (this._debug) console.log("hashconnect - Cancel connect to local wallet - no window object");
            return;
        }

        if (!this._pairingString) {
            console.error("hashconnect - Cancel connect to local wallet - no pairing string");
            return;
        }

        if (this._debug)console.log("hashconnect - Connecting to local wallet");

        //todo: add extension metadata support
        window.postMessage(
            {
                type: "hashconnect-connect-extension",
                pairingString: this._pairingString,
            },
            "*"
        );
    }

    private async _connectToIframeParent() {
        if (typeof window === "undefined") {
            if (this._debug) console.log("hashconnect - Cancel iframe connection - no window object");
            return;
        }

        if (!this._pairingString) {
            console.error("hashconnect - Cancel connect to iframe parent wallet - no pairing string");
            return;
        }

        if (this._debug) console.log("hashconnect - Connecting to iframe parent wallet");

        window.parent.postMessage(
            {
                type: "hashconnect2-iframe-pairing",
                pairingString: this._pairingString,
            },
            "*"
        );
    }

    /**
     * Opens the WalletConnect pairing modal.
     * @param themeMode - "dark" | "light"
     * @param backgroundColor - string (hex color)
     * @param accentColor - string (hex color)
     * @param accentFillColor - string (hex color)
     * @param borderRadius - string (css border radius)
     * @example
     * ```ts
     * hashconnect.openModal();
     * ```
     */
    async openModal(themeMode: "dark" | "light" = "dark", backgroundColor: string = "#1F1D2B", accentColor: string = "#ACACD3", accentFillColor: string = "white", borderRadius: string = "0px") {
        if (this._debug) console.log(`hashconnect - Pairing string created: ${this._pairingString}`);

        if (!this._pairingString) {
            console.error("hashconnect - URI Missing");
            return;
        }
        const chains = [HederaChainId.Testnet]

        const walletConnectModal = new WalletConnectModal({
            projectId: this.projectId,
            chains,
            desktopWallets: [],
            enableExplorer: false,
            mobileWallets: [],
            themeVariables: {
                "--wcm-accent-color": accentColor,
                "--wcm-accent-fill-color": accentFillColor,
                "--wcm-background-color": backgroundColor,
                '--wcm-container-border-radius': borderRadius,
                '--wcm-background-border-radius': borderRadius,
                '--wcm-wallet-icon-border-radius': borderRadius,
                '--wcm-wallet-icon-large-border-radius': borderRadius,
                '--wcm-wallet-icon-small-border-radius': borderRadius,
                '--wcm-input-border-radius': borderRadius,
                '--wcm-notification-border-radius': borderRadius,
                '--wcm-button-border-radius': borderRadius,
                '--wcm-secondary-button-border-radius': borderRadius,
                '--wcm-icon-button-border-radius': borderRadius,
                '--wcm-button-hover-highlight-border-radius': borderRadius,
            },
            themeMode: themeMode,
        })
        walletConnectModal.openModal({ uri: this._pairingString })

        this.approveEvent.once(() => {
            walletConnectModal.closeModal()
        });
    }

    async generatePairingString(): Promise<{
        uri: string | undefined;
        approval: () => Promise<SessionTypes.Struct>;
    }> {
        const { uri, approval } = await this._signClient!.connect({
            optionalNamespaces: networkNamespaces(
                this.ledgerId,
                ["hashpack_authenticate"],
                []
            ),
            requiredNamespaces: networkNamespaces(
                this.ledgerId,
                Object.values(HederaJsonRpcMethod),
                []
            ),
        });

        this._pairingString = uri;

        const pairTimeoutMs = 480_000;
        const timeout = setTimeout(() => {
            this.approveEvent.emit();
            this.generatePairingString();
            throw new Error(`Connect timed out after ${pairTimeoutMs}(ms)`);
        }, pairTimeoutMs);
        
        approval()
            .then(async (approved) => {
                if (this._debug) console.log("hashconnect - Approval received", approved);
                
                if (approved) {
                    this.connectionStatusChangeEvent.emit(
                        HashConnectConnectionState.Paired
                    );

                    this.pairingEvent.emit({
                        metadata: approved.peer.metadata,
                        accountIds: this.connectedAccountIds.map((a) => a.toString()),
                        network: this.ledgerId.toString(),
                    });

                    this.approveEvent.emit();
                    clearTimeout(timeout);
                }
            })
            .catch((e) => {
                this.approveEvent.emit();
                clearTimeout(timeout);
                console.error("hashconnect - Approval error", e);
            });
        

        return { uri, approval };
    }

    // async getUserProfile(accountId: string, network: "mainnet" | "testnet" = "mainnet"): Promise<UserProfile> {
    //     let profile: UserProfile = await UserProfileHelper.getUserProfile(accountId, network);

    //     return profile;
    // }

    

    // async getMultipleUserProfiles(accountIds: string[], network: "mainnet" | "testnet" = "mainnet"): Promise<UserProfile[]> {
    //     let profiles: UserProfile[] = await UserProfileHelper.getMultipleUserProfiles(accountIds, network);

    //     return profiles;
    // }

    // verifyMessageSignature(
    //     message: string,
    //     base64SignatureMap: string,
    //     publicKey: PublicKey,
    //   ): boolean {
    //     const signatureMap = base64StringToSignatureMap(base64SignatureMap)
    //     const signature = signatureMap.sigPair[0].ed25519 || signatureMap.sigPair[0].ECDSASecp256k1
      
    //     if (!signature) throw new Error('Signature not found in signature map')
      
    //     return publicKey.verify(Buffer.from(prefixMessageToSign(message)), signature)
    //   }
}
