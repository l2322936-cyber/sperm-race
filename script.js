document.body.style.background = "red";
alert("NEW JS IS RUNNING");

/* =====================
   GLOBAL STATE
===================== */
let playerName = "";
let time = 0;
let timerInterval = null;
let stage = 0;

const gameDiv = document.getElementById("game");
const mazeCanvas = document.getElementById("mazeCanvas");
const mazeCtx = mazeCanvas.getContext("2d");

const flappyCanvas = document.getElementById("flappyCanvas");
const flappyCtx = flappyCanvas.getContext("2d");

let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

/* =====================
   TIMER
===================== */
function startTimer() {
  timerInterval = setInterval(() => time += 0.1, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

/* =====================
   SPERM DRAW
===================== */
function drawSperm(ctx, x, y, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.quadraticCurveTo(-22, Math.sin(Date.now() / 100) * 5, -32, 0);
  ctx.stroke();

  ctx.restore();
}

/* =====================
   QUESTIONS
===================== */
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
    q: "How many chromosomes does a human sperm carry?",
    a: ["46", "23", "92", "12"],
    c: 1
  }
];

function showQuestion(qIndex) {
  gameDiv.innerHTML = `
    <div style="padding:40px; font-size:32px; text-align:center;">
      <h1>${questions[qIndex].q}</h1>
      ${questions[qIndex].a.map((ans, i) =>
        `<button style="font-size:24px; margin:20px; padding:20px 40px;"
          onclick="answerQuestion(${i}, ${qIndex})">${ans}</button>`
      ).join("")}
    </div>
  `;
}

function answerQuestion(choice, qIndex) {
  time += choice === questions[qIndex].c ? -10 : 10;
  nextStage();
}

/* =====================
   MAZE (SOLVABLE)
===================== */
const mazeWalls = [
  {x:0,y:0,w:800,h:20},
  {x:0,y:480,w:800,h:20},
  {x:0,y:0,w:20,h:500},
  {x:780,y:0,w:20,h:500},

  {x:100,y:0,w:20,h:400},
  {x:200,y:100,w:20,h:400},
  {x:300,y:0,w:20,h:400},
  {x:400,y:100,w:20,h:400},
  {x:500,y:0,w:20,h:400},
  {x:600,y:100,w:20,h:400}
];

let sperm = { x: 50, y: 250, speed: 4 };

function drawMaze() {
  mazeCtx.clearRect(0,0,800,500);
  mazeCtx.fillStyle = "#222";
  mazeWalls.forEach(w => mazeCtx.fillRect(w.x, w.y, w.w, w.h));

  // Exit
  mazeCtx.fillStyle = "green";
  mazeCtx.fillRect(760, 220, 20, 60);

  drawSperm(mazeCtx, sperm.x, sperm.y);
}

function collision(nx, ny) {
  return mazeWalls.some(w =>
    nx > w.x - 10 &&
    nx < w.x + w.w + 10 &&
    ny > w.y - 10 &&
    ny < w.y + w.h + 10
  );
}

document.addEventListener("keydown", e => {
  let nx = sperm.x;
  let ny = sperm.y;

  if (e.key === "w") ny -= sperm.speed;
  if (e.key === "s") ny += sperm.speed;
  if (e.key === "a") nx -= sperm.speed;
  if (e.key === "d") nx += sperm.speed;

  if (!collision(nx, ny)) {
    sperm.x = nx;
    sperm.y = ny;
  }

  if (sperm.x > 760 && sperm.y > 220 && sperm.y < 280) {
    nextStage();
  }

  drawMaze();
});

/* =====================
   STAGES
===================== */
function nextStage() {
  stage++;
  if (stage === 1) showQuestion(0);
  if (stage === 2) startMaze();
  if (stage === 3) showQuestion(1);
  if (stage === 4) showQuestion(2);
  if (stage === 5) endGame();
}

function startMaze() {
  gameDiv.innerHTML = "<h1 style='text-align:center'>ESCAPE THE MAZE</h1>";
  mazeCanvas.style.display = "block";
  drawMaze();
}

function endGame() {
  stopTimer();
  leaderboard.push({name: playerName, time: time.toFixed(1)});
  leaderboard.sort((a,b)=>a.time-b.time);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  gameDiv.innerHTML = `
    <h1>Finished!</h1>
    <h2>${playerName}: ${time.toFixed(1)}s</h2>
    <h3>Leaderboard</h3>
    ${leaderboard.map(l=>`<p>${l.name}: ${l.time}s</p>`).join("")}
    <button onclick="location.reload()">Restart</button>
  `;
}

/* =====================
   START
===================== */
playerName = prompt("Enter your name:");
startTimer();
nextStage();
