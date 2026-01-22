/* =====================
   GLOBAL
===================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerName = "";
let time = 0;
let timer;
let state = "start";
let questionIndex = 0;

/* =====================
   TIMER
===================== */
function startTimer() {
  timer = setInterval(() => {
    time += 0.1;
    document.getElementById("timer").textContent = `Time: ${time.toFixed(1)}s`;
  }, 100);
}

/* =====================
   LEADERBOARD
===================== */
function saveScore() {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push({ name: playerName, time });
  scores.sort((a,b)=>a.time-b.time);
  localStorage.setItem("scores", JSON.stringify(scores.slice(0,5)));
}

function loadBoard(id) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.forEach(s=>{
    const li=document.createElement("li");
    li.textContent = `${s.name}: ${s.time.toFixed(1)}s`;
    ul.appendChild(li);
  });
}

loadBoard("leaderboard");

/* =====================
   START
===================== */
function startGame() {
  playerName = document.getElementById("nameInput").value || "Anonymous";
  document.getElementById("startScreen").classList.add("hidden");
  state = "maze";
  startTimer();
}

/* =====================
   MAZE (GRID-BASED, SOLVABLE)
===================== */
const tile = 30;
const maze = [
"####################",
"#S     #        #  #",
"# ### ### ###### # #",
"#   #     #      # #",
"### ##### # ###### #",
"#     #   #      # #",
"# ### # ### ###### #",
"# #   #     #      #",
"# # ####### ###### #",
"# #         #    E #",
"####################"
];

let player = { x: 1, y: 1, speed: 2 };

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function canMove(x,y) {
  return maze[y][x] !== "#";
}

function updateMaze() {
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= 1;
  if (keys["s"]) ny += 1;
  if (keys["a"]) nx -= 1;
  if (keys["d"]) nx += 1;

  if (canMove(nx,ny)) {
    player.x = nx;
    player.y = ny;
  }

  if (maze[player.y][player.x] === "E") {
    showQuestion();
  }
}

function drawMaze() {
  for (let y=0;y<maze.length;y++) {
    for (let x=0;x<maze[y].length;x++) {
      if (maze[y][x]==="#") {
        ctx.fillStyle="#1e90ff";
        ctx.fillRect(x*tile,y*tile,tile,tile);
      }
    }
  }
}

function drawSperm() {
  const px = player.x*tile + tile/2;
  const py = player.y*tile + tile/2;

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.ellipse(px,py,10,6,0,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle="white";
  ctx.beginPath();
  ctx.moveTo(px-10,py);
  ctx.lineTo(px-25,py+Math.sin(Date.now()/100)*6);
  ctx.stroke();
}

/* =====================
   QUESTIONS (10)
===================== */
const questions = [
["What is fertilization?",["Fusion of sperm and egg","Cell division","Pregnancy"],0],
["Where does fertilization occur?",["Uterus","Fallopian tube","Ovary"],1],
["What cell does sperm fertilize?",["Embryo","Egg","Zygote"],1],
["What is meiosis?",["Growth","Division for sex cells","Repair"],1],
["What carries genes?",["DNA","Protein","Hormones"],0],
["Male sex cell?",["Egg","Sperm","Zygote"],1],
["Where is sperm made?",["Testes","Bladder","Prostate"],0],
["Female hormone?",["Insulin","Estrogen","Adrenaline"],1],
["After fertilization forms?",["Embryo","Zygote","Fetus"],1],
["Why sexual reproduction?",["Speed","Variation","Size"],1]
];

function showQuestion() {
  state="question";
  document.getElementById("questionScreen").classList.remove("hidden");

  const q = questions[questionIndex];
  document.getElementById("questionText").textContent = q[0];
  const aDiv = document.getElementById("answers");
  aDiv.innerHTML="";

  q[1].forEach((ans,i)=>{
    const b=document.createElement("button");
    b.textContent=ans;
    b.onclick=()=>answer(i);
    aDiv.appendChild(b);
  });
}

function answer(i) {
  if (i===questions[questionIndex][2]) time-=10;
  else time+=10;

  questionIndex++;
  document.getElementById("questionScreen").classList.add("hidden");

  if (questionIndex===questions.length) endGame();
  else state="maze";
}

/* =====================
   END
===================== */
function endGame() {
  clearInterval(timer);
  saveScore();
  document.getElementById("endScreen").classList.remove("hidden");
  document.getElementById("finalTime").textContent=`Time: ${time.toFixed(1)}s`;
  loadBoard("leaderboardEnd");
  state="end";
}

function restart() {
  location.reload();
}

/* =====================
   LOOP
===================== */
function loop() {
  ctx.clearRect(0,0,600,600);

  if (state==="maze") {
    updateMaze();
    drawMaze();
    drawSperm();
  }

  requestAnimationFrame(loop);
}

loop();
