/***********************
 GLOBAL GAME STATE
************************/
let currentScreen = "start";
let playerName = "";
let gameData = {
  mazeCompleted: false,
  questionsCompleted: false,
  flappyCompleted: false
};

/***********************
 SCREEN HELPERS
************************/
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
  currentScreen = id;
}

/***********************
 SECTION 1: START SCREEN
************************/
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerNameInput");

startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Enter a name");
    return;
  }

  playerName = name;
  showScreen("mazeScreen");
  startMaze(); // 🔑 CONNECTS TO NEXT SECTION
});

/***********************
 SECTION 2: MAZE (CONNECTED)
************************/
const mazeCanvas = document.getElementById("mazeCanvas");
const mazeCtx = mazeCanvas.getContext("2d");

function resizeMaze() {
  mazeCanvas.width = window.innerWidth;
  mazeCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeMaze);

let player = { x: 60, y: 60, r: 10, speed: 12 };
let goal = { x: 0, y: 0, r: 20 };

function startMaze() {
  resizeMaze();
  goal.x = mazeCanvas.width - 80;
  goal.y = mazeCanvas.height - 80;
  requestAnimationFrame(updateMaze);
}

function updateMaze() {
  if (currentScreen !== "mazeScreen") return;

  mazeCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  // player
  mazeCtx.fillStyle = "white";
  mazeCtx.beginPath();
  mazeCtx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  mazeCtx.fill();

  // goal
  mazeCtx.fillStyle = "green";
  mazeCtx.beginPath();
  mazeCtx.arc(goal.x, goal.y, goal.r, 0, Math.PI * 2);
  mazeCtx.fill();

  // win check
  const dx = player.x - goal.x;
  const dy = player.y - goal.y;
  if (Math.hypot(dx, dy) < player.r + goal.r) {
    gameData.mazeCompleted = true;
    showScreen("questionScreen");
    startQuestions(); // 🔑 CONNECTS
    return;
  }

  requestAnimationFrame(updateMaze);
}

// movement
document.addEventListener("keydown", e => {
  if (currentScreen !== "mazeScreen") return;

  if (e.key === "ArrowUp") player.y -= player.speed;
  if (e.key === "ArrowDown") player.y += player.speed;
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
});

/***********************
 SECTION 3: QUESTIONS
************************/
const questionText = document.getElementById("questionText");
const answersDiv = document.getElementById("answers");

let qIndex = 0;
const questions = [
  { q: "What is fertilization?", a: ["Cell division", "Fusion of gametes", "Mitosis"], c: 1 },
  { q: "What does sperm provide?", a: ["Energy", "DNA", "Nutrients"], c: 1 }
];

function startQuestions() {
  qIndex = 0;
  loadQuestion();
}

function loadQuestion() {
  if (qIndex >= questions.length) {
    gameData.questionsCompleted = true;
    showScreen("flappyScreen");
    startFlappy(); // 🔑 CONNECTS
    return;
  }

  const q = questions[qIndex];
  questionText.textContent = q.q;
  answersDiv.innerHTML = "";

  q.a.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = () => {
      if (i === q.c) qIndex++;
      loadQuestion();
    };
    answersDiv.appendChild(btn);
  });
}

/***********************
 SECTION 4: FLAPPY SPERM
************************/
const flappyCanvas = document.getElementById("flappyCanvas");
const flappyCtx = flappyCanvas.getContext("2d");

let sperm = { x: 100, y: 200, vy: 0 };
let gravity = 0.6;

function startFlappy() {
  flappyCanvas.width = window.innerWidth;
  flappyCanvas.height = window.innerHeight;
  requestAnimationFrame(updateFlappy);
}

function updateFlappy() {
  if (currentScreen !== "flappyScreen") return;

  flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

  sperm.vy += gravity;
  sperm.y += sperm.vy;

  flappyCtx.fillStyle = "white";
  flappyCtx.beginPath();
  flappyCtx.arc(sperm.x, sperm.y, 12, 0, Math.PI * 2);
  flappyCtx.fill();

  if (sperm.y < 0 || sperm.y > flappyCanvas.height) {
    alert("Game Over");
    location.reload();
    return;
  }

  requestAnimationFrame(updateFlappy);
}

document.addEventListener("keydown", e => {
  if (currentScreen === "flappyScreen" && e.code === "Space") {
    sperm.vy = -8;
  }
});
