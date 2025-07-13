const API_URL = "https://ishan999.pythonanywhere.com";

async function registerUser() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
    } else {
      alert(data.error || "Registration failed");
    }
  } catch (err) {
    console.error("Register Error:", err);
    alert("Network error during registration.");
  }
}

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Login successful!");
      console.log(data.user); // optional
      // Optionally redirect to game page
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("Network error during login.");
  }
}
