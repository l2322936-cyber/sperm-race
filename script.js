/* =====================
   GLOBAL
===================== */
let time = 60;
let name = "";
let phase = "start";
let timer;

/* =====================
   LEADERBOARD
===================== */
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}
function saveScore(n, t) {
  const b = getBoard();
  b.push({ n, t });
  b.sort((a,b)=>a.t-b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0,5)));
}
function renderBoard(id) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  getBoard().forEach(s=>{
    const li=document.createElement("li");
    li.textContent=`${s.n} — ${s.t}s`;
    el.appendChild(li);
  });
}

/* =====================
   START
===================== */
document.getElementById("startBtn").onclick = () => {
  name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("Enter a name");

  document.getElementById("startScreen").classList.remove("active");
  startTimer();
  startMaze();
};

function startTimer() {
  timer = setInterval(()=>time++,1000);
}

/* =====================
   MAZE SETUP (SOLVABLE)
===================== */
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const maze = [
"#############################",
"#S        #       #         #",
"# ####### # ##### # ####### #",
"#       # #     # #       # #",
"####### # ##### # ####### # #",
"#     # #     # # #     #   #",
"# ### # ##### # # # ### #####",
"# #   #     #   # #   #     #",
"# # ####### ##### ### ##### #",
"# #       #     #     #     #",
"# ####### ##### ####### #####",
"#       #     #       #     #",
"####### ##### ####### # ### #",
"#     #     #       # # #   #",
"# ### ##### ####### # # # ###",
"# #   #     #     # #   #   #",
"# # ### ##### ### # ##### ###",
"# #     #   #   # #     #   #",
"# ##### # # ### # ####### # #",
"#       # #     #         #E#",
"#############################"
];

const rows = maze.length;
const cols = maze[0].length;
const tile = Math.min(canvas.width / cols, canvas.height / rows);

/* =====================
   PLAYER (REALISTIC SPERM)
===================== */
const sperm = {
  x: 1.5,
  y: 1.5,
  r: tile * 0.25,
  speed: 0.25 // 25% faster
};

/* =====================
   COLLISION (FIXED)
===================== */
function hitsWall(nx, ny) {
  const checks = [
    [nx + sperm.r, ny],
    [nx - sperm.r, ny],
    [nx, ny + sperm.r],
    [nx, ny - sperm.r]
  ];

  return checks.some(([x,y])=>{
    const c = Math.floor(x);
    const r = Math.floor(y);
    return maze[r]?.[c] === "#";
  });
}

/* =====================
   DRAW MAZE
===================== */
function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  maze.forEach((row,y)=>{
    [...row].forEach((cell,x)=>{
      if(cell==="#"){
        ctx.fillStyle="#1c4fd8";
        ctx.fillRect(x*tile,y*tile,tile,tile);
      }
      if(cell==="E"){
        ctx.fillStyle="#00ff99";
        ctx.fillRect(x*tile,y*tile,tile,tile);
      }
    });
  });

  drawSperm();
}

/* =====================
   DRAW REALISTIC SPERM
===================== */
function drawSperm() {
  const px = sperm.x * tile;
  const py = sperm.y * tile;

  // head
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.ellipse(px,py,tile*0.35,tile*0.25,Math.sin(Date.now()/300)*0.2,0,Math.PI*2);
  ctx.fill();

  // tail (multi-segment)
  ctx.strokeStyle="white";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(px - tile*0.3, py);
  for(let i=1;i<=6;i++){
    ctx.lineTo(
      px - tile*(0.3 + i*0.15),
      py + Math.sin(Date.now()/120 + i)*6
    );
  }
  ctx.stroke();
}

/* =====================
   MAZE LOOP
===================== */
function startMaze() {
  phase="maze";
  canvas.style.display="block";
  requestAnimationFrame(loop);
}

function loop() {
  if(phase!=="maze") return;
  drawMaze();
  requestAnimationFrame(loop);
}

/* =====================
   CONTROLS
===================== */
window.addEventListener("keydown",e=>{
  if(phase!=="maze") return;

  let nx = sperm.x;
  let ny = sperm.y;

  if(e.key==="ArrowUp") ny -= sperm.speed;
  if(e.key==="ArrowDown") ny += sperm.speed;
  if(e.key==="ArrowLeft") nx -= sperm.speed;
  if(e.key==="ArrowRight") nx += sperm.speed;

  if(!hitsWall(nx, ny)){
    sperm.x = nx;
    sperm.y = ny;
  }

  if(maze[Math.floor(sperm.y)][Math.floor(sperm.x)]==="E"){
    canvas.style.display="none";
    clearInterval(timer);
    alert("MAZE COMPLETE — QUESTIONS NEXT");
  }
});
