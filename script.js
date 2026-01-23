/* ========= GLOBAL ========= */
let time = 60;
let playerName = "";
let currentQuestion = 0;
let gamePhase = "start";

/* ========= ELEMENTS ========= */
const startScreen = document.getElementById("startScreen");
const mazeCanvas = document.getElementById("mazeCanvas");
const questionScreen = document.getElementById("questionScreen");
const flappyIntro = document.getElementById("flappyIntro");
const flappyCanvas = document.getElementById("flappyCanvas");
const endScreen = document.getElementById("endScreen");

const mCtx = mazeCanvas.getContext("2d");

/* ========= START ========= */
document.getElementById("startBtn").onclick = () => {
  playerName = document.getElementById("nameInput").value.trim();
  if (!playerName) return alert("Enter your name");

  startScreen.classList.remove("active");
  startMaze();
};

/* ========= MAZE ========= */
mazeCanvas.width = window.innerWidth;
mazeCanvas.height = window.innerHeight;

const maze = [
"########################",
"#S     #         #     #",
"##### ### ##### ### ### #",
"#     #     #   #     # #",
"# ### ##### # ##### ### #",
"#   #     # #     #     #",
"### ##### # ##### #######",
"#     #   #     #       #",
"# ### # ##### ### ##### #",
"#     #         #     E#",
"########################"
];

let px = 1.5, py = 1.5;
const cell = Math.min(
  mazeCanvas.width / maze[0].length,
  mazeCanvas.height / maze.length
);
const speed = 0.15;

function drawSperm(x, y) {
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;

  // head
  mCtx.fillStyle = "white";
  mCtx.beginPath();
  mCtx.ellipse(cx, cy, cell/3, cell/4, 0, 0, Math.PI * 2);
  mCtx.fill();

  // tail
  mCtx.strokeStyle = "white";
  mCtx.beginPath();
  mCtx.moveTo(cx - cell/3, cy);
  mCtx.lineTo(cx - cell, cy + Math.sin(Date.now()/100)*10);
  mCtx.stroke();
}

function drawMaze() {
  mCtx.clearRect(0,0,mazeCanvas.width,mazeCanvas.height);
  maze.forEach((row,y)=>{
    [...row].forEach((c,x)=>{
      if(c==="#"){
        mCtx.fillStyle="#002244";
        mCtx.fillRect(x*cell,y*cell,cell,cell);
      }
      if(c==="E"){
        mCtx.fillStyle="gold";
        mCtx.fillRect(x*cell,y*cell,cell,cell);
      }
    });
  });
  drawSperm(px,py);
}

function startMaze(){
  gamePhase="maze";
  mazeCanvas.style.display="block";
  drawMaze();
}

window.addEventListener("keydown",e=>{
  if(gamePhase==="maze"){
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
      loadQuestion();
    }
    drawMaze();
  }

  if(gamePhase==="flappyIntro"){
    startFlappy();
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

function loadQuestion(){
  gamePhase="questions";
  questionScreen.classList.add("active");
  const q=questions[currentQuestion];
  const box=document.getElementById("questionBox");
  box.innerHTML=`<h2>${q[0]}</h2>`+
  q.slice(1,5).map((a,i)=>`<div class="answer" onclick="answer(${i})">${a}</div>`).join("");
}

function answer(i){
  if(i===questions[currentQuestion][5]) time-=5;
  else time+=5;

  currentQuestion++;
  if(currentQuestion>=questions.length){
    questionScreen.classList.remove("active");
    showFlappyIntro();
  } else loadQuestion();
}

/* ========= FLAPPY ========= */
function showFlappyIntro(){
  gamePhase="flappyIntro";
  flappyIntro.classList.add("active");
}

function startFlappy(){
  gamePhase="flappy";
  flappyIntro.classList.remove("active");
  flappyCanvas.style.display="block";

  setInterval(()=>time--,2000);
  setTimeout(endGame,15000);
}

/* ========= END ========= */
function endGame(){
  flappyCanvas.style.display="none";
  endScreen.classList.add("active");
  document.getElementById("finalScore").innerText=
    `${playerName}'s Time: ${time}s`;
}
