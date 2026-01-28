/* =========================
   START SCREEN + LEADERBOARD
========================= */

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const leaderboardEl = document.getElementById("leaderboard");
const canvas = document.getElementById("gameCanvas");

let playerName = "Anonymous";

/* ---------- LEADERBOARD ---------- */
function loadBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}

function saveScore(name, time) {
  const board = loadBoard();
  board.push({ name, time });
  board.sort((a,b)=>a.time-b.time);
  localStorage.setItem("spermBoard", JSON.stringify(board.slice(0,5)));
}

function renderBoard() {
  leaderboardEl.innerHTML = "";
  loadBoard().forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.time}s`;
    leaderboardEl.appendChild(li);
  });
}

renderBoard();

/* ---------- START GAME ---------- */
startBtn.onclick = () => {
  playerName = nameInput.value.trim() || "Anonymous";
  startScreen.style.display = "none";
  canvas.style.display = "block";
  stage = "maze";        // MUST match your maze code
  mazeLoop();            // MUST already exist
};

/* ===============================
   SOLVABLE FULLSCREEN MAZE
   SMOOTH SPERM MOVEMENT
================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "maze";

/* ---------- MAZE SETTINGS ---------- */
const COLS = 31;   // odd numbers = better mazes
const ROWS = 21;
const CELL = Math.floor(Math.min(
  canvas.width / COLS,
  canvas.height / ROWS
));

const offsetX = (canvas.width - COLS * CELL) / 2;
const offsetY = (canvas.height - ROWS * CELL) / 2;

/* ---------- MAZE GENERATION (DFS) ---------- */
let maze = Array.from({ length: ROWS }, () =>
  Array(COLS).fill(1)
);

function carve(x, y) {
  const dirs = [
    [2,0], [-2,0], [0,2], [0,-2]
  ].sort(() => Math.random() - 0.5);

  maze[y][x] = 0;

  for (let [dx, dy] of dirs) {
    let nx = x + dx;
    let ny = y + dy;

    if (
      ny > 0 && ny < ROWS - 1 &&
      nx > 0 && nx < COLS - 1 &&
      maze[ny][nx] === 1
    ) {
      maze[y + dy/2][x + dx/2] = 0;
      carve(nx, ny);
    }
  }
}

carve(1,1);
maze[1][1] = 2;                       // START
maze[ROWS-2][COLS-2] = 3;             // END

/* ---------- SPERM (PIXEL MOVEMENT) ---------- */
let sperm = {
  x: offsetX + CELL + CELL/2,
  y: offsetY + CELL + CELL/2,
  r: CELL * 0.25,
  speed: 6,
  vx: 0,
  vy: 0
};

const keys = {};

/* ---------- INPUT ---------- */
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* ---------- COLLISION ---------- */
function wallAt(px, py) {
  let cx = Math.floor((px - offsetX) / CELL);
  let cy = Math.floor((py - offsetY) / CELL);
  return maze[cy]?.[cx] === 1;
}

/* ---------- UPDATE ---------- */
function update() {
  sperm.vx = sperm.vy = 0;
  if (keys.ArrowUp) sperm.vy = -sperm.speed;
  if (keys.ArrowDown) sperm.vy = sperm.speed;
  if (keys.ArrowLeft) sperm.vx = -sperm.speed;
  if (keys.ArrowRight) sperm.vx = sperm.speed;

  let nx = sperm.x + sperm.vx;
  let ny = sperm.y + sperm.vy;

  if (!wallAt(nx, sperm.y)) sperm.x = nx;
  if (!wallAt(sperm.x, ny)) sperm.y = ny;

  // END CHECK
  let endX = offsetX + (COLS-2)*CELL;
  let endY = offsetY + (ROWS-2)*CELL;
  if (
    Math.abs(sperm.x - (endX + CELL/2)) < CELL/2 &&
    Math.abs(sperm.y - (endY + CELL/2)) < CELL/2
  ) {
    stage = "questions";
    canvas.style.display = "none";
    startQuestions(); // your existing function
    return;
  }
}

/* ---------- DRAW ---------- */
function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for (let y=0;y<ROWS;y++){
    for (let x=0;x<COLS;x++){
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#1f4fd8";
        ctx.fillRect(
          offsetX + x*CELL,
          offsetY + y*CELL,
          CELL, CELL
        );
      }
      if (maze[y][x] === 3) {
        ctx.fillStyle = "gold";
        ctx.fillRect(
          offsetX + x*CELL,
          offsetY + y*CELL,
          CELL, CELL
        );
      }
    }
  }
}

function drawSperm() {
  // head
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(sperm.x, sperm.y, sperm.r, 0, Math.PI*2);
  ctx.fill();

  // animated tail
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let wiggle = Math.sin(Date.now()/100) * 10;
  ctx.moveTo(sperm.x - sperm.r, sperm.y);
  ctx.lineTo(
    sperm.x - sperm.r - 30,
    sperm.y + wiggle
  );
  ctx.stroke();
}

/* ---------- LOOP ---------- */
function loop() {
  if (stage !== "maze") return;
  update();
  drawMaze();
  drawSperm();
  requestAnimationFrame(loop);
}

canvas.style.display = "block";
loop();


/* ---------- QUESTIONS ---------- */
const questions = [
  {q:"What is meiosis?", a:["Cell division for gametes","Mitosis","Fertilization"], c:0},
  {q:"Humans have how many chromosomes?", a:["46","23","92"], c:0},
  {q:"DNA shape?", a:["Helix","Square","Circle"], c:0},
  {q:"Sperm is produced where?", a:["Testes","Ovary","Uterus"], c:0},
  {q:"Egg cell is called?", a:["Ovum","Zygote","Embryo"], c:0},
  {q:"Fertilization creates?", a:["Zygote","Embryo","Fetus"], c:0},
  {q:"Mutation means?", a:["DNA change","Growth","Death"], c:0},
  {q:"Which is haploid?", a:["Sperm","Skin cell","Liver cell"], c:0},
  {q:"Crossing over occurs in?", a:["Meiosis","Mitosis","Fertilization"], c:0},
  {q:"Gametes have?", a:["Half DNA","Double DNA","No DNA"], c:0}
];

function startQuestions(){
  stage="questions";
  questionScreen.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion(){
  if(questionIndex>=questions.length){
    questionScreen.classList.add("hidden");
    startFlappyIntro();
    return;
  }

  const q = questions[questionIndex];
  questionText.innerText = q.q;
  answersDiv.innerHTML="";

  q.a.forEach((ans,i)=>{
    const btn=document.createElement("button");
    btn.innerText=ans;
    btn.onclick=()=>{
      timer += (i===q.c ? -5 : 5);
      questionIndex++;
      loadQuestion();
    };
    answersDiv.appendChild(btn);
  });
}

/* ---------- FLAPPY ---------- */
function startFlappyIntro(){
  stage="flappyIntro";
  flappyIntro.classList.remove("hidden");

  document.addEventListener("keydown", startFlappyOnce, {once:true});
}

function startFlappyOnce(){
  flappyIntro.classList.add("hidden");
  canvas.style.display="block";
  stage="flappy";
  startFlappy();
}

let birdY = canvas.height/2;
let velocity = 0;

function startFlappy(){
  setInterval(()=>{ timer--; },2000);
  requestAnimationFrame(flappyLoop);
}

function flappyLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  velocity += 0.5;
  birdY += velocity;

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(200,birdY,15,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle="white";
  ctx.beginPath();
  ctx.moveTo(185,birdY);
  ctx.lineTo(150,birdY+Math.sin(Date.now()/100)*15);
  ctx.stroke();

  requestAnimationFrame(flappyLoop);
}

document.addEventListener("keydown",e=>{
  if(stage==="flappy" && e.key==="ArrowUp"){
    velocity=-8;
  }
});
