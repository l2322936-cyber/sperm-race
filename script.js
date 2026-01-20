/* =====================
   GLOBAL STATE
===================== */
const ui = document.getElementById("ui");
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let name = "";
let time = 0;
let timer;
let stage = 0;

/* =====================
   TIMER
===================== */
function startTimer() {
  timer = setInterval(() => time += 0.1, 100);
}
function stopTimer() {
  clearInterval(timer);
}

/* =====================
   SPERM DRAW
===================== */
function drawSperm(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // head
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(
    -28,
    Math.sin(Date.now() / 120) * 8,
    -45,
    0
  );
  ctx.stroke();

  ctx.restore();
}

/* =====================
   QUESTIONS
===================== */
const questions = [
  {
    q: "What is the main role of sperm?",
    a: ["Nutrition", "Movement", "Deliver DNA", "Hormones"],
    c: 2
  },
  {
    q: "Where does fertilization usually happen?",
    a: ["Uterus", "Fallopian Tube", "Ovary", "Cervix"],
    c: 1
  },
  {
    q: "How many chromosomes does sperm contain?",
    a: ["46", "23", "92", "12"],
    c: 1
  }
];

function showQuestion(i) {
  ui.innerHTML = `
    <h1>${questions[i].q}</h1>
    ${questions[i].a.map((a, n) =>
      `<button onclick="answer(${n}, ${i})">${a}</button>`
    ).join("")}
  `;
}

function answer(choice, i) {
  time += choice === questions[i].c ? -10 : 10;
  nextStage();
}

/* =====================
   MAZE (SOLVABLE)
===================== */
const walls = [
  {x:0,y:0,w:900,h:20},
  {x:0,y:530,w:900,h:20},
  {x:0,y:0,w:20,h:550},
  {x:880,y:0,w:20,h:550},

  {x:120,y:20,w:20,h:400},
  {x:240,y:130,w:20,h:400},
  {x:360,y:20,w:20,h:400},
  {x:480,y:130,w:20,h:400},
  {x:600,y:20,w:20,h:400},
  {x:720,y:130,w:20,h:400}
];

let sperm = { x: 50, y: 275, speed: 5 };

function hitWall(nx, ny) {
  return walls.some(w =>
    nx > w.x - 12 &&
    nx < w.x + w.w + 12 &&
    ny > w.y - 12 &&
    ny < w.y + w.h + 12
  );
}

function drawMaze() {
  ctx.clearRect(0,0,900,550);

  ctx.fillStyle = "#222";
  walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

  // exit
  ctx.fillStyle = "lime";
  ctx.fillRect(860, 245, 20, 60);

  drawSperm(sperm.x, sperm.y, 0);
}

document.addEventListener("keydown", e => {
  if (stage !== 2) return;

  let nx = sperm.x;
  let ny = sperm.y;

  if (e.key === "w") ny -= sperm.speed;
  if (e.key === "s") ny += sperm.speed;
  if (e.key === "a") nx -= sperm.speed;
  if (e.key === "d") nx += sperm.speed;

  if (!hitWall(nx, ny)) {
    sperm.x = nx;
    sperm.y = ny;
  }

  if (sperm.x > 860 && sperm.y > 245 && sperm.y < 305) {
    nextStage();
  }

  drawMaze();
});

/* =====================
   FLOW
===================== */
function nextStage() {
  stage++;

  if (stage === 1) showQuestion(0);
  if (stage === 2) {
    ui.innerHTML = "<h1>ESCAPE THE MAZE</h1>";
    canvas.style.display = "block";
    drawMaze();
  }
  if (stage === 3) showQuestion(1);
  if (stage === 4) showQuestion(2);
  if (stage === 5) endGame();
}

function endGame() {
  stopTimer();
  ui.innerHTML = `
    <h1>Finished!</h1>
    <h2>${name} — ${time.toFixed(1)} seconds</h2>
    <button onclick="location.reload()">Restart</button>
  `;
}

/* =====================
   START
===================== */
name = prompt("Enter your name");
startTimer();
nextStage();
