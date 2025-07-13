const API = "https://ishan999.pythonanywhere.com"; // your backend URL

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      credentials: "include", // important for session cookie
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Login successful!");
      // Optional: redirect or update UI
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    alert("❌ Network error: " + err.message);
  }
}

async function registerUser() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Registered successfully!");
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    alert("❌ Network error: " + err.message);
  }
}
