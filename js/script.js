const API = "https://ishan999.pythonanywhere.com";

// ---------------- AUTH ----------------
async function registerUser() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  alert(data.message || data.error);
}

async function loginUser() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.error) {
    alert(data.error);
  } else {
    alert("Login successful!");
    showDashboard(data.user);
  }
}

async function logoutUser() {
  await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include",
  });
  alert("Logged out!");
  showLogin();
}

async function getUser() {
  const res = await fetch(`${API}/user`, {
    credentials: "include",
  });

  const data = await res.json();
  if (data.user) {
    showDashboard(data.user);
  } else {
    showLogin();
  }
}

// ---------------- GAME ACTIONS ----------------
async function drawCard() {
  const res = await fetch(`${API}/draw`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();
  if (data.card) {
    alert(`🎉 You drew: ${data.card}`);
    updateDeck();
    updateVault();
  } else {
    alert(data.error || "Error drawing card");
  }
}

async function sellCard() {
  const card = document.getElementById("sell-card-name").value.trim();
  const qty = parseInt(document.getElementById("sell-card-qty").value);

  if (!card || isNaN(qty) || qty <= 0) {
    return alert("Enter valid card name and quantity.");
  }

  const res = await fetch(`${API}/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ card, qty }),
  });

  const data = await res.json();
  alert(data.message || data.error);
  updateDeck();
  updateVault();
}

// ---------------- UI UPDATERS ----------------
async function updateVault() {
  const res = await fetch(`${API}/vault`, {
    credentials: "include",
  });

  const data = await res.json();
  document.getElementById("vault-box").innerText = `💰 Coins: ${data.coins || 0}`;
}

async function updateDeck() {
  const res = await fetch(`${API}/deck`, {
    credentials: "include",
  });

  const data = await res.json();
  const deck = data.deck || {};
  const box = document.getElementById("deck-box");
  box.innerHTML = "";

  Object.entries(deck).forEach(([card, qty]) => {
    const div = document.createElement("div");
    div.textContent = `${card}: ${qty}`;
    box.appendChild(div);
  });
}

// ---------------- UI CONTROL ----------------
function showLogin() {
  document.getElementById("login-section").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
}

function showDashboard(user) {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("welcome-user").innerText = `👋 Welcome, ${user.username || "Player"}!`;

  updateVault();
  updateDeck();
}

// ---------------- INIT ----------------
window.onload = () => {
  getUser();

  document.getElementById("register-btn").onclick = registerUser;
  document.getElementById("login-btn").onclick = loginUser;
  document.getElementById("logout-btn").onclick = logoutUser;
  document.getElementById("draw-btn").onclick = drawCard;
  document.getElementById("sell-btn").onclick = sellCard;
};
