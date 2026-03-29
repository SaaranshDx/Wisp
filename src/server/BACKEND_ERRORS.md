# Backend Error Reference

This file documents the errors that can come from `src/server/main.py`.

## Errors that can happen on multiple endpoints

### Origin validation

These are checked by `validate_client_request()` and can affect:

- `POST /api/createaccount`
- `POST /api/login`
- `GET /api/verify-token`
- `POST /api/logout`

| Status | Message | When it happens |
| --- | --- | --- |
| 403 | `Missing origin header` | The request does not include an `origin` header. |
| 403 | `Unknown or unauthorized origin` | The `origin` header is present, but it does not exactly match any allowed origin in `urlverificationkey.json`. |

### JWT / Authorization validation

These are checked for protected routes:

- `GET /api/verify-token`
- `POST /api/logout`

| Status | Message | When it happens |
| --- | --- | --- |
| 401 | `Missing Bearer token` | The `Authorization` header is missing, does not start with `Bearer `, or the token part is empty after trimming spaces. |
| 401 | `Token has expired` | The JWT is valid but the `exp` time has passed. |
| 401 | `Invalid token` | The JWT is malformed, signed with the wrong secret, or otherwise fails JWT validation. |
| 401 | `Token client does not match request` | The JWT `client_id` does not match the company resolved from the request origin. |
| 401 | `Token is not active` | The token is missing from the database, was replaced by a newer login, or was cleared on logout. |
| 500 | `Missing jwt_key in environment` | The backend is missing `jwt_key` in `.env`, so token encode/decode cannot run. |

## Endpoint-specific errors

### `POST /api/createaccount`

| Status | Message | When it happens |
| --- | --- | --- |
| 400 | `Invalid JSON` | `request.get_json()` returns `None`. |
| 400 | `User already exists` | A user with the same `(email, client_id)` already exists in SQLite. |
| 500 | `Missing jwt_key in environment` | The account is created, but token creation fails because `jwt_key` is missing. |

Important backend behavior:

- There is no backend validation for missing `username`, `email`, or `password` before `bcrypt.hashpw(...)`.
- If `password` is missing and becomes `None`, the server can crash with an unhandled `AttributeError` when calling `password.encode()`.
- There is no backend email-format validation.
- There is no backend password-strength validation.
- There is no trimming of whitespace. Inputs like `"   "` are not rejected by the backend.
- There is no backend confirm-password check. If the frontend sends mismatched passwords but still posts a single `password` value, the backend does not know.

### `POST /api/login`

| Status | Message | When it happens |
| --- | --- | --- |
| 400 | `Invalid JSON` | `request.get_json()` returns `None`. |
| 400 | `Username and password are required` | `username` or `password` is missing or is an empty string. |
| 401 | `Invalid username or password` | The username does not exist for that client, or the password hash check fails. |
| 500 | `Missing jwt_key in environment` | Login succeeds, but token creation fails because `jwt_key` is missing. |

Important backend behavior:

- The login route does not trim spaces.
- A value like `"   "` is treated as present, not empty.
- That means space-only usernames/passwords do not trigger `Username and password are required`.
- Space-only values usually fall through to `Invalid username or password` unless a matching user actually exists.

### `GET /api/verify-token`

This route returns the shared origin and JWT errors listed above. It does not define any extra custom error messages beyond those checks.

### `POST /api/logout`

This route returns the shared origin and JWT errors listed above. On success it returns:

| Status | Message |
| --- | --- |
| 200 | `Logged out` |

## Quick test cases

### Invalid token

- Broken JWT string like `abc`
- JWT signed with a different secret
- JWT with invalid structure

Expected backend response:

- `401 Invalid token`

### Blank bearer token / extra spaces

Example header:

```http
Authorization: Bearer    
```

Expected backend response:

- `401 Missing Bearer token`

### Wrong origin

If the request sends an origin that is not exactly in `urlverificationkey.json`, the expected backend response is:

- `403 Unknown or unauthorized origin`

### Wrong password

If the username exists but the password is wrong, the expected backend response is:

- `401 Invalid username or password`

### Space-only username/password

Important detail:

- The backend does not trim inputs.
- `"   "` counts as a real value.
- On login, that usually becomes `401 Invalid username or password`.
- On create-account, whitespace-only values can be stored unless something else fails first.
