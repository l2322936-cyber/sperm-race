/* =====================
   GLOBAL STATE
===================== */
let playerName = "";
let time = 0;
let timerInterval;
let questionIndex = 0;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

/* =====================
   QUESTIONS
===================== */
const questions = [
  {
    q: "What is the function of the sperm tail?",
    a: ["Movement", "Nutrition", "Protection", "Division"],
    c: 0
  },
  {
    q: "Where does fertilization usually occur?",
    a: ["Uterus", "Ovary", "Fallopian tube", "Cervix"],
    c: 2
  },
  {
    q: "How many chromosomes does a sperm cell have?",
    a: ["46", "23", "92", "12"],
    c: 1
  },
  {
    q: "What does the acrosome do?",
    a: ["Moves sperm", "Stores DNA", "Breaks egg membrane", "Feeds sperm"],
    c: 2
  },
  {
    q: "Why are many sperm released?",
    a: ["Speed", "Competition", "Survival odds", "Energy"],
    c: 2
  }
];

/* =====================
   DOM READY
===================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn").onclick = startGame;
  document.getElementById("restart-btn").onclick = () => location.reload();
  updateLeaderboard();
});

/* =====================
   GAME FLOW
===================== */
function startGame() {
  playerName = document.getElementById("name-input").value || "Anonymous";
  time = 0;
  startTimer();
  showScreen("maze-screen");
  startMaze();
}

function startTimer() {
  timerInterval = setInterval(() => {
    time += 0.1;
    document.getElementById("time").innerText = "Time: " + time.toFixed(1) + "s";
  }, 100);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* =====================
   MAZE
===================== */
function startMaze() {
  const canvas = document.getElementById("maze-canvas");
  const ctx = canvas.getContext("2d");

  const walls = [
    [0,0,900,20],[0,0,20,500],[0,480,900,20],[880,0,20,500],
    [100,0,20,400],[200,100,20,400],[300,0,20,400],
    [400,100,20,400],[500,0,20,400],[600,100,20,400]
  ];

  let sperm = { x: 40, y: 250, r: 10, speed: 4 };

  function drawSperm() {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(sperm.x, sperm.y, sperm.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(sperm.x - 10, sperm.y);
    ctx.lineTo(sperm.x - 30, sperm.y + 10);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0,0,900,500);
    ctx.fillStyle = "#00ffb3";
    walls.forEach(w => ctx.fillRect(...w));
    drawSperm();

    if (sperm.x > 850) {
      showQuestion();
      return;
    }
    requestAnimationFrame(draw);
  }

  document.onkeydown = e => {
    if (e.key === "w") sperm.y -= sperm.speed;
    if (e.key === "s") sperm.y += sperm.speed;
    if (e.key === "a") sperm.x -= sperm.speed;
    if (e.key === "d") sperm.x += sperm.speed;
  };

  draw();
}

/* =====================
   QUESTIONS
===================== */
function showQuestion() {
  showScreen("question-screen");
  const q = questions[questionIndex];
  document.getElementById("question-text").innerText = q.q;
  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.a.forEach((txt, i) => {
    const b = document.createElement("button");
    b.innerText = txt;
    b.onclick = () => {
      time += i === q.c ? -10 : 10;
      questionIndex++;
      questionIndex < questions.length ? showQuestion() : startFlappy();
    };
    answers.appendChild(b);
  });
}

/* =====================
   FLAPPY
===================== */
function startFlappy() {
  showScreen("flappy-screen");
  const c = document.getElementById("flappy-canvas");
  const ctx = c.getContext("2d");

  let y = 250, vy = 0;
  let pipes = [{ x: 900, gap: 200 }];

  document.onkeydown = e => {
    if (e.key === "ArrowUp") vy = -6;
  };

  function loop() {
    ctx.clearRect(0,0,900,500);
    vy += 0.4;
    y += vy;

    pipes.forEach(p => {
      p.x -= 3;
      ctx.fillStyle = "#00ffb3";
      ctx.fillRect(p.x,0,40,p.gap-80);
      ctx.fillRect(p.x,p.gap+80,40,500);
    });

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(100,y,10,0,Math.PI*2);
    ctx.fill();

    if (pipes[0].x < -40) pipes.push({ x: 900, gap: 100 + Math.random()*300 });
    if (pipes.some(p => p.x < 140 && p.x > 60 && (y < p.gap-80 || y > p.gap+80))) {
      endGame();
      return;
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* =====================
   END + LEADERBOARD
===================== */
function endGame() {
  clearInterval(timerInterval);
  leaderboard.push({ name: playerName, time: time.toFixed(1) });
  leaderboard.sort((a,b)=>a.time-b.time);
  leaderboard = leaderboard.slice(0,5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();
  document.getElementById("final-time").innerText = `Final Time: ${time.toFixed(1)}s`;
  showScreen("end-screen");
}

function updateLeaderboard() {
  const ol = document.getElementById("leaderboard");
  if (!ol) return;
  ol.innerHTML = "";
  leaderboard.forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.name} — ${e.time}s`;
    ol.appendChild(li);
  });
}
