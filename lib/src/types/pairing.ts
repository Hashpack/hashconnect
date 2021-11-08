export declare namespace Pairing {
    
    export interface Approval {
        topic: string;
    }

    export interface Rejected {
        topic: string;
        reason: string;
    }

    export interface Acknowledgement {
        result: boolean;
    }
}
