let loginpage;
let createaccountpage;
let wispapiurl;
let wispConfigPromise = null;

function initialisewisp(configsource, authState) {
  if (!authState) {
    alert("Error: Missing authentication state. Please provide a valid auth state to initialize wisp.");
  } else {
    if (authState == "login") {
      initialisewisplogin(configsource);
    } else if (authState == "createaccount") {
      initialisewispsignup(configsource);
    }
  }
}

function initialisewisplogin(configSource) {
  if (!document.getElementById("wisp-login-styles")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `
<style id="wisp-login-styles">
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
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
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
    background: #111;
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
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .login-heading {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0 0 0.3rem;
  }

  .login-sub {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0 0 1.5rem;
  }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
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
    background: var(--color-text-primary);
    color: var(--color-background-primary);
    border: none;
    border-radius: var(--border-radius-md);
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
    color: var(--color-text-tertiary);
    letter-spacing: 0.01em;
  }

  .login-footer span {
    font-weight: 500;
    color: var(--color-text-secondary);
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
          <circle cx="8" cy="8" r="2" fill="#111"/>
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
      <input type="password" id="password" placeholder="••••••••" />
    </div>

    <button type="button" class="login-btn" id="wisp-login-submit">Sign in</button>

    <div class="login-footer">
      Powered by <a href="https://wisp.com" target="_blank"><span>wisp</span></a>
    </div>
  </div>
</div>
`
    );
  }

  const loginButton = document.getElementById("wisp-login-submit");
  if (loginButton && !loginButton.dataset.bound) {
    loginButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await wisplogin();
    });
    loginButton.dataset.bound = "true";
  }

  wispConfigPromise = parsewispconfig(configSource);
  return wispConfigPromise;
}

function initialisewispsignup(configSource) {
  if (!document.getElementById("wisp-createacc-styles")) {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style id="wisp-createacc-styles">
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@500&display=swap');

  .createacc-wrap {
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    font-family: 'DM Sans', sans-serif;
  }

  .createacc-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 2rem 2.25rem 1.75rem;
    width: 100%;
    max-width: 360px;
  }

  .createacc-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.75rem;
  }

  .createacc-logo-icon {
    width: 28px;
    height: 28px;
    background: #111;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .createacc-logo-icon svg { display: block; }

  .createacc-logo-name {
    font-family: 'DM Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .createacc-heading {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0 0 0.3rem;
  }

  .createacc-sub {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0 0 1.5rem;
  }

  .createacc-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 5px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .createacc-field {
    margin-bottom: 1rem;
  }

  .createacc-card input[type="text"],
  .createacc-card input[type="email"],
  .createacc-card input[type="password"] {
    width: 100%;
    box-sizing: border-box;
  }

  .createacc-btn {
    width: 100%;
    padding: 9px 0;
    margin-top: 0.5rem;
    background: var(--color-text-primary);
    color: var(--color-background-primary);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .createacc-btn:hover { opacity: 0.85; }
  .createacc-btn:active { opacity: 0.7; transform: scale(0.99); }

  .createacc-footer {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 11px;
    color: var(--color-text-tertiary);
    letter-spacing: 0.01em;
  }

  .createacc-footer span {
    font-weight: 500;
    color: var(--color-text-secondary);
  }
</style>`
    );
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="createacc-wrap">
  <div class="createacc-card">
    <div class="createacc-logo">
      <div class="createacc-logo-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="4" fill="white" opacity="0.9"/>
          <circle cx="8" cy="8" r="2" fill="#111"/>
        </svg>
      </div>
      <span class="createacc-logo-name">wisp</span>
    </div>

    <p class="createacc-heading">Create your account</p>
    <p class="createacc-sub">Set up your workspace and start using wisp.</p>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-username">Username</label>
      <input type="text" id="createacc-username" placeholder="your_username" />
    </div>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-email">Email</label>
      <input type="email" id="createacc-email" placeholder="you@example.com" />
    </div>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-password">Password</label>
      <input type="password" id="createacc-password" placeholder="Create a password" />
    </div>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-confirm-password">Confirm password</label>
      <input type="password" id="createacc-confirm-password" placeholder="Repeat your password" />
    </div>

    <button type="button" class="createacc-btn" id="createacc-submit">Create account</button>

    <div class="createacc-footer">
      Powered by <span><a href="https://wisp.dev" target="_blank">wisp</a></span>
    </div>
  </div>
</div>`
  );

  const createAccountButton = document.getElementById("createacc-submit");
  if (createAccountButton && !createAccountButton.dataset.bound) {
    createAccountButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await wispcreateaccount();
    });
    createAccountButton.dataset.bound = "true";
  }

  wispConfigPromise = parsewispconfig(configSource);
  return wispConfigPromise;

}

function getcurrenturl() {
  let currentURL = window.location.origin;
  return currentURL;
}

origin = getcurrenturl();

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
    wispapiurl = cfg.wispapiurl;

    return cfg;
  } catch (error) {
    console.error("Failed to parse wisp config:", error);
    alert("Error: Invalid configuration. Please check the console for details.");
    return null;
  }
}

function settokenincookies(token) {
  document.cookie = `token=${encodeURIComponent(token)}; path=/`;
}

function cleartokenfromcookies() {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function fetchtokenfromcookies() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? decodeURIComponent(token) : null;
}

function getwisperrormessage(data, fallbackMessage) {
  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallbackMessage;
}

async function parsejsonresponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse response JSON:", error);
    return null;
  }
}

function handlebackenderror(message, { fallbackMessage, silent = false } = {}) {
  let resolvedMessage = message || fallbackMessage || "Unexpected error";

  switch (message) {
    case "Missing origin header":
      resolvedMessage = "Missing origin header. This frontend request is not sending a valid origin.";
      break;
    case "Unknown or unauthorized origin":
      resolvedMessage = "Unknown or unauthorized origin. This site is not allowed to use the configured Wisp backend.";
      break;
    case "Missing Bearer token":
      cleartokenfromcookies();
      resolvedMessage = "Missing Bearer token. Please log in again.";
      break;
    case "Token has expired":
      cleartokenfromcookies();
      resolvedMessage = "Token has expired. Please log in again.";
      break;
    case "Invalid token":
      cleartokenfromcookies();
      resolvedMessage = "Invalid token. Please log in again.";
      break;
    case "Token client does not match request":
      cleartokenfromcookies();
      resolvedMessage = "Token client does not match request. Please log in from the correct client app.";
      break;
    case "Token is not active":
      cleartokenfromcookies();
      resolvedMessage = "Token is not active. Please log in again.";
      break;
    case "Missing jwt_key in environment":
      resolvedMessage = "Missing jwt_key in environment. The backend is not configured correctly.";
      break;
    case "Invalid JSON":
      resolvedMessage = "Invalid JSON. The request payload could not be processed.";
      break;
    case "User already exists":
      resolvedMessage = "User already exists. Try logging in instead.";
      break;
    case "Username and password are required":
      resolvedMessage = "Username and password are required.";
      break;
    case "Invalid username or password":
      resolvedMessage = "Invalid username or password.";
      break;
    default:
      break;
  }

  if (!silent) {
    alert(resolvedMessage);
  }

  return resolvedMessage;
}

async function wisprequest(path, options = {}, { fallbackMessage } = {}) {
  const response = await fetch(`${wispapiurl}${path}`, options);
  const data = await parsejsonresponse(response);
  const message = getwisperrormessage(data, fallbackMessage);

  return { response, data, message };
}

async function wispcreateaccount() {
  if (!loginpage) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const username = document.getElementById("createacc-username")?.value.trim();
  const email = document.getElementById("createacc-email")?.value.trim();
  const password = document.getElementById("createacc-password")?.value;
  const confirmPassword = document.getElementById("createacc-confirm-password")?.value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill in all fields.");
    return null;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return null;
  }

try {
    const { response, data, message } = await wisprequest("/api/createaccount", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "company-id": "test-corp",
        "origin": origin  
      },
      body: JSON.stringify({ "username": username, "email": email, "password": password }),
    }, {
      fallbackMessage: "Failed to create account.",
    });

    if (!response.ok) {
      handlebackenderror(message, { fallbackMessage: "Failed to create account." });
      return null;
    }

    if (!loginpage) {
      alert("Error: Missing login page in wisp config.");
      return null;
    }

    if (!data?.token) {
      alert("Account created, but no token was returned by the backend.");
      return null;
    }

    const token = data.token;
    settokenincookies(token);
    console.log("Token saved:", token);
    window.location.replace(`${loginpage}?token=${token}`);
    return token;
} catch (error) {
  console.error("Create account failed:", error);
  alert(`Network error: ${error.message}`);
  return null; 
}
}

async function wisplogin() {
  if (!loginpage) {
    await (wispConfigPromise ?? parsewispconfig());
  }


  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }
try {
    const { response, data, message } = await wisprequest("/api/login", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "origin": origin
      },
      body: JSON.stringify({ username, password })
    }, {
      fallbackMessage: "Login failed.",
    });
    
    if (!response.ok) {
      handlebackenderror(message, { fallbackMessage: "Login failed." });
      return null;
    }

    if (!data?.token) {
      alert("Login succeeded, but no token was returned by the backend.");
      return null;
    }

    settokenincookies(data.token);
    console.log("Token saved:", data.token);
    return data.token;
  } catch (error) {
    console.error("Login failed:", error);
    alert(`Network error: ${error.message}`);
    return null;
  }
}

async function wisplogout({ silent = false, redirectToLogin = false } = {}) {
  if (!wispapiurl) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const token = fetchtokenfromcookies();

  if (!token) {
    handlebackenderror("Missing Bearer token", {
      fallbackMessage: "Missing Bearer token",
      silent,
    });
    return false;
  }

  try {
    const { response, data, message } = await wisprequest("/api/logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "origin": origin
      }
    }, {
      fallbackMessage: "Logout failed.",
    });

    if (!response.ok) {
      handlebackenderror(message, { fallbackMessage: "Logout failed.", silent });
      return false;
    }

    cleartokenfromcookies();

    if (!silent && data?.message) {
      alert(data.message);
    }

    if (redirectToLogin && loginpage) {
      window.location.replace(loginpage);
    }

    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    if (!silent) {
      alert(`Network error: ${error.message}`);
    }
    return false;
  }
}

async function keyvalidationcheck() {
  const tokenIsValid = await verifytokenvalidation();
  return tokenIsValid;
}
         