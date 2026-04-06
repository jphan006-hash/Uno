let players = [];
let myName = "";
let deck = [];
let discardPile = [];
let currentCard = null;
let turnIndex = 0;
let direction = 1; // 1 = clockwise, -1 = reverse

const COLORS = ["R", "G", "B", "Y"];
const AI_COUNT = 2; // number of bots

// JOIN
function joinGame() {
  myName = document.getElementById("name").value;
  if (!myName) return alert("Enter a name!");

  players.push({ name: myName, hand: [], isAI: false });

  // Add AI players
  for (let i = 1; i <= AI_COUNT; i++) {
    players.push({
      name: "AI_" + i,
      hand: [],
      isAI: true
    });
  }

  alert("Game ready with AI players!");
}

// START
// REMOVE joinGame completely

function startGame() {
  const inputs = document.querySelectorAll(".playerName");

  players = [];

  inputs.forEach((input, index) => {
    let name = input.value.trim();

    if (name !== "") {
      players.push({
        name: name,
        hand: [],
        isAI: index !== 0 // first player = YOU
      });
    }
  });

  if (players.length < 2) {
    return alert("Enter at least 2 players!");
  }

  myName = players[0].name; // YOU are first input

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  createDeck();
  shuffle(deck);
  dealCards();

  currentCard = deck.pop();
  discardPile.push(currentCard);

  renderAll();
  handleTurn();
}

  createDeck();
  shuffle(deck);
  dealCards();

  currentCard = deck.pop();
  discardPile.push(currentCard);

  renderAll();
  handleTurn();
}

// CREATE FULL UNO DECK
function createDeck() {
  deck = [];

  for (let color of COLORS) {
    for (let i = 0; i <= 9; i++) {
      deck.push({ color, value: i });
      if (i !== 0) deck.push({ color, value: i });
    }

    ["+2", "skip", "reverse"].forEach(v => {
      deck.push({ color, value: v });
      deck.push({ color, value: v });
    });

    // Custom +20
    deck.push({ color, value: "+20" });
  }

  // Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "W", value: "wild" });
  }
}

// SHUFFLE
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// DEAL 7 CARDS
function dealCards() {
  players.forEach(p => {
    p.hand = [];
    for (let i = 0; i < 7; i++) {
      p.hand.push(deck.pop());
    }
  });
}

// RENDER EVERYTHING
function renderAll() {
  renderTable();
  renderHand();
}

// TABLE
function renderTable() {
  const table = document.getElementById("table");

  table.innerHTML = `
    <div id="drawPile" onclick="drawCard()">DECK (${deck.length})</div>
    <div id="centerPile"></div>
  `;

  updateCenter();

  players.forEach((p, i) => {
    let angle = (i / players.length) * 2 * Math.PI;
    let x = 300 + 230 * Math.cos(angle);
    let y = 300 + 230 * Math.sin(angle);

    let div = document.createElement("div");
    div.className = "player";
    div.style.left = x + "px";
    div.style.top = y + "px";

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      (${p.hand.length})
    `;

    table.appendChild(div);
  });
}

// CENTER
function updateCenter() {
  const c = document.getElementById("centerPile");
  c.innerText = currentCard.value;
  c.style.background = getColor(currentCard.color);
}

// HAND
function renderHand() {
  const me = players.find(p => p.name === myName);
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";

  me.hand.forEach((card, i) => {
    let d = document.createElement("div");
    d.className = "card";
    d.innerText = card.value;
    d.style.background = getColor(card.color);

    d.onclick = () => playCard(i);
    handDiv.appendChild(d);
  });
}

// PLAY
function playCard(index) {
  const player = players[turnIndex];
  if (player.name !== myName) return;

  let card = player.hand[index];

  if (!isValid(card)) return alert("Invalid!");

  applyCardEffect(card);

  player.hand.splice(index, 1);
  currentCard = card;
  discardPile.push(card);

  nextTurn();
  renderAll();
  checkWin(player);
  handleTurn();
}

// VALID CHECK
function isValid(card) {
  return (
    card.color === currentCard.color ||
    card.value === currentCard.value ||
    card.color === "W"
  );
}

// EFFECTS
function applyCardEffect(card) {
  let next = getNextPlayer();

  switch (card.value) {
    case "+2":
      drawMultiple(next, 2);
      skipTurn();
      break;

    case "+20":
      drawMultiple(next, 20);
      skipTurn();
      break;

    case "skip":
      skipTurn();
      break;

    case "reverse":
      direction *= -1;
      break;

    case "wild":
      card.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      break;
  }
}

// DRAW MULTIPLE
function drawMultiple(player, n) {
  for (let i = 0; i < n; i++) drawTo(player);
}

// DRAW BUTTON
function drawCard() {
  const player = players[turnIndex];
  if (player.name !== myName) return;

  drawTo(player);
  renderAll();

  nextTurn();
  handleTurn();
}

// DRAW HELPER
function drawTo(player) {
  if (deck.length === 0) reshuffle();

  if (deck.length > 0) player.hand.push(deck.pop());
}

// RESHUFFLE
function reshuffle() {
  let top = discardPile.pop();
  deck = discardPile;
  discardPile = [top];
  shuffle(deck);
}

// TURN LOGIC
function nextTurn() {
  turnIndex = (turnIndex + direction + players.length) % players.length;
}

// SKIP
function skipTurn() {
  turnIndex = (turnIndex + direction + players.length) % players.length;
}

// GET NEXT PLAYER
function getNextPlayer() {
  return players[(turnIndex + direction + players.length) % players.length];
}

// HANDLE TURN (AI)
function handleTurn() {
  let player = players[turnIndex];

  if (player.isAI) {
    setTimeout(() => aiPlay(player), 800);
  }
}

// AI LOGIC
function aiPlay(player) {
  let playable = player.hand.find(isValid);

  if (playable) {
    applyCardEffect(playable);
    player.hand.splice(player.hand.indexOf(playable), 1);

    currentCard = playable;
    discardPile.push(playable);
  } else {
    drawTo(player);
  }

  renderAll();
  checkWin(player);
  nextTurn();
  handleTurn();
}

// WIN
function checkWin(player) {
  if (player.hand.length === 0) {
    alert(player.name + " wins!");
    location.reload();
  }
}

// COLORS
function getColor(c) {
  switch (c) {
    case "R": return "#e74c3c";
    case "G": return "#2ecc71";
    case "B": return "#3498db";
    case "Y": return "#f1c40f";
    case "W": return "#333";
  }
}
