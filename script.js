/* ========= GLOBAL STATE ========= */
let time = 60;
let currentQuestion = 0;
let flappyTimerInterval;
let mazeCanvas = document.getElementById("mazeCanvas");
let mCtx = mazeCanvas.getContext("2d");

/* ========= SCREENS ========= */
const startScreen = document.getElementById("startScreen");
const questionScreen = document.getElementById("questionScreen");
const flappyIntro = document.getElementById("flappyIntro");
const flappyCanvas = document.getElementById("flappyCanvas");
const endScreen = document.getElementById("endScreen");

/* ========= START ========= */
document.getElementById("startBtn").onclick = () => {
  startScreen.classList.remove("active");
  startMaze();
};

/* ========= MAZE ========= */
mazeCanvas.width = window.innerWidth;
mazeCanvas.height = window.innerHeight;

const maze = [
  "########################",
  "#S     #         #     #",
  "##### ### ##### ### ### #",
  "#     #     #   #     # #",
  "# ### ##### # ##### ### #",
  "#   #     # #     #     #",
  "### ##### # ##### #######",
  "#     #   #     #       #",
  "# ### # ##### ### ##### #",
  "#     #         #     E#",
  "########################"
];

let px = 1, py = 1;
const cellSize = Math.min(
  mazeCanvas.width / maze[0].length,
  mazeCanvas.height / maze.length
);
const speed = 2; // 2x faster

function drawMaze() {
  mCtx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  maze.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") {
        mCtx.fillStyle = "#002244";
        mCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
      if (cell === "E") {
        mCtx.fillStyle = "gold";
        mCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    });
  });

  // sperm
  mCtx.fillStyle = "white";
  mCtx.beginPath();
  mCtx.arc(
    px * cellSize + cellSize / 2,
    py * cellSize + cellSize / 2,
    cellSize / 3,
    0,
    Math.PI * 2
  );
  mCtx.fill();
}

function startMaze() {
  mazeCanvas.style.display = "block";
  drawMaze();
}

window.addEventListener("keydown", e => {
  let nx = px, ny = py;
  if (e.key === "ArrowUp") ny -= speed * 0.1;
  if (e.key === "ArrowDown") ny += speed * 0.1;
  if (e.key === "ArrowLeft") nx -= speed * 0.1;
  if (e.key === "ArrowRight") nx += speed * 0.1;

  if (maze[Math.floor(ny)][Math.floor(nx)] !== "#") {
    px = nx;
    py = ny;
  }

  if (maze[Math.floor(py)][Math.floor(px)] === "E") {
    mazeCanvas.style.display = "none";
    loadQuestion();
  }

  drawMaze();
});

/* ========= QUESTIONS ========= */
const questions = [
  { q: "What is fertilization?", a: ["Fusion of gametes", "Cell division", "Growth", "Respiration"], c: 0 },
  { q: "Where does fertilization occur in humans?", a: ["Ovary", "Uterus", "Fallopian tube", "Cervix"], c: 2 },
  { q: "What cell does sperm fertilize?", a: ["Zygote", "Egg", "Embryo", "Fetus"], c: 1 },
  { q: "What is meiosis?", a: ["Growth", "Repair", "Sex cell division", "Respiration"], c: 2 },
  { q: "How many chromosomes in sperm?", a: ["46", "23", "92", "12"], c: 1 },
  { q: "What protects the embryo?", a: ["Placenta", "Testes", "Ovary", "Urethra"], c: 0 },
  { q: "Which hormone triggers ovulation?", a: ["LH", "Testosterone", "Estrogen", "Progesterone"], c: 0 },
  { q: "What is a zygote?", a: ["Unfertilized egg", "Fertilized egg", "Embryo", "Fetus"], c: 1 },
  { q: "What does sperm provide?", a: ["DNA", "Nutrients", "Energy", "Oxygen"], c: 0 },
  { q: "What system controls reproduction?", a: ["Digestive", "Reproductive", "Nervous", "Respiratory"], c: 1 }
];

function loadQuestion() {
  questionScreen.classList.add("active");
  const q = questions[currentQuestion];
  const box = document.getElementById("questionBox");
  box.innerHTML = `<h1>${q.q}</h1>` + q.a.map((ans, i) =>
    `<div class="answer" onclick="answer(${i})">${ans}</div>`
  ).join("");
}

function answer(i) {
  if (i === questions[currentQuestion].c) time -= 5;
  else time += 5;

  currentQuestion++;
  if (currentQuestion >= questions.length) {
    questionScreen.classList.remove("active");
    showFlappyIntro();
  } else loadQuestion();
}

/* ========= FLAPPY ========= */
function showFlappyIntro() {
  flappyIntro.classList.add("active");
  window.addEventListener("keydown", startFlappy, { once: true });
}

function startFlappy() {
  flappyIntro.classList.remove("active");
  flappyCanvas.style.display = "block";

  flappyTimerInterval = setInterval(() => {
    time--;
  }, 2000);

  setTimeout(endGame, 15000);
}

/* ========= END ========= */
function endGame() {
  clearInterval(flappyTimerInterval);
  flappyCanvas.style.display = "none";
  endScreen.classList.add("active");
  document.getElementById("finalScore").innerText = `Final Time: ${time}s`;
}
