function showMessage(text, isError = false) {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = text;
  el.className = "message show" + (isError ? " error" : "");
}

async function handleLogin(event) {
  event.preventDefault();

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    saveAuth(data);
    window.location.href = "/dashboard.html";
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function handleRegister(event) {
  event.preventDefault();

  try {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password })
    });

    saveAuth(data);
    window.location.href = "/dashboard.html";
  } catch (error) {
    showMessage(error.message, true);
  }
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) loginForm.addEventListener("submit", handleLogin);
if (registerForm) registerForm.addEventListener("submit", handleRegister);
