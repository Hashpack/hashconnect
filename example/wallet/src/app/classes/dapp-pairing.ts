import { HashConnectTypes } from "hashconnect";

export class DappPairing {
    topic: string;
    accountIds: string[];
    metadata: HashConnectTypes.AppMetadata;

    constructor(topic: string, accountIds: string[], metadata: HashConnectTypes.AppMetadata){
        this.topic = topic;
        this.accountIds = accountIds;
        this.metadata = metadata;
    }
}
