function injectcreateaccountscreen() {
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

    <button class="createacc-btn" onclick="createaccount()">Create account</button>

    <div class="createacc-footer">
      Powered by <span><a href="https://wisp.dev" target="_blank">wisp</a></span>
    </div>
  </div>
</div>`
  );

}

function getcurrenturl() {
  let currentURL = window.location.href;
  return currentURL;
}

origin = getcurrenturl();

async function wispcreateaccount() {
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
    const response = await fetch("http://localhost:5000/api/createaccount", {
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
      const token = data.token;
      window.location.replace(`${verificationURL}?token=${token}`);
    }
} catch (error) {
  alert(`Network error: ${error.message}`);
  return null; 
}
}

