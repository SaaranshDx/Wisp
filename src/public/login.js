let loginpage;
let createaccountpage;
let wispConfigPromise = null;
const apiBaseUrl = "http://localhost:5000";
const companyId = "test-corp";

function emitWispAuthEvent(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function initialisewisp(configSource) {
  if (!document.getElementById("wisp-login-styles")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="wisp-login-styles">
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@500&display=swap');

  .login-wrap {
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'DM Sans', sans-serif;
  }

  .login-card {
    background: var(--color-background-primary, #ffffff);
    border: 0.5px solid var(--color-border-tertiary, #dddddd);
    border-radius: var(--border-radius-lg, 18px);
    padding: 2rem 2.25rem 1.75rem;
    width: 100%;
    max-width: 360px;
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.75rem;
  }

  .login-logo-icon {
    width: 28px;
    height: 28px;
    background: #111111;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-logo-icon svg { display: block; }

  .login-logo-name {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary, #111111);
    letter-spacing: -0.02em;
  }

  .login-heading {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary, #111111);
    margin: 0 0 0.3rem;
  }

  .login-sub {
    font-size: 13px;
    color: var(--color-text-secondary, #666666);
    margin: 0 0 1.5rem;
  }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary, #666666);
    margin-bottom: 5px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .login-field {
    margin-bottom: 1rem;
  }

  .login-card input[type="text"],
  .login-card input[type="password"] {
    width: 100%;
    box-sizing: border-box;
  }

  .login-btn {
    width: 100%;
    padding: 9px 0;
    margin-top: 0.5rem;
    background: var(--color-text-primary, #111111);
    color: var(--color-background-primary, #ffffff);
    border: none;
    border-radius: var(--border-radius-md, 12px);
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .login-btn:hover { opacity: 0.85; }
  .login-btn:active { opacity: 0.7; transform: scale(0.99); }

  .login-footer {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 11px;
    color: var(--color-text-tertiary, #888888);
    letter-spacing: 0.01em;
  }

  .login-footer span,
  .login-footer a {
    font-weight: 500;
    color: var(--color-text-secondary, #666666);
  }

  .login-footer a {
    text-decoration: none;
  }
  </style>`
    );
  }

  if (!document.getElementById("wisp-login-root")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="login-wrap" id="wisp-login-root">
  <div class="login-card">
    <div class="login-logo">
      <div class="login-logo-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="4" fill="white" opacity="0.9"/>
          <circle cx="8" cy="8" r="2" fill="#111111"/>
        </svg>
      </div>
      <span class="login-logo-name">wisp</span>
    </div>

    <p class="login-heading">Welcome back</p>
    <p class="login-sub">Sign in to your account to continue.</p>

    <div class="login-field">
      <label class="login-label" for="username">Username</label>
      <input type="text" id="username" placeholder="your_username" />
    </div>

    <div class="login-field">
      <label class="login-label" for="password">Password</label>
      <input type="password" id="password" placeholder="password" />
    </div>

    <button type="button" class="login-btn" id="login-submit">Sign in</button>

    <div class="login-footer" id="login-footer">
      Powered by <span>wisp</span>
    </div>
  </div>
</div>`
    );
  }

  const loginButton = document.getElementById("login-submit");
  if (loginButton && !loginButton.dataset.bound) {
    loginButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await wisplogin();
    });
    loginButton.dataset.bound = "true";
  }

  wispConfigPromise = parsewispconfig(configSource).then((cfg) => {
    renderFooterLink();
    tokenlogin();
    return cfg;
  });

  return wispConfigPromise;
}

function renderFooterLink() {
  const footer = document.getElementById("login-footer");

  if (!footer || !createaccountpage) {
    return;
  }

  footer.innerHTML = `Need an account? <a href="${createaccountpage}">Create one</a>`;
}

async function parsewispconfig(configSource = globalThis.wispconfig) {
  try {
    if (!configSource) {
      return null;
    }

    let cfg;

    if (typeof configSource === "string") {
      const trimmedConfigSource = configSource.trim();

      if (trimmedConfigSource.startsWith("{")) {
        cfg = JSON.parse(trimmedConfigSource);
      } else {
        const response = await fetch(trimmedConfigSource);

        if (!response.ok) {
          throw new Error(`Unable to load config from ${trimmedConfigSource}`);
        }

        cfg = await response.json();
      }
    } else if (typeof configSource === "object") {
      cfg = configSource;
    } else {
      throw new Error("Config must be a JSON string, object, or path to a JSON file.");
    }

    loginpage = cfg.loginpage;
    createaccountpage = cfg.createaccountpage;

    return cfg;
  } catch (error) {
    console.error("Failed to parse wisp config:", error);
    alert("Error: Invalid configuration. Please check the console for details.");
    return null;
  }
}

function getRequestOrigin() {
  return window.location.origin;
}

async function wisplogin() {
  if (!loginpage) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!username || !password) {
    alert("Please enter both username and password.");
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "company-id": companyId,
        "origin": getRequestOrigin()
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Error: ${data.message || "Failed to sign in."}`);
      return null;
    }

    if (!data.token) {
      alert("Error: Server did not return a token.");
      return null;
    }

    localStorage.setItem("wispToken", data.token);
    emitWispAuthEvent("wisp:login-success", { token: data.token, response: data });
    alert("Login successful.");
    return data.token;
  } catch (error) {
    alert(`Network error: ${error.message}`);
    return null;
  }
}

async function tokenlogin() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      return null;
    }

    const response = await fetch(`${apiBaseUrl}/api/verify-token`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "company-id": companyId,
        "origin": getRequestOrigin()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid token");
    }

    localStorage.setItem("wispToken", token);
    window.history.replaceState({}, "", window.location.pathname);
    emitWispAuthEvent("wisp:token-verified", { token, response: data });
    return data;
  } catch (error) {
    console.error("Token verification failed:", error);
    alert("Token invalid or expired");
    return null;
  }
}
