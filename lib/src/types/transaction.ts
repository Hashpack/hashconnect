export class Transaction {
    type: TransactionType;
    transaction: string; //should be some weird encoded string? or is there a better tpe
    metadata: TransactionMetadata;

    constructor(type: TransactionType, transaction: string, metadata: TransactionMetadata) {
        this.type = type;
        this.transaction = transaction;
        this.metadata = metadata;
    }
}

export enum TransactionType {
    NFT="NFT",
    Token="Token",
    Transaction="Transaction"
}

export class TransactionMetadata {

}