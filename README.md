<div align="center">

# Better Auth My Admin

<a href="https://www.npmjs.com/package/better-auth-my-admin"><img alt="NPM Version" src="https://img.shields.io/npm/v/better-auth-my-admin?style=flat-square&logo=npm"></a>
<a href="https://github.com/cvpv/better-auth-my-admin/blob/main/LICENSE.md"><img alt="License" src="https://img.shields.io/npm/l/better-auth-my-admin?style=flat-square"></a>

<p>
  <strong>A flexible, unopinionated Admin & RBAC plugin for <a href="https://better-auth.com">Better Auth</a>.</strong>
</p>
<p>
  Unlock the full potential of your admin system with absolute freedom.
  <br />
  Break free from rigid role structures and define your own rules.
</p>

</div>

> [!CAUTION]
> **Total Control, Total Responsibility**
> 
> This plugin implements **Control Inversion** for permissions. Unlike the official admin plugin, it makes **ZERO assumptions** about your role system.
> 
> You simply provide a `checkPermission` callback, and the plugin delegates all authorization decisions to it.
> **You are solely responsible for ensuring your permission logic is secure and handles all edge cases.**

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
        return false;
      }
    })
  ]
});
```

### 2. Update Database Schema

Run the migration or generate the schema to add the necessary fields and tables to the database.

```bash
npx @better-auth/cli migrate
```

or

```bash
npx @better-auth/cli generate
```

This plugin adds the following fields to the `user` table:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `banned` | `Boolean` | Indicates whether the user is banned. |
| `banReason` | `String` | The reason for the user's ban. |
| `banExpires` | `DateTime` | The date when the user's ban will expire. |

### 3. Add the client plugin

```typescript
import { createAuthClient } from "better-auth/react";
import { myAdminClient } from "better-auth-my-admin";

const authClient = createAuthClient({
  plugins: [myAdminClient()]
});
```

## Usage

### Client Side

You can use the `myAdmin` property on the auth client to perform admin actions. The client is fully typed.

```typescript
await authClient.myAdmin.banUser({
    userId: "target-user-id",
    banReason: "Violation of terms"
});
```

### Server Side

You can also call admin actions directly from your server-side code (e.g. in API routes or Server Actions) using `auth.api`.

> **Note**: When calling from the server, you must pass the request headers to ensure the session context is correctly resolved.

```typescript
import { auth } from "@/lib/auth"; // Your auth instance
import { headers } from "next/headers"; // Example for Next.js

await auth.api.banUser({
    body: {
        userId: "target-user-id",
        banReason: "Violation of terms"
    },
    headers: await headers()
});
```

## API Reference

### Set User Password

Changes the password of a user.

- **Path**: `/my-admin/set-user-password`
- **Method**: `POST`

#### Parameters

```ts
type setUserPassword = {
    /**
     * The user id which you want to set the password for.
     */
    userId: string;
    /**
     * The new password.
     */
    newPassword: string;
}
```

#### Examples

**Client**
```ts
await authClient.myAdmin.setUserPassword({
    userId: 'user-id',
    newPassword: 'new-password'
});
```

**Server**
```ts
await auth.api.setUserPassword({
    body: {
        userId: 'user-id',
        newPassword: 'new-password'
    },
    headers: await headers()
});
```

### Ban User

Bans a user, preventing them from signing in and revokes all of their existing sessions.

- **Path**: `/my-admin/ban-user`
- **Method**: `POST`

#### Parameters

```ts
type banUser = {
    /**
     * The user id which you want to ban.
     */
    userId: string;
    /**
     * The reason for the ban.
     */
    banReason?: string;
    /**
     * The number of seconds until the ban expires. If not provided, the ban will never expire.
     */
    banExpiresIn?: number;
}
```

#### Examples

**Client**
```ts
await authClient.myAdmin.banUser({
    userId: 'user-id',
    banReason: 'Spamming',
    banExpiresIn: 604800 // 1 week
});
```

**Server**
```ts
await auth.api.banUser({
    body: {
        userId: 'user-id',
        banReason: 'Spamming'
    },
    headers: await headers()
});
```

### Unban User

Removes the ban from a user, allowing them to sign in again.

- **Path**: `/my-admin/unban-user`
- **Method**: `POST`

#### Parameters

```ts
type unbanUser = {
    /**
     * The user id which you want to unban.
     */
    userId: string;
}
```

#### Examples

**Client**
```ts
await authClient.myAdmin.unbanUser({
    userId: 'user-id'
});
```

**Server**
```ts
await auth.api.unbanUser({
    body: { userId: 'user-id' },
    headers: await headers()
});
```

### List User Sessions

Lists all active sessions for a specific user.

- **Path**: `/my-admin/list-user-sessions`
- **Method**: `POST`

#### Parameters

```ts
type listUserSessions = {
    /**
     * The user id to list sessions for.
     */
    userId: string;
}
```

#### Examples

**Client**
```ts
const { data } = await authClient.myAdmin.listUserSessions({
    userId: 'user-id'
});
```

**Server**
```ts
const sessions = await auth.api.listUserSessions({
    body: { userId: 'user-id' },
    headers: await headers()
});
```

### Revoke User Session

Revokes a specific session for a user.

- **Path**: `/my-admin/revoke-user-session`
- **Method**: `POST`

#### Parameters

```ts
type revokeUserSession = {
    /**
     * The session token which you want to revoke.
     */
    sessionToken: string;
}
```

#### Examples

**Client**
```ts
await authClient.myAdmin.revokeUserSession({
    sessionToken: 'session-token'
});
```

**Server**
```ts
await auth.api.revokeUserSession({
    body: { sessionToken: 'session-token' },
    headers: await headers()
});
```

### Revoke User Sessions

Revokes all sessions for a user.

- **Path**: `/my-admin/revoke-user-sessions`
- **Method**: `POST`

#### Parameters

```ts
type revokeUserSessions = {
    /**
     * The user id which you want to revoke all sessions for.
     */
    userId: string;
}
```

#### Examples

**Client**
```ts
await authClient.myAdmin.revokeUserSessions({
    userId: 'user-id'
});
```

**Server**
```ts
await auth.api.revokeUserSessions({
    body: { userId: 'user-id' },
    headers: await headers()
});
```

## Localization

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
