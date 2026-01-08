# Changelog

## v0.1.0 (2026-01-08)

### 🚀 Major Release

- **Initial Stable Release**: First official release with complete feature set.

### ✨ Features

- **Control Inversion**: Complete control over permission logic via `checkPermission` hook.
- **User Management**:
  - Ban/Unban users with reasons and expiration.
  - Set user passwords securely.
- **Session Control**:
  - List user sessions.
  - Revoke specific sessions.
  - Revoke all sessions for a user.
- **Security**:
  - Automatic session revocation when a user is banned.
  - Prevention of self-banning.
- **Developer Experience**:
  - Full TypeScript support.
  - Comprehensive API documentation.
  - Localization support for error messages.
