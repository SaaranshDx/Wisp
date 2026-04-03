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
  .login-card input[type="email"] {
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
  .input {
  background: #111;
  color: #e5e5e5;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px;
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
      <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 477.959 477.959" xml:space="preserve">
        <g><g>
          <path d="M238.421,165.792c0,0,54.115-84.598,18.411-143.04C243.147,0.356,213.901-6.707,191.505,6.976c-16.049,9.805-24.223,27.601-22.533,45.14c-14.836-9.507-34.4-10.355-50.449-0.552c-22.396,13.683-29.459,42.93-15.777,65.327C138.452,175.333,238.421,165.792,238.421,165.792z"/>
          <path d="M260.801,202.423c0,0-54.115,84.596-18.41,143.04c13.684,22.396,42.932,29.46,65.328,15.775c16.047-9.804,24.223-27.6,22.53-45.14c14.837,9.509,34.402,10.357,50.449,0.553c22.396-13.683,29.459-42.931,15.777-65.325C360.771,192.881,260.801,202.423,260.801,202.423z"/>
          <path d="M426.744,126.001c-9.805-16.049-27.602-24.223-45.141-22.533c9.508-14.836,10.357-34.4,0.553-50.448c-13.684-22.396-42.93-29.46-65.326-15.778c-58.44,35.706-48.903,135.676-48.903,135.676s84.598,54.115,143.041,18.41C433.361,177.645,440.426,148.397,426.744,126.001z"/>
          <path d="M117.62,264.748c-9.508,14.835-10.357,34.4-0.551,50.447c13.682,22.396,42.93,29.459,65.324,15.777c58.445-35.705,48.904-135.676,48.904-135.676s-84.596-54.115-143.041-18.408c-22.395,13.682-29.459,42.93-15.775,65.326C82.286,258.263,100.081,266.437,117.62,264.748z"/>
          <path d="M216.699,316.855c-0.652,1.458-1.324,3.08-2.141,4.81c-0.85,1.716-1.701,3.586-2.77,5.514c-2.033,3.893-4.572,8.14-7.598,12.561c-3.018,4.425-6.537,9.018-10.539,13.598c-4,4.585-8.482,9.155-13.365,13.593c-4.879,4.438-10.156,8.74-15.711,12.836c-5.566,4.083-11.416,7.953-17.402,11.58c-11.975,7.257-24.551,13.476-36.604,18.621c-12.051,5.156-23.588,9.239-33.539,12.366c-9.957,3.128-18.332,5.291-24.117,6.646c-2.891,0.676-5.137,1.151-6.613,1.443c-0.709,0.131-1.254,0.232-1.619,0.299c-0.191,0.037-0.25,0.036-0.303,0.041c-0.051,0.003-0.15,0.024-0.137,0.021l14.199,47.176c0,0,0.287-0.111,0.842-0.329c0.475-0.201,1.182-0.5,2.104-0.888c1.773-0.77,4.283-1.895,7.404-3.366c6.24-2.947,14.922-7.3,25.004-13.005c10.078-5.706,21.563-12.766,33.34-21.082c11.775-8.303,23.848-17.866,35.027-28.396c5.592-5.263,10.967-10.746,15.982-16.385c5.006-5.648,9.652-11.443,13.828-17.263c4.18-5.82,7.881-11.665,11.053-17.375c3.176-5.705,5.814-11.273,7.957-16.503c2.145-5.229,3.809-10.114,5.027-14.499c0.66-2.174,1.123-4.257,1.604-6.149c0.449-1.906,0.777-3.676,1.113-5.255c0.561-3.192,0.969-5.687,1.154-7.404c0.215-1.707,0.328-2.617,0.328-2.617s-0.303,0.866-0.867,2.491C218.809,311.561,217.889,313.908,216.699,316.855z"/>
        </g></g>
      </svg>
      </div>
      <span class="login-logo-name">wisp</span>
    </div>

    <!-- Step 1: Email entry -->
    <div id="wisp-login-step-email">
      <p class="login-heading">Welcome back</p>
      <p class="login-sub">Enter your email to receive a sign-in code.</p>

      <div class="login-field">
        <label class="login-label" for="login-email">Email</label>
        <input class="input" type="email" id="login-email" placeholder="you@example.com" />
      </div>

      <a href="createaccount.html" style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 1.5rem; display: inline-block;">Don't have an account? Create one</a>

      <button type="button" class="login-btn" id="wisp-login-send-code">Send code</button>
    </div>

    <!-- Step 2: Code verification (hidden until code is sent) -->
    <div id="wisp-login-step-verify" style="display: none;">
      <p class="login-heading">Check your email</p>
      <p class="login-sub">We sent a 6-digit code to <strong id="wisp-login-email-display"></strong>. It expires in 5 minutes.</p>

      <div class="login-field">
        <label class="login-label" for="login-code">Verification code</label>
        <input class="input" type="text" id="login-code" placeholder="000000" maxlength="6" inputmode="numeric" />
      </div>

      <button type="button" class="login-btn" id="wisp-login-submit">Verify & sign in</button>
      <button type="button" class="login-btn" id="wisp-login-back" style="margin-top: 0.5rem; background: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border-tertiary);">Back</button>
    </div>

    <div class="login-footer">
      Powered by <a href="https://wispproject.netlify.app" target="_blank"><span>wisp</span></a>
    </div>
  </div>
</div>
`
    );
  }

  // Send code button — transitions to step 2
  const sendCodeButton = document.getElementById("wisp-login-send-code");
  if (sendCodeButton && !sendCodeButton.dataset.bound) {
    sendCodeButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await wispsendcode();
    });
    sendCodeButton.dataset.bound = "true";
  }

  // Verify button — submits code
  const loginButton = document.getElementById("wisp-login-submit");
  if (loginButton && !loginButton.dataset.bound) {
    loginButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await wisplogin();
    });
    loginButton.dataset.bound = "true";
  }

  // Back button — returns to step 1
  const backButton = document.getElementById("wisp-login-back");
  if (backButton && !backButton.dataset.bound) {
    backButton.addEventListener("click", () => {
      document.getElementById("wisp-login-step-verify").style.display = "none";
      document.getElementById("wisp-login-step-email").style.display = "";
    });
    backButton.dataset.bound = "true";
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
  .createacc-card input[type="email"] {
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
  .input {
  background: #111;
  color: #e5e5e5;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px;
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
      <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 477.959 477.959" xml:space="preserve">
        <g><g>
          <path d="M238.421,165.792c0,0,54.115-84.598,18.411-143.04C243.147,0.356,213.901-6.707,191.505,6.976c-16.049,9.805-24.223,27.601-22.533,45.14c-14.836-9.507-34.4-10.355-50.449-0.552c-22.396,13.683-29.459,42.93-15.777,65.327C138.452,175.333,238.421,165.792,238.421,165.792z"/>
          <path d="M260.801,202.423c0,0-54.115,84.596-18.41,143.04c13.684,22.396,42.932,29.46,65.328,15.775c16.047-9.804,24.223-27.6,22.53-45.14c14.837,9.509,34.402,10.357,50.449,0.553c22.396-13.683,29.459-42.931,15.777-65.325C360.771,192.881,260.801,202.423,260.801,202.423z"/>
          <path d="M426.744,126.001c-9.805-16.049-27.602-24.223-45.141-22.533c9.508-14.836,10.357-34.4,0.553-50.448c-13.684-22.396-42.93-29.46-65.326-15.778c-58.44,35.706-48.903,135.676-48.903,135.676s84.598,54.115,143.041,18.41C433.361,177.645,440.426,148.397,426.744,126.001z"/>
          <path d="M117.62,264.748c-9.508,14.835-10.357,34.4-0.551,50.447c13.682,22.396,42.93,29.459,65.324,15.777c58.445-35.705,48.904-135.676,48.904-135.676s-84.596-54.115-143.041-18.408c-22.395,13.682-29.459,42.93-15.775,65.326C82.286,258.263,100.081,266.437,117.62,264.748z"/>
          <path d="M216.699,316.855c-0.652,1.458-1.324,3.08-2.141,4.81c-0.85,1.716-1.701,3.586-2.77,5.514c-2.033,3.893-4.572,8.14-7.598,12.561c-3.018,4.425-6.537,9.018-10.539,13.598c-4,4.585-8.482,9.155-13.365,13.593c-4.879,4.438-10.156,8.74-15.711,12.836c-5.566,4.083-11.416,7.953-17.402,11.58c-11.975,7.257-24.551,13.476-36.604,18.621c-12.051,5.156-23.588,9.239-33.539,12.366c-9.957,3.128-18.332,5.291-24.117,6.646c-2.891,0.676-5.137,1.151-6.613,1.443c-0.709,0.131-1.254,0.232-1.619,0.299c-0.191,0.037-0.25,0.036-0.303,0.041c-0.051,0.003-0.15,0.024-0.137,0.021l14.199,47.176c0,0,0.287-0.111,0.842-0.329c0.475-0.201,1.182-0.5,2.104-0.888c1.773-0.77,4.283-1.895,7.404-3.366c6.24-2.947,14.922-7.3,25.004-13.005c10.078-5.706,21.563-12.766,33.34-21.082c11.775-8.303,23.848-17.866,35.027-28.396c5.592-5.263,10.967-10.746,15.982-16.385c5.006-5.648,9.652-11.443,13.828-17.263c4.18-5.82,7.881-11.665,11.053-17.375c3.176-5.705,5.814-11.273,7.957-16.503c2.145-5.229,3.809-10.114,5.027-14.499c0.66-2.174,1.123-4.257,1.604-6.149c0.449-1.906,0.777-3.676,1.113-5.255c0.561-3.192,0.969-5.687,1.154-7.404c0.215-1.707,0.328-2.617,0.328-2.617s-0.303,0.866-0.867,2.491C218.809,311.561,217.889,313.908,216.699,316.855z"/>
        </g></g>
      </svg>
      </div>
      <span class="createacc-logo-name">wisp</span>
    </div>

    <p class="createacc-heading">Create your account</p>
    <p class="createacc-sub">Set up your workspace and start using wisp.</p>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-username">Username</label>
      <input class="input" type="text" id="createacc-username" placeholder="your_username" />
    </div>

    <div class="createacc-field">
      <label class="createacc-label" for="createacc-email">Email</label>
      <input class="input" type="email" id="createacc-email" placeholder="you@example.com" />
    </div>

    <a href="login.html" style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 1.5rem; display: inline-block;">Already have an account? Sign in</a>
    <button type="button" class="createacc-btn" id="createacc-submit">Create account</button>

    <div class="createacc-footer">
      Powered by <span><a href="https://wispproject.netlify.app" target="_blank">wisp</a></span>
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

let redirectpage

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
    redirectpage = cfg.redirectpage
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

function fetchtoken() {
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
    case "Unauthorized origin":
      resolvedMessage = "Unknown or unauthorized origin. This site is not allowed to use the configured Wisp backend.";
      break;
    case "Missing Bearer token":
    case "Missing token":
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
    // Passwordless-specific errors
    case "Email required":
      resolvedMessage = "Email address is required.";
      break;
    case "No code found":
      resolvedMessage = "No verification code found for this email. Please request a new one.";
      break;
    case "Company mismatch":
      resolvedMessage = "Verification code was issued for a different company. Please request a new code.";
      break;
    case "Code expired":
      resolvedMessage = "Verification code has expired. Please request a new one.";
      break;
    case "Invalid code":
      resolvedMessage = "Invalid verification code. Please check and try again.";
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

  if (!username || !email) {
    alert("Please fill in all fields.");
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
      body: JSON.stringify({ "username": username, "email": email }),
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

    alert("Account created! Please sign in using the magic code sent to your email.");
    window.location.replace(loginpage);
    return true;
  } catch (error) {
    console.error("Create account failed:", error);
    alert(`Network error: ${error.message}`);
    return null;
  }
}

// Step 1: Request a magic code to be sent to the user's email
async function wispsendcode() {
  if (!wispapiurl) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const email = document.getElementById("login-email")?.value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  try {
    const { response, data, message } = await wisprequest("/api/auth/magics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": origin
      },
      body: JSON.stringify({ email })
    }, {
      fallbackMessage: "Failed to send verification code.",
    });

    if (!response.ok) {
      handlebackenderror(message, { fallbackMessage: "Failed to send verification code." });
      return;
    }

    // Transition UI to the code entry step
    document.getElementById("wisp-login-email-display").textContent = email;
    document.getElementById("wisp-login-step-email").style.display = "none";
    document.getElementById("wisp-login-step-verify").style.display = "";
    document.getElementById("login-code").focus();
  } catch (error) {
    console.error("Send code failed:", error);
    alert(`Network error: ${error.message}`);
  }
}

// Step 2: Verify the code and receive a JWT
async function wisplogin() {
  if (!loginpage) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const email = document.getElementById("login-email")?.value.trim();
  const code = document.getElementById("login-code")?.value.trim();

  if (!email || !code) {
    alert("Please enter your email and the verification code.");
    return;
  }

  try {
    const { response, data, message } = await wisprequest("/api/auth/magics/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": origin
      },
      body: JSON.stringify({ email, code })
    }, {
      fallbackMessage: "Verification failed.",
    });

    if (!response.ok) {
      handlebackenderror(message, { fallbackMessage: "Verification failed." });
      return "error";
    }

    if (!data?.token) {
      alert("Verification succeeded, but no token was returned by the backend.");
      return "error";
    }

    settokenincookies(data.token);
    console.log("Token saved:", data.token);
    if (redirectpage) {
      window.location.href = redirectpage;
    } else {
      console.warn("No redirect page configured");
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert(`Network error: ${error.message}`);
    return "error";
  }
}

async function wisplogout({ silent = false, redirectToLogin = false } = {}) {
  if (!wispapiurl) {
    await (wispConfigPromise ?? parsewispconfig());
  }

  const token = fetchtoken();

  if (!token) {
    handlebackenderror("Missing Bearer token", {
      fallbackMessage: "Missing Bearer token",
      silent,
    });
    return false;
  }

  try {
    const { response, data, message } = await wisprequest("/api/auth/logout", {
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


const token = fetchtoken();

if (token) {
  alert("You're already logged in. Go touch the dashboard.");
  window.location.href = redirectpage || "dash.html";
}