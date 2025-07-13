// --- Data & Constants ---

const cardsPool = [
  { name: "Slime", rarity: "common", multiplierRange: [1, 2] },
  { name: "Oger", rarity: "uncommon", multiplierRange: [2, 3] },
  { name: "Hawk", rarity: "rare", multiplierRange: [3, 4] },
  { name: "Tarantula", rarity: "epic", multiplierRange: [4, 6] },
  { name: "Boar", rarity: "mythical", multiplierRange: [6, 8] },
  { name: "Dragon", rarity: "legendary", multiplierRange: [8, 10] },
  { name: "Pegasus", rarity: "legendary", multiplierRange: [8, 10] },
  { name: "Phoenix", rarity: "mythical", multiplierRange: [6, 8] },
  { name: "Rainbow", rarity: "rainbow", multiplierRange: [50000, 50000] },
];

// Rarity chances (sum 100)
const rarityChances = [
  { rarity: "rainbow", chance: 0.2 },
  { rarity: "legendary", chance: 2.0 },
  { rarity: "mythical", chance: 5.0 },
  { rarity: "epic", chance: 10.0 },
  { rarity: "rare", chance: 15.0 },
  { rarity: "uncommon", chance: 25.0 },
  { rarity: "common", chance: 42.8 },
];

// User data (simulate localStorage)
let user = {
  username: null,
  gold: 0,
  level: 1,
  xp: 0,
  cardsDrawn: 0,
  deck: {}, // { cardName: count }
  vaultGold: 0,
  vaultTimestamp: null,
};

// --- DOM Elements ---
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const loginSection = document.getElementById("loginSection");
const gameSection = document.getElementById("gameSection");

const displayUsername = document.getElementById("displayUsername");
const goldCount = document.getElementById("goldCount");
const levelCount = document.getElementById("levelCount");
const xpBar = document.getElementById("xpBar");

const drawCardBtn = document.getElementById("drawCardBtn");
const drawResult = document.getElementById("drawResult");

const deckContainer = document.getElementById("deckContainer");

const vaultSection = document.getElementById("vaultSection");
const vaultAmountInput = document.getElementById("vaultAmount");
const storeVaultBtn = document.getElementById("storeVaultBtn");
const vaultMsg = document.getElementById("vaultMsg");

const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardList = document.getElementById("leaderboardList");

const profileSection = document.getElementById("profileSection");
const profileUsername = document.getElementById("profileUsername");
const profileGold = document.getElementById("profileGold");
const profileCardsDrawn = document.getElementById("profileCardsDrawn");
const profileLevel = document.getElementById("profileLevel");

const bottomNavButtons = document.querySelectorAll(".bottom-nav button");
const backButtons = document.querySelectorAll(".backBtn");

// --- Helper Functions ---

function saveUser() {
  localStorage.setItem("drawqardsUser", JSON.stringify(user));
}

function loadUser() {
  const saved = localStorage.getItem("drawqardsUser");
  if (saved) {
    user = JSON.parse(saved);
    return true;
  }
  return false;
}

function getRarityByChance() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (let i = 0; i < rarityChances.length; i++) {
    sum += rarityChances[i].chance;
    if (rand <= sum) return rarityChances[i].rarity;
  }
  return "common"; // fallback
}

function getCardsByRarity(rarity) {
  return cardsPool.filter(c => c.rarity === rarity);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addXp(amount) {
  user.xp += amount;
  const xpForNextLevel = user.level * 100;
  if (user.xp >= xpForNextLevel) {
    user.xp -= xpForNextLevel;
    user.level++;
    alert(`Congrats! You leveled up to level ${user.level}!`);
  }
}

function updateXpBar() {
  const xpForNextLevel = user.level * 100;
  const percent = (user.xp / xpForNextLevel) * 100;
  xpBar.style.width = `${percent}%`;
}

function updateDeckUI() {
  deckContainer.innerHTML = "";
  for (const cardName in user.deck) {
    const count = user.deck[cardName];
    const cardData = cardsPool.find(c => c.name === cardName);
    if (!cardData) continue;

    const multiplier = randomBetween(...cardData.multiplierRange);

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", cardData.rarity);

    cardDiv.innerHTML = `
      ${cardData.name}
      <span class="multiplier">x${count}</span>
    `;
    deckContainer.appendChild(cardDiv);
  }
}

function updateProfileUI() {
  profileUsername.textContent = user.username;
  profileGold.textContent = user.gold;
  profileCardsDrawn.textContent = user.cardsDrawn;
  profileLevel.textContent = user.level;
}

function updateUserInfoUI() {
  displayUsername.textContent = user.username;
  goldCount.textContent = user.gold;
  levelCount.textContent = user.level;
  updateXpBar();
  updateDeckUI();
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    if (sec.id === id) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });
  // Update nav active button
  bottomNavButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === id);
  });
  // Clear messages
  loginMsg.textContent = "";
  vaultMsg.textContent = "";
  drawResult.textContent = "";
}

function loadLeaderboard() {
  // Dummy leaderboard sorted by gold desc
  const dummy = [
    { username: "Alice", gold: 9500 },
    { username: "Bob", gold: 7500 },
    { username: "Charlie", gold: 6200 },
    { username: user.username, gold: user.gold }, // include current user
  ];

  dummy.sort((a, b) => b.gold - a.gold);

  leaderboardList.innerHTML = "";
  dummy.forEach((player, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${player.username} — ${player.gold} 🪙`;
    if (player.username === user.username) {
      li.style.fontWeight = "700";
      li.style.color = "#3498db";
    }
    leaderboardList.appendChild(li);
  });
}

function drawCard() {
  const rarity = getRarityByChance();
  const cards = getCardsByRarity(rarity);
  const card = cards[Math.floor(Math.random() * cards.length)];

  // Random multiplier for card
  const multiplier = randomBetween(...card.multiplierRange);

  // Add card to deck count or create new
  user.deck[card.name] = (user.deck[card.name] || 0) + 1;

  user.cardsDrawn++;
  // Reward gold based on multiplier and level
  const reward = Math.floor(multiplier * user.level * 10);
  user.gold += reward;

  // Add XP (simple formula)
  addXp(20);

  saveUser();
  updateUserInfoUI();

  drawResult.textContent = `You got a ${card.name} (${rarity.toUpperCase()})! Gold +${reward}`;

  updateDeckUI();
}

// Vault store gold
function storeGoldInVault() {
  const amount = parseInt(vaultAmountInput.value);
  if (isNaN(amount) || amount <= 0) {
    vaultMsg.textContent = "Enter a valid amount";
    return;
  }
  if (amount > user.gold) {
    vaultMsg.textContent = "You don't have that much gold";
    return;
  }
  if (user.vaultGold > 0) {
    vaultMsg.textContent = "You already have gold stored in vault";
    return;
  }

  user.gold -= amount;
  user.vaultGold = amount;
  user.vaultTimestamp = Date.now();

  vaultMsg.textContent = `Stored ${amount} gold in vault. Come back after 24h to claim 15% interest!`;
  vaultAmountInput.value = "";

  saveUser();
  updateUserInfoUI();
}

// Claim vault gold + interest if 24h passed
function checkVault() {
  if (!user.vaultTimestamp) return;
  const now = Date.now();
  const diff = now - user.vaultTimestamp;
  if (diff >= 24 * 60 * 60 * 1000) {
    const interest = Math.floor(user.vaultGold * 0.15);
    const total = user.vaultGold + interest;
    user.gold += total;
    user.vaultGold = 0;
    user.vaultTimestamp = null;
    alert(`Vault matured! You got back ${total} gold (including 15% interest).`);
    saveUser();
    updateUserInfoUI();
  }
}

// Login handler
function login() {
  const uname = usernameInput.value.trim();
  if (!uname) {
    loginMsg.textContent = "Enter a username";
    return;
  }
  user.username = uname;

  // Load saved user data or create new
  if (!loadUser() || user.username !== uname) {
    // New user or different username - reset data
    user = {
      username: uname,
      gold: 1000,
      level: 1,
      xp: 0,
      cardsDrawn: 0,
      deck: {},
      vaultGold: 0,
      vaultTimestamp: null,
    };
    saveUser();
  }

loginSection.classList.remove("active");
  gameSection.classList.add("active");
  updateUserInfoUI();
  loadLeaderboard();
  updateProfileUI();
  checkVault();
  showSection("gameSection");
  usernameInput.value = "";
  loginMsg.textContent = "";
}

// Navigation handler
function setupNavigation() {
  bottomNavButtons.forEach(button => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.section;
      showSection(sectionId);
      if (sectionId === "leaderboardSection") {
        loadLeaderboard();
      }
      if (sectionId === "profileSection") {
        updateProfileUI();
      }
    });
  });

  backButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      showSection("gameSection");
    });
  });
}

// Initialize app
function init() {
  // Check if user saved in localStorage
  if (loadUser()) {
    loginSection.classList.remove("active");
    gameSection.classList.add("active");
    updateUserInfoUI();
    loadLeaderboard();
    updateProfileUI();
    checkVault();
    showSection("gameSection");
  } else {
    showSection("loginSection");
  }

  // Event listeners
  loginBtn.addEventListener("click", login);
  drawCardBtn.addEventListener("click", () => {
    drawCard();
  });
  storeVaultBtn.addEventListener("click", storeGoldInVault);

  setupNavigation();
}

// Run init on page load
window.addEventListener("load", init);
