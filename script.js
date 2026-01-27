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
   MAZE DATA (UNCHANGED)
===================== */
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

/* =====================
   CANVAS + CENTERING
===================== */
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const tile = Math.min(
  canvas.width / (cols + 2),
  canvas.height / (rows + 2)
);

const offsetX = (canvas.width - cols * tile) / 2;
const offsetY = (canvas.height - rows * tile) / 2;

/* =====================
   PLAYER (PIXEL-BASED)
===================== */
const sperm = {
  x: offsetX + tile * 1.5,
  y: offsetY + tile * 1.5,
  r: tile * 0.22,
  speed: tile * 0.16 // fast but precise
};

/* =====================
   COLLISION (FIXED)
===================== */
function isWall(px, py) {
  const col = Math.floor((px - offsetX) / tile);
  const row = Math.floor((py - offsetY) / tile);

  if (row < 0 || col < 0 || row >= rows || col >= cols) return true;
  return maze[row][col] === "#";
}

function hitsWall(nx, ny) {
  return (
    isWall(nx + sperm.r, ny) ||
    isWall(nx - sperm.r, ny) ||
    isWall(nx, ny + sperm.r) ||
    isWall(nx, ny - sperm.r)
  );
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
        ctx.fillRect(
          offsetX + x * tile,
          offsetY + y * tile,
          tile,
          tile
        );
      }
      if(cell==="E"){
        ctx.fillStyle="#00ff99";
        ctx.fillRect(
          offsetX + x * tile,
          offsetY + y * tile,
          tile,
          tile
        );
      }
    });
  });

  drawSperm();
}

/* =====================
   REALISTIC SPERM
===================== */
function drawSperm() {
  ctx.fillStyle="white";

  // head
  ctx.beginPath();
  ctx.ellipse(
    sperm.x,
    sperm.y,
    tile * 0.32,
    tile * 0.22,
    Math.sin(Date.now()/300)*0.25,
    0,
    Math.PI*2
  );
  ctx.fill();

  // tail
  ctx.strokeStyle="white";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(sperm.x - tile*0.3, sperm.y);
  for(let i=1;i<=6;i++){
    ctx.lineTo(
      sperm.x - tile*(0.3 + i*0.15),
      sperm.y + Math.sin(Date.now()/120 + i)*6
    );
  }
  ctx.stroke();
}

/* =====================
   LOOP
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

  const col = Math.floor((sperm.x - offsetX) / tile);
  const row = Math.floor((sperm.y - offsetY) / tile);

  if(maze[row]?.[col] === "E"){
    canvas.style.display="none";
    clearInterval(timer);
    alert("Maze complete — next stage!");
  }
});
