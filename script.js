// ================= SETUP =================
const startScreen = document.getElementById("startScreen");
const questionScreen = document.getElementById("questionScreen");
const endScreen = document.getElementById("endScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerName = "";
let time = 0;
let timerInterval;
let stage = "start";
let currentQuestion = 0;

// ================= LEADERBOARD =================
function getLeaderboard() {
  return JSON.parse(localStorage.getItem("leaderboard") || "[]");
}

function saveScore(name, time) {
  const board = getLeaderboard();
  board.push({ name, time });
  board.sort((a, b) => a.time - b.time);
  localStorage.setItem("leaderboard", JSON.stringify(board.slice(0, 5)));
}

function renderLeaderboard(el) {
  el.innerHTML = "";
  getLeaderboard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.time}s`;
    el.appendChild(li);
  });
}

renderLeaderboard(document.getElementById("leaderboard"));

// ================= START =================
function startGame() {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  startScreen.classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;

  timerInterval = setInterval(() => time++, 1000);
  startMaze();
}

// ================= MAZE =================
const tile = 40;
const maze = [
  "####################",
  "#S   #       #     #",
  "# ### # ##### # ### #",
  "#     #     # #   # #",
  "##### ##### # ### # #",
  "#     #   # #     # #",
  "# ### # # # ##### # #",
  "# #   # # #     #   #",
  "# # ##### # ##### ###",
  "# #     # #   #     #",
  "# ##### # ### ### ###",
  "#     #       #   E #",
  "####################"
];

let px = 60, py = 60;
let vx = 0, vy = 0;
const speed = 6;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") vy = -speed;
  if (e.key === "ArrowDown") vy = speed;
  if (e.key === "ArrowLeft") vx = -speed;
  if (e.key === "ArrowRight") vx = speed;
});

document.addEventListener("keyup", () => vx = vy = 0);

function wall(x, y) {
  const c = Math.floor(x / tile);
  const r = Math.floor(y / tile);
  return maze[r][c] === "#";
}

function startMaze() {
  requestAnimationFrame(mazeLoop);
}

function mazeLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === "#") {
        ctx.fillStyle = "#222";
        ctx.fillRect(c * tile, r * tile, tile, tile);
      }
    }
  }

  if (!wall(px + vx, py)) px += vx;
  if (!wall(px, py + vy)) py += vy;

  // sperm
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(px, py, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(px - 10, py);
  ctx.lineTo(px - 25, py);
  ctx.stroke();

  // finish
  if (px > canvas.width - 80 && py > canvas.height - 80) {
    canvas.style.display = "none";
    startQuestions();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

// ================= QUESTIONS =================
const questions = [
  { q: "What is fertilization?", a: ["Fusion of gametes", "Cell division", "Implantation"], c: 0 },
  { q: "Sperm are produced in the…", a: ["Testes", "Ovaries", "Uterus"], c: 0 },
  { q: "Egg cells are also called?", a: ["Ova", "Zygotes", "Embryos"], c: 0 },
  { q: "How many chromosomes in humans?", a: ["46", "23", "92"], c: 0 },
  { q: "Where does fertilization occur?", a: ["Fallopian tube", "Uterus", "Vagina"], c: 0 },
  { q: "What protects the embryo?", a: ["Amniotic sac", "Placenta", "Ovary"], c: 0 },
  { q: "What is meiosis?", a: ["Cell division forming gametes", "Growth", "Repair"], c: 0 },
  { q: "Which is male gamete?", a: ["Sperm", "Egg", "Zygote"], c: 0 },
  { q: "Which is female gamete?", a: ["Egg", "Sperm", "Embryo"], c: 0 },
  { q: "Zygote means?", a: ["Fertilized egg", "Unfertilized egg", "Embryo"], c: 0 }
];

function startQuestions() {
  stage = "questions";
  questionScreen.classList.add("active");
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("questionText").textContent = q.q;
  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.a.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = () => {
      time += i === q.c ? -10 : 10;
      currentQuestion++;
      currentQuestion < questions.length ? showQuestion() : startFlappy();
    };
    answers.appendChild(btn);
  });
}

// ================= FLAPPY =================
let fy = canvas.height / 2;
let fvy = 0;
let pipes = [];

document.addEventListener("keydown", e => {
  if (stage === "flappy" && e.key === "ArrowUp") fvy = -8;
});

function startFlappy() {
  questionScreen.classList.remove("active");
  canvas.style.display = "block";
  stage = "flappy";
  pipes = [];
  requestAnimationFrame(flappyLoop);
}

function flappyLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fvy += 0.4;
  fy += fvy;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(150, fy, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (Math.random() < 0.02) {
    pipes.push({ x: canvas.width, gap: 200 + Math.random() * 200 });
  }

  pipes.forEach(p => {
    p.x -= 4;
    ctx.fillRect(p.x, 0, 40, p.gap - 120);
    ctx.fillRect(p.x, p.gap + 120, 40, canvas.height);
  });

  if (fy < 0 || fy > canvas.height) return endGame();

  requestAnimationFrame(flappyLoop);
}

// ================= END =================
function endGame() {
  clearInterval(timerInterval);
  saveScore(playerName, time);
  canvas.style.display = "none";
  endScreen.classList.add("active");
  document.getElementById("finalTime").textContent = `Time: ${time}s`;
  renderLeaderboard(document.getElementById("finalLeaderboard"));
}

function restart() {
  location.reload();
}

// ================= INIT =================
startScreen.classList.add("active");
