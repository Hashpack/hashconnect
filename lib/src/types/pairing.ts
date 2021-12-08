import { HashConnectTypes } from ".";

// export declare namespace Pairing {
    
//     export interface Approval {
//         topic: string;
//     }

//     export interface Rejected {
//         topic: string;
//         reason: string;
//     }

//     export interface Acknowledgement {
//         result: boolean;
//     }
// }

export interface PairingData {
    metadata: HashConnectTypes.AppMetadata;
    topic: string;
    encKey: Uint8Array | string;
}