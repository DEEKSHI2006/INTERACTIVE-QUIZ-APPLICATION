const QUESTIONS = [
  {id:1, q:"Which HTML tag is used to include JavaScript code?",choices:["<script>","<js>","<javascript>","<code>"],correct:0,hint:"Use the <script> tag."},
  {id:2, q:"What does CSS stand for?",choices:["Computer Style Sheets","Cascading Style Sheets","Creative Style Syntax","Control Style Sheet"],correct:1,hint:"Think about layers."},
  {id:3, q:"Which method adds an item to the end of an array in JavaScript?",choices:["push()","pop()","shift()","unshift()"],correct:0,hint:"It pushes to the end."},
  {id:4, q:"Which operator is used to assign a value in JavaScript?",choices:["==","=","===","=>"],correct:1,hint:"Single equals assigns."},
  {id:5, q:"What is the output type of document.querySelectorAll?",choices:["Array","NodeList","HTMLCollection","Object"],correct:1,hint:"It's a NodeList (array-like)."}
];

let state = {
  questions: JSON.parse(JSON.stringify(QUESTIONS)),
  index: 0, score: 0, answered: 0, answers: {}, startTs: null, timerInterval: null
};

const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const qIndexEl = document.getElementById('qIndex');
const scoreEl = document.getElementById('score');
const answeredEl = document.getElementById('answered');
const progressBar = document.getElementById('progressBar');
const hintEl = document.getElementById('hint');
const resultsEl = document.getElementById('results');
const finalScoreEl = document.getElementById('finalScore');
const reviewListEl = document.getElementById('reviewList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const retakeWrongBtn = document.getElementById('retakeWrongBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const showAnswersBtn = document.getElementById('showAnswersBtn');
const highscoreEl = document.getElementById('highscore');
const timerEl = document.getElementById('timer');
const addQBtn = document.getElementById('addQBtn');

function formatTime(s){const m=String(Math.floor(s/60)).padStart(2,'0');const ss=String(s%60).padStart(2,'0');return `${m}:${ss}`;}
function saveHighScore(score){const prev=Number(localStorage.getItem('quiz_highscore')||0);if(score>prev)localStorage.setItem('quiz_highscore',score);highscoreEl.textContent=localStorage.getItem('quiz_highscore')||0;}
function startTimer(){if(state.timerInterval)clearInterval(state.timerInterval);state.startTs=Date.now();state.timerInterval=setInterval(()=>{const s=Math.floor((Date.now()-state.startTs)/1000);timerEl.textContent=formatTime(s)},1000);}
function stopTimer(){if(state.timerInterval)clearInterval(state.timerInterval);}

function updateUI(){
  const qs=state.questions,total=qs.length,idx=state.index+1;
  qIndexEl.textContent=`${idx} / ${total}`;
  scoreEl.textContent=state.score;answeredEl.textContent=state.answered;
  progressBar.style.width=`${Math.round((state.index/Math.max(1,total-1))*100)}%`;
  const current=qs[state.index];questionEl.innerHTML=current.q;
  hintEl.textContent=state.answers[current.id]?current.hint:'';
  choicesEl.innerHTML='';
  current.choices.forEach((c,i)=>{
    const btn=document.createElement('button');
    btn.className='choice';btn.dataset.index=i;btn.innerHTML=`<strong>${String.fromCharCode(65+i)}</strong> ${c}`;
    const answered=state.answers[current.id];
    if(answered){btn.classList.add('disabled');if(i===current.correct)btn.classList.add('correct');if(i===answered.selected&&!answered.correct)btn.classList.add('wrong');}
    btn.onclick=()=>onSelectAnswer(current,i,btn);choicesEl.appendChild(btn);
  });
  prevBtn.disabled=state.index===0;nextBtn.disabled=state.index===total-1;
  if(Object.keys(state.answers).length===total)showResults();
}

function onSelectAnswer(q,idx,btn){
  if(state.answers[q.id])return;
  const correct=idx===q.correct;
  state.answers[q.id]={selected:idx,correct};
  state.answered++;if(correct)state.score++;
  Array.from(choicesEl.children).forEach(el=>{
    el.classList.add('disabled');
    const i=Number(el.dataset.index);
    if(i===q.correct)el.classList.add('correct');
    if(i===idx&&!correct)el.classList.add('wrong');
  });
  scoreEl.textContent=state.score;answeredEl.textContent=state.answered;
  setTimeout(()=>{if(state.index<state.questions.length-1){state.index++;updateUI();}else showResults();},450);
}

function showResults(){
  stopTimer();resultsEl.classList.add('show');
  finalScoreEl.textContent=`You scored ${state.score} / ${state.questions.length}`;saveHighScore(state.score);
  reviewListEl.innerHTML='';state.questions.forEach(q=>{
    const a=state.answers[q.id];
    const div=document.createElement('div');
    div.className='review-item';
    div.innerHTML=`<div><strong>${q.q}</strong></div>
    <div>Correct: ${q.choices[q.correct]} | Your: ${a?q.choices[a.selected]:'—'}</div>`;
    reviewListEl.appendChild(div);
  });
}

function restartQuiz(){state.questions=JSON.parse(JSON.stringify(QUESTIONS));state.index=0;state.score=0;state.answered=0;state.answers={};resultsEl.classList.remove('show');startTimer();updateUI();}
function retakeWrong(){const w=state.questions.filter(q=>state.answers[q.id]&&!state.answers[q.id].correct);if(!w.length){alert('No wrong questions!');return;}state.questions=JSON.parse(JSON.stringify(w));state.index=0;state.score=0;state.answered=0;state.answers={};resultsEl.classList.remove('show');startTimer();updateUI();}
function shuffleQuestions(){for(let i=state.questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.questions[i],state.questions[j]]=[state.questions[j],state.questions[i]];}restartQuiz();}
function showAnswers(){const curr=state.questions[state.index];Array.from(choicesEl.children).forEach(el=>{const i=Number(el.dataset.index);if(i===curr.correct)el.classList.add('correct');});}

prevBtn.onclick=()=>{if(state.index>0){state.index--;updateUI();}};
nextBtn.onclick=()=>{if(state.index<state.questions.length-1){state.index++;updateUI();}};
restartBtn.onclick=restartQuiz;
retakeWrongBtn.onclick=retakeWrong;
shuffleBtn.onclick=shuffleQuestions;
showAnswersBtn.onclick=showAnswers;
addQBtn.onclick=()=>{
  const q=document.getElementById('newQ').value.trim();
  const a0=document.getElementById('newA0').value.trim();
  const a1=document.getElementById('newA1').value.trim();
  const correct=Number(document.getElementById('newCorrect').value);
  if(!q||!a0||!a1||isNaN(correct))return alert('Enter question, 2 options, correct index');
  const id=Math.max(0,...state.questions.map(x=>x.id))+1;
  state.questions.push({id,q,choices:[a0,a1],correct,hint:''});
  alert('Question added!');
};
window.onkeydown=e=>{if(e.key==='ArrowLeft')prevBtn.click();if(e.key==='ArrowRight')nextBtn.click();};
(function init(){highscoreEl.textContent=localStorage.getItem('quiz_highscore')||0;startTimer();updateUI();})();
