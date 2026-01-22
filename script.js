console.log("JS LOADED");

/* =====================
   GLOBAL STATE
===================== */
let playerName = "";
let time = 0;

/* =====================
   DOM READY
===================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const startBtn = document.getElementById("start-btn");
  const nameInput = document.getElementById("name-input");

  startBtn.addEventListener("click", () => {
    playerName = nameInput.value.trim() || "Anonymous";
    showScreen("maze-screen");
    startMaze(); // canvas is accessed ONLY here
  });
});

/* =====================
   SCREEN CONTROL
===================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
}

/* =====================
   MAZE SETUP (SAFE)
===================== */
function startMaze() {
  const canvas = document.getElementById("maze-canvas");
  if (!canvas) {
    console.error("Maze canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0a3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.fillText("Maze Loaded", 300, 250);
}
