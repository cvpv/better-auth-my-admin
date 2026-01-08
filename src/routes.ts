import { createAuthEndpoint } from "better-auth/api";
import { APIError } from "better-auth/api";
import { z } from "zod";
import type { CustomAdminOptions } from "./types";
import { MY_ADMIN_ERROR_CODES } from "./error-codes";

export const setUserPassword = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/set-user-password",
        {
            method: "POST",
            body: z.object({
                userId: z.string(),
                newPassword: z.string().min(8),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "set-user-password" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            const { userId, newPassword } = ctx.body;
            const hashedPassword = await ctx.context.password.hash(newPassword);
            await ctx.context.internalAdapter.updatePassword(userId, hashedPassword);
            return ctx.json({ success: true });
        }
    );

export const banUser = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/ban-user",
        {
            method: "POST",
            body: z.object({
                userId: z.string(),
                banReason: z.string().optional(),
                banExpiresIn: z.number().optional(),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "ban-user" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            const { userId, banReason, banExpiresIn } = ctx.body;

            // Check if user bans themselves
            if (ctx.context.session && userId === ctx.context.session.user.id) {
                throw new APIError("BAD_REQUEST", { message: MY_ADMIN_ERROR_CODES.CANNOT_BAN_YOURSELF });
            }
            
            const banExpires = banExpiresIn
                ? new Date(Date.now() + banExpiresIn * 1000)
                : options.defaultBanExpiresIn
                ? new Date(Date.now() + options.defaultBanExpiresIn * 1000)
                : undefined;

            const user = await ctx.context.internalAdapter.updateUser(userId, {
                banned: true,
                banReason: banReason || options.defaultBanReason || "No reason",
                banExpires,
                updatedAt: new Date(),
            });
            
            // Revoke all sessions
            await ctx.context.internalAdapter.deleteSessions(userId);
            
            return ctx.json({ user });
        }
    );

export const unbanUser = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/unban-user",
        {
            method: "POST",
            body: z.object({
                userId: z.string(),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "unban-user" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            const { userId } = ctx.body;
            const user = await ctx.context.internalAdapter.updateUser(userId, {
                banned: false,
                banExpires: null,
                banReason: null,
                updatedAt: new Date(),
            });
            return ctx.json({ user });
        }
    );

export const listUserSessions = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/list-user-sessions",
        {
            method: "POST",
            body: z.object({
                userId: z.string(),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "list-user-sessions" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            const sessions = await ctx.context.internalAdapter.listSessions(ctx.body.userId);
            return ctx.json({ sessions });
        }
    );

export const revokeUserSession = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/revoke-user-session",
        {
            method: "POST",
            body: z.object({
                sessionToken: z.string(),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "revoke-user-session" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            await ctx.context.internalAdapter.deleteSession(ctx.body.sessionToken);
            return ctx.json({ success: true });
        }
    );

export const revokeUserSessions = (options: CustomAdminOptions) => 
    createAuthEndpoint(
        "/my-admin/revoke-user-sessions",
        {
            method: "POST",
            body: z.object({
                userId: z.string(),
            }),
        },
        async (ctx) => {
            const allowed = await options.checkPermission({ action: "revoke-user-sessions" }, ctx);
            if (!allowed) {
                throw new APIError("FORBIDDEN", { message: MY_ADMIN_ERROR_CODES.FORBIDDEN_ACTION });
            }
            await ctx.context.internalAdapter.deleteSessions(ctx.body.userId);
            return ctx.json({ success: true });
        }
    );

