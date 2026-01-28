const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const questionScreen = document.getElementById("questionScreen");
const questionText = document.getElementById("questionText");
const answersDiv = document.getElementById("answers");
const flappyIntro = document.getElementById("flappyIntro");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stage = "start";
let timer = 120;
let questionIndex = 0;

/* ---------- START ---------- */
startBtn.onclick = () => {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  stage = "maze";
  startMaze();
};

/* ---------- MAZE ---------- */
const maze = [
  "########################",
  "#S   #       #        E#",
  "### ### ##### ### ######",
  "#     #     #     #    #",
  "# ##### ### ##### #### #",
  "#       #   #          #",
  "########################"
];

const cellSize = 60;
let sperm = { x: 1, y: 1 };

function startMaze() {
  drawMaze();
  document.addEventListener("keydown", moveSperm);
}

function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const offsetX = (canvas.width - maze[0].length * cellSize)/2;
  const offsetY = (canvas.height - maze.length * cellSize)/2;

  for (let y=0;y<maze.length;y++){
    for (let x=0;x<maze[y].length;x++){
      if (maze[y][x] === "#"){
        ctx.fillStyle = "#1e4fa3";
        ctx.fillRect(offsetX+x*cellSize, offsetY+y*cellSize, cellSize, cellSize);
      }
      if (maze[y][x] === "E"){
        ctx.fillStyle = "gold";
        ctx.fillRect(offsetX+x*cellSize, offsetY+y*cellSize, cellSize, cellSize);
      }
    }
  }

  drawSperm(offsetX, offsetY);
}

function drawSperm(ox, oy) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(
    ox + sperm.x*cellSize + cellSize/2,
    oy + sperm.y*cellSize + cellSize/2,
    cellSize/4,
    0,
    Math.PI*2
  );
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(
    ox + sperm.x*cellSize,
    oy + sperm.y*cellSize + cellSize/2
  );
  ctx.lineTo(
    ox + sperm.x*cellSize - 30,
    oy + sperm.y*cellSize + cellSize/2 + Math.sin(Date.now()/100)*10
  );
  ctx.stroke();
}

function moveSperm(e){
  let dx=0, dy=0;
  if(e.key==="ArrowUp") dy=-1;
  if(e.key==="ArrowDown") dy=1;
  if(e.key==="ArrowLeft") dx=-1;
  if(e.key==="ArrowRight") dx=1;

  if(maze[sperm.y+dy][sperm.x+dx] !== "#"){
    sperm.x += dx;
    sperm.y += dy;
  }

  if(maze[sperm.y][sperm.x]==="E"){
    document.removeEventListener("keydown", moveSperm);
    canvas.style.display="none";
    startQuestions();
    return;
  }

  drawMaze();
}

/* ---------- QUESTIONS ---------- */
const questions = [
  {q:"What is meiosis?", a:["Cell division for gametes","Mitosis","Fertilization"], c:0},
  {q:"Humans have how many chromosomes?", a:["46","23","92"], c:0},
  {q:"DNA shape?", a:["Helix","Square","Circle"], c:0},
  {q:"Sperm is produced where?", a:["Testes","Ovary","Uterus"], c:0},
  {q:"Egg cell is called?", a:["Ovum","Zygote","Embryo"], c:0},
  {q:"Fertilization creates?", a:["Zygote","Embryo","Fetus"], c:0},
  {q:"Mutation means?", a:["DNA change","Growth","Death"], c:0},
  {q:"Which is haploid?", a:["Sperm","Skin cell","Liver cell"], c:0},
  {q:"Crossing over occurs in?", a:["Meiosis","Mitosis","Fertilization"], c:0},
  {q:"Gametes have?", a:["Half DNA","Double DNA","No DNA"], c:0}
];

function startQuestions(){
  stage="questions";
  questionScreen.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion(){
  if(questionIndex>=questions.length){
    questionScreen.classList.add("hidden");
    startFlappyIntro();
    return;
  }

  const q = questions[questionIndex];
  questionText.innerText = q.q;
  answersDiv.innerHTML="";

  q.a.forEach((ans,i)=>{
    const btn=document.createElement("button");
    btn.innerText=ans;
    btn.onclick=()=>{
      timer += (i===q.c ? -5 : 5);
      questionIndex++;
      loadQuestion();
    };
    answersDiv.appendChild(btn);
  });
}

/* ---------- FLAPPY ---------- */
function startFlappyIntro(){
  stage="flappyIntro";
  flappyIntro.classList.remove("hidden");

  document.addEventListener("keydown", startFlappyOnce, {once:true});
}

function startFlappyOnce(){
  flappyIntro.classList.add("hidden");
  canvas.style.display="block";
  stage="flappy";
  startFlappy();
}

let birdY = canvas.height/2;
let velocity = 0;

function startFlappy(){
  setInterval(()=>{ timer--; },2000);
  requestAnimationFrame(flappyLoop);
}

function flappyLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  velocity += 0.5;
  birdY += velocity;

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(200,birdY,15,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle="white";
  ctx.beginPath();
  ctx.moveTo(185,birdY);
  ctx.lineTo(150,birdY+Math.sin(Date.now()/100)*15);
  ctx.stroke();

  requestAnimationFrame(flappyLoop);
}

document.addEventListener("keydown",e=>{
  if(stage==="flappy" && e.key==="ArrowUp"){
    velocity=-8;
  }
});
