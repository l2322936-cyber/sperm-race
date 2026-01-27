/* =========================
   CANVAS + GLOBAL STATE
========================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let time = 0;
let timer;

function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}

function renderStartBoard() {
  const list = document.getElementById("startBoard");
  if (!list) return;

  list.innerHTML = "";
  getBoard().forEach(score => {
    const li = document.createElement("li");
    li.textContent = `${score.name} — ${score.time}s`;
    list.appendChild(li);
  });
}
window.onload = function () {
  renderStartBoard();
};



/* =========================
   START BUTTON
========================= */
function startGame() {
  stage = "maze";
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";

  time = 0;
  timer = setInterval(() => time++, 1000);

  initMaze();
  mazeLoop();
}

/* =========================
   MAZE DATA (SOLVABLE)
========================= */
/*
  1 = wall
  0 = path
  S = start
  E = end
*/

const mazeMap = [
  "1111111111111111111111111",
  "1S00000000000000100000001",
  "1011111111111111010111111",
  "1000000000000000010000001",
  "1111110111111111110111101",
  "1000010000000000000100001",
  "1011011111111111111101101",
  "1010010000000000000001001",
  "1011110111111111111101111",
  "1000000100000000000100001",
  "1111101110111111110111101",
  "1000000000100000010000001",
  "1011111111110111111111101",
  "10000000000001000000000E1",
  "1111111111111111111111111"
];

const rows = mazeMap.length;
const cols = mazeMap[0].length;

/* =========================
   TILE SCALING + CENTERING
========================= */
const tileSize = Math.floor(
  Math.min(window.innerWidth / cols, window.innerHeight / rows)
);

const offsetX = Math.floor((canvas.width - cols * tileSize) / 2);
const offsetY = Math.floor((canvas.height - rows * tileSize) / 2);

/* =========================
   FIND START + END
========================= */
let startPos = { x: 1, y: 1 };
let endPos = { x: cols - 2, y: rows - 2 };

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (mazeMap[y][x] === "S") startPos = { x, y };
    if (mazeMap[y][x] === "E") endPos = { x, y };
  }
}

/* =========================
   PLAYER (SPERM)
========================= */
const sperm = {
  x: 0,
  y: 0,
  speed: 12, // fast + smooth
  radius: tileSize * 0.3
};

function initMaze() {
  sperm.x = offsetX + startPos.x * tileSize + tileSize / 2;
  sperm.y = offsetY + startPos.y * tileSize + tileSize / 2;
}

/* =========================
   DRAW MAZE
========================= */
function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let tile = mazeMap[y][x];

      if (tile === "1") ctx.fillStyle = "#1e90ff";
      else if (tile === "S") ctx.fillStyle = "#00ff99";
      else if (tile === "E") ctx.fillStyle = "#ffd700";
      else ctx.fillStyle = "#001428";

      ctx.fillRect(
        offsetX + x * tileSize,
        offsetY + y * tileSize,
        tileSize,
        tileSize
      );
    }
  }
}

/* =========================
   COLLISION
========================= */
function isWall(px, py) {
  const col = Math.floor((px - offsetX) / tileSize);
  const row = Math.floor((py - offsetY) / tileSize);

  if (row < 0 || col < 0 || row >= rows || col >= cols) return true;
  return mazeMap[row][col] === "1";
}

/* =========================
   MOVEMENT
========================= */
function move(dx, dy) {
  const nx = sperm.x + dx;
  const ny = sperm.y + dy;

  if (!isWall(nx, sperm.y)) sperm.x = nx;
  if (!isWall(sperm.x, ny)) sperm.y = ny;
}

/* =========================
   DRAW SPERM (ANIMATED TAIL)
========================= */
function drawSperm() {
  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, sperm.radius, sperm.radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail (animated)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sperm.x - sperm.radius, sperm.y);

  const wiggle = Math.sin(Date.now() / 120) * 8;
  ctx.lineTo(sperm.x - sperm.radius * 2.5, sperm.y + wiggle);
  ctx.stroke();
}

/* =========================
   MAZE WIN CHECK
========================= */
function checkMazeWin() {
  const cx = Math.floor((sperm.x - offsetX) / tileSize);
  const cy = Math.floor((sperm.y - offsetY) / tileSize);

  if (cx === endPos.x && cy === endPos.y) {
    clearInterval(timer);
    stage = "questions"; // NEXT PHASE
    canvas.style.display = "none";
    document.getElementById("questions").classList.add("active");
    if (typeof loadQuestion === "function") loadQuestion();
  }
}

/* =========================
   GAME LOOP
========================= */
function mazeLoop() {
  if (stage !== "maze") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm();
  checkMazeWin();

  requestAnimationFrame(mazeLoop);
}

/* =========================
   CONTROLS
========================= */
document.addEventListener("keydown", e => {
  if (stage !== "maze") return;

  if (e.key === "ArrowUp") move(0, -sperm.speed);
  if (e.key === "ArrowDown") move(0, sperm.speed);
  if (e.key === "ArrowLeft") move(-sperm.speed, 0);
  if (e.key === "ArrowRight") move(sperm.speed, 0);
});
/* =====================
   QUESTIONS
===================== */
const questions = [
  ["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
  ["Where is sperm made?",["Testes","Ovary","Uterus"],0],
  ["How many chromosomes?",["46","23","92"],1],
  ["Female gamete?",["Egg","Sperm","Zygote"],0],
  ["Meiosis creates?",["Gametes","Organs","Skin"],0],
  ["Zygote is?",["Fertilized egg","Embryo","Gamete"],0],
  ["Where fertilization occurs?",["Fallopian tube","Uterus","Cervix"],0],
  ["Male hormone?",["Testosterone","Estrogen","Insulin"],0],
  ["What increases variation?",["Crossing over","Cloning","Mitosis"],0],
  ["Sperm tail is called?",["Flagellum","Nucleus","Acrosome"],0]
];

let qi = 0;

function loadQuestion() {
  if (qi >= questions.length) {
    document.getElementById("questions").classList.remove("active");
    document.getElementById("flappyInfo").classList.add("active");
    stage = "flappyInfo";
    return;
  }

  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";

  q[1].forEach((t,i)=>{
    const b = document.createElement("button");
    b.textContent = t;
    b.onclick = ()=>{
      time += i === q[2] ? -5 : 5;
      qi++;
      loadQuestion();
    };
    a.appendChild(b);
  });
}

/* =====================
   FLAPPY SPERM
===================== */
let fy, fvy, pipes, lastTime;

document.addEventListener("keydown", e => {
  if (stage === "flappyInfo" && e.key === "ArrowUp") startFlappy();
  if (stage === "flappy" && e.key === "ArrowUp") fvy = -7;
});

function startFlappy() {
  document.getElementById("flappyInfo").classList.remove("active");
  canvas.style.display = "block";
  stage = "flappy";
  fy = canvas.height / 2;
  fvy = 0;
  pipes = [];
  lastTime = Date.now();
  requestAnimationFrame(flappyLoop);
}

function flappyLoop() {
  if (stage !== "flappy") return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  fvy += 0.4;
  fy += fvy;

 drawFlappySperm();

  if (Math.random() < 0.02) {
    pipes.push({ x: canvas.width, gap: 200 + Math.random() * 200 });
  }

  pipes.forEach(p => {
    p.x -= 4;
    ctx.fillRect(p.x,0,50,p.gap-120);
    ctx.fillRect(p.x,p.gap+120,50,canvas.height);
    if (p.x < 120 && p.x > 50 &&
        (fy < p.gap-120 || fy > p.gap+120)) endGame();
  });

  if (fy < 0 || fy > canvas.height) endGame();

  if (Date.now() - lastTime > 2000) {
    time--;
    lastTime = Date.now();
  }

  requestAnimationFrame(flappyLoop);
}

function drawFlappySperm(x, y) {
  // head
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // animated tail
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, y);

  const wiggle = Math.sin(Date.now() / 100) * 6;
  ctx.lineTo(x - 35, y + wiggle);
  ctx.stroke();
}

/* =====================
   END
===================== */
function endGame() {
  clearInterval(timer);
  stage = "end";
  canvas.style.display = "none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent = `Final Time: ${time}s`;
}
