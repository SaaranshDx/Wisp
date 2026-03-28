const apiBaseUrl = "http://localhost:5000";
const companyId = "test-corp";
const loginPage = "./login.html";

function getRequestOrigin() {
  return window.location.origin;
}

function getStoredToken() {
  return localStorage.getItem("wispToken");
}

function clearStoredToken() {
  localStorage.removeItem("wispToken");
}

function redirectToLogin() {
  window.location.replace(loginPage);
}

function setStatus(message) {
  const status = document.getElementById("status-message");
  if (status) {
    status.textContent = message;
  }
}

function fillSessionDetails(data) {
  document.getElementById("session-user").textContent = data.user_id || "Unknown user";
  document.getElementById("session-email").textContent = data.email || "Unknown email";
  document.getElementById("session-client").textContent = data.client_id || "Unknown client";

  const expiry = typeof data.expires_at === "number"
    ? new Date(data.expires_at * 1000).toLocaleString()
    : "Unknown expiry";

  document.getElementById("session-expiry").textContent = expiry;
}

async function verifySession() {
  const token = getStoredToken();

  if (!token) {
    setStatus("No saved token found. Redirecting to login.");
    redirectToLogin();
    return;
  }

  try {
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
      throw new Error(data.message || "Session verification failed");
    }

    fillSessionDetails(data);
    setStatus("Session verified. This page is only available while the saved Wisp token is active.");
  } catch (error) {
    clearStoredToken();
    setStatus("Session is invalid or expired. Redirecting to login.");
    setTimeout(() => {
      redirectToLogin();
    }, 500);
  }
}

async function logout() {
  const token = getStoredToken();

  try {
    if (token) {
      await fetch(`${apiBaseUrl}/api/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "company-id": companyId,
          "origin": getRequestOrigin()
        }
      });
    }
  } finally {
    clearStoredToken();
    redirectToLogin();
  }
}

document.getElementById("logout-button")?.addEventListener("click", async () => {
  await logout();
});

verifySession();
