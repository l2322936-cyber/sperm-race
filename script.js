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

  if (!startBtn) {
    console.error("Start button not found");
    return;
  }

  startBtn.addEventListener("click", () => {
    playerName = nameInput.value.trim() || "Anonymous";
    console.log("Starting game for:", playerName);
    showScreen("maze-screen");
  });
});

/* =====================
   SCREEN CONTROL
===================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const next = document.getElementById(id);
  if (next) {
    next.classList.add("active");
  } else {
    console.error("Screen not found:", id);
  }
}
