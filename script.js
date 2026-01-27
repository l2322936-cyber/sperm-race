/* =========================
   CANVAS + GLOBAL STATE
========================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let time = 0;
let timer;

function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}

function renderStartBoard() {
  const list = document.getElementById("startBoard");
  if (!list) return;

  list.innerHTML = "";
  getBoard().forEach(score => {
    const li = document.createElement("li");
    li.textContent = `${score.name} — ${score.time}s`;
    list.appendChild(li);
  });
}
window.onload = function () {
  renderStartBoard();
};



/* =========================
   START BUTTON
========================= */
function startGame() {
  stage = "maze";
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";

  time = 0;
  timer = setInterval(() => time++, 1000);

  initMaze();
  mazeLoop();
}

/* =========================
   MAZE DATA (SOLVABLE)
========================= */
/*
  1 = wall
  0 = path
  S = start
  E = end
*/

const mazeMap = [
  "1111111111111111111111111",
  "1S00000000000000100000001",
  "1011111111111111010111111",
  "1000000000000000010000001",
  "1111110111111111110111101",
  "1000010000000000000100001",
  "1011011111111111111101101",
  "1010010000000000000001001",
  "1011110111111111111101111",
  "1000000100000000000100001",
  "1111101110111111110111101",
  "1000000000100000010000001",
  "1011111111110111111111101",
  "10000000000001000000000E1",
  "1111111111111111111111111"
];

const rows = mazeMap.length;
const cols = mazeMap[0].length;

/* =========================
   TILE SCALING + CENTERING
========================= */
const tileSize = Math.floor(
  Math.min(window.innerWidth / cols, window.innerHeight / rows)
);

const offsetX = Math.floor((canvas.width - cols * tileSize) / 2);
const offsetY = Math.floor((canvas.height - rows * tileSize) / 2);

/* =========================
   FIND START + END
========================= */
let startPos = { x: 1, y: 1 };
let endPos = { x: cols - 2, y: rows - 2 };

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (mazeMap[y][x] === "S") startPos = { x, y };
    if (mazeMap[y][x] === "E") endPos = { x, y };
  }
}

/* =========================
   PLAYER (SPERM)
========================= */
const sperm = {
  x: 0,
  y: 0,
  speed: 12, // fast + smooth
  radius: tileSize * 0.3
};

function initMaze() {
  sperm.x = offsetX + startPos.x * tileSize + tileSize / 2;
  sperm.y = offsetY + startPos.y * tileSize + tileSize / 2;
}

/* =========================
   DRAW MAZE
========================= */
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let tile = mazeMap[y][x];

      if (tile === "1") ctx.fillStyle = "#1e90ff";
      else if (tile === "S") ctx.fillStyle = "#00ff99";
      else if (tile === "E") ctx.fillStyle = "#ffd700";
      else ctx.fillStyle = "#001428";

      ctx.fillRect(
        offsetX + x * tileSize,
        offsetY + y * tileSize,
        tileSize,
        tileSize
      );
    }
  }
}

/* =========================
   COLLISION
========================= */
function isWall(px, py) {
  const col = Math.floor((px - offsetX) / tileSize);
  const row = Math.floor((py - offsetY) / tileSize);

  if (row < 0 || col < 0 || row >= rows || col >= cols) return true;
  return mazeMap[row][col] === "1";
}

/* =========================
   MOVEMENT
========================= */
function move(dx, dy) {
  const nx = sperm.x + dx;
  const ny = sperm.y + dy;

  if (!isWall(nx, sperm.y)) sperm.x = nx;
  if (!isWall(sperm.x, ny)) sperm.y = ny;
}

/* =========================
   DRAW SPERM (ANIMATED TAIL)
========================= */
function drawSperm() {
  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, sperm.radius, sperm.radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail (animated)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sperm.x - sperm.radius, sperm.y);

  const wiggle = Math.sin(Date.now() / 120) * 8;
  ctx.lineTo(sperm.x - sperm.radius * 2.5, sperm.y + wiggle);
  ctx.stroke();
}

/* =========================
   MAZE WIN CHECK
========================= */
function checkMazeWin() {
  const cx = Math.floor((sperm.x - offsetX) / tileSize);
  const cy = Math.floor((sperm.y - offsetY) / tileSize);

  if (cx === endPos.x && cy === endPos.y) {
    clearInterval(timer);
    stage = "questions"; // NEXT PHASE
    canvas.style.display = "none";
    document.getElementById("questions").classList.add("active");
    if (typeof loadQuestion === "function") loadQuestion();
  }
}

/* =========================
   GAME LOOP
========================= */
function mazeLoop() {
  if (stage !== "maze") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm();
  checkMazeWin();

  requestAnimationFrame(mazeLoop);
}

/* =========================
   CONTROLS
========================= */
document.addEventListener("keydown", e => {
  if (stage !== "maze") return;

  if (e.key === "ArrowUp") move(0, -sperm.speed);
  if (e.key === "ArrowDown") move(0, sperm.speed);
  if (e.key === "ArrowLeft") move(-sperm.speed, 0);
  if (e.key === "ArrowRight") move(sperm.speed, 0);
});
/* =====================
   QUESTIONS
===================== */
const questions = [
  ["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
  ["Where is sperm made?",["Testes","Ovary","Uterus"],0],
  ["How many chromosomes?",["46","23","92"],1],
  ["Female gamete?",["Egg","Sperm","Zygote"],0],
  ["Meiosis creates?",["Gametes","Organs","Skin"],0],
  ["Zygote is?",["Fertilized egg","Embryo","Gamete"],0],
  ["Where fertilization occurs?",["Fallopian tube","Uterus","Cervix"],0],
  ["Male hormone?",["Testosterone","Estrogen","Insulin"],0],
  ["What increases variation?",["Crossing over","Cloning","Mitosis"],0],
  ["Sperm tail is called?",["Flagellum","Nucleus","Acrosome"],0]
];

let qi = 0;

function loadQuestion() {
  if (qi >= questions.length) {
    document.getElementById("questions").classList.remove("active");
    document.getElementById("flappyInfo").classList.add("active");
    stage = "flappyInfo";
    return;
  }

  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";

  q[1].forEach((t,i)=>{
    const b = document.createElement("button");
    b.textContent = t;
    b.onclick = ()=>{
      time += i === q[2] ? -5 : 5;
      qi++;
      loadQuestion();
    };
    a.appendChild(b);
  });
}

/* =========================
   FLAPPY SPERM GAME
   ========================= */

let flappyCanvas = document.getElementById("flappyCanvas");
let fctx = flappyCanvas.getContext("2d");

flappyCanvas.width = window.innerWidth;
flappyCanvas.height = window.innerHeight;

let gravity = 0.5;
let lift = -10;
let gameStarted = false;
let gameOver = false;
let frame = 0;

// sperm object
let sperm = {
  x: flappyCanvas.width / 3,
  y: flappyCanvas.height / 2,
  radius: 12,
  velocity: 0
};

// pipes
let pipes = [];

function startFlappy() {
  gameStarted = true;
  gameOver = false;
  pipes = [];
  sperm.y = flappyCanvas.height / 2;
  sperm.velocity = 0;
  frame = 0;
  flappyLoop();
}

/* ===== DRAW SPERM ===== */
function drawSperm() {
  // HEAD
  fctx.fillStyle = "white";
  fctx.beginPath();
  fctx.arc(sperm.x, sperm.y, sperm.radius, 0, Math.PI * 2);
  fctx.fill();

  // TAIL (wiggle animation)
  fctx.strokeStyle = "white";
  fctx.lineWidth = 2;
  fctx.beginPath();
  let tailLength = 35;

  for (let i = 0; i < tailLength; i += 5) {
    let wiggle = Math.sin((frame + i) * 0.2) * 4;
    fctx.lineTo(
      sperm.x - i,
      sperm.y + wiggle
    );
  }
  fctx.stroke();
}

/* ===== PIPES ===== */
function addPipe() {
  let gap = 180;
  let topHeight = Math.random() * (flappyCanvas.height - gap - 200) + 100;

  pipes.push({
    x: flappyCanvas.width,
    top: topHeight,
    bottom: flappyCanvas.height - topHeight - gap,
    width: 70
  });
}

function drawPipes() {
  fctx.fillStyle = "#00ff88";

  pipes.forEach(pipe => {
    // top pipe
    fctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

    // bottom pipe
    fctx.fillRect(
      pipe.x,
      flappyCanvas.height - pipe.bottom,
      pipe.width,
      pipe.bottom
    );
  });
}

function updatePipes() {
  pipes.forEach(pipe => pipe.x -= 4);

  if (frame % 90 === 0) addPipe();

  // collision detection
  pipes.forEach(pipe => {
    if (
      sperm.x + sperm.radius > pipe.x &&
      sperm.x - sperm.radius < pipe.x + pipe.width &&
      (sperm.y - sperm.radius < pipe.top ||
        sperm.y + sperm.radius >
          flappyCanvas.height - pipe.bottom)
    ) {
      gameOver = true;
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

/* ===== GAME LOOP ===== */
function flappyLoop() {
  if (gameOver) {
    fctx.fillStyle = "white";
    fctx.font = "40px Arial";
    fctx.fillText(
      "Game Over",
      flappyCanvas.width / 2 - 100,
      flappyCanvas.height / 2
    );
    return;
  }

  fctx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  if (!gameStarted) {
    fctx.fillStyle = "white";
    fctx.font = "32px Arial";
    fctx.fillText(
      "Once you click the UP arrow, the game will begin",
      flappyCanvas.width / 2 - 300,
      flappyCanvas.height / 2
    );
    requestAnimationFrame(flappyLoop);
    return;
  }

  frame++;

  sperm.velocity += gravity;
  sperm.y += sperm.velocity;

  drawSperm();
  updatePipes();
  drawPipes();

  // floor / ceiling collision
  if (
    sperm.y + sperm.radius > flappyCanvas.height ||
    sperm.y - sperm.radius < 0
  ) {
    gameOver = true;
  }

  requestAnimationFrame(flappyLoop);
}

/* ===== CONTROLS ===== */
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") {
    if (!gameStarted) startFlappy();
    sperm.velocity = lift;
  }
});
/* =====================
   END
===================== */
function endGame() {
  clearInterval(timer);
  stage = "end";
  canvas.style.display = "none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent = `Final Time: ${time}s`;
}
