/* =====================
   CANVAS SETUP
===================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =====================
   GAME STATE
===================== */
let gameState = "maze";

/* =====================
   SPERM PLAYER
===================== */
const sperm = {
  x: 40,
  y: 40,
  r: 10,
  speed: 4  // 2× faster
};

/* =====================
   MAZE WALLS (SOLVABLE)
===================== */
const walls = [
  { x: 0, y: 0, w: 800, h: 20 },
  { x: 0, y: 0, w: 20, h: 500 },
  { x: 780, y: 0, w: 20, h: 500 },
  { x: 0, y: 480, w: 800, h: 20 },

  { x: 60, y: 60, w: 680, h: 20 },
  { x: 60, y: 60, w: 20, h: 380 },
  { x: 60, y: 420, w: 680, h: 20 },

  { x: 720, y: 100, w: 20, h: 320 },
  { x: 140, y: 120, w: 520, h: 20 },
  { x: 140, y: 120, w: 20, h: 260 },
  { x: 140, y: 380, w: 520, h: 20 },

  { x: 660, y: 160, w: 20, h: 180 }
];

/* =====================
   FINISH ZONE
===================== */
const finish = {
  x: 720,
  y: 440,
  w: 40,
  h: 40
};

/* =====================
   INPUT
===================== */
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* =====================
   COLLISION
===================== */
function hitWall(nx, ny) {
  for (let w of walls) {
    if (
      nx + sperm.r > w.x &&
      nx - sperm.r < w.x + w.w &&
      ny + sperm.r > w.y &&
      ny - sperm.r < w.y + w.h
    ) {
      return true;
    }
  }
  return false;
}

/* =====================
   DRAW SPERM (REALISTIC)
===================== */
function drawSperm() {
  // head
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // tail
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sperm.x - 10, sperm.y);
  ctx.lineTo(sperm.x - 25, sperm.y + Math.sin(Date.now() / 100) * 6);
  ctx.stroke();
}

/* =====================
   UPDATE
===================== */
function update() {
  let nx = sperm.x;
  let ny = sperm.y;

  if (keys["w"]) ny -= sperm.speed;
  if (keys["s"]) ny += sperm.speed;
  if (keys["a"]) nx -= sperm.speed;
  if (keys["d"]) nx += sperm.speed;

  if (!hitWall(nx, sperm.y)) sperm.x = nx;
  if (!hitWall(sperm.x, ny)) sperm.y = ny;

  // finish
  if (
    sperm.x > finish.x &&
    sperm.y > finish.y
  ) {
    gameState = "done";
  }
}

/* =====================
   DRAW
===================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // walls
  ctx.fillStyle = "#1e90ff";
  walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

  // finish
  ctx.fillStyle = "lime";
  ctx.fillRect(finish.x, finish.y, finish.w, finish.h);

  drawSperm();

  if (gameState === "done") {
    ctx.fillStyle = "yellow";
    ctx.font = "30px Arial";
    ctx.fillText("MAZE COMPLETE!", 260, 250);
  }
}

/* =====================
   LOOP
===================== */
function loop() {
  if (gameState === "maze") update();
  draw();
  requestAnimationFrame(loop);
}

loop();
