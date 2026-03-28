# Wisp Test App Auth Flow

This project now includes a small end-to-end example app in the `test` directory that integrates Wisp account creation, login, JWT verification, and logout.

## Directory map

- `test/index.html`
  Creates an account with the Wisp create-account widget.
- `test/login.html`
  Hosts the Wisp login widget and reacts to Wisp auth events.
- `test/app.html`
  Protected app page that only works with a valid stored token.
- `test/app.js`
  Verifies the saved JWT with the backend and logs the user out.
- `test/wisp/config.json`
  Tells Wisp where the login and create-account pages live.
- `src/public/createacc.js`
  Renders the create-account UI and posts to `/api/createaccount`.
- `src/public/login.js`
  Renders the login UI, verifies `?token=...`, and saves `wispToken`.
- `src/server/main.py`
  Issues JWTs, stores the active token in SQLite, verifies it, and clears it on logout.

## Full flow

1. Open `test/index.html`.
2. Wisp renders the create-account form from `src/public/createacc.js`.
3. On success, the backend creates the user, issues a JWT, stores it in SQLite, and redirects to:

   `test/login.html?token=<jwt>`

4. `src/public/login.js` sees the `token` query param and calls `GET /api/verify-token`.
5. If the token is valid, `login.js` saves it to local storage as `wispToken` and emits:

   `wisp:token-verified`

6. `test/login.html` listens for that event and redirects to `test/app.html`.
7. `test/app.js` reads `wispToken` from local storage and verifies it again with the backend before showing protected content.
8. When the user logs out, `test/app.js` calls `POST /api/logout`, the backend clears the saved token in SQLite, local storage is cleared, and the user is sent back to `test/login.html`.

## Backend token behavior

The server uses SQLite at `src/server/db.sqlite3`.

The `users` table stores:

- `username`
- `email`
- `password_hash`
- `auth_token`
- `client_id`

Important behavior:

- `POST /api/createaccount` creates the user, generates a JWT, and saves it into `auth_token`.
- `POST /api/login` validates the password, generates a new JWT, and replaces the saved `auth_token`.
- `GET /api/verify-token` only succeeds if:
  - the JWT signature is valid
  - the JWT is not expired
  - the JWT `client_id` matches the request
  - the JWT matches the token currently saved in SQLite
- `POST /api/logout` clears the saved token so the old JWT stops being active.

That means each user has one active server-side token at a time.

## Required headers

The example app sends these headers to protected Wisp endpoints:

- `company-id: test-corp`
- `origin: http://127.0.0.1:5500`
- `Authorization: Bearer <token>` for verify and logout

The server checks `company-id` and `origin` against `src/server/urlverificationkey.json`.

## How to run the demo

### 1. Start the backend

From the project root:

```powershell
python src/server/main.py
```

Make sure `src/server/.env` contains a `jwt_key`.

### 2. Serve the frontend on `127.0.0.1:5500`

The example config expects the test app to run from:

`http://127.0.0.1:5500/test/...`

You can use a static server that binds to `127.0.0.1:5500`. One option is:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Run that from the project root so the `test` folder is available at `/test`.

### 3. Walk the flow

Open:

`http://127.0.0.1:5500/test/index.html`

Then:

1. Create an account.
2. Let Wisp redirect you through `login.html?token=...`.
3. Land on `app.html` after token verification.
4. Click Log out to clear the token on both client and server.

## Integration notes

- `login.js` now emits:
  - `wisp:login-success`
  - `wisp:token-verified`
- `test/login.html` uses those events to redirect into the protected app.
- `createacc.js` now sends `window.location.origin` as the `origin` header, which matches the backend check.

## If something fails

- If create-account returns `Invalid origin`, confirm the frontend is running on `http://127.0.0.1:5500`.
- If verify fails, confirm the backend is running and the token in SQLite matches the latest login.
- If login works but `app.html` bounces back to login, inspect `localStorage.wispToken` and the response from `/api/verify-token`.
