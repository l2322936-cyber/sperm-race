window.onload = () => {

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const startScreen = document.getElementById("startScreen");
  const questionScreen = document.getElementById("questionScreen");
  const flappyIntro = document.getElementById("flappyIntro");
  const endScreen = document.getElementById("endScreen");
  const startBtn = document.getElementById("startBtn");

  let timer = 60;

  // ---------- LEADERBOARD ----------
  function loadBoard() {
    const board = JSON.parse(localStorage.getItem("board") || "[]");
    document.getElementById("leaderboard").innerHTML =
      board.map(b => `<li>${b.name}: ${b.time}s</li>`).join("");
  }
  loadBoard();

  // ---------- START BUTTON ----------
  startBtn.onclick = () => {
    console.log("START CLICKED ✅");
    startScreen.classList.add("hidden");
    canvas.style.display = "block";
    startMaze();
  };

  // ---------- PLAYER ----------
  const player = {
    x: 60,
    y: 60,
    r: 12,
    vx: 0,
    vy: 0
  };

  let tailAngle = 0;

  // ---------- MAZE (SOLVABLE) ----------
  const walls = [
    {x:0,y:0,w:canvas.width,h:20},
    {x:0,y:canvas.height-20,w:canvas.width,h:20},
    {x:0,y:0,w:20,h:canvas.height},
    {x:canvas.width-20,y:0,w:20,h:canvas.height},

    {x:100,y:100,w:800,h:20},
    {x:100,y:100,w:20,h:500},
    {x:200,y:300,w:700,h:20},
    {x:880,y:300,w:20,h:400},
    {x:300,y:500,w:600,h:20}
  ];

  const endZone = {
    x: canvas.width - 80,
    y: canvas.height - 80,
    w: 40,
    h: 40
  };

  function drawSperm() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      ctx.lineTo(
        player.x - i * 6,
        player.y + Math.sin(tailAngle + i * 0.4) * 6
      );
    }
    ctx.stroke();
    tailAngle += 0.3;
  }

  function drawMaze() {
    ctx.fillStyle = "#7ecbff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e4f7a";
    walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

    ctx.fillStyle = "red";
    ctx.fillRect(endZone.x, endZone.y, endZone.w, endZone.h);

    drawSperm();
  }

  function startMaze() {
    function loop() {
      drawMaze();

      player.x += player.vx;
      player.y += player.vy;

      walls.forEach(w => {
        if (
          player.x + player.r > w.x &&
          player.x - player.r < w.x + w.w &&
          player.y + player.r > w.y &&
          player.y - player.r < w.y + w.h
        ) {
          player.x -= player.vx;
          player.y -= player.vy;
        }
      });

      if (
        player.x > endZone.x &&
        player.y > endZone.y
      ) {
        canvas.style.display = "none";
        questionScreen.classList.remove("hidden");
        return;
      }

      requestAnimationFrame(loop);
    }
    loop();
  }

  // ---------- CONTROLS ----------
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") player.vy = -5;
    if (e.key === "ArrowDown") player.vy = 5;
    if (e.key === "ArrowLeft") player.vx = -5;
    if (e.key === "ArrowRight") player.vx = 5;
  });

  window.addEventListener("keyup", () => {
    player.vx = 0;
    player.vy = 0;
  });

};
