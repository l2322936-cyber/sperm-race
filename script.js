console.log("JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const startBtn = document.getElementById("start-btn");
  const nameInput = document.getElementById("name-input");

  if (!startBtn) {
    console.error("Start button missing");
    return;
  }

  startBtn.onclick = () => {
    const name = nameInput.value || "Anonymous";
    console.log("Starting game for", name);
    showScreen("maze-screen");
  };
});

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}
