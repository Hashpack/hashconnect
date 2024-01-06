import { UserProfile } from "./types";

export class UserProfileHelper {
    static cache: UserProfile[] = [];

    /**
     * Get a user profile from the HashConnect API
     * @param accountId
     * @param network (optional)
     * @returns
     * @example
     * ```ts
     * const userProfile = await hashconnect.getUserProfile("0.0.12345");
     * ```
     * @category User Profiles
     */
    static async getUserProfile(accountId: string, network: "mainnet" | "testnet" = "mainnet"): Promise<UserProfile> {
        const cachedProfile = this.cache.find(profile => profile.accountId === accountId && profile.network === network);
    
        if (cachedProfile) {
            return cachedProfile;
        }
    
        try {
            const response = await fetch("https://api.hashpack.app/user-profile/get", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accountId: accountId.toString(), network: network }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to get user profile");
            }
    
            const userProfile: UserProfile = await response.json();
    
            this.cache.push(userProfile);
    
            return userProfile;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    /**
     * Get multiple user profiles from the HashConnect API
     * @param accountIds []
     * @param network (optional)
     * @returns
     * @example
     * ```ts
     * const userProfiles = await hashconnect.getMultipleUserProfiles(["0.0.12345", "0.0.12346"]);
     * ```
     * @category User Profiles
     */
    static async getMultipleUserProfiles(accountIds: string[], network: "mainnet" | "testnet" = "mainnet"): Promise<UserProfile[]> {
        const cachedProfiles: UserProfile[] = [];
        const idsToFetch: string[] = [];
    
        for (const id of accountIds) {
            const cachedProfile = this.cache.find(profile => profile.accountId === id && profile.network === network);
            if (cachedProfile) {
                cachedProfiles.push(cachedProfile);
            } else {
                idsToFetch.push(id);
            }
        }
    
        if (idsToFetch.length === 0) {
            return cachedProfiles;
        }
    
        try {
            const response = await fetch("https://api.hashpack.app/user-profile/get-multiple", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accountIds: idsToFetch, network: network }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to get user profiles");
            }
    
            const fetchedProfiles: UserProfile[] = await response.json();
    
            this.cache.push(...fetchedProfiles);
    
            return [...cachedProfiles, ...fetchedProfiles];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}