import { HashConnectTypes } from "hashconnect";

export class DappPairing {
    topic: string;
    accountIds: string[];
    metadata: HashConnectTypes.AppMetadata;
    pubKey: string;

    constructor(topic: string, accountIds: string[], metadata: HashConnectTypes.AppMetadata, pubKey: string){
        this.topic = topic;
        this.accountIds = accountIds;
        this.metadata = metadata;
        this.pubKey = pubKey;
    }
}
