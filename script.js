/* =====================
   CANVAS
===================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* =====================
   GLOBAL STATE
===================== */
let playerName = "";
let time = 0;
let timer = null;
let stage = "start";
let gameActive = false;

/* =====================
   LEADERBOARD
===================== */
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}
function saveScore(n, t) {
  const b = getBoard();
  b.push({ n, t });
  b.sort((a, b) => a.t - b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0, 5)));
}
function renderBoard(el) {
  el.innerHTML = "";
  getBoard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.n} — ${s.t}s`;
    el.appendChild(li);
  });
}
renderBoard(document.getElementById("board"));

/* =====================
   START GAME
===================== */
function startGame() {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("start").classList.remove("active");

  stage = "maze";
  gameActive = true;
  time = 0;

  clearInterval(timer);
  timer = setInterval(() => time++, 1000);

  initMaze();
  canvas.style.display = "block";
  mazeLoop();
}

/* =====================
   MAZE DATA (SOLVABLE)
===================== */
const tileSize = 40;

const mazeMap = [
  "1111111111111111",
  "1S00000000100001",
  "1011111111010101",
  "1000000010010101",
  "1110111011110101",
  "1000100000000101",
  "1011101111111101",
  "1010001000000001",
  "1010111011111101",
  "10000000100000E1",
  "1111111111111111"
];

const rows = mazeMap.length;
const cols = mazeMap[0].length;

let startPos = { x: 1, y: 1 };
let endPos = { x: 14, y: 9 };

/* =====================
   PLAYER
===================== */
const player = {
  x: 0,
  y: 0,
  speed: 6
};

function initMaze() {
  canvas.width = cols * tileSize;
  canvas.height = rows * tileSize;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mazeMap[y][x] === "S") startPos = { x, y };
      if (mazeMap[y][x] === "E") endPos = { x, y };
    }
  }

  player.x = startPos.x * tileSize + tileSize / 2;
  player.y = startPos.y * tileSize + tileSize / 2;
}

/* =====================
   DRAW
===================== */
function drawMaze() {
  ctx.fillStyle = "#001f7a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mazeMap[y][x] === "1") {
        ctx.fillStyle = "#0a4cff";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  ctx.fillStyle = "#00ff99";
  ctx.fillRect(endPos.x * tileSize, endPos.y * tileSize, tileSize, tileSize);
}

function drawSperm(x = player.x, y = player.y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 30, y + Math.sin(Date.now() / 120) * 6);
  ctx.stroke();
}

/* =====================
   COLLISION
===================== */
function isWall(px, py) {
  const c = Math.floor(px / tileSize);
  const r = Math.floor(py / tileSize);
  if (r < 0 || c < 0 || r >= rows || c >= cols) return true;
  return mazeMap[r][c] === "1";
}

function movePlayer(dx, dy) {
  if (!isWall(player.x + dx, player.y)) player.x += dx;
  if (!isWall(player.x, player.y + dy)) player.y += dy;
}

/* =====================
   MAZE LOOP
===================== */
function mazeLoop() {
  if (stage !== "maze") return;
  drawMaze();
  drawSperm();
  checkMazeWin();
  requestAnimationFrame(mazeLoop);
}

function checkMazeWin() {
  const cx = Math.floor(player.x / tileSize);
  const cy = Math.floor(player.y / tileSize);
  if (cx === endPos.x && cy === endPos.y) {
    gameActive = false;
    startQuestions();
  }
}

/* =====================
   CONTROLS
===================== */
document.addEventListener("keydown", e => {
  if (!gameActive || stage !== "maze") return;
  if (e.key === "ArrowUp") movePlayer(0, -player.speed);
  if (e.key === "ArrowDown") movePlayer(0, player.speed);
  if (e.key === "ArrowLeft") movePlayer(-player.speed, 0);
  if (e.key === "ArrowRight") movePlayer(player.speed, 0);
});

/* =====================
   QUESTIONS
===================== */
const questions = [
  ["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
  ["Where is sperm produced?",["Testes","Ovaries","Uterus"],0],
  ["Female gamete?",["Egg","Sperm","Zygote"],0],
  ["Human chromosomes?",["46","23","92"],0],
  ["Where fertilization occurs?",["Fallopian tube","Uterus","Vagina"],0],
  ["Zygote is?",["Fertilized egg","Embryo","Gamete"],0],
  ["Gametes made by?",["Meiosis","Mitosis","Diffusion"],0],
  ["Protects fetus?",["Amniotic sac","Placenta","Ovary"],0],
  ["Male gamete?",["Sperm","Egg","Embryo"],0],
  ["DNA stands for?",["Deoxyribonucleic acid","Dual nucleus acid","Dynamic RNA"],0]
];

let qIndex = 0;

function startQuestions() {
  stage = "questions";
  qIndex = 0;
  document.getElementById("questions").classList.add("active");
  showQuestion();
}

function showQuestion() {
  const q = questions[qIndex];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";

  q[1].forEach((txt, i) => {
    const btn = document.createElement("button");
    btn.textContent = txt;
    btn.onclick = () => {
      time += i === q[2] ? -10 : 10;
      qIndex++;
      qIndex < questions.length ? showQuestion() : startFlappy();
    };
    a.appendChild(btn);
  });
}

/* =====================
   FLAPPY
===================== */
let fy, fvy, pipes, distance;
const FLAPPY_X = 200;

function startFlappy() {
  document.getElementById("questions").classList.remove("active");
  stage = "flappy";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  fy = canvas.height / 2;
  fvy = 0;
  pipes = [];
  distance = 0;

  flappyLoop();
}

document.addEventListener("keydown", e => {
  if (stage === "flappy" && e.key === "ArrowUp") fvy = -8;
});

function flappyLoop() {
  if (stage !== "flappy") return;

  ctx.fillStyle = "#001f7a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  distance++;
  if (distance % 60 === 0) time -= Math.floor(distance / 600);

  fvy += 0.5;
  fy += fvy;

  drawSperm(FLAPPY_X, fy);

  if (Math.random() < 0.02 + distance / 25000) {
    pipes.push({ x: canvas.width, gap: 160 - distance / 300 });
  }

  pipes.forEach(p => {
    p.x -= 4 + distance / 2000;
    ctx.fillStyle = "#0a4cff";
    ctx.fillRect(p.x, 0, 50, canvas.height / 2 - p.gap);
    ctx.fillRect(p.x, canvas.height / 2 + p.gap, 50, canvas.height);

    if (
      p.x < FLAPPY_X + 14 &&
      p.x + 50 > FLAPPY_X - 14 &&
      (fy < canvas.height / 2 - p.gap || fy > canvas.height / 2 + p.gap)
    ) endGame();
  });

  if (fy < 0 || fy > canvas.height) endGame();
  requestAnimationFrame(flappyLoop);
}

/* =====================
   END
===================== */
function endGame() {
  clearInterval(timer);
  saveScore(playerName, time);
  stage = "end";
  canvas.style.display = "none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent = `Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
}
