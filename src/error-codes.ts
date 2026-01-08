export const MY_ADMIN_ERROR_CODES = {
    FORBIDDEN_ACTION: "You are not allowed to perform this action",
    USER_NOT_FOUND: "User not found",
    USER_IS_BANNED: "User is banned",
    CANNOT_BAN_YOURSELF: "You cannot ban yourself",
    FAILED_TO_UPDATE_USER: "Failed to update user",
    PASSWORD_TOO_SHORT: "Password is too short",
    PASSWORD_TOO_LONG: "Password is too long",
} as const;

