const API_URL = "https://ishan999.pythonanywhere.com";

let currentUser = null; // Will hold logged-in user info

// --- UTILS ---
function qs(selector) {
  return document.querySelector(selector);
}

function showView(viewId) {
  document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
  qs(`#${viewId}`).classList.remove('hidden');
}

function updateNavbar(show) {
  const nav = qs('#navbar');
  nav.style.display = show ? 'flex' : 'none';
}

function showAlert(msg) {
  alert(msg);
}

// --- SESSION MANAGEMENT ---

async function fetchUser() {
  try {
    const res = await fetch(`${API_URL}/user`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      return true;
    } else {
      currentUser = null;
      return false;
    }
  } catch {
    currentUser = null;
    return false;
  }
}

// --- AUTH ---

async function registerUser() {
  const username = qs('#register-username').value.trim();
  const password = qs('#register-password').value.trim();
  if (!username || !password) return showAlert('Fill in all fields to register.');

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      showAlert('Registered successfully! Logging in...');
      await loginUser(username, password);
    } else {
      showAlert(data.error || 'Registration failed');
    }
  } catch (e) {
    showAlert('Network error during registration');
  }
}

async function loginUser(prefilledUser, prefilledPass) {
  const username = prefilledUser || qs('#login-username').value.trim();
  const password = prefilledPass || qs('#login-password').value.trim();
  if (!username || !password) return showAlert('Fill in all fields to login.');

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      showAlert('Login successful!');
      qs('#login-username').value = '';
      qs('#login-password').value = '';
      initAfterLogin();
    } else {
      showAlert(data.error || 'Login failed');
    }
  } catch (e) {
    showAlert('Network error during login');
  }
}

async function logoutUser() {
  try {
    const res = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      currentUser = null;
      showAlert('Logged out successfully');
      updateNavbar(false);
      showView('auth-view');
    } else {
      showAlert('Logout failed');
    }
  } catch {
    showAlert('Network error during logout');
  }
}

// --- AFTER LOGIN INIT ---

function initAfterLogin() {
  updateNavbar(true);
  showView('dashboard-view');
  renderUserInfo();
  loadDeck();
  loadVault();
  loadLeaderboard();
  loadShop();
  loadFriends();
  loadIncomingTrades();
  // Clear any previous messages/results
  qs('#draw-result').innerText = '';
  qs('#sell-result').innerText = '';
  qs('#shop-message').innerText = '';
  qs('#trade-result').innerText = '';
}

// --- USER INFO DISPLAY ---

function renderUserInfo() {
  qs('#user-name').innerText = currentUser ? currentUser.username || 'Player' : '';
  qs('#user-xp').innerText = currentUser ? currentUser.xp || 0 : 0;
  qs('#user-level').innerText = currentUser ? currentUser.level || 1 : 1;
  qs('#user-coins').innerText = currentUser ? currentUser.coins || 0 : 0;

  qs('#profile-username').innerText = currentUser ? currentUser.username || '' : '';
  qs('#profile-xp').innerText = currentUser ? currentUser.xp || 0 : 0;
  qs('#profile-level').innerText = currentUser ? currentUser.level || 1 : 1;
}

// --- DRAW CARD ---

async function drawCard() {
  try {
    const res = await fetch(`${API_URL}/draw`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      currentUser.deck = data.deck;
      qs('#draw-result').innerText = `You drew a "${data.card}"!`;
      renderUserInfo();
      loadDeck();
    } else {
      showAlert(data.error || 'Failed to draw card');
    }
  } catch {
    showAlert('Network error during draw');
  }
}

// --- DECK ---

function loadDeck() {
  if (!currentUser || !currentUser.deck) return;
  const deckDiv = qs('#deck-cards');
  deckDiv.innerHTML = '';
  const cards = currentUser.deck;
  const cardKeys = Object.keys(cards);
  if (!cardKeys.length) {
    deckDiv.innerHTML = '<p>Your deck is empty.</p>';
    qs('#sell-section').classList.add('hidden');
    return;
  }
  qs('#sell-section').classList.remove('hidden');

  cardKeys.forEach(card => {
    const cardCount = cards[card];
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.innerHTML = `<h4>${card}</h4><p>Count: ${cardCount}</p>`;
    deckDiv.appendChild(cardEl);
  });

  // Fill sell dropdown
  const sellSelect = qs('#sell-card-select');
  sellSelect.innerHTML = '';
  cardKeys.forEach(card => {
    sellSelect.innerHTML += `<option value="${card}">${card} (${cards[card]})</option>`;
  });
}

async function sellCard() {
  const card = qs('#sell-card-select').value;
  let qty = parseInt(qs('#sell-qty').value, 10);
  if (!qty || qty < 1) qty = 1;
  try {
    const res = await fetch(`${API_URL}/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ card, qty }),
    });
    const data = await res.json();
    if (res.ok) {
      showAlert(data.message);
      currentUser.coins = data.coins;
      currentUser.deck = data.deck;
      qs('#sell-result').innerText = data.message;
      renderUserInfo();
      loadDeck();
      loadVault();
    } else {
      showAlert(data.error || 'Failed to sell card');
    }
  } catch {
    showAlert('Network error during selling');
  }
}

// --- VAULT ---

async function loadVault() {
  try {
    const res = await fetch(`${API_URL}/vault`, { credentials: 'include' });
    const data = await res.json();
    if (res.ok) {
      qs('#vault-coins').innerText = data.coins;
      if(currentUser) currentUser.coins = data.coins;
      renderUserInfo();
    } else {
      showAlert(data.error || 'Failed to load vault');
    }
  } catch {
    showAlert('Network error during vault loading');
  }
}

// --- LEADERBOARD ---

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_URL}/leaderboard`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed leaderboard');
    const data = await res.json();
    const list = qs('#leaderboard-list');
    list.innerHTML = '';
    data.leaderboard.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.username} — Level ${user.level} (XP: ${user.xp})`;
      list.appendChild(li);
    });
  } catch {
    showAlert('Network error loading leaderboard');
  }
}

// --- SHOP ---

async function loadShop() {
  // Example boosters are static in HTML, implement API calls if available
  const shopItems = document.querySelectorAll('.shop-item');
  shopItems.forEach(btn => {
    btn.onclick = async () => {
      const item = btn.dataset.item;
      const price = parseInt(btn.dataset.price);
      if (currentUser.coins < price) {
        showAlert("Not enough coins");
        return;
      }
      try {
        // Implement your buy booster API here if exists, else simulate
        showAlert(`Bought ${item} for ${price} coins!`);
        // Deduct coins locally
        currentUser.coins -= price;
        renderUserInfo();
        loadVault();
      } catch {
        showAlert("Failed to buy booster");
      }
    };
  });
}

// --- FRIENDS & TRADING ---

async function loadFriends() {
  // You need an API endpoint to get friend list
  try {
    const res = await fetch(`${API_URL}/friends`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load friends');
    const data = await res.json();
    const friendsDiv = qs('#friends-list');
    friendsDiv.innerHTML = '';
    const tradeSelect = qs('#trade-friend-select');
    tradeSelect.innerHTML = '';

    data.friends.forEach(friend => {
      const p = document.createElement('p');
      p.textContent = friend;
      friendsDiv.appendChild(p);

      const option = document.createElement('option');
      option.value = friend;
      option.textContent = friend;
      tradeSelect.appendChild(option);
    });

    qs('#trade-offer-section').classList.toggle('hidden', data.friends.length === 0);
  } catch {
    showAlert('Network error loading friends');
  }
}

async function loadIncomingTrades() {
  // You need API to get incoming trade offers
  // Show them in #incoming-trades div
}

async function sendTradeOffer() {
  const friend = qs('#trade-friend-select').value;
  const card = qs('#trade-card-select').value;
  let qty = parseInt(qs('#trade-qty').value);
  if (!friend || !card || !qty || qty < 1) {
    showAlert('Fill all trade fields correctly');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/trade/send`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({friend, card, qty}),
    });
    const data = await res.json();
    if (res.ok) {
      showAlert('Trade offer sent!');
      qs('#trade-result').innerText = 'Trade offer sent successfully';
    } else {
      showAlert(data.error || 'Failed to send trade offer');
    }
  } catch {
    showAlert('Network error during trade offer');
  }
}

// --- NAVIGATION ---

document.addEventListener('DOMContentLoaded', async () => {
  // Setup event listeners
  qs('#register-btn').onclick = registerUser;
  qs('#login-btn').onclick = () => loginUser();
  qs('#logout-btn').onclick = logoutUser;
  qs('#draw-card-btn').onclick = drawCard;
  qs('#sell-btn').onclick = sellCard;
  qs('#send-trade-btn').onclick = sendTradeOffer;

  // Navigation buttons
  qs('#navbar').addEventListener('click', e => {
    if(e.target.tagName === 'BUTTON' && e.target.dataset.view) {
      showView(e.target.dataset.view + '-view');
    }
  });

  // On load try fetch user (session)
  const loggedIn = await fetchUser();
  if (loggedIn) {
    initAfterLogin();
  } else {
    updateNavbar(false);
    showView('auth-view');
  }
});
