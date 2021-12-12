import { HashConnectTypes } from ".";

export interface PairingData {
    metadata: HashConnectTypes.AppMetadata;
    topic: string;
    network: string;
}