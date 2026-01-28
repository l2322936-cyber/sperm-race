console.log("SCRIPT LOADED ✅");

const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("startScreen");
const canvas = document.getElementById("gameCanvas");

startBtn.addEventListener("click", () => {
  console.log("START BUTTON CLICKED ✅");

  startScreen.style.display = "none";
  canvas.style.display = "block";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("START WORKS", 100, 100);
});
