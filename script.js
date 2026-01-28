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
   START SCREEN
===================== */
startScreen.style.display = "block";

document.getElementById("startBtn").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Player";
  time = 0;
  startScreen.style.display = "none";
  startMaze();
};

/* =====================
   MAZE
===================== */
mazeCanvas.width = window.innerWidth;
mazeCanvas.height = window.innerHeight;

const CELL = 80;
const mazeMap = [
  "111111111111111",
  "100000000000001",
  "101111111111101",
  "101000000001101",
  "101011111101101",
  "101010000101101",
  "101010111101101",
  "100010100001001",
  "111110101111101",
  "100000100000001",
  "111111111111111"
];

const walls = [];
mazeMap.forEach((row, y) => {
  [...row].forEach((c, x) => {
    if (c === "1") {
      walls.push({ x: x * CELL, y: y * CELL, w: CELL, h: CELL });
    }
  });
});

let sperm = { x: CELL + 40, y: CELL + 40, vx: 0, vy: 0 };

function collide(nx, ny) {
  return walls.some(w =>
    nx > w.x - 12 &&
    nx < w.x + w.w + 12 &&
    ny > w.y - 12 &&
    ny < w.y + w.h + 12
  );
}

document.addEventListener("keydown", e => {
  sperm.vx = sperm.vy = 0;
  if (e.key === "ArrowUp") sperm.vy = -12;
  if (e.key === "ArrowDown") sperm.vy = 12;
  if (e.key === "ArrowLeft") sperm.vx = -12;
  if (e.key === "ArrowRight") sperm.vx = 12;
});

function drawSperm(ctx, x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x - 40, y + Math.sin(Date.now() / 120) * 10);
  ctx.stroke();
}

function mazeLoop() {
  mCtx.fillStyle = "#d6f2ff";
  mCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  walls.forEach(w => {
    mCtx.fillStyle = "#0a3cff";
    mCtx.fillRect(w.x, w.y, w.w, w.h);
  });

  const nx = sperm.x + sperm.vx;
  const ny = sperm.y + sperm.vy;
  if (!collide(nx, sperm.y)) sperm.x = nx;
  if (!collide(sperm.x, ny)) sperm.y = ny;

  drawSperm(mCtx, sperm.x, sperm.y);

  if (sperm.x > mazeCanvas.width - CELL) {
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
