/* =========================
   GLOBAL SETUP
========================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let playerName = "";
let time = 0;
let timer = null;

/* =========================
   LEADERBOARD
========================= */
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}

function saveScore(name, t) {
  const b = getBoard();
  b.push({ name, t });
  b.sort((a, b) => a.t - b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0, 5)));
}

function renderBoard(el) {
  el.innerHTML = "";
  getBoard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.t}s`;
    el.appendChild(li);
  });
}

renderBoard(document.getElementById("board"));

/* =========================
   START SCREEN
========================= */
document.getElementById("startBtn").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("startScreen").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;
  timer = setInterval(() => time++, 1000);
  initMaze();
};
/* =========================
   MAZE SYSTEM (FINAL FIX)
========================= */

const tile = 36;
let maze = [];
let rows, cols;
let startCell, endCell;

/* ---------- PLAYER (SPERM) ---------- */
const player = {
  x: 0,
  y: 0,
  r: 10,
  speed: 12
};

/* ---------- INIT MAZE ---------- */
function initMaze() {
  canvas.style.display = "block";

  rows = Math.floor(window.innerHeight / tile);
  cols = Math.floor(window.innerWidth / tile);

  // FORCE ODD GRID (REQUIRED)
  if (rows % 2 === 0) rows--;
  if (cols % 2 === 0) cols--;

  maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 1)
  );

  function carve(x, y) {
    const dirs = [
      [2,0],[-2,0],[0,2],[0,-2]
    ].sort(() => Math.random() - 0.5);

    for (let [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        ny > 0 && ny < rows - 1 &&
        nx > 0 && nx < cols - 1 &&
        maze[ny][nx] === 1
      ) {
        maze[ny][nx] = 0;
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  // START
  startCell = { x: 1, y: 1 };
  maze[startCell.y][startCell.x] = 0;
  carve(startCell.x, startCell.y);

  // END (CONNECTED BY DESIGN)
  endCell = { x: cols - 2, y: rows - 2 };
  maze[endCell.y][endCell.x] = 0;

  // PLAYER POSITION
  player.x = startCell.x * tile + tile / 2;
  player.y = startCell.y * tile + tile / 2;

  stage = "maze";
  mazeLoop();
}

/* ---------- DRAW MAZE ---------- */
function drawMaze() {
  ctx.fillStyle = "#4aa3df"; // corridors
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#0a3cff"; // walls
        ctx.fillRect(x * tile, y * tile, tile, tile);
      }
    }
  }

  // END TILE
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(
    endCell.x * tile,
    endCell.y * tile,
    tile,
    tile
  );
}

/* ---------- COLLISION ---------- */
function isWall(px, py) {
  const cx = Math.floor(px / tile);
  const cy = Math.floor(py / tile);
  if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return true;
  return maze[cy][cx] === 1;
}

/* ---------- MOVE ---------- */
function move(dx, dy) {
  if (!isWall(player.x + dx, player.y)) player.x += dx;
  if (!isWall(player.x, player.y + dy)) player.y += dy;
}

/* ---------- DRAW SPERM ---------- */
function drawSperm(x, y) {
  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // animated tail
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(
    x - 22,
    y + Math.sin(Date.now() / 120) * 5
  );
  ctx.stroke();
}

/* ---------- MAZE LOOP ---------- */
function mazeLoop() {
  if (stage !== "maze") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm(player.x, player.y);

  // WIN CHECK
  if (
    Math.floor(player.x / tile) === endCell.x &&
    Math.floor(player.y / tile) === endCell.y
  ) {
    stage = "questions";
    canvas.style.display = "none";
    document.getElementById("questions").classList.add("active");
    showQuestion();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

/* ---------- CONTROLS ---------- */
document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  if (e.key === "ArrowUp") move(0, -player.speed);
  if (e.key === "ArrowDown") move(0, player.speed);
  if (e.key === "ArrowLeft") move(-player.speed, 0);
  if (e.key === "ArrowRight") move(player.speed, 0);
});

/* =========================
   QUESTIONS
========================= */
const questions = [
  ["What is fertilization?",["Fusion of gametes","Cell division","Implantation"],0],
  ["Male gamete?",["Sperm","Egg","Zygote"],0],
  ["Female gamete?",["Egg","Sperm","Embryo"],0],
  ["Where fertilization occurs?",["Fallopian tube","Uterus","Vagina"],0],
  ["Chromosomes in humans?",["46","23","92"],0],
  ["Meiosis creates?",["Gametes","Organs","Skin"],0],
  ["Zygote is?",["Fertilized egg","Embryo","Gamete"],0],
  ["What protects fetus?",["Amniotic sac","Placenta","Cervix"],0],
  ["Where sperm produced?",["Testes","Ovaries","Uterus"],0],
  ["What implants?",["Blastocyst","Gamete","Ovum"],0]
];

let qi = 0;

function showQuestion() {
  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const ans = document.getElementById("answers");
  ans.innerHTML = "";

  q[1].forEach((t,i)=>{
    const b=document.createElement("button");
    b.textContent=t;
    b.onclick=()=>{
      time += i===q[2] ? -5 : 5;
      qi++;
      if (qi < questions.length) showQuestion();
      else startFlappyIntro();
    };
    ans.appendChild(b);
  });
}

// ---------- FLAPPY ----------
let flappyY, flappyVy;
let flappyStarted = false;
let pipes = [];
let flappyTimer = 0;

function startFlappy() {
  stage = "flappyIntro";
  canvas.style.display = "block";

  flappyY = canvas.height / 2;
  flappyVy = 0;
  pipes = [];
  flappyStarted = false;
  flappyTimer = 0;

  flappyLoop();
}

document.addEventListener("keydown", e => {
  if (e.key !== "ArrowUp") return;

  if (stage === "flappyIntro") {
    stage = "flappyPlaying";
    flappyStarted = true;
    flappyVy = -9;
  } 
  else if (stage === "flappyPlaying") {
    flappyVy = -9;
  }
});

function flappyLoop() {
  if (stage !== "flappyIntro" && stage !== "flappyPlaying") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background
  ctx.fillStyle = "#3fa9f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // instructions
  if (stage === "flappyIntro") {
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("Flappy Sperm", canvas.width / 2 - 160, canvas.height / 2 - 80);
    ctx.font = "26px Arial";
    ctx.fillText(
      "Press ↑ to start. Each 2 seconds = -1 time",
      canvas.width / 2 - 300,
      canvas.height / 2
    );
  }

  // physics
  if (stage === "flappyPlaying") {
    flappyVy += 0.5;
    flappyY += flappyVy;

    flappyTimer++;
    if (flappyTimer % 120 === 0) time--; // every 2 seconds
  }

  // spawn pipes
  if (stage === "flappyPlaying" && Math.random() < 0.02) {
    const gap = 200;
    const top = 100 + Math.random() * (canvas.height - gap - 200);
    pipes.push({ x: canvas.width, top });
  }

  // draw pipes
  ctx.fillStyle = "#0a3cff";
  pipes.forEach(p => {
    p.x -= 4;
    ctx.fillRect(p.x, 0, 60, p.top);
    ctx.fillRect(p.x, p.top + 200, 60, canvas.height);
  });

  // collision
  pipes.forEach(p => {
    if (
      120 > p.x && 120 < p.x + 60 &&
      (flappyY < p.top || flappyY > p.top + 200)
    ) {
      endGame();
    }
  });

  if (flappyY < 0 || flappyY > canvas.height) endGame();

  drawFlappySperm(120, flappyY);

  requestAnimationFrame(flappyLoop);
}

/* =====================
   DRAW FLAPPY SPERM
===================== */
function drawFlappySperm(x, y) {
  // head
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 30, y + Math.sin(Date.now() / 100) * 6);
  ctx.stroke();
}

/* =========================
   END
========================= */
function endGame(){
  clearInterval(timer);
  stage="end";
  canvas.style.display="none";
  saveScore(playerName,time);
  document.getElementById("finalTime").textContent=`Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
  document.getElementById("endScreen").classList.add("active");
}

document.getElementById("restartBtn").onclick=()=>location.reload();
