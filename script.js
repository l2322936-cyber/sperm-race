const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let time = 0;
let timer;

/* =====================
   START
===================== */
function startGame() {
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;
  timer = setInterval(() => time++, 1000);
  initMaze();
}

/* =====================
   MAZE (SOLVABLE)
===================== */
const tile = 50;
const maze = [
  "11111111111111111111",
  "1S000000001000000001",
  "10111111110111111101",
  "10000000000100000001",
  "11101111111101111111",
  "10001000000001000001",
  "10111011111111011101",
  "10100010000000010001",
  "10101110111111110101",
  "10000000100000000E01",
  "11111111111111111111"
];

const rows = maze.length;
const cols = maze[0].length;

canvas.width = cols * tile;
canvas.height = rows * tile;

let startPos, endPos;

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (maze[y][x] === "S") startPos = { x, y };
    if (maze[y][x] === "E") endPos = { x, y };
  }
}

/* =====================
   SPERM PLAYER
===================== */
const sperm = {
  x: 0,
  y: 0,
  r: 12,
  speed: 8,
  tail: []
};

function initMaze() {
  sperm.x = startPos.x * tile + tile / 2;
  sperm.y = startPos.y * tile + tile / 2;
  requestAnimationFrame(mazeLoop);
}

function isWall(x, y) {
  const c = Math.floor(x / tile);
  const r = Math.floor(y / tile);
  if (r < 0 || c < 0 || r >= rows || c >= cols) return true;
  return maze[r][c] === "1";
}

/* =====================
   MAZE LOOP
===================== */
function mazeLoop() {
  if (stage !== "maze") return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === "1") {
        ctx.fillStyle = "#0a4cff";
        ctx.fillRect(x * tile, y * tile, tile, tile);
      }
    }
  }

  drawSperm();

  const cx = Math.floor(sperm.x / tile);
  const cy = Math.floor(sperm.y / tile);
  if (cx === endPos.x && cy === endPos.y) {
    stage = "questions";
    canvas.style.display = "none";
    document.getElementById("questions").classList.add("active");
    loadQuestion();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

/* =====================
   SPERM DRAW
===================== */
function drawSperm() {
  sperm.tail.push({ x: sperm.x, y: sperm.y });
  if (sperm.tail.length > 15) sperm.tail.shift();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  sperm.tail.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y + Math.sin(Date.now() / 80) * 4);
  });
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* =====================
   CONTROLS
===================== */
document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  let dx = 0, dy = 0;
  if (e.key === "ArrowUp") dy = -sperm.speed;
  if (e.key === "ArrowDown") dy = sperm.speed;
  if (e.key === "ArrowLeft") dx = -sperm.speed;
  if (e.key === "ArrowRight") dx = sperm.speed;

  if (!isWall(sperm.x + dx, sperm.y)) sperm.x += dx;
  if (!isWall(sperm.x, sperm.y + dy)) sperm.y += dy;
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

function drawFlappySperm() {
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.ellipse(120,fy,14,9,0,0,Math.PI*2);
  ctx.fill();
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
