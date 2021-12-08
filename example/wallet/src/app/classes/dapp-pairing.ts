import { HashConnectTypes } from "hashconnect";

export class DappPairing {
    topic: string;
    accountIds: string[];
    metadata: HashConnectTypes.AppMetadata;
    encKey: Uint8Array;

    constructor(topic: string, accountIds: string[], metadata: HashConnectTypes.AppMetadata, encKey: Uint8Array){
        this.topic = topic;
        this.accountIds = accountIds;
        this.metadata = metadata;
        this.encKey = encKey;
    }
}
