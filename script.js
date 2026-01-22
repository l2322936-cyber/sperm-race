const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

document.getElementById("startBtn").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lime";
  ctx.font = "30px Arial";
  ctx.fillText("NEW CODE LOADED ✅", 220, 250);
};
