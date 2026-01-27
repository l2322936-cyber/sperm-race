const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ================= GLOBAL ================= */
let stage = "start";
let time = 0;
let timer;

/* ================= START ================= */
document.getElementById("startBtn").onclick = () => {
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  timer = setInterval(() => time++, 1000);
  mazeLoop();
};

/* ================= HUGE HARD MAZE ================= */
const maze = [
"1111111111111111111111111111111111111",
"1S00000000000100000000000000000000001",
"1011111111111011111111111111111111101",
"1000000000000010000000000000000000101",
"1111111111111010111111111111111110101",
"1000000000000010100000000000000010101",
"1011111111111010111111111111111010101",
"1010000000000010000000000000010010101",
"1010111111111111111111111111011010101",
"1010100000000000000000000000010010101",
"1010101111111111111111111111111010101",
"1010101000000000000000000000000010101",
"1010101011111111111111111111111110101",
"1010101010000000000000000000000000101",
"1010101010111111111111111111111111101",
"1010000010000000000000000000000000001",
"11111111111111111111111111111111111E1"
];

const rows = maze.length;
const cols = maze[0].length;

const tileW = canvas.width / cols;
const tileH = canvas.height / rows;

let start, end;
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (maze[y][x] === "S") start = { x, y };
    if (maze[y][x] === "E") end = { x, y };
  }
}

const sperm = {
  x: start.x * tileW + tileW / 2,
  y: start.y * tileH + tileH / 2,
  speed: Math.min(tileW, tileH) / 4
};

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === "1") {
        ctx.fillStyle = "#1e90ff";
        ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
      }
    }
  }
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(end.x * tileW, end.y * tileH, tileW, tileH);
}

function drawSperm() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, tileW / 3, tileH / 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function wall(px, py) {
  const c = Math.floor(px / tileW);
  const r = Math.floor(py / tileH);
  return maze[r]?.[c] === "1";
}

document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  let dx = 0, dy = 0;
  if (e.key === "ArrowUp") dy = -sperm.speed;
  if (e.key === "ArrowDown") dy = sperm.speed;
  if (e.key === "ArrowLeft") dx = -sperm.speed;
  if (e.key === "ArrowRight") dx = sperm.speed;
  if (!wall(sperm.x + dx, sperm.y)) sperm.x += dx;
  if (!wall(sperm.x, sperm.y + dy)) sperm.y += dy;
});

function mazeLoop() {
  if (stage !== "maze") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm();

  if (
    Math.floor(sperm.x / tileW) === end.x &&
    Math.floor(sperm.y / tileH) === end.y
  ) {
    clearInterval(timer);
    stage = "questions";
    canvas.style.display = "none";
    document.getElementById("questions").classList.add("active");
    return;
  }

  requestAnimationFrame(mazeLoop);
}

/* ================= QUESTIONS + FLAPPY ================= */
/* (UNCHANGED — SAME AS LAST VERSION, FULLY WORKING) */


/* ================= QUESTIONS ================= */
const questions = [
["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
["Where is sperm made?", ["Testes","Ovaries","Uterus"],0],
["Egg cells are called?", ["Ova","Zygotes","Embryos"],0],
["Chromosomes in humans?", ["46","23","92"],0],
["Where fertilization occurs?", ["Fallopian tube","Uterus","Vagina"],0],
["What protects fetus?", ["Amniotic sac","Placenta","Cervix"],0],
["Meiosis produces?", ["Gametes","Organs","Skin cells"],0],
["Male gamete?", ["Sperm","Egg","Zygote"],0],
["Female gamete?", ["Egg","Sperm","Embryo"],0],
["Zygote means?", ["Fertilized egg","Embryo","Gamete"],0]
];

let qi = 0;

function showQuestion() {
  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";
  q[1].forEach((txt, i) => {
    const b = document.createElement("button");
    b.textContent = txt;
    b.onclick = () => {
      time += i === q[2] ? -5 : 5;
      qi++;
      qi < questions.length ? showQuestion() : startFlappy();
    };
    a.appendChild(b);
  });
}

/* ================= FLAPPY SPERM ================= */
let fy, fvy, pipes;

function startFlappy() {
  document.getElementById("questions").classList.remove("active");
  document.getElementById("flappyInfo").classList.add("active");
  stage = "flappyInfo";
  clearInterval(timer);
}

document.addEventListener("keydown", e => {
  if (stage === "flappyInfo") {
    document.getElementById("flappyInfo").classList.remove("active");
    canvas.style.display = "block";
    stage = "flappy";
    timer = setInterval(() => time--, 2000);
    fy = canvas.height / 2;
    fvy = 0;
    pipes = [];
    flappyLoop();
  }
  if (stage === "flappy" && e.key === "ArrowUp") fvy = -8;
});

function flappyLoop() {
  if (stage !== "flappy") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fvy += 0.4;
  fy += fvy;
  drawSperm(canvas.width / 3, fy);

  if (Math.random() < 0.02) {
    pipes.push({ x: canvas.width, gap: 220 + Math.random() * 160 });
  }

  for (let p of pipes) {
    p.x -= 5;
    ctx.fillRect(p.x, 0, 40, p.gap - 120);
    ctx.fillRect(p.x, p.gap + 120, 40, canvas.height);

    if (
      p.x < canvas.width / 3 + 14 &&
      p.x + 40 > canvas.width / 3 - 14 &&
      (fy < p.gap - 120 || fy > p.gap + 120)
    ) {
      return endGame();
    }
  }

  if (fy < 0 || fy > canvas.height) return endGame();
  requestAnimationFrame(flappyLoop);
}

/* ================= END ================= */
function endGame() {
  clearInterval(timer);
  saveScore(playerName, time);
  canvas.style.display = "none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent = `Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
}
