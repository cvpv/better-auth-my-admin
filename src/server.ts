import { BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { schema } from "./schema";
import { MY_ADMIN_ERROR_CODES } from "./error-codes";
import type { CustomAdminOptions } from "./types";
import {
    setUserPassword,
    banUser,
    unbanUser,
    listUserSessions,
    revokeUserSession,
    revokeUserSessions
} from "./routes";

export const myAdminPlugin = (options: CustomAdminOptions) => {
    return {
        id: "my-admin",
        schema: schema,
        init(ctx) {
            return {
                options: {
                    databaseHooks: {
                        session: {
                            create: {
                                async before(session) {
                                    const user = await ctx.internalAdapter.findUserById(session.userId) as any;
                                    if (user?.banned) {
                                        if (user.banExpires && new Date(user.banExpires).getTime() < Date.now()) {
                                            await ctx.internalAdapter.updateUser(session.userId, {
                                                banned: false,
                                                banReason: null,
                                                banExpires: null,
                                            });
                                            return;
                                        }
                                        throw new APIError("FORBIDDEN", {
                                            message: MY_ADMIN_ERROR_CODES.USER_IS_BANNED,
                                        });
                                    }
                                },
                            },
                        },
                    },
                },
            };
        },
        endpoints: {
            setUserPassword: setUserPassword(options),
            banUser: banUser(options),
            unbanUser: unbanUser(options),
            listUserSessions: listUserSessions(options),
            revokeUserSession: revokeUserSession(options),
            revokeUserSessions: revokeUserSessions(options),
        },
    } satisfies BetterAuthPlugin;
};
