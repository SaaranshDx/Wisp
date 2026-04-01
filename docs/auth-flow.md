# Authentication Flow

This document outlines the high-level authentication flow used by Wisp.

- Initialize Wisp with your config and mode (login or create account).
- Use the provided UI to authenticate users and obtain a token.
- Store the token securely (e.g., in HTTP-only cookies or secure storage) and redirect on success.

Example outline:
- Init: initialisewisp(configPath, mode)
- Login: wispcreateaccount() or equivalent login function
- Verify: call /api/verify-token on protected routes
- Logout: call /api/logout and clear client-side state
