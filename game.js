let players = [];
let myName = "";
let deck = [];
let discardPile = [];
let currentCard = null;
let turnIndex = 0;

const COLORS = ["R", "G", "B", "Y"];

// JOIN
function joinGame() {
  myName = document.getElementById("name").value;
  if (!myName) return alert("Enter a name!");

  players.push({ name: myName, hand: [] });
  alert("Joined as " + myName);
}

// START GAME
function startGame() {
  if (players.length === 0) return alert("No players!");

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  createDeck();
  shuffle(deck);

  dealCards(); // ALWAYS 7 CARDS

  // Start discard pile
  currentCard = deck.pop();
  discardPile.push(currentCard);

  renderTable();
  renderHand();
}

// CREATE DECK
function createDeck() {
  deck = [];

  for (let color of COLORS) {
    for (let i = 0; i <= 9; i++) {
      deck.push({ color, value: i });
    }

    // +20 cards
    deck.push({ color, value: "+20" });
    deck.push({ color, value: "+20" });
  }
}

// SHUFFLE
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// DEAL 7 CARDS
function dealCards() {
  for (let p of players) {
    p.hand = [];
    for (let i = 0; i < 7; i++) {
      p.hand.push(deck.pop());
    }
  }
}

// RENDER TABLE
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
      (${p.hand.length} cards)
    `;

    table.appendChild(div);
  });
}

// UPDATE CENTER CARD
function updateCenter() {
  const center = document.getElementById("centerPile");
  center.innerText = currentCard.value;
  center.style.background = getColor(currentCard.color);
}

// HAND
function renderHand() {
  const me = players.find(p => p.name === myName);
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "";

  me.hand.forEach((card, index) => {
    let div = document.createElement("div");
    div.className = "card";
    div.innerText = card.value;
    div.style.background = getColor(card.color);

    div.onclick = () => playCard(index);

    handDiv.appendChild(div);
  });
}

// PLAY CARD
function playCard(index) {
  const me = players.find(p => p.name === myName);
  let card = me.hand[index];

  if (
    card.color === currentCard.color ||
    card.value === currentCard.value
  ) {
    me.hand.splice(index, 1);

    // +20 EFFECT
    if (card.value === "+20") {
      let next = players[(turnIndex + 1) % players.length];
      for (let i = 0; i < 20; i++) {
        drawToPlayer(next);
      }
      alert(next.name + " draws 20 cards!");
    }

    currentCard = card;
    discardPile.push(card);

    nextTurn();
    renderTable();
    renderHand();
    checkWin(me);
  } else {
    alert("Invalid move!");
  }
}

// DRAW CARD (CLICK DECK)
function drawCard() {
  const me = players.find(p => p.name === myName);
  drawToPlayer(me);
  renderHand();
  renderTable();
}

// DRAW HELPER
function drawToPlayer(player) {
  if (deck.length === 0) {
    reshuffleDeck();
  }

  if (deck.length > 0) {
    player.hand.push(deck.pop());
  }
}

// RESHUFFLE
function reshuffleDeck() {
  let top = discardPile.pop(); // keep current card
  deck = discardPile;
  discardPile = [top];
  shuffle(deck);
}

// TURN
function nextTurn() {
  turnIndex = (turnIndex + 1) % players.length;
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
  }
}
