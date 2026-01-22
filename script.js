/* =====================
   GLOBAL STATE
===================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let state = "start";
let playerName = "";
let time = 0;
let timerInterval;
let questionIndex = 0;

/* =====================
   LEADERBOARD
===================== */
function saveScore(name, time) {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push({ name, time });
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem("scores", JSON.stringify(scores.slice(0, 5)));
}

function loadLeaderboard(id) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name}: ${s.time.toFixed(1)}s`;
    ul.appendChild(li);
  });
}

loadLeaderboard("leaderboard");

/* =====================
   START
===================== */
function startGame() {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("startScreen").classList.add("hidden");
  state = "maze";
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    time += 0.1;
    document.getElementById("timer").textContent = `Time: ${time.toFixed(1)}s`;
  }, 100);
}

/* =====================
   SPERM
===================== */
const sperm = {
  x: 40,
  y: 40,
  speed: 5
};

/* =====================
   MAZE (SOLVABLE)
===================== */
const walls = [
  {x:0,y:0,w:900,h:20},{x:0,y:0,w:20,h:500},{x:880,y:0,w:20,h:500},{x:0,y:480,w:900,h:20},
  {x:80,y:80,w:740,h:20},{x:80,y:80,w:20,h:340},{x:80,y:420,w:740,h:20},
  {x:800,y:120,w:20,h:300},{x:160,y:140,w:580,h:20},
  {x:160,y:140,w:20,h:260},{x:160,y:380,w:580,h:20}
];

const finish = {x:820,y:440,w:40,h:40};

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function hitWall(nx, ny) {
  return walls.some(w =>
    nx > w.x - 10 && nx < w.x + w.w + 10 &&
    ny > w.y - 10 && ny < w.y + w.h + 10
  );
}

function drawSperm() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(sperm.x, sperm.y, 12, 8, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(sperm.x - 12, sperm.y);
  ctx.lineTo(sperm.x - 30, sperm.y + Math.sin(Date.now()/100)*8);
  ctx.stroke();
}

/* =====================
   QUESTIONS (10)
===================== */
const questions = [
  {q:"What is fertilization?", a:["Fusion of sperm and egg","Cell division","Pregnancy","Ovulation"], c:0},
  {q:"Where does fertilization usually occur?", a:["Uterus","Ovary","Fallopian tube","Cervix"], c:2},
  {q:"What cell does sperm fertilize?", a:["Zygote","Egg","Embryo","Fetus"], c:1},
  {q:"What is meiosis?", a:["Cell growth","Cell death","Division forming sex cells","Fertilization"], c:2},
  {q:"What carries genetic info?", a:["Proteins","DNA","Lipids","Hormones"], c:1},
  {q:"Which is male reproductive cell?", a:["Egg","Zygote","Sperm","Embryo"], c:2},
  {q:"What organ produces sperm?", a:["Prostate","Testes","Penis","Bladder"], c:1},
  {q:"What hormone regulates reproduction?", a:["Insulin","Estrogen","Adrenaline","Melatonin"], c:1},
  {q:"What forms after fertilization?", a:["Embryo","Zygote","Fetus","Egg"], c:1},
  {q:"Why is sexual reproduction important?", a:["Speed","Variation","Cloning","Size"], c:1}
];

function showQuestion() {
  state = "question";
  document.getElementById("questionScreen").classList.remove("hidden");

  const q = questions[questionIndex];
  document.getElementById("questionText").textContent = q.q;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  q.a.forEach((ans,i)=>{
    const btn=document.createElement("button");
    btn.textContent=ans;
    btn.onclick=()=>answer(i);
    answersDiv.appendChild(btn);
  });
}

function answer(i) {
  if (i === questions[questionIndex].c) time -= 10;
  else time += 10;

  questionIndex++;
  document.getElementById("questionScreen").classList.add("hidden");

  state = questionIndex === questions.length ? "flappy" : "maze";
}

/* =====================
   FLAPPY SPERM
===================== */
let vy = 0;
let pipes = [];

function flappy() {
  sperm.y += vy;
  vy += 0.4;
  if (keys[" "]) vy = -6;

  if (Math.random()<0.02) {
    pipes.push({x:900, gap:150+Math.random()*150});
  }

  pipes.forEach(p=>p.x-=3);
  pipes = pipes.filter(p=>p.x>-50);

  pipes.forEach(p=>{
    if (sperm.x>p.x && sperm.x<p.x+40 &&
       (sperm.y<p.gap-60||sperm.y>p.gap+60)) {
      endGame();
    }
  });
}

/* =====================
   END
===================== */
function endGame() {
  clearInterval(timerInterval);
  saveScore(playerName, time);
  document.getElementById("endScreen").classList.remove("hidden");
  document.getElementById("finalTime").textContent = `Time: ${time.toFixed(1)}s`;
  loadLeaderboard("leaderboardEnd");
  state="end";
}

function restart() {
  location.reload();
}

/* =====================
   LOOP
===================== */
function loop() {
  ctx.clearRect(0,0,900,500);

  if (state==="maze") {
    let nx=sperm.x, ny=sperm.y;
    if(keys["w"])ny-=sperm.speed;
    if(keys["s"])ny+=sperm.speed;
    if(keys["a"])nx-=sperm.speed;
    if(keys["d"])nx+=sperm.speed;
    if(!hitWall(nx,ny)){sperm.x=nx;sperm.y=ny;}

    walls.forEach(w=>ctx.fillRect(w.x,w.y,w.w,w.h));
    ctx.fillStyle="lime";
    ctx.fillRect(finish.x,finish.y,finish.w,finish.h);
    drawSperm();

    if (sperm.x>finish.x) showQuestion();
  }

  if (state==="flappy") flappy();
  drawSperm();

  requestAnimationFrame(loop);
}

loop();
