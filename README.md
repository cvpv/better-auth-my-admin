# Better Auth My Admin

A flexible, unopinionated Admin & RBAC plugin for [Better Auth](https://github.com/better-auth/better-auth).

Unlike the official admin plugin which enforces a strict role-based structure, `better-auth-my-admin` gives you **complete control inversion**. You define the permission logic via a simple callback, allowing you to implement any authorization strategy (RBAC, ABAC, etc.) with ease.

## Features

- 🛠 **Complete Control Inversion** - You define `checkPermission` logic.
- ⚡️ **Zero Assumption** - Doesn't enforce specific roles or database schemas for permissions.
- 🌍 **Localization Support** - Compatible with `better-auth-localization` for internationalization.
- 🔒 **Secure Defaults** - Handles user banning, session revocation, and password management securely.
- 📦 **Type Safe** - Fully typed with TypeScript.

## Installation

```bash
npm install better-auth-my-admin
# or
pnpm add better-auth-my-admin
# or
yarn add better-auth-my-admin
```

## Setup

### 1. Add the plugin to your auth config

```typescript
// auth.ts
import { betterAuth } from "better-auth";
import { myAdminPlugin } from "better-auth-my-admin";

export const auth = betterAuth({
  // ... other config
  plugins: [
    myAdminPlugin({
      // Define your permission logic here
      checkPermission: async ({ action }, ctx) => {
        const session = ctx.session;
        if (!session) return false;

        // Example: Only allow 'admin' role
        if (session.user.role === 'admin') return true;
        
        // Example: Allow specific action
        if (action === "ban-user" && session.user.isSuperAdmin) return true;

        // Return false to deny (triggers 403)
        // Or throw custom error: throw new APIError("FORBIDDEN", { message: "..." })
        return false;
      }
    })
  ]
});
```

### 2. Update Database Schema

This plugin adds `banned`, `banReason`, and `banExpires` fields to the User model.

**Prisma:**

Add fields to your `schema.prisma`:

```prisma
model User {
  // ... existing fields
  banned            Boolean?
  banReason         String?
  banExpires        DateTime?
}
```

Then run migration:
```bash
npx prisma migrate dev --name add_admin_fields
```

**Drizzle / Others:**
(Run `better-auth migrate` or equivalent to update schema)

## Usage on Client

```typescript
import { createAuthClient } from "better-auth/react";
import { myAdminClient } from "better-auth-my-admin";

const authClient = createAuthClient({
  plugins: [myAdminClient()]
});

// Example: Ban a user
await authClient.myAdmin.banUser({
  userId: "target-user-id",
  banReason: "Violation of terms"
});

// Example: Set user password
await authClient.myAdmin.setUserPassword({
  userId: "target-user-id",
  newPassword: "new-secure-password"
});
```

## API Reference

### Set User Password

Changes the password of a user.

**Path:** `/my-admin/set-user-password`

```typescript
const { data, error } = await authClient.myAdmin.setUserPassword({
    userId: 'user-id', // required
    newPassword: 'new-password', // required
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `userId` | The user id which you want to set the password for. | `string` |
| `newPassword` | The new password. | `string` |

### Ban User

Bans a user, preventing them from signing in and revokes all of their existing sessions.

**Path:** `/my-admin/ban-user`

```typescript
const { data, error } = await authClient.myAdmin.banUser({
    userId: 'user-id', // required
    banReason: 'Spamming', // optional
    banExpiresIn: 60 * 60 * 24 * 7 // optional (seconds)
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `userId` | The user id which you want to ban. | `string` |
| `banReason` | The reason for the ban. | `string` |
| `banExpiresIn` | The number of seconds until the ban expires. If not provided, the ban will never expire. | `number` |

### Unban User

Removes the ban from a user, allowing them to sign in again.

**Path:** `/my-admin/unban-user`

```typescript
const { data, error } = await authClient.myAdmin.unbanUser({
    userId: 'user-id', // required
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `userId` | The user id which you want to unban. | `string` |

### List User Sessions

Lists all active sessions for a specific user.

**Path:** `/my-admin/list-user-sessions`

```typescript
const { data, error } = await authClient.myAdmin.listUserSessions({
    userId: 'user-id', // required
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `userId` | The user id to list sessions for. | `string` |

### Revoke User Session

Revokes a specific session for a user.

**Path:** `/my-admin/revoke-user-session`

```typescript
const { data, error } = await authClient.myAdmin.revokeUserSession({
    sessionToken: 'session-token', // required
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `sessionToken` | The session token which you want to revoke. | `string` |

### Revoke User Sessions

Revokes all sessions for a user.

**Path:** `/my-admin/revoke-user-sessions`

```typescript
const { data, error } = await authClient.myAdmin.revokeUserSessions({
    userId: 'user-id', // required
});
```

| Prop | Description | Type |
| :--- | :--- | :--- |
| `userId` | The user id which you want to revoke all sessions for. | `string` |

### Localization

To translate error messages (e.g. to Chinese), use `better-auth-localization`:

```typescript
localization({
  translations: {
    "zh-Hans": {
        "You are not allowed to perform this action": "禁止操作：您没有执行此操作的权限",
        "User not found": "用户不存在",
        "User is banned": "该用户已被封禁",
        "You cannot ban yourself": "您不能封禁自己",
        "Failed to update user": "更新用户信息失败",
        "Password is too short": "密码太短",
        "Password is too long": "密码太长"
    }
  }
})
```

## License

MIT
