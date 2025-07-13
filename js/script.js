const API_URL = 'https://ishan999.pythonanywhere.com'; // Change if needed

// State
let currentUser = null;

// Helpers
function qs(selector) {
  return document.querySelector(selector);
}

function showMessage(containerSelector, message, isError = false) {
  const container = qs(containerSelector);
  container.textContent = message;
  container.style.color = isError ? 'red' : 'green';
  setTimeout(() => container.textContent = '', 3000);
}

// Show section and set active nav button
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';

  document.querySelectorAll('nav button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`nav button[onclick="showSection('${id}')"]`).classList.add('active');
}

// Auth functions
async function login() {
  const username = qs('#username-input').value.trim();
  const password = qs('#password-input').value.trim();
  if (!username || !password) {
    showMessage('#auth-message', 'Please enter username and password', true);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      afterLogin();
      showMessage('#auth-message', 'Login successful!');
    } else {
      showMessage('#auth-message', data.error || 'Login failed', true);
    }
  } catch(e) {
    showMessage('#auth-message', 'Network error', true);
  }
}

async function register() {
  const username = qs('#username-input').value.trim();
  const password = qs('#password-input').value.trim();
  if (!username || !password) {
    showMessage('#auth-message', 'Please enter username and password', true);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('#auth-message', 'Registration successful! You can now login.');
    } else {
      showMessage('#auth-message', data.error || 'Registration failed', true);
    }
  } catch(e) {
    showMessage('#auth-message', 'Network error', true);
  }
}

async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  currentUser = null;
  qs('#main-section').style.display = 'none';
  qs('#auth-section').style.display = 'block';
  qs('#username-input').value = '';
  qs('#password-input').value = '';
  showMessage('#auth-message', 'Logged out');
  clearUI();
}

// After login: load user data and show main UI
async function afterLogin() {
  qs('#auth-section').style.display = 'none';
  qs('#main-section').style.display = 'block';
  qs('#user-name-display').textContent = currentUser ? currentUser.username || 'Player' : 'Player';
  updateXP(currentUser.xp, currentUser.level);
  await loadVault();
  await loadDeck();
  await loadLeaderboard();
  showSection('draw-section');
}

// Update XP bar and level display
function updateXP(xp, level) {
  const percent = Math.min((xp / 100) * 100, 100); // Example xp scale
  qs('#xp-fill').style.width = percent + '%';
}

// Draw card API call
async function drawCard() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/draw`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      qs('#draw-result').textContent = `You drew a: ${data.card}`;
      currentUser.deck = data.deck;
      await loadDeck();
    } else {
      qs('#draw-result').textContent = data.error || 'Draw failed';
    }
  } catch(e) {
    qs('#draw-result').textContent = 'Network error';
  }
}

// Load deck and display
async function loadDeck() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/deck`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      const deckList = qs('#deck-list');
      deckList.innerHTML = '';
      if (!data.deck || Object.keys(data.deck).length === 0) {
        deckList.textContent = 'No cards in deck.';
        return;
      }
      for (const [card, qty] of Object.entries(data.deck)) {
        const div = document.createElement('div');
        div.textContent = `${card} x${qty} `;
        const sellBtn = document.createElement('button');
        sellBtn.textContent = 'Sell 1';
        sellBtn.onclick = () => sellCard(card, 1);
        div.appendChild(sellBtn);
        deckList.appendChild(div);
      }
    } else {
      qs('#deck-list').textContent = data.error || 'Failed to load deck';
    }
  } catch(e) {
    qs('#deck-list').textContent = 'Network error';
  }
}

// Sell card API call
async function sellCard(card, qty) {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/sell`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({card, qty})
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('#draw-result', data.message);
      await loadVault();
      await loadDeck();
    } else {
      showMessage('#draw-result', data.error || 'Sell failed', true);
    }
  } catch(e) {
    showMessage('#draw-result', 'Network error', true);
  }
}

// Load vault coins
async function loadVault() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${API_URL}/vault`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      qs('#coin-count').textContent = data.coins;
      currentUser.coins = data.coins;
    } else {
      qs('#coin-count').textContent = '0';
    }
  } catch(e) {
    qs('#coin-count').textContent = '0';
  }
}

// Load leaderboard - stub (backend currently empty)
async function loadLeaderboard() {
  // You can expand this API & UI later.
  const leaderboard = qs('#leaderboard-list');
  leaderboard.innerHTML = '<li>Coming soon...</li>';
}

// On page load, check if already logged in
(async function init() {
  try {
    const res = await fetch(`${API_URL}/user`, {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.error) {
        currentUser = data.user;
        afterLogin();
      } else {
        // Not logged in
        qs('#auth-section').style.display = 'block';
      }
    }
  } catch {
    qs('#auth-section').style.display = 'block';
  }
})();

// Clear UI after logout
function clearUI() {
  qs('#draw-result').textContent = '';
  qs('#deck-list').textContent = '';
  qs('#coin-count').textContent = '0';
  qs('#user-name-display').textContent = '';
  qs('#xp-fill').style.width = '0%';
  qs('#leaderboard-list').innerHTML = '';
}