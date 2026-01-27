let timeLeft = 60;
let player = "";
let timerInterval;

/* START */
function startGame() {
  player = document.getElementById("playerName").value || "Player";
  document.getElementById("startScreen").classList.add("hidden");
  startMaze();
}

/* MAZE */
const mazeCanvas = document.getElementById("mazeCanvas");
const ctx = mazeCanvas.getContext("2d");

let maze, cellSize, cols, rows;
let px = 1, py = 1;
const SPEED = 2;

function startMaze() {
  mazeCanvas.classList.remove("hidden");
  resizeMaze();
  generateMaze();
  startTimer();
  requestAnimationFrame(drawMaze);
}

function resizeMaze() {
  mazeCanvas.width = window.innerWidth;
  mazeCanvas.height = window.innerHeight;
  cols = 21;
  rows = 21;
  cellSize = Math.min(
    mazeCanvas.width / cols,
    mazeCanvas.height / rows
  );
}

function generateMaze() {
  maze = Array.from({ length: rows }, () =>
    Array(cols).fill(1)
  );

  function carve(x, y) {
    const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random()-0.5);
    dirs.forEach(([dx, dy]) => {
      let nx = x + dx, ny = y + dy;
      if (nx > 0 && ny > 0 && nx < cols-1 && ny < rows-1 && maze[ny][nx]) {
        maze[ny][nx] = 0;
        maze[y + dy/2][x + dx/2] = 0;
        carve(nx, ny);
      }
    });
  }

  maze[1][1] = 0;
  carve(1,1);
  maze[rows-2][cols-2] = 0;
}

function drawMaze() {
  ctx.clearRect(0,0,mazeCanvas.width,mazeCanvas.height);

  for (let y=0;y<rows;y++) {
    for (let x=0;x<cols;x++) {
      if (maze[y][x]) {
        ctx.fillStyle = "#007";
        ctx.fillRect(
          x*cellSize, y*cellSize,
          cellSize, cellSize
        );
      }
    }
  }

  ctx.font = `${cellSize}px serif`;
  ctx.fillText("🧬", px*cellSize, (py+1)*cellSize);

  if (px === cols-2 && py === rows-2) {
    stopTimer();
    mazeCanvas.classList.add("hidden");
    startQuestions();
    return;
  }

  requestAnimationFrame(drawMaze);
}

document.addEventListener("keydown", e => {
  let nx = px, ny = py;
  if (e.key === "ArrowUp") ny -= SPEED;
  if (e.key === "ArrowDown") ny += SPEED;
  if (e.key === "ArrowLeft") nx -= SPEED;
  if (e.key === "ArrowRight") nx += SPEED;

  if (maze[ny] && maze[ny][nx] === 0) {
    px = nx;
    py = ny;
  }
});

/* TIMER */
function startTimer() {
  timerInterval = setInterval(() => timeLeft--, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
}

/* QUESTIONS + FLAPPY would continue here (unchanged) */
