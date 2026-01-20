/* =====================
   GLOBAL STATE
===================== */
const game = document.getElementById("game");
const timerEl = document.getElementById("timer");

let playerName = "";
let time = 0;
let timerInterval;
let stageIndex = 0;

const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

/* =====================
   TIMER
===================== */
function startTimer() {
  timerInterval = setInterval(() => {
    time++;
    timerEl.textContent = `Time: ${time}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

/* =====================
   QUESTIONS
===================== */
const questions = [
  { q: "What does sperm fertilize?", a: 0, o: ["Egg", "Blood", "Skin"] },
  { q: "Where does fertilization occur?", a: 1, o: ["Uterus", "Fallopian tube", "Ovary"] },
  { q: "What gives sperm movement?", a: 2, o: ["Nucleus", "Mitochondria", "Flagellum"] },
  { q: "How many chromosomes are in sperm?", a: 0, o: ["23", "46", "92"] },
  { q: "Why are millions of sperm released?", a: 1, o: ["Speed", "Survival", "Size"] }
];

function questionStage() {
  const q = questions.splice(Math.floor(Math.random() * questions.length), 1)[0];

  game.innerHTML = `
    <h2>${q.q}</h2>
    ${q.o.map((opt, i) =>
      `<button onclick="answer(${i === q.a})">${opt}</button>`
    ).join("")}
  `;
}

window.answer = correct => {
  time += correct ? -10 : 10;
  nextStage();
};

/* =====================
   SPERM CREATOR
===================== */
function createSperm() {
  const s = document.createElement("div");
  s.style.position = "absolute";
  s.innerHTML = `
    <div style="width:18px;height:18px;background:#facc15;border-radius:50%"></div>
    <div style="width:22px;height:4px;background:#fde68a;margin-left:18px;margin-top:-11px"></div>
  `;
  return s;
}

/* =====================
   MAZE GAME
===================== */
function mazeStage(size = 10) {
  game.innerHTML = "";
  game.style.position = "relative";
  game.style.width = "420px";
  game.style.height = "420px";
  game.style.border = "3px solid white";

  const cell = 42;
  const walls = [];

  const layout = [
    "S000111100",
    "1110000010",
    "0001111010",
    "0110000010",
    "0101111110",
    "0100000000",
    "0111111110",
    "0000000010",
    "1111111010",
    "000000001F"
  ];

  let finish;

  layout.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === "1") {
        const w = document.createElement("div");
        w.style.cssText = `
          position:absolute;width:${cell}px;height:${cell}px;
          background:#334155;
          left:${x * cell}px;top:${y * cell}px;
        `;
        game.appendChild(w);
        walls.push(w);
      }
      if (c === "F") {
        finish = document.createElement("div");
        finish.style.cssText = `
          position:absolute;width:30px;height:30px;
          background:#22c55e;
          left:${x * cell + 6}px;top:${y * cell + 6}px;
        `;
        game.appendChild(finish);
      }
    });
  });

  const sperm = createSperm();
  sperm.style.left = "5px";
  sperm.style.top = "5px";
  game.appendChild(sperm);

  function hit(x, y) {
    return walls.some(w =>
      x < w.offsetLeft + cell &&
      x + 36 > w.offsetLeft &&
      y < w.offsetTop + cell &&
      y + 18 > w.offsetTop
    );
  }

  document.onkeydown = e => {
    let x = sperm.offsetLeft;
    let y = sperm.offsetTop;
    const s = 6;

    if (e.key === "w") y -= s;
    if (e.key === "s") y += s;
    if (e.key === "a") x -= s;
    if (e.key === "d") x += s;

    if (!hit(x, y)) {
      sperm.style.left = x + "px";
      sperm.style.top = y + "px";
    }

    if (x + 30 > finish.offsetLeft && y + 30 > finish.offsetTop) {
      document.onkeydown = null;
      nextStage();
    }
  };
}

/* =====================
   FLAPPY GAME
===================== */
function flappyStage() {
  game.innerHTML = `
    <button id="startFlap">Start</button>
    <div id="area" style="width:360px;height:420px;border:3px solid white;position:relative;overflow:hidden"></div>
  `;

  const area = document.getElementById("area");
  const sperm = createSperm();
  sperm.style.left = "40px";
  sperm.style.top = "200px";
  area.appendChild(sperm);

  let velocity = 0;
  let gravity = 0.35;
  let started = false;
  let pipes = [];

  document.getElementById("startFlap").onclick = () => started = true;
  document.onkeydown = e => { if (started && e.key === "ArrowUp") velocity = -5; };

  function spawnPipe() {
    const gap = 120;
    const topH = Math.random() * 200 + 40;

    const top = document.createElement("div");
    const bottom = document.createElement("div");

    top.style.cssText = `position:absolute;width:40px;height:${topH}px;background:#475569;right:0`;
    bottom.style.cssText = `position:absolute;width:40px;height:${420 - topH - gap}px;background:#475569;right:0;bottom:0`;

    area.append(top, bottom);
    pipes.push({ top, bottom });
  }

  setInterval(() => started && spawnPipe(), 1800);

  const loop = setInterval(() => {
    if (!started) return;

    velocity += gravity;
    sperm.style.top = sperm.offsetTop + velocity + "px";

    pipes.forEach(p => {
      p.top.style.left = p.top.offsetLeft - 2 + "px";
      p.bottom.style.left = p.bottom.offsetLeft - 2 + "px";

      if (
        sperm.offsetLeft + 30 > p.top.offsetLeft &&
        sperm.offsetLeft < p.top.offsetLeft + 40 &&
        (sperm.offsetTop < p.top.offsetHeight ||
         sperm.offsetTop + 18 > p.bottom.offsetTop)
      ) {
        clearInterval(loop);
        nextStage();
      }
    });
  }, 30);
}

/* =====================
   FLOW CONTROL
===================== */
const stages = [
  questionStage,
  mazeStage,
  questionStage,
  flappyStage,
  questionStage,
  mazeStage,
  questionStage,
  questionStage
];

function nextStage() {
  stageIndex++;
  if (stageIndex < stages.length) stages[stageIndex]();
  else finishGame();
}

/* =====================
   FINISH
===================== */
function finishGame() {
  stopTimer();
  leaderboard.push({ name: playerName, time });
  leaderboard.sort((a, b) => a.time - b.time);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  game.innerHTML = `
    <h2>Finished</h2>
    <p>${playerName} — ${time}s</p>
    <h3>Leaderboard</h3>
    <ol>${leaderboard.slice(0, 5).map(l => `<li>${l.name}: ${l.time}s</li>`).join("")}</ol>
    <button onclick="location.reload()">Restart</button>
  `;
}

/* =====================
   START
===================== */
game.innerHTML = `
  <input id="name" placeholder="Enter your name" />
  <button id="start">Start</button>
`;

document.getElementById("start").onclick = () => {
  playerName = document.getElementById("name").value || "Anonymous";
  startTimer();
  stages[0]();
};
