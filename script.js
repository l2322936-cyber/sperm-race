/* ========= GLOBAL ========= */
let time = 60;
let name = "";
let phase = "start";
let timerInterval;

/* ========= STORAGE ========= */
function getBoard() {
  return JSON.parse(localStorage.getItem("spermBoard") || "[]");
}
function saveScore(n, t) {
  const b = getBoard();
  b.push({ n, t });
  b.sort((a,b)=>a.t-b.t);
  localStorage.setItem("spermBoard", JSON.stringify(b.slice(0,5)));
}
function renderBoard(id) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  getBoard().forEach(s=>{
    const li=document.createElement("li");
    li.textContent=`${s.n}: ${s.t}s`;
    el.appendChild(li);
  });
}
renderBoard("leaderboard");

/* ========= START ========= */
document.getElementById("startBtn").onclick = () => {
  name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("Enter a name");

  document.getElementById("startScreen").classList.remove("active");
  startTimer();
  startMaze();
};

function startTimer(){
  timerInterval = setInterval(()=>time++,1000);
}

/* ========= MAZE ========= */
const mazeCanvas = document.getElementById("mazeCanvas");
const m = mazeCanvas.getContext("2d");
mazeCanvas.width = innerWidth;
mazeCanvas.height = innerHeight;

const maze = [
"###########################",
"#S     #   #         #    #",
"### ### ### # ##### ### ## #",
"#   #     # #     #     #  #",
"# ### ##### ##### ##### ####",
"#   #     #     #   #      #",
"##### ### ##### ### ### ####",
"#     #   #     #     #    #",
"# ### ### ##### ##### #### #",
"#     #         #        E#",
"###########################"
];

const cell = Math.min(
  mazeCanvas.width / maze[0].length,
  mazeCanvas.height / maze.length
);

let px = 1.5, py = 1.5;
const speed = 0.19; // 25% faster

function drawSperm(x,y){
  const cx = x*cell+cell/2;
  const cy = y*cell+cell/2;

  // head
  m.fillStyle="white";
  m.beginPath();
  m.ellipse(cx,cy,cell/3,cell/4,0,0,Math.PI*2);
  m.fill();

  // tail
  m.strokeStyle="white";
  m.beginPath();
  m.moveTo(cx-cell/3,cy);
  m.lineTo(
    cx-cell,
    cy+Math.sin(Date.now()/90)*10
  );
  m.stroke();
}

function drawMaze(){
  m.clearRect(0,0,mazeCanvas.width,mazeCanvas.height);
  maze.forEach((row,y)=>{
    [...row].forEach((c,x)=>{
      if(c==="#"){
        m.fillStyle="#0a2d4a";
        m.fillRect(x*cell,y*cell,cell,cell);
      }
      if(c==="E"){
        m.fillStyle="#00ff99";
        m.fillRect(x*cell,y*cell,cell,cell);
      }
    });
  });
  drawSperm(px,py);
}

function startMaze(){
  phase="maze";
  mazeCanvas.style.display="block";
  requestAnimationFrame(loopMaze);
}

function loopMaze(){
  if(phase!=="maze") return;
  drawMaze();
  requestAnimationFrame(loopMaze);
}

window.addEventListener("keydown",e=>{
  if(phase==="maze"){
    let nx=px, ny=py;
    if(e.key==="ArrowUp") ny-=speed;
    if(e.key==="ArrowDown") ny+=speed;
    if(e.key==="ArrowLeft") nx-=speed;
    if(e.key==="ArrowRight") nx+=speed;

    if(maze[Math.floor(ny)][Math.floor(nx)]!=="#"){
      px=nx; py=ny;
    }

    if(maze[Math.floor(py)][Math.floor(px)]==="E"){
      mazeCanvas.style.display="none";
      startQuestions();
    }
  }

  if(phase==="flappyIntro"){
    startFlappy();
  }

  if(phase==="flappy" && e.key.startsWith("Arrow")){
    vy = -7;
  }
});

/* ========= QUESTIONS ========= */
const questions = [
["What is fertilization?","Fusion of gametes","Growth","Respiration","Division",0],
["Where does fertilization occur?","Ovary","Uterus","Fallopian tube","Cervix",2],
["How many chromosomes in sperm?","46","23","12","92",1],
["What is a zygote?","Fertilized egg","Embryo","Fetus","Cell",0],
["What process makes sperm?","Mitosis","Meiosis","Respiration","Growth",1],
["Which hormone triggers ovulation?","LH","FSH","Estrogen","Testosterone",0],
["What protects embryo?","Placenta","Testes","Ovary","Urethra",0],
["What does sperm carry?","DNA","Oxygen","Energy","Nutrients",0],
["What system controls reproduction?","Digestive","Nervous","Reproductive","Respiratory",2],
["What cell is fertilized?","Egg","Zygote","Embryo","Fetus",0]
];

let qi=0;

function startQuestions(){
  phase="questions";
  document.getElementById("questionScreen").classList.add("active");
  showQ();
}

function showQ(){
  const q=questions[qi];
  const box=document.getElementById("questionBox");
  box.innerHTML=`<h2>${q[0]}</h2>`+
    q.slice(1,5).map((a,i)=>`<div class="answer" onclick="answer(${i})">${a}</div>`).join("");
}

function answer(i){
  if(i===questions[qi][5]) time-=5;
  else time+=5;

  qi++;
  if(qi>=questions.length){
    document.getElementById("questionScreen").classList.remove("active");
    showFlappyIntro();
  } else showQ();
}

/* ========= FLAPPY ========= */
const flappyCanvas=document.getElementById("flappyCanvas");
const f=flappyCanvas.getContext("2d");
flappyCanvas.width=innerWidth;
flappyCanvas.height=innerHeight;

let fy, vy, pipes, flappyTimer;

function showFlappyIntro(){
  phase="flappyIntro";
  document.getElementById("flappyIntro").classList.add("active");
  clearInterval(timerInterval);
}

function startFlappy(){
  phase="flappy";
  document.getElementById("flappyIntro").classList.remove("active");
  flappyCanvas.style.display="block";

  fy=flappyCanvas.height/2;
  vy=0;
  pipes=[];
  flappyTimer=setInterval(()=>time--,2000);
  requestAnimationFrame(flappyLoop);
}

function flappyLoop(){
  if(phase!=="flappy") return;

  f.clearRect(0,0,flappyCanvas.width,flappyCanvas.height);
  vy+=0.5;
  fy+=vy;

  drawSperm(2,fy/cell);

  if(Math.random()<0.02)
    pipes.push({x:flappyCanvas.width,g:200+Math.random()*200});

  pipes.forEach(p=>{
    p.x-=4;
    f.fillRect(p.x,0,40,p.g-120);
    f.fillRect(p.x,p.g+120,40,flappyCanvas.height);
  });

  if(fy<0||fy>flappyCanvas.height){
    endGame();
    return;
  }

  requestAnimationFrame(flappyLoop);
}

/* ========= END ========= */
function endGame(){
  clearInterval(flappyTimer);
  saveScore(name,time);
  flappyCanvas.style.display="none";
  document.getElementById("endScreen").classList.add("active");
  document.getElementById("finalScore").textContent=
    `${name} finished with ${time}s`;
  renderBoard("leaderboardEnd");
}
