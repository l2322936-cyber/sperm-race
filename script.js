const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= GLOBAL ================= */
let playerName = "";
let time = 0;
let timer;
let stage = "start";

/* ================= LEADERBOARD ================= */
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

/* ================= START ================= */
document.getElementById("startBtn").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;
  timer = setInterval(() => time++, 1000);
  mazeLoop();
};

/* ================= MAZE ================= */
// SOLVABLE BLUEPRINT MAZE
const tile = 40;
const maze = [
"1111111111111111111",
"1S00000000000100001",
"1011111111111011101",
"1000000000001000001",
"1110111111101110101",
"1000100000100000101",
"1011101110101111101",
"1010000010101000001",
"1010111010101011111",
"10000000100000000E1",
"1111111111111111111"
];

const rows = maze.length;
const cols = maze[0].length;

canvas.width = cols * tile;
canvas.height = rows * tile;

let startPos, endPos;

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (maze[y][x] === "S") startPos = { x, y };
    if (maze[y][x] === "E") endPos = { x, y };
  }
}

const sperm = {
  x: startPos.x * tile + tile / 2,
  y: startPos.y * tile + tile / 2,
  speed: 8
};

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === "1") {
        ctx.fillStyle = "#1e90ff";
        ctx.fillRect(x * tile, y * tile, tile, tile);
      }
    }
  }
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(endPos.x * tile, endPos.y * tile, tile, tile);
}

function drawSperm(px = sperm.x, py = sperm.y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(px, py, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px - 14, py);
  ctx.lineTo(px - 30, py + Math.sin(Date.now() / 100) * 6);
  ctx.stroke();
}

function isWall(px, py) {
  const c = Math.floor(px / tile);
  const r = Math.floor(py / tile);
  return maze[r]?.[c] === "1";
}

document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  let dx = 0, dy = 0;
  if (e.key === "ArrowUp") dy = -sperm.speed;
  if (e.key === "ArrowDown") dy = sperm.speed;
  if (e.key === "ArrowLeft") dx = -sperm.speed;
  if (e.key === "ArrowRight") dx = sperm.speed;
  if (!isWall(sperm.x + dx, sperm.y)) sperm.x += dx;
  if (!isWall(sperm.x, sperm.y + dy)) sperm.y += dy;
});

function mazeLoop() {
  if (stage !== "maze") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm();
  if (
    Math.floor(sperm.x / tile) === endPos.x &&
    Math.floor(sperm.y / tile) === endPos.y
  ) {
    stage = "questions";
    document.getElementById("questions").classList.add("active");
    showQuestion();
    return;
  }
  requestAnimationFrame(mazeLoop);
}

/* ================= QUESTIONS ================= */
const questions = [
["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
["Where is sperm made?", ["Testes","Ovaries","Uterus"],0],
["Egg cells are called?", ["Ova","Zygotes","Embryos"],0],
["Chromosomes in humans?", ["46","23","92"],0],
["Where fertilization occurs?", ["Fallopian tube","Uterus","Vagina"],0],
["What protects fetus?", ["Amniotic sac","Placenta","Cervix"],0],
["Meiosis produces?", ["Gametes","Organs","Skin cells"],0],
["Male gamete?", ["Sperm","Egg","Zygote"],0],
["Female gamete?", ["Egg","Sperm","Embryo"],0],
["Zygote means?", ["Fertilized egg","Embryo","Gamete"],0]
];

let qi = 0;

function showQuestion() {
  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";
  q[1].forEach((txt, i) => {
    const b = document.createElement("button");
    b.textContent = txt;
    b.onclick = () => {
      time += i === q[2] ? -5 : 5;
      qi++;
      qi < questions.length ? showQuestion() : startFlappy();
    };
    a.appendChild(b);
  });
}

/* ================= FLAPPY SPERM ================= */
let fy, fvy, pipes, started = false;

function startFlappy() {
  document.getElementById("questions").classList.remove("active");
  document.getElementById("flappyInfo").classList.add("active");
  stage = "flappyInfo";
  clearInterval(timer);
}

document.addEventListener("keydown", e => {
  if (stage === "flappyInfo") {
    document.getElementById("flappyInfo").classList.remove("active");
    canvas.style.display = "block";
    stage = "flappy";
    timer = setInterval(() => time--, 2000);
    fy = canvas.height / 2;
    fvy = 0;
    pipes = [];
    flappyLoop();
  }
  if (stage === "flappy" && e.key === "ArrowUp") fvy = -8;
});

function flappyLoop() {
  if (stage !== "flappy") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fvy += 0.4;
  fy += fvy;
  drawSperm(150, fy);

  if (Math.random() < 0.02) {
    pipes.push({ x: canvas.width, gap: 200 + Math.random() * 200 });
  }

  pipes.forEach(p => {
    p.x -= 5;
    ctx.fillRect(p.x, 0, 40, p.gap - 120);
    ctx.fillRect(p.x, p.gap + 120, 40, canvas.height);
  });

  if (fy < 0 || fy > canvas.height) return endGame();
  requestAnimationFrame(flappyLoop);
}

/* ================= END ================= */
function endGame() {
  clearInterval(timer);
  saveScore(playerName, time);
  canvas.style.display = "none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent = `Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
}
