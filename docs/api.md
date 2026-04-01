# API Reference

This section documents the core endpoints exposed by Wisp.

- POST /api/createaccount: create a new user account
- POST /api/login: login and obtain a token
- GET /api/verify-token: verify the current token
- POST /api/logout: invalidate the current session

Notes:
- All protected endpoints expect a valid JWT token in the Authorization header (Bearer token).
- The exact request/response payloads may vary by environment; refer to the implementation for details.
