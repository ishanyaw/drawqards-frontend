// Frontend + Backend connected script
const API_BASE = 'https://ishan999.pythonanywhere.com'; // Replace with your backend URL

// Current logged-in user data
let currentUser = null;
let userData = null;

// Card rarities & their chances (hard to get rares)
const rarities = [
  { name: 'common', chance: 53 },
  { name: 'rare', chance: 30 },
  { name: 'legendary', chance: 10 },
  { name: 'mythic', chance: 5 },
  { name: 'rainbow', chance: 2 }
];

// Cards by rarity (simplified)
const cardsByRarity = {
  common: ['Slime', 'Bo