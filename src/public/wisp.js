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
    const response = await fetch(`${wispapiurl}/api/createaccount`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "company-id": "test-corp",
        "origin": origin  
      },
      body: JSON.stringify({ "username": username, "email": email, "password": password }),
    });

    const data = await response.json(); 

    if (!response.ok) {
      const errorData = await data;
      alert(`Error: ${errorData.message || 'Failed to create account.'}`);
      return null;
    } else {
      if (!loginpage) {
        alert("Error: Missing login page in wisp config.");
        return null;
      }

      const token = data.token;
      window.location.replace(`${loginpage}?token=${token}`);
      return token;
    }
} catch (error) {
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
    const result = await fetch(`${wispapiurl}/api/login`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "origin": origin
      },
      body: JSON.stringify({ username, password })
    });

    const data = await result.json();
    
    if (result.ok && data.token) {
      document.cookie = `token=${data.token}; path=/`;
      console.log("Token saved:", data.token);
    } else {
      alert("Login failed: " + (data.message || "Invalid credentials"));
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("An error occurred during login. Please check the console for details.");
  }
}
