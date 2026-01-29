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
   LEADERBOARD (FIXED)
========================= */

function saveScore(name, time) {
  const scores =
    JSON.parse(localStorage.getItem("spermLeaderboard")) || [];

  scores.push({ name, time });

  scores.sort((a, b) => a.time - b.time);

  localStorage.setItem(
    "spermLeaderboard",
    JSON.stringify(scores.slice(0, 5))
  );
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard");
  if (!list) return;

  list.innerHTML = "";

  const scores =
    JSON.parse(localStorage.getItem("spermLeaderboard")) || [];

  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.time}s`;
    list.appendChild(li);
  });
}

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
/* =========================
   FLAPPY SPERM (PIPE FIXED)
========================= */

let flappyY;
let flappyVY;
let flappyPipes = [];
let flappyStarted = false;
let flappyLastTime = Date.now();

const PIPE_WIDTH = 60;
const PIPE_GAP = 260;          // LARGE, safe gap
const PIPE_SPACING = 340;     // distance between pipes
const PIPE_SPEED = 4;

function startFlappyIntro() {
  stage = "flappyIntro";
  canvas.style.display = "block";
  flappyStarted = false;

  flappyY = canvas.height / 2;
  flappyVY = 0;
  flappyPipes = [];
  flappyLastTime = Date.now();

  flappyIntroLoop();
}

function flappyIntroLoop() {
  if (stage !== "flappyIntro") return;

  ctx.fillStyle = "#5bbcff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "52px Arial";
  ctx.fillText("Flappy Sperm", canvas.width / 2, canvas.height / 2 - 80);

  ctx.font = "26px Arial";
  ctx.fillText(
    "Use the ↑ arrow to fly",
    canvas.width / 2,
    canvas.height / 2 - 10
  );
  ctx.fillText(
    "Once you press ↑, the game begins",
    canvas.width / 2,
    canvas.height / 2 + 30
  );

  requestAnimationFrame(flappyIntroLoop);
}

/* ---------- CONTROLS ---------- */

document.addEventListener("keydown", e => {
  if (e.key !== "ArrowUp") return;

  if (stage === "flappyIntro") {
    stage = "flappy";
    flappyStarted = true;
    flappyLastTime = Date.now();
    flappyLoop();
    return;
  }

  if (stage === "flappy") {
    flappyVY = -9;
  }
});

/* ---------- GAME LOOP ---------- */

function flappyLoop() {
  if (stage !== "flappy") return;

  ctx.fillStyle = "#5bbcff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // gravity
  flappyVY += 0.45;
  flappyY += flappyVY;

  // spawn pipes ONLY if spaced far enough
  if (
    flappyPipes.length === 0 ||
    flappyPipes[flappyPipes.length - 1].x <
      canvas.width - PIPE_SPACING
  ) {
    const gapTop =
      140 + Math.random() * (canvas.height - PIPE_GAP - 280);

    flappyPipes.push({
      x: canvas.width,
      gap: gapTop
    });
  }

  // draw pipes
  ctx.fillStyle = "#0a3d91";
  flappyPipes.forEach(p => {
    p.x -= PIPE_SPEED;

    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.gap);
    ctx.fillRect(
      p.x,
      p.gap + PIPE_GAP,
      PIPE_WIDTH,
      canvas.height
    );
  });

  drawFlappySperm();

  // collisions
  flappyPipes.forEach(p => {
    if (
      140 + 14 > p.x &&
      140 - 14 < p.x + PIPE_WIDTH &&
      (flappyY - 9 < p.gap ||
        flappyY + 9 > p.gap + PIPE_GAP)
    ) {
      endGame();
    }
  });

  // out of bounds
  if (flappyY < 0 || flappyY > canvas.height) {
    endGame();
  }

  // time reduction (every 2s = -1s)
  if (Date.now() - flappyLastTime >= 2000) {
    time = Math.max(0, time - 1);
    flappyLastTime = Date.now();
  }

  requestAnimationFrame(flappyLoop);
}

/* ---------- SPERM DRAW ---------- */

function drawFlappySperm() {
  const x = 140;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x, flappyY, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, flappyY);
  ctx.lineTo(
    x - 34,
    flappyY + Math.sin(Date.now() / 120) * 7
  );
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
   renderLeaderboard();
  document.getElementById("finalTime").textContent=`Time: ${time}s`;
  renderLeaderboard();
  document.getElementById("endScreen").classList.add("active");
}

document.getElementById("restartBtn").onclick=()=>location.reload();
