// ===============================
// START SCREEN ONLY
// ===============================

// ----- PAGE STYLE -----
document.body.style.margin = "0";
document.body.style.backgroundColor = "#0b4edb";
document.body.style.fontFamily = "Arial, sans-serif";
document.body.style.color = "white";
document.body.style.textAlign = "center";

// ----- ELEMENTS -----
const startScreen = document.getElementById("startScreen");
const title = document.getElementById("gameTitle");
const nameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const leaderboardEl = document.getElementById("leaderboard");

// ----- TITLE -----
title.textContent = "SPERM RACE 🧬";

// ----- INPUT STYLE -----
nameInput.style.fontSize = "24px";
nameInput.style.padding = "15px";
nameInput.style.width = "300px";
nameInput.style.margin = "20px auto";
nameInput.style.display = "block";

// ----- BUTTON STYLE -----
startBtn.style.fontSize = "22px";
startBtn.style.padding = "12px 40px";
startBtn.style.cursor = "pointer";

// ----- FAKE LEADERBOARD DATA -----
const defaultScores = [
  { name: "Alex", score: 42 },
  { name: "Jordan", score: 38 },
  { name: "Chris", score: 31 }
];

// Save if empty
if (!localStorage.getItem("leaderboard")) {
  localStorage.setItem("leaderboard", JSON.stringify(defaultScores));
}

// ----- LOAD LEADERBOARD -----
function loadLeaderboard() {
  leaderboardEl.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("leaderboard"));

  scores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.name} — ${entry.score}s`;
    li.style.fontSize = "20px";
    li.style.margin = "10px 0";
    leaderboardEl.appendChild(li);
  });
}

loadLeaderboard();

// ----- START BUTTON (NO GAME YET) -----
startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Enter your name first");
    return;
  }

  console.log("Player name saved:", name);
  // NEXT STEP: switch to maze (we’ll add this later)
});
// ===============================
// MAZE GAME
// ===============================

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

canvas.style.display = "none";

const CELL_SIZE = 40;
const SPEED = 12;

let cols, rows;
let maze = [];
let player = { x: 0, y: 0, px: 0, py: 0 };
let keys = {};

// ---------- FULLSCREEN ----------
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

// ---------- MAZE CELL ----------
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
  }

  draw() {
    const x = this.x * CELL_SIZE;
    const y = this.y * CELL_SIZE;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    if (this.walls.top) ctx.strokeRect(x, y, CELL_SIZE, 0);
    if (this.walls.right) ctx.strokeRect(x + CELL_SIZE, y, 0, CELL_SIZE);
    if (this.walls.bottom) ctx.strokeRect(x, y + CELL_SIZE, CELL_SIZE, 0);
    if (this.walls.left) ctx.strokeRect(x, y, 0, CELL_SIZE);
  }
}

// ---------- MAZE GENERATION ----------
function generateMaze() {
  cols = Math.floor(canvas.width / CELL_SIZE);
  rows = Math.floor(canvas.height / CELL_SIZE);

  maze = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      maze.push(new Cell(x, y));
    }
  }

  let stack = [];
  let current = maze[0];
  current.visited = true;

  while (true) {
    let neighbors = getUnvisitedNeighbors(current);
    if (neighbors.length > 0) {
      let next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      stack.push(current);
      current = next;
      current.visited = true;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }
}

// ---------- HELPERS ----------
function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

function getUnvisitedNeighbors(cell) {
  const neighbors = [];
  const top = maze[index(cell.x, cell.y - 1)];
  const right = maze[index(cell.x + 1, cell.y)];
  const bottom = maze[index(cell.x, cell.y + 1)];
  const left = maze[index(cell.x - 1, cell.y)];

  if (top && !top.visited) neighbors.push(top);
  if (right && !right.visited) neighbors.push(right);
  if (bottom && !bottom.visited) neighbors.push(bottom);
  if (left && !left.visited) neighbors.push(left);

  return neighbors;
}

function removeWalls(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;

  if (dx === 1) { a.walls.left = false; b.walls.right = false; }
  if (dx === -1) { a.walls.right = false; b.walls.left = false; }
  if (dy === 1) { a.walls.top = false; b.walls.bottom = false; }
  if (dy === -1) { a.walls.bottom = false; b.walls.top = false; }
}

// ---------- PLAYER ----------
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.px, player.py, 10, 0, Math.PI * 2);
  ctx.fillStyle = "cyan";
  ctx.fill();
}

function movePlayer() {
  let vx = 0, vy = 0;
  if (keys.ArrowUp) vy = -SPEED;
  if (keys.ArrowDown) vy = SPEED;
  if (keys.ArrowLeft) vx = -SPEED;
  if (keys.ArrowRight) vx = SPEED;

  player.px += vx;
  player.py += vy;
}

// ---------- DRAW ----------
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  maze.forEach(cell => cell.draw());

  // START
  ctx.fillStyle = "green";
  ctx.fillRect(5, 5, CELL_SIZE - 10, CELL_SIZE - 10);

  // END
  ctx.fillStyle = "red";
  ctx.fillRect(
    (cols - 1) * CELL_SIZE + 5,
    (rows - 1) * CELL_SIZE + 5,
    CELL_SIZE - 10,
    CELL_SIZE - 10
  );

  drawPlayer();
}

// ---------- LOOP ----------
function mazeLoop() {
  movePlayer();
  drawMaze();
  requestAnimationFrame(mazeLoop);
}

// ---------- START GAME ----------
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  canvas.style.display = "block";

  resizeCanvas();
  generateMaze();

  player.x = 0;
  player.y = 0;
  player.px = CELL_SIZE / 2;
  player.py = CELL_SIZE / 2;

  mazeLoop();
// WIN CHECK
if (
  player.px > (cols - 1) * CELL_SIZE &&
  player.py > (rows - 1) * CELL_SIZE
) {
  startQuestions();
}
});

// ---------- INPUT ----------
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);
// ===============================
// QUESTIONS SYSTEM
// ===============================

const questions = [
  "What is the main purpose of reproduction?",
  "What is fertilization?",
  "What is the difference between sexual and asexual reproduction?",
  "Why is genetic variation important?",
  "How do plants reproduce without seeds?",
  "What is pollination?",
  "Why do organisms evolve over generations?",
  "What role does DNA play in reproduction?",
  "What environmental factors affect reproduction?",
  "Why is reproduction essential for survival?"
];

let currentQuestion = 0;
let showingQuestions = false;

// ---------- QUESTION SCREEN ----------
const questionScreen = document.createElement("div");
questionScreen.style.position = "fixed";
questionScreen.style.top = "0";
questionScreen.style.left = "0";
questionScreen.style.width = "100vw";
questionScreen.style.height = "100vh";
questionScreen.style.background = "#050b2c";
questionScreen.style.color = "white";
questionScreen.style.display = "none";
questionScreen.style.justifyContent = "center";
questionScreen.style.alignItems = "center";
questionScreen.style.fontSize = "2.5rem";
questionScreen.style.textAlign = "center";
questionScreen.style.padding = "60px";
questionScreen.style.boxSizing = "border-box";
questionScreen.style.fontFamily = "Arial, sans-serif";

document.body.appendChild(questionScreen);

// ---------- SHOW QUESTION ----------
function showQuestion() {
  questionScreen.innerHTML = `
    <div>
      <div style="font-size:1.5rem; opacity:0.7;">Question ${currentQuestion + 1} / 10</div>
      <br>
      <div>${questions[currentQuestion]}</div>
      <br><br>
      <div style="font-size:1.2rem; opacity:0.6;">Press SPACE to continue</div>
    </div>
  `;
}

// ---------- START QUESTIONS ----------
function startQuestions() {
  showingQuestions = true;
  canvas.style.display = "none";
  questionScreen.style.display = "flex";
  currentQuestion = 0;
  showQuestion();
}

// ---------- SPACE TO ADVANCE ----------
window.addEventListener("keydown", e => {
  if (!showingQuestions) return;
  if (e.code === "Space") {
    currentQuestion++;
    if (currentQuestion < questions.length) {
      showQuestion();
    } else {
      endQuestions();
    }
  }
});

// ---------- END ----------
function endQuestions() {
  questionScreen.innerHTML = `
    <div>
      <h1>Finished.</h1>
      <p>You survived.</p>
    </div>
  `;
startFlappy();
}
// ===============================
// FLAPPY SPERM
// ===============================

let flappyActive = false;
let flappyStarted = false;
let flappyTimeCounter = 0;

let spermY, spermV;
const gravity = 0.6;
const lift = -10;

let pipes = [];
const pipeWidth = 80;
let pipeGap = 220;
let pipeSpeed = 4;

// ---------- INSTRUCTION SCREEN ----------
const flappyScreen = document.createElement("div");
flappyScreen.style.position = "fixed";
flappyScreen.style.inset = "0";
flappyScreen.style.background = "#050b2c";
flappyScreen.style.color = "white";
flappyScreen.style.display = "none";
flappyScreen.style.justifyContent = "center";
flappyScreen.style.alignItems = "center";
flappyScreen.style.textAlign = "center";
flappyScreen.style.fontSize = "2.2rem";
flappyScreen.style.padding = "60px";
flappyScreen.style.boxSizing = "border-box";

flappyScreen.innerHTML = `
  <div>
    <h1>Flappy Sperm</h1>
    <p>The longer you survive, the more time is removed from your timer.</p>
    <p>Use the ↑ arrow to swim.</p>
    <p style="opacity:.7;margin-top:30px;">
      Once you press ↑, the game will begin.
    </p>
  </div>
`;

document.body.appendChild(flappyScreen);

// ---------- START FLAPPY ----------
function startFlappy() {
  flappyActive = true;
  flappyStarted = false;
  flappyTimeCounter = 0;

  canvas.style.display = "block";
  flappyScreen.style.display = "flex";

  spermY = canvas.height / 2;
  spermV = 0;
  pipes = [];
}

// ---------- DRAW SPERM ----------
function drawFlappySperm(x, y) {
  // head
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail (animated)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 16, y);
  ctx.lineTo(
    x - 36,
    y + Math.sin(Date.now() / 120) * 8
  );
  ctx.stroke();
}

// ---------- FLAPPY LOOP ----------
function flappyLoop() {
  if (!flappyActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // START WAIT
  if (!flappyStarted) {
    requestAnimationFrame(flappyLoop);
    return;
  }

  // gravity
  spermV += gravity;
  spermY += spermV;

  // pipes
  if (Math.random() < 0.02) {
    const gapY = 200 + Math.random() * (canvas.height - 400);
    pipes.push({ x: canvas.width, gapY });
  }

  pipes.forEach(p => {
    p.x -= pipeSpeed;

    // top pipe
    ctx.fillStyle = "#2aff6a";
    ctx.fillRect(p.x, 0, pipeWidth, p.gapY - pipeGap / 2);

    // bottom pipe
    ctx.fillRect(
      p.x,
      p.gapY + pipeGap / 2,
      pipeWidth,
      canvas.height
    );

    // collision
    if (
      150 + 16 > p.x &&
      150 - 16 < p.x + pipeWidth &&
      (spermY - 10 < p.gapY - pipeGap / 2 ||
       spermY + 10 > p.gapY + pipeGap / 2)
    ) {
      endFlappy();
    }
  });

  // bounds
  if (spermY < 0 || spermY > canvas.height) {
    endFlappy();
  }

  drawFlappySperm(150, spermY);

  // TIME PENALTY
  flappyTimeCounter++;
  if (flappyTimeCounter % 120 === 0) {
    time -= 1; // every ~2 seconds
  }

  requestAnimationFrame(flappyLoop);
}

// ---------- INPUT ----------
window.addEventListener("keydown", e => {
  if (!flappyActive) return;
  if (e.key === "ArrowUp") {
    if (!flappyStarted) {
      flappyStarted = true;
      flappyScreen.style.display = "none";
    }
    spermV = lift;
  }
});

// ---------- END ----------
function endFlappy() {
  flappyActive = false;
  canvas.style.display = "none";
  flappyScreen.style.display = "none";

  // NEXT: leaderboard / restart
  alert("Game over. Final time: " + time + "s");
}


