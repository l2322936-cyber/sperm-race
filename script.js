/* =========================
   GLOBAL SETUP
========================= */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let playerName = "";
let time = 0;
let timer = null;

/* =========================
   LEADERBOARD
========================= */
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}

function saveScore(name, t) {
  const b = getBoard();
  b.push({ name, t });
  b.sort((a, b) => a.t - b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0, 5)));
}

function renderBoard(el) {
  el.innerHTML = "";
  getBoard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.t}s`;
    el.appendChild(li);
  });
}

renderBoard(document.getElementById("board"));

/* =========================
   START SCREEN
========================= */
document.getElementById("startBtn").onclick = () => {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("startScreen").classList.remove("active");
  canvas.style.display = "block";
  stage = "maze";
  time = 0;
  timer = setInterval(() => time++, 1000);
  initMaze();
};

/* =========================
   MAZE SYSTEM (FIXED)
========================= */

const tile = 40; // smaller tiles = more complexity
let maze = [];
let rows, cols;
let startCell, endCell;

function initMaze() {
  // FORCE ODD DIMENSIONS (critical)
  rows = Math.floor(canvas.height / tile);
  cols = Math.floor(canvas.width / tile);
  if (rows % 2 === 0) rows--;
  if (cols % 2 === 0) cols--;

  maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 1)
  );

  function carve(x, y) {
    const dirs = [
      [2,0],[-2,0],[0,2],[0,-2]
    ].sort(() => Math.random() - 0.5);

    for (let [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        ny > 0 && ny < rows-1 &&
        nx > 0 && nx < cols-1 &&
        maze[ny][nx] === 1
      ) {
        maze[ny][nx] = 0;
        maze[y + dy/2][x + dx/2] = 0;
        carve(nx, ny);
      }
    }
  }

  // START + CARVE
  startCell = { x: 1, y: 1 };
  maze[startCell.y][startCell.x] = 0;
  carve(startCell.x, startCell.y);

  // END (guaranteed reachable)
  endCell = { x: cols - 2, y: rows - 2 };
  maze[endCell.y][endCell.x] = 0;

  player.x = startCell.x * tile + tile/2;
  player.y = startCell.y * tile + tile/2;

  mazeLoop();
}

/* =========================
   PLAYER (FASTER SPERM)
========================= */
const player = {
  x: 0,
  y: 0,
  r: 12,
  speed: 24 // 🔥 2x faster (was 12)
};

/* =========================
   DRAW MAZE
========================= */
function drawMaze() {
  ctx.fillStyle = "#3fa9f5";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for (let y=0;y<rows;y++){
    for (let x=0;x<cols;x++){
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#0a3cff";
        ctx.fillRect(x*tile,y*tile,tile,tile);
      }
    }
  }

  ctx.fillStyle = "#00ff99";
  ctx.fillRect(
    endCell.x * tile,
    endCell.y * tile,
    tile,
    tile
  );
}

/* =========================
   COLLISION (SOLID)
========================= */
function isWall(px, py) {
  const c = Math.floor(px / tile);
  const r = Math.floor(py / tile);
  if (r < 0 || c < 0 || r >= rows || c >= cols) return true;
  return maze[r][c] === 1;
}

/* =========================
   MOVEMENT (SMOOTH)
========================= */
function move(dx, dy) {
  if (!isWall(player.x + dx, player.y)) player.x += dx;
  if (!isWall(player.x, player.y + dy)) player.y += dy;
}

/* =========================
   MAZE LOOP
========================= */
function mazeLoop() {
  if (stage !== "maze") return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMaze();
  drawSperm(player.x, player.y);

  if (
    Math.floor(player.x / tile) === endCell.x &&
    Math.floor(player.y / tile) === endCell.y
  ) {
    stage = "questions";
    document.getElementById("questions").classList.add("active");
    showQuestion();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

/* =========================
   CONTROLS
========================= */
document.addEventListener("keydown", e => {
  if (stage !== "maze") return;
  if (e.key === "ArrowUp") move(0,-player.speed);
  if (e.key === "ArrowDown") move(0,player.speed);
  if (e.key === "ArrowLeft") move(-player.speed,0);
  if (e.key === "ArrowRight") move(player.speed,0);
});

/* =========================
   QUESTIONS
========================= */
const questions = [
  ["What is fertilization?",["Fusion of gametes","Cell division","Implantation"],0],
  ["Male gamete?",["Sperm","Egg","Zygote"],0],
  ["Female gamete?",["Egg","Sperm","Embryo"],0],
  ["Where fertilization occurs?",["Fallopian tube","Uterus","Vagina"],0],
  ["Chromosomes in humans?",["46","23","92"],0],
  ["Meiosis creates?",["Gametes","Organs","Skin"],0],
  ["Zygote is?",["Fertilized egg","Embryo","Gamete"],0],
  ["What protects fetus?",["Amniotic sac","Placenta","Cervix"],0],
  ["Where sperm produced?",["Testes","Ovaries","Uterus"],0],
  ["What implants?",["Blastocyst","Gamete","Ovum"],0]
];

let qi = 0;

function showQuestion() {
  const q = questions[qi];
  document.getElementById("qText").textContent = q[0];
  const ans = document.getElementById("answers");
  ans.innerHTML = "";

  q[1].forEach((t,i)=>{
    const b=document.createElement("button");
    b.textContent=t;
    b.onclick=()=>{
      time += i===q[2] ? -5 : 5;
      qi++;
      if (qi < questions.length) showQuestion();
      else startFlappyIntro();
    };
    ans.appendChild(b);
  });
}

/* =========================
   FLAPPY INTRO
========================= */
function startFlappyIntro(){
  document.getElementById("questions").classList.remove("active");
  document.getElementById("flappyIntro").classList.add("active");
  stage="flappyIntro";
}

document.addEventListener("keydown",e=>{
  if(stage==="flappyIntro" && e.key==="ArrowUp"){
    document.getElementById("flappyIntro").classList.remove("active");
    stage="flappy";
    startFlappy();
  }
});

/* =========================
   FLAPPY SPERM
========================= */
let fy, fvy, pipes, lastTick;

function startFlappy(){
  canvas.style.display="block";
  fy=canvas.height/2;
  fvy=0;
  pipes=[];
  lastTick=Date.now();
  flappyLoop();
}

function flappyLoop(){
  if(stage!=="flappy") return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#3fa9f5";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  fvy+=0.5;
  fy+=fvy;

  drawSperm(150,fy);

  if(Math.random()<0.02){
    const gap=200;
    const top=Math.random()*(canvas.height-gap);
    pipes.push({x:canvas.width,top});
  }

  pipes.forEach(p=>{
    p.x-=5;
    ctx.fillStyle="#0a3cff";
    ctx.fillRect(p.x,0,40,p.top);
    ctx.fillRect(p.x,p.top+200,40,canvas.height);
    if(150< p.x+40 && 150>p.x && (fy<p.top||fy>p.top+200)) endGame();
  });

  if(fy<0||fy>canvas.height) endGame();

  if(Date.now()-lastTick>2000){
    time--;
    lastTick=Date.now();
  }

  requestAnimationFrame(flappyLoop);
}

/* =========================
   END
========================= */
function endGame(){
  clearInterval(timer);
  stage="end";
  canvas.style.display="none";
  saveScore(playerName,time);
  document.getElementById("finalTime").textContent=`Time: ${time}s`;
  renderBoard(document.getElementById("finalBoard"));
  document.getElementById("endScreen").classList.add("active");
}

document.getElementById("restartBtn").onclick=()=>location.reload();
