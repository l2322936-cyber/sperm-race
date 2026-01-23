const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------- GLOBAL ----------
let name = "";
let time = 0;
let timer;
let stage = "start";

// ---------- LEADERBOARD ----------
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}
function saveScore(n, t) {
  const b = getBoard();
  b.push({ n, t });
  b.sort((a, b) => a.t - b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0, 5)));
}
function renderBoard(el) {
  el.innerHTML = "";
  getBoard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.n} — ${s.t}s`;
    el.appendChild(li);
  });
}
renderBoard(document.getElementById("board"));

// ---------- START ----------
function startGame() {
  name = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("start").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;
  timer = setInterval(() => time++, 1000);
  mazeLoop();
}

/* =====================
   SOLVABLE MAZE SYSTEM
===================== */

const tileSize = 40;

// 0 = path
// 1 = wall
// S = start
// E = end

const mazeMap = [
  "111111111111111",
  "1S0000000010001",
  "1011111111010101",
  "1000000010010101",
  "1110111011110101",
  "1000100000000101",
  "1011101111111101",
  "1010001000000001",
  "1010111011111111",
  "10000000100000E1",
  "111111111111111"
];

const mazeRows = mazeMap.length;
const mazeCols = mazeMap[0].length;

canvas.width = mazeCols * tileSize;
canvas.height = mazeRows * tileSize;

// find start + end
let startPos = { x: 1, y: 1 };
let endPos = { x: 13, y: 9 };

for (let y = 0; y < mazeRows; y++) {
  for (let x = 0; x < mazeCols; x++) {
    if (mazeMap[y][x] === "S") startPos = { x, y };
    if (mazeMap[y][x] === "E") endPos = { x, y };
  }
}

/* =====================
   PLAYER (SPERM)
===================== */

const player = {
  x: startPos.x * tileSize + tileSize / 2,
  y: startPos.y * tileSize + tileSize / 2,
  r: 12,
  speed: 4 // fast but smooth
};

/* =====================
   DRAW MAZE
===================== */

function drawMaze() {
  for (let y = 0; y < mazeRows; y++) {
    for (let x = 0; x < mazeCols; x++) {
      if (mazeMap[y][x] === "1") {
        ctx.fillStyle = "#0a4cff";
        ctx.fillRect(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }

  // end tile
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(
    endPos.x * tileSize,
    endPos.y * tileSize,
    tileSize,
    tileSize
  );
}

/* =====================
   COLLISION CHECK
===================== */

function isWall(px, py) {
  const col = Math.floor(px / tileSize);
  const row = Math.floor(py / tileSize);

  if (row < 0 || col < 0 || row >= mazeRows || col >= mazeCols) return true;
  return mazeMap[row][col] === "1";
}

/* =====================
   PLAYER MOVEMENT
===================== */

function movePlayer(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!isWall(nextX, player.y)) player.x = nextX;
  if (!isWall(player.x, nextY)) player.y = nextY;
}

/* =====================
   DRAW SPERM (REALISTIC)
===================== */

function drawSperm() {
  ctx.fillStyle = "#ffffff";

  // head
  ctx.beginPath();
  ctx.ellipse(player.x, player.y, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x - 12, player.y);
  ctx.lineTo(player.x - 25, player.y + Math.sin(Date.now() / 100) * 4);
  ctx.stroke();
}

/* =====================
   WIN CHECK
===================== */

function checkMazeWin() {
  const cx = Math.floor(player.x / tileSize);
  const cy = Math.floor(player.y / tileSize);

  if (cx === endPos.x && cy === endPos.y) {
    startQuestions();
  }
}

/* =====================
   GAME LOOP
===================== */

function mazeLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawSperm();
  checkMazeWin();
  requestAnimationFrame(mazeLoop);
}

/* =====================
   KEY CONTROLS
===================== */

document.addEventListener("keydown", e => {
  if (!gameActive) return;

  if (e.key === "ArrowUp") movePlayer(0, -player.speed);
  if (e.key === "ArrowDown") movePlayer(0, player.speed);
  if (e.key === "ArrowLeft") movePlayer(-player.speed, 0);
  if (e.key === "ArrowRight") movePlayer(player.speed, 0);
});

// ---------- QUESTIONS ----------
const questions = [
["What is fertilization?", ["Fusion of gametes","Cell division","Implantation"],0],
["Where is sperm produced?",["Testes","Ovaries","Uterus"],0],
["Egg cells are called?",["Ova","Zygotes","Embryos"],0],
["How many chromosomes in humans?",["46","23","92"],0],
["Where does fertilization occur?",["Fallopian tube","Uterus","Vagina"],0],
["What protects the fetus?",["Amniotic sac","Ovary","Cervix"],0],
["Meiosis creates?",["Gametes","Skin cells","Organs"],0],
["Male gamete?",["Sperm","Egg","Zygote"],0],
["Female gamete?",["Egg","Sperm","Embryo"],0],
["Zygote means?",["Fertilized egg","Embryo","Gamete"],0]
];

let qi = 0;

function startQuestions() {
  stage = "questions";
  document.getElementById("questions").classList.add("active");
  showQ();
}

function showQ() {
  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const a = document.getElementById("answers");
  a.innerHTML = "";
  q[1].forEach((t,i)=>{
    const b=document.createElement("button");
    b.textContent=t;
    b.onclick=()=>{
      time += i===q[2] ? -10 : 10;
      qi++;
      qi<questions.length ? showQ() : startFlappy();
    };
    a.appendChild(b);
  });
}

// ---------- FLAPPY ----------
let fy = canvas.height/2, fvy = 0;
let pipes = [];

document.addEventListener("keydown",e=>{
  if(stage==="flappy" && e.key==="ArrowUp") fvy=-8;
});

function startFlappy(){
  document.getElementById("questions").classList.remove("active");
  canvas.style.display="block";
  stage="flappy";
  pipes=[];
  flappyLoop();
}

function flappyLoop(){
  if(stage!=="flappy")return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  fvy+=0.4; fy+=fvy;
  drawSperm(150,fy);

  if(Math.random()<0.02)
    pipes.push({x:canvas.width,g:200+Math.random()*200});

  pipes.forEach(p=>{
    p.x-=4;
    ctx.fillRect(p.x,0,40,p.g-120);
    ctx.fillRect(p.x,p.g+120,40,canvas.height);
  });

  if(fy<0||fy>canvas.height) return endGame();
  requestAnimationFrame(flappyLoop);
}

// ---------- END ----------
function endGame(){
  clearInterval(timer);
  saveScore(name,time);
  canvas.style.display="none";
  document.getElementById("end").classList.add("active");
  document.getElementById("finalTime").textContent=`Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
}
