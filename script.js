const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let timer = 60;
let player = { x: 50, y: 50, r: 12, vx: 0, vy: 0 };
let tailAngle = 0;

const startScreen = document.getElementById("startScreen");
const questionScreen = document.getElementById("questionScreen");
const flappyIntro = document.getElementById("flappyIntro");
const endScreen = document.getElementById("endScreen");

document.getElementById("startBtn").onclick = startGame;

// ---------- LEADERBOARD ----------
function loadBoard() {
  const board = JSON.parse(localStorage.getItem("board") || "[]");
  document.getElementById("leaderboard").innerHTML =
    board.map(b => `<li>${b.name}: ${b.time}s</li>`).join("");
}
loadBoard();

// ---------- START ----------
function startGame() {
  startScreen.classList.add("hidden");
  canvas.style.display = "block";
  startMaze();
}

// ---------- MAZE ----------
const walls = [
  {x:0,y:0,w:canvas.width,h:20},
  {x:0,y:canvas.height-20,w:canvas.width,h:20},
  {x:0,y:0,w:20,h:canvas.height},
  {x:canvas.width-20,y:0,w:20,h:canvas.height},

  {x:100,y:100,w:600,h:20},
  {x:100,y:100,w:20,h:500},
  {x:200,y:200,w:800,h:20},
  {x:900,y:200,w:20,h:500},
  {x:300,y:400,w:700,h:20}
];

const endZone = {x:canvas.width-80,y:canvas.height-80,w:40,h:40};

function drawMaze() {
  ctx.fillStyle = "#7ecbff";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#1e4f7a";
  walls.forEach(w=>ctx.fillRect(w.x,w.y,w.w,w.h));

  ctx.fillStyle = "red";
  ctx.fillRect(endZone.x,endZone.y,endZone.w,endZone.h);

  drawSperm();
}

function drawSperm() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for(let i=0;i<20;i++){
    ctx.lineTo(
      player.x - i*6,
      player.y + Math.sin(tailAngle + i*0.5)*6
    );
  }
  ctx.stroke();
  tailAngle += 0.3;
}

function startMaze() {
  function loop() {
    drawMaze();
    player.x += player.vx;
    player.y += player.vy;

    walls.forEach(w=>{
      if(
        player.x > w.x-player.r &&
        player.x < w.x+w.w+player.r &&
        player.y > w.y-player.r &&
        player.y < w.y+w.h+player.r
      ){
        player.x -= player.vx;
        player.y -= player.vy;
      }
    });

    if(
      player.x > endZone.x &&
      player.y > endZone.y
    ){
      canvas.style.display="none";
      startQuestions();
      return;
    }
    requestAnimationFrame(loop);
  }
  loop();
}

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp")player.vy=-4;
  if(e.key==="ArrowDown")player.vy=4;
  if(e.key==="ArrowLeft")player.vx=-4;
  if(e.key==="ArrowRight")player.vx=4;
});
window.addEventListener("keyup",()=>player.vx=player.vy=0);

// ---------- QUESTIONS ----------
const questions=[
 {q:"What is meiosis?",a:["Cell division","Growth","Digestion","Photosynthesis"],c:0},
 {q:"Humans have how many chromosomes?",a:["46","23","44","48"],c:0}
];
let qi=0;

function startQuestions(){
  questionScreen.classList.remove("hidden");
  showQuestion();
}

function showQuestion(){
  if(qi>=questions.length){ startFlappyIntro(); return; }
  const q=questions[qi];
  document.getElementById("questionText").innerText=q.q;
  const aDiv=document.getElementById("answers");
  aDiv.innerHTML="";
  q.a.forEach((txt,i)=>{
    const b=document.createElement("button");
    b.className="answerBtn";
    b.innerText=txt;
    b.onclick=()=>{ timer+= i===q.c?-5:5; qi++; showQuestion(); };
    aDiv.appendChild(b);
  });
}

// ---------- FLAPPY ----------
let flappy=false;
let bird={x:200,y:300,vy:0};

function startFlappyIntro(){
  questionScreen.classList.add("hidden");
  flappyIntro.classList.remove("hidden");
}

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp" && !flappy){
    flappy=true;
    flappyIntro.classList.add("hidden");
    canvas.style.display="block";
    flappyLoop();
  }
  if(e.key==="ArrowUp") bird.vy=-6;
});

function flappyLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  bird.vy+=0.5;
  bird.y+=bird.vy;

  drawSperm();

  if(bird.y>canvas.height||bird.y<0){
    endGame();
    return;
  }
  requestAnimationFrame(flappyLoop);
}

// ---------- END ----------
function endGame(){
  canvas.style.display="none";
  endScreen.classList.remove("hidden");
}
