let gold = 0;
let xp = 0;
let deck = {};
let vault = 0;

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`${id}-section`).classList.add('active');
}

function drawCard() {
  const cards = [
    { name: "Slime", rarity: "Common", color: "#ccc" },
    { name: "Boar", rarity: "Common", color: "#ccc" },
    { name: "Hawk", rarity: "Rare", color: "#3498db" },
    { name: "Tarantula", rarity: "Rare", color: "#3498db" },
    { name: "Ogre", rarity: "Legendary", color: "#9b59b6" },
    { name: "Dragon", rarity: "Mythic", color: "#f39c12" },
    { name: "Phoenix", rarity: "Mythic", color: "#f39c12" },
    { name: "Pegasus", rarity: "Mythic", color: "#f39c12" },
    { name: "Rainbow Beast", rarity: "Rainbow", color: "rainbow" }
  ];
  const chances = [25, 25, 15, 15, 10, 4, 3, 2, 1];

  let total = chances.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let chosen;
  for (let i = 0; i < cards.length; i++) {
    if (roll < chances[i]) {
      chosen = cards[i];
      break;
    }
    roll -= chances[i];
  }

  addToDeck(chosen);
  gainXP(10);

  let cardHTML = `<div class="card ${chosen.rarity.toLowerCase()}">${chosen.name} (${chosen.rarity})</div>`;
  document.getElementById("card-display").innerHTML = cardHTML;
}

function addToDeck(card) {
  let key = card.name;
  deck[key] = (deck[key] || 0) + 1;
  updateDeckDisplay();
}

function updateDeckDisplay() {
  let html = "";
  for (let name in deck) {
    html += `<div class="card">${name} x${deck[name]}
      <button onclick="sell('${name}')">Sell</button>
    </div>`;
  }
  document.getElementById("deck-list").innerHTML = html;
}

function sell(name) {
  let reward = Math.floor(Math.random() * 30) + 20;
  gold += reward;
  deck[name]--;
  if (deck[name] <= 0) delete deck[name];
  updateDeckDisplay();
  updateGold();
}

function transformCards() {
  let keys = Object.keys(deck);
  if (keys.length >= 3) {
    let newCard = { name: "Mystery Upgrade", rarity: "Legendary", color: "#9b59b6" };
    keys.slice(0, 3).forEach(k => {
      delete deck[k];
    });
    addToDeck(newCard);
    gainXP(50);
  }
}

function depositVault() {
  if (gold > 0) {
    vault += gold;
    gold = 0;
    updateGold();
    document.getElementById("vault-gold").innerText = vault;
  }
}

function claimInterest() {
  let interest = Math.floor(vault * 0.05);
  gold += interest;
  updateGold();
}

function gainXP(amount) {
  xp += amount;
  document.getElementById("xp-text").innerText = `XP: ${xp}`;
  document.getElementById("xp-fill").style.width = `${xp % 100}%`;
}

function updateGold() {
  document.getElementById("gold").innerText = gold;
}

function logout() {
  // Reset all data (for demo purpose)
  gold = 0;
  xp = 0;
  deck = {};
  vault = 0;
  document.getElementById("username").innerText = "Guest";
  document.getElementById("vault-gold").innerText = "0";
  document.getElementById("xp-fill").style.width = "0%";
  document.getElementById("xp-text").innerText = "XP: 0";
  updateDeckDisplay();
  updateGold();
}

window.onload = () => {
  // Simulate user login
  document.getElementById("username").innerText = "Ishan";
  updateGold();
  updateDeckDisplay();
  document.getElementById("vault-gold").innerText = vault;
  document.getElementById("xp-text").innerText = `XP: ${xp}`;
};