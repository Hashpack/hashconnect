import { LedgerId, AccountId, SignerSignature, AccountBalance, AccountInfo, TransactionRecord, Transaction, Executable } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnect } from "../main";
import { HashConnectProvider } from "./provider";

export class HashConnectSigner implements Signer {

    private hashconnect: HashConnect;
    private provider: HashConnectProvider;

    constructor(hashconnect: HashConnect, provider: HashConnectProvider) {
        this.hashconnect = hashconnect;
        this.provider = provider;
    }

    getLedgerId: () => LedgerId | null;
    getAccountId: () => AccountId;
    getNetwork: () => { [key: string]: string | AccountId; };
    getMirrorNetwork: () => string[];
    sign: (messages: Uint8Array[]) => Promise<SignerSignature[]>;
    getAccountBalance: () => Promise<AccountBalance>;
    getAccountInfo: () => Promise<AccountInfo>;
    getAccountRecords: () => Promise<TransactionRecord[]>;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    checkTransaction: (transaction: Transaction) => Promise<Transaction>;
    populateTransaction: (transaction: Transaction) => Promise<Transaction>;

    sendRequest<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        return this.provider.sendRequest(request);
    }

}