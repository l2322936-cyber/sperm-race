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

/* =====================
   QUESTIONS SYSTEM
===================== */

const questions = [
  {
    q: "Why does fertilization usually happen in the fallopian tube instead of the uterus?",
    a: ["Chemical signals guide sperm there", "The egg never enters the uterus", "Sperm cannot survive in the uterus"],
    c: 0
  },
  {
    q: "What advantage does internal fertilization give mammals?",
    a: ["More offspring at once", "Higher survival rate of embryos", "Faster reproduction"],
    c: 1
  },
  {
    q: "Why do humans produce millions of sperm for a single egg?",
    a: ["Most sperm are defective or lost", "Eggs reject most sperm", "Sperm expire instantly"],
    c: 0
  },
  {
    q: "How does meiosis increase genetic diversity?",
    a: ["Creates identical cells", "Mixes and reshuffles genes", "Removes mutations"],
    c: 1
  },
  {
    q: "Why is timing critical in fertilization?",
    a: ["Eggs survive briefly after release", "Sperm live only minutes", "Hormones block fertilization"],
    c: 0
  },
  {
    q: "Why is the amniotic sac important?",
    a: ["It feeds the fetus", "It cushions and protects the fetus", "It controls genetics"],
    c: 1
  },
  {
    q: "Why don’t all fertilized eggs implant successfully?",
    a: ["Genetic abnormalities", "Lack of sperm", "Low oxygen"],
    c: 0
  },
  {
    q: "Why is sexual reproduction slower than asexual reproduction?",
    a: ["Needs two parents and gametes", "Cells divide slower", "Embryos grow slower"],
    c: 0
  },
  {
    q: "Why does fertilization trigger rapid cell division?",
    a: ["To form specialized tissues", "To avoid immune response", "To reduce mutations"],
    c: 0
  },
  {
    q: "What evolutionary benefit comes from genetic variation?",
    a: ["More identical offspring", "Greater survival in changing environments", "Faster reproduction"],
    c: 1
  }
];

let qIndex = 0;

/* START QUESTIONS */
function startQuestions() {
  stage = "questions";
  canvas.style.display = "none";

  const qBox = document.getElementById("questions");
  qBox.classList.add("active");

  qIndex = 0;
  showQuestion();
}

/* SHOW QUESTION */
function showQuestion() {
  const qBox = document.getElementById("questions");
  const qText = document.getElementById("qText");
  const answers = document.getElementById("answers");

  const current = questions[qIndex];
  qText.textContent = current.q;

  answers.innerHTML = "";

  current.a.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.textContent = text;

    btn.onclick = () => {
      if (i === current.c) {
        time -= 5;
      } else {
        time += 5;
      }

      qIndex++;

      if (qIndex < questions.length) {
        showQuestion();
      } else {
        endQuestions();
      }
    };

    answers.appendChild(btn);
  });
}

/* END QUESTIONS */
function endQuestions() {
  document.getElementById("questions").classList.remove("active");
  startFlappyIntro();
}
/* =====================
   FLAPPY SPERM (FIXED)
===================== */

let flappyActive = false;
let flappyIntro = true;

let flappyY;
let flappyVY;
let flappyPipes = [];

const PIPE_WIDTH = 60;
const PIPE_GAP = 260;
const PIPE_SPACING = 320;

/* ---------- START FLAPPY ---------- */

function startFlappyIntro() {
  stage = "flappyIntro";
  flappyIntro = true;
  flappyActive = false;

  flappyY = canvas.height / 2;
  flappyVY = 0;
  flappyPipes = [];

  flappyRender();
}

function startFlappyGame() {
  stage = "flappy";
  flappyIntro = false;
  flappyActive = true;

  flappyVY = -6; // immediate lift so it never dies instantly
  flappyLoop();
}

/* ---------- CONTROLS ---------- */

document.addEventListener("keydown", e => {
  if (stage === "flappyIntro" && e.key === "ArrowUp") {
    startFlappyGame();
  }

  if (stage === "flappy" && e.key === "ArrowUp") {
    flappyVY = -7;
  }
});

/* ---------- DRAW SPERM ---------- */

function drawFlappySperm(x, y) {
  ctx.fillStyle = "#ffffff";

  ctx.beginPath();
  ctx.ellipse(x, y, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 32, y + Math.sin(Date.now() / 120) * 6);
  ctx.stroke();
}

/* ---------- RENDER ---------- */

function flappyRender() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#7fbfff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (stage === "flappyIntro") {
    ctx.fillStyle = "#ffffff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("FLAPPY SPERM", canvas.width / 2, canvas.height / 2 - 80);

    ctx.font = "24px Arial";
    ctx.fillText(
      "Survive to remove time from your score.",
      canvas.width / 2,
      canvas.height / 2 - 20
    );
    ctx.fillText(
      "Press ↑ to begin",
      canvas.width / 2,
      canvas.height / 2 + 40
    );

    requestAnimationFrame(flappyRender);
  }
}

/* ---------- GAME LOOP ---------- */

function flappyLoop() {
  if (!flappyActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#7fbfff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // physics
  flappyVY += 0.4;
  flappyY += flappyVY;

  // clamp so it never vanishes instantly
  flappyY = Math.max(20, Math.min(canvas.height - 20, flappyY));

  // time reward
  if (Date.now() % 2000 < 20) {
    time = Math.max(0, time - 1);
  }

  // spawn pipes safely
  if (
    flappyPipes.length === 0 ||
    flappyPipes[flappyPipes.length - 1].x < canvas.width - PIPE_SPACING
  ) {
    const gapTop =
      150 + Math.random() * (canvas.height - PIPE_GAP - 300);

    flappyPipes.push({
      x: canvas.width,
      gap: gapTop
    });
  }

  ctx.fillStyle = "#0a3d91";
  flappyPipes.forEach(p => {
    p.x -= 3.5;

    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gap);
    ctx.fillRect(
      p.x,
      p.gap + PIPE_GAP,
      PIPE_WIDTH,
      canvas.height
    );

    // collision
    if (
      150 + 14 > p.x &&
      150 - 14 < p.x + PIPE_WIDTH &&
      (flappyY - 9 < p.gap ||
        flappyY + 9 > p.gap + PIPE_GAP)
    ) {
      flappyActive = false;
      endGame();
    }
  });

  drawFlappySperm(150, flappyY);

  requestAnimationFrame(flappyLoop);
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
