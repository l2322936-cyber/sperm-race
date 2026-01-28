/* =====================
   GLOBAL STATE
===================== */
let playerName = "";
let time = 0;
let stage = "start";

const startScreen = document.getElementById("startScreen");
const mazeCanvas = document.getElementById("mazeCanvas");
const questionScreen = document.getElementById("questionScreen");
const flappyIntro = document.getElementById("flappyIntro");
const flappyCanvas = document.getElementById("flappyCanvas");
const endScreen = document.getElementById("endScreen");

const mCtx = mazeCanvas.getContext("2d");
const fCtx = flappyCanvas.getContext("2d");

/* =====================
   MAZE (NEW – COMPLEX & SOLVABLE)
===================== */

mazeCanvas.width = window.innerWidth;
mazeCanvas.height = window.innerHeight;

const TILE = 60;
const MAZE = [
  "111111111111111111111",
  "100000100000000000001",
  "101110101111111011101",
  "101000101000001010001",
  "101011101011101011101",
  "101010001010001010001",
  "101010111010111011101",
  "100010000010000000001",
  "111011111110111111101",
  "100000000000000000001",
  "101111111111111111101",
  "100000000000000000001",
  "111111111111111111111"
];

const mazeOffsetX =
  (mazeCanvas.width - MAZE[0].length * TILE) / 2;
const mazeOffsetY =
  (mazeCanvas.height - MAZE.length * TILE) / 2;

const mazeWalls = [];

MAZE.forEach((row, y) => {
  [...row].forEach((cell, x) => {
    if (cell === "1") {
      mazeWalls.push({
        x: mazeOffsetX + x * TILE,
        y: mazeOffsetY + y * TILE,
        w: TILE,
        h: TILE
      });
    }
  });
});

let sperm = {
  x: mazeOffsetX + TILE * 1.5,
  y: mazeOffsetY + TILE * 1.5,
  vx: 0,
  vy: 0
};

document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  sperm.vx = sperm.vy = 0;
  if (e.key === "ArrowUp") sperm.vy = -12;
  if (e.key === "ArrowDown") sperm.vy = 12;
  if (e.key === "ArrowLeft") sperm.vx = -12;
  if (e.key === "ArrowRight") sperm.vx = 12;
});

function wallCollision(nx, ny) {
  return mazeWalls.some(w =>
    nx + 10 > w.x &&
    nx - 10 < w.x + w.w &&
    ny + 10 > w.y &&
    ny - 10 < w.y + w.h
  );
}

function drawMazeSperm(ctx, x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(
    x - 35,
    y + Math.sin(Date.now() / 120) * 8
  );
  ctx.stroke();
}

function mazeLoop() {
  stage = "maze";

  // darker light-blue corridor
  mCtx.fillStyle = "#b6e3ff";
  mCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  mazeWalls.forEach(w => {
    mCtx.fillStyle = "#0830aa";
    mCtx.fillRect(w.x, w.y, w.w, w.h);
  });

  const nx = sperm.x + sperm.vx;
  const ny = sperm.y + sperm.vy;

  if (!wallCollision(nx, sperm.y)) sperm.x = nx;
  if (!wallCollision(sperm.x, ny)) sperm.y = ny;

  drawMazeSperm(mCtx, sperm.x, sperm.y);

  // END POINT (right side exit)
  if (
    sperm.x >
    mazeOffsetX + MAZE[0].length * TILE - TILE / 2
  ) {
    mazeCanvas.style.display = "none";
    startQuestions();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

function startMaze() {
  mazeCanvas.style.display = "block";
  mazeLoop();
}

/* =====================
   QUESTIONS
===================== */
const questions = [
  { q:"Why does sexual reproduction increase diversity?", a:["Allele mixing","Faster growth","Energy savings"], c:0 },
  { q:"Why are eggs larger than sperm?", a:["Nutrients","Speed","DNA size"], c:0 },
  { q:"Why is meiosis important?", a:["Variation","Repair","Growth"], c:0 },
  { q:"Why do many sperm fail?", a:["Competition","Mutation","Age"], c:0 },
  { q:"Why is timing critical in fertilization?", a:["Short lifespan","Cell division","Hormones"], c:0 },
  { q:"Why does internal fertilization help survival?", a:["Protection","Speed","Quantity"], c:0 },
  { q:"Why is motility important for sperm?", a:["Reach egg","Mutation","Respiration"], c:0 },
  { q:"Why does diversity aid survival?", a:["Adaptation","Strength","Energy"], c:0 },
  { q:"Why produce many gametes?", a:["Low survival","Efficiency","Growth"], c:0 },
  { q:"Why does fertilization fail often?", a:["Environment","DNA","Age"], c:0 }
];

let qi = 0;

function startQuestions() {
  questionScreen.style.display = "block";
  showQuestion();
}

function showQuestion() {
  if (qi >= questions.length) {
    questionScreen.style.display = "none";
    startFlappyIntro();
    return;
  }

  const q = questions[qi];
  questionScreen.innerHTML = `<h1>${q.q}</h1>`;

  q.a.forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = ans;
    btn.onclick = () => {
      time += (i === q.c ? -5 : 5);
      qi++;
      showQuestion();
    };
    questionScreen.appendChild(btn);
  });
}

/* =====================
   FLAPPY SPERM
===================== */
flappyCanvas.width = window.innerWidth;
flappyCanvas.height = window.innerHeight;

let fy = flappyCanvas.height / 2;
let vy = 0;
let pipes = [];
let frame = 0;
let flappyStarted = false;

function startFlappyIntro() {
  flappyIntro.style.display = "block";
}

document.addEventListener("keydown", e => {
  if (stage === "flappy" && e.key === "ArrowUp") vy = -8;
  if (flappyIntro.style.display === "block" && e.key === "ArrowUp") {
    flappyIntro.style.display = "none";
    flappyCanvas.style.display = "block";
    stage = "flappy";
    flappyLoop();
  }
});

function spawnPipe() {
  const gap = 200;
  const top = Math.random() * (flappyCanvas.height - gap - 100) + 50;
  pipes.push({ x: flappyCanvas.width, top, bottom: top + gap });
}

function flappyLoop() {
  frame++;
  if (frame % 120 === 0) {
    spawnPipe();
    time--;
  }

  vy += 0.5;
  fy += vy;

  fCtx.fillStyle = "#d6f2ff";
  fCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  pipes.forEach(p => {
    p.x -= 4;
    fCtx.fillStyle = "#0a3cff";
    fCtx.fillRect(p.x, 0, 60, p.top);
    fCtx.fillRect(p.x, p.bottom, 60, flappyCanvas.height);

    if (100 > p.x && 100 < p.x + 60 &&
       (fy < p.top || fy > p.bottom)) endGame();
  });

  drawSperm(fCtx, 100, fy);

  if (fy < 0 || fy > flappyCanvas.height) endGame();
  requestAnimationFrame(flappyLoop);
}

function endGame() {
  flappyCanvas.style.display = "none";
  endScreen.style.display = "block";
  document.getElementById("finalTime").textContent =
    `${playerName}'s Time: ${time}s`;
}
