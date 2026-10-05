function getToken() {
  return localStorage.getItem("shiptrack_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("shiptrack_user"));
  } catch {
    return null;
  }
}

function saveAuth(data) {
  localStorage.setItem("shiptrack_token", data.token);
  localStorage.setItem("shiptrack_user", JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem("shiptrack_token");
  localStorage.removeItem("shiptrack_user");
  window.location.href = "/login.html";
}

async function api(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function requireLogin() {
  if (!getToken()) {
    window.location.href = "/login.html";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
