/* =========================
   GLOBAL STATE
========================= */
let playerName = "";
let time = 0;
let timer = null;
let stage = 0;

const game = document.getElementById("game");
const mazeCanvas = document.getElementById("mazeCanvas");
const mazeCtx = mazeCanvas.getContext("2d");
const flappyCanvas = document.getElementById("flappyCanvas");
const flappyCtx = flappyCanvas.getContext("2d");

let leaderboard = JSON.parse(localStorage.getItem("spermLeaderboard")) || [];

/* =========================
   TIMER
========================= */
function startTimer() {
  timer = setInterval(() => time += 0.1, 100);
}
function stopTimer() {
  clearInterval(timer);
}

/* =========================
   REALISTIC SPERM DRAW
========================= */
function drawSperm(ctx, x, y, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // midpiece
  ctx.fillRect(-18, -3, 6, 6);

  // tail (animated)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.quadraticCurveTo(
    -35,
    Math.sin(Date.now() / 100) * 8,
    -60,
    0
  );
  ctx.stroke();

  ctx.restore();
}

/* =========================
   QUESTIONS (FULL SCREEN)
========================= */
const questions = [
  {
    q: "What is the primary function of sperm?",
    a: ["Produce hormones", "Deliver genetic material", "Create eggs", "Protect the uterus"],
    c: 1
  },
  {
    q: "Where does fertilization usually occur?",
    a: ["Uterus", "Ovary", "Fallopian tube", "Cervix"],
    c: 2
  },
  {
    q: "How many chromosomes does a sperm cell contain?",
    a: ["46", "23", "92", "12"],
    c: 1
  },
  {
    q: "Why are millions of sperm released?",
    a: ["They reproduce", "Most do not survive", "To fertilize multiple eggs", "They are weak"],
    c: 1
  },
  {
    q: "What structure helps sperm swim?",
    a: ["Nucleus", "Acrosome", "Flagellum", "Mitochondria"],
    c: 2
  }
];

function showQuestion(i) {
  game.innerHTML = `
    <div style="
      width:100%;
      height:100%;
      padding:60px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      text-align:center;">
      <h1 style="font-size:3rem; max-width:1000px;">${questions[i].q}</h1>
      ${questions[i].a.map((ans, n) =>
        `<button style="font-size:1.8rem; padding:20px 50px; margin:15px;"
          onclick="answerQuestion(${n}, ${i})">${ans}</button>`
      ).join("")}
    </div>
  `;
}

function answerQuestion(choice, i) {
  time += choice === questions[i].c ? -10 : 10;
  nextStage();
}

/* =========================
   MAZE (COMPLEX + SOLVABLE)
   GRID-BASED
========================= */
const cellSize = 50;
const mazeCols = 18;
const mazeRows = 11;

// 0 = open, 1 = wall
const mazeGrid = [
  [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0],
  [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0],
  [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0],
  [1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1,0],
  [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

let sperm = { x: 25, y: 25, speed: 8 };

function drawMaze() {
  mazeCtx.clearRect(0,0,mazeCanvas.width,mazeCanvas.height);

  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      if (mazeGrid[r][c] === 1) {
        mazeCtx.fillStyle = "#222";
        mazeCtx.fillRect(c*cellSize, r*cellSize, cellSize, cellSize);
      }
    }
  }

  // exit
  mazeCtx.fillStyle = "lime";
  mazeCtx.fillRect(17*cellSize+10, 10*cellSize+10, 30, 30);

  drawSperm(mazeCtx, sperm.x, sperm.y);
}

function canMove(nx, ny) {
  const col = Math.floor(nx / cellSize);
  const row = Math.floor(ny / cellSize);
  return mazeGrid[row] && mazeGrid[row][col] === 0;
}

document.addEventListener("keydown", e => {
  if (stage !== 1) return;

  let nx = sperm.x;
  let ny = sperm.y;

  if (e.key === "w") ny -= sperm.speed;
  if (e.key === "s") ny += sperm.speed;
  if (e.key === "a") nx -= sperm.speed;
  if (e.key === "d") nx += sperm.speed;

  if (canMove(nx, ny)) {
    sperm.x = nx;
    sperm.y = ny;
  }

  if (Math.floor(sperm.x / cellSize) === 17 &&
      Math.floor(sperm.y / cellSize) === 10) {
    nextStage();
  }

  drawMaze();
});

/* =========================
   FLAPPY SPERM
========================= */
let flappyY = 275;
let velocity = 0;
let pipes = [];
let flappyRunning = false;

function startFlappy() {
  flappyCanvas.style.display = "block";
  flappyRunning = true;
  pipes = [];
  velocity = 0;
  loopFlappy();
}

function loopFlappy() {
  if (!flappyRunning) return;

  flappyCtx.clearRect(0,0,900,550);
  velocity += 0.5;
  flappyY += velocity;

  if (Math.random() < 0.02) {
    pipes.push({ x: 900, gap: 200 + Math.random()*150 });
  }

  pipes.forEach(p => {
    p.x -= 3;
    flappyCtx.fillStyle = "#222";
    flappyCtx.fillRect(p.x, 0, 60, p.gap - 80);
    flappyCtx.fillRect(p.x, p.gap + 80, 60, 550);
  });

  drawSperm(flappyCtx, 150, flappyY);

  requestAnimationFrame(loopFlappy);
}

document.addEventListener("keydown", e => {
  if (stage === 7 && e.key === "ArrowUp") velocity = -8;
});

/* =========================
   FLOW
========================= */
function nextStage() {
  stage++;

  if (stage === 1) {
    game.innerHTML = "<h1>ESCAPE THE MAZE</h1>";
    mazeCanvas.style.display = "block";
    drawMaze();
  }
  if (stage >= 2 && stage <= 6) showQuestion(stage - 2);
  if (stage === 7) {
    game.innerHTML = "<h1>FLAPPY SPERM</h1><p>Press ↑ to swim</p>";
    startFlappy();
  }
  if (stage === 8) endGame();
}

function endGame() {
  stopTimer();
  leaderboard.push({ name: playerName, time: time.toFixed(1) });
  leaderboard.sort((a,b)=>a.time-b.time);
  leaderboard = leaderboard.slice(0,5);
  localStorage.setItem("spermLeaderboard", JSON.stringify(leaderboard));

  game.innerHTML = `
    <h1>Finished!</h1>
    <h2>${playerName} — ${time.toFixed(1)}s</h2>
    <h3>Leaderboard</h3>
    ${leaderboard.map(l=>`<p>${l.name}: ${l.time}s</p>`).join("")}
    <button onclick="location.reload()">Restart</button>
  `;
}

/* =========================
   START
========================= */
playerName = prompt("Enter your name");
startTimer();
nextStage();
