export interface CustomAdminOptions {
    /**
     * Permission check function.
     * Return true to allow, false to deny.
     * You can also throw an error to return a custom error response.
     */
    checkPermission: (
        data: {
            action: "set-user-password" | "ban-user" | "unban-user" | "list-user-sessions" | "revoke-user-session" | "revoke-user-sessions";
        },
        ctx: any
    ) => Promise<boolean>;
    
    /**
     * Default reason for banning a user
     */
    defaultBanReason?: string;
    
    /**
     * Default expiration time for a ban in seconds
     */
    defaultBanExpiresIn?: number;
}

