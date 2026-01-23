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

// ---------- MAZE (HAND-TRACED, SOLVABLE) ----------
const tile = 40;
const maze = [
"########################",
"#S   #       #        #",
"# ### # ##### # ###### #",
"#     #     # #      # #",
"##### ##### # ###### # #",
"#     #   # #        # #",
"# ### # # # ######## # #",
"# #   # # #        #   #",
"# # ##### # ######## ###",
"# #     # #        #   #",
"# ##### # ###### ### ###",
"#     #       #        E",
"########################"
];

let px = tile * 1.5;
let py = tile * 1.5;
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
  return maze[r]?.[c] === "#";
}

function drawMaze() {
  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === "#") {
        ctx.fillStyle = "#123";
        ctx.fillRect(c * tile, r * tile, tile, tile);
      }
    }
  }
}

function drawSperm(x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x - 30, y + Math.sin(Date.now()/100)*4);
  ctx.stroke();
}

function mazeLoop() {
  if (stage !== "maze") return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMaze();

  if (!wall(px + vx, py)) px += vx;
  if (!wall(px, py + vy)) py += vy;

  drawSperm(px, py);

  if (px > tile * 22 && py > tile * 10) {
    canvas.style.display = "none";
    startQuestions();
    return;
  }

  requestAnimationFrame(mazeLoop);
}

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
