/* ---------------- GLOBAL ---------------- */
let state = "start";
let player = { name: "", time: 120 };
let leaderboard = JSON.parse(localStorage.getItem("leaders") || "[]");

/* ---------------- START ---------------- */
const startBtn = document.getElementById("startBtn");
startBtn.onclick = () => {
  player.name = document.getElementById("playerName").value || "Player";
  document.getElementById("startScreen").classList.remove("active");
  startMaze();
};

function renderLeaderboard() {
  const list = document.getElementById("leaderboard");
  list.innerHTML = leaderboard.map(l => `<li>${l.name}: ${l.time}s</li>`).join("");
}
renderLeaderboard();

/* ---------------- MAZE ---------------- */
const mazeCanvas = document.getElementById("mazeCanvas");
const mCtx = mazeCanvas.getContext("2d");
mazeCanvas.width = innerWidth;
mazeCanvas.height = innerHeight;

let sperm = { x: 40, y: mazeCanvas.height / 2, vx: 0, vy: 0 };
const speed = 12;

// SIMPLE SOLVABLE MAZE
const walls = [];
for (let i = 0; i < 20; i++) {
  walls.push({ x: 200 + i * 80, y: (i % 2) * 300 + 100, w: 40, h: 400 });
}

function drawSperm(ctx, x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x - 25, y + Math.sin(Date.now() / 100) * 10);
  ctx.stroke();
}

function startMaze() {
  state = "maze";
  mazeCanvas.style.display = "block";
  requestAnimationFrame(mazeLoop);
}

function mazeLoop() {
  if (state !== "maze") return;
  mCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  walls.forEach(w => {
    mCtx.fillStyle = "#2aa9ff";
    mCtx.fillRect(w.x, w.y, w.w, w.h);
  });

  drawSperm(mCtx, sperm.x, sperm.y);

  sperm.x += sperm.vx;
  sperm.y += sperm.vy;

  if (sperm.x > mazeCanvas.width - 30) {
    mazeCanvas.style.display = "none";
    startQuestions();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

document.addEventListener("keydown", e => {
  if (state === "maze") {
    if (e.key === "ArrowUp") sperm.vy = -speed;
    if (e.key === "ArrowDown") sperm.vy = speed;
    if (e.key === "ArrowRight") sperm.vx = speed;
    if (e.key === "ArrowLeft") sperm.vx = -speed;
  }
});

document.addEventListener("keyup", () => {
  sperm.vx = sperm.vy = 0;
});

/* ---------------- QUESTIONS ---------------- */
const questions = [
  {
    q: "What mattered more in the maze: planning or reaction?",
    a: ["Planning", "Reaction"],
    c: 0
  },
  {
    q: "Did difficulty improve realism?",
    a: ["Yes", "No"],
    c: 0
  }
];

let qIndex = 0;

function startQuestions() {
  state = "questions";
  document.getElementById("questionScreen").classList.add("active");
  showQuestion();
}

function showQuestion() {
  const q = questions[qIndex];
  document.getElementById("questionText").innerText = q.q;
  const aDiv = document.getElementById("answers");
  aDiv.innerHTML = "";
  q.a.forEach((ans, i) => {
    const b = document.createElement("button");
    b.innerText = ans;
    b.onclick = () => {
      player.time += i === q.c ? -5 : 5;
      qIndex++;
      qIndex < questions.length ? showQuestion() : startFlappyInfo();
    };
    aDiv.appendChild(b);
  });
}

/* ---------------- FLAPPY ---------------- */
const flappyCanvas = document.getElementById("flappyCanvas");
const fCtx = flappyCanvas.getContext("2d");
flappyCanvas.width = innerWidth;
flappyCanvas.height = innerHeight;

let fy = flappyCanvas.height / 2;
let vel = 0;
let started = false;

function startFlappyInfo() {
  document.getElementById("questionScreen").classList.remove("active");
  document.getElementById("flappyInfo").classList.add("active");
  state = "flappyInfo";
}

document.addEventListener("keydown", e => {
  if (state === "flappyInfo" && e.key === "ArrowUp") {
    document.getElementById("flappyInfo").classList.remove("active");
    flappyCanvas.style.display = "block";
    state = "flappy";
    started = true;
    requestAnimationFrame(flappyLoop);
  }
  if (state === "flappy") vel = -8;
});

function flappyLoop() {
  if (state !== "flappy") return;
  fCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  vel += 0.5;
  fy += vel;

  drawSperm(fCtx, 100, fy);

  if (fy < 0 || fy > flappyCanvas.height) endGame();

  requestAnimationFrame(flappyLoop);
}

/* ---------------- END ---------------- */
function endGame() {
  state = "end";
  flappyCanvas.style.display = "none";
  leaderboard.push({ name: player.name, time: player.time });
  leaderboard.sort((a, b) => b.time - a.time);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaders", JSON.stringify(leaderboard));

  document.getElementById("finalTime").innerText = `Time: ${player.time}s`;
  document.getElementById("endScreen").classList.add("active");

  document.getElementById("finalLeaderboard").innerHTML =
    leaderboard.map(l => `<li>${l.name}: ${l.time}s</li>`).join("");
}
