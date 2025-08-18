// Load quiz data then boot
let DATA = [];
fetch('data.json').then(r=>r.json()).then(d=>{ DATA=d; init(); });

const screens = {splash:el('splash'), home:el('home'), quiz:el('quiz'), result:el('result'), rewards:el('rewards')};
const grid = document.getElementById('topic-grid');
const back = document.getElementById('back');
const topicTitle = document.getElementById('topic-title');
const qtext = document.getElementById('qtext');
const opts = document.getElementById('opts');
const bar = document.getElementById('bar');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next');
const again = document.getElementById('again');
const scoreline = document.getElementById('scoreline');
const earned = document.getElementById('earned');
const confetti = document.getElementById('confetti');
const ctx2d = confetti.getContext('2d');

const rewardsBtn = document.getElementById('rewardsBtn');
const reBack = document.getElementById('reBack');
const claimDaily = document.getElementById('claimDaily');
const streakRing = document.getElementById('streakRing');
const weeklyChest = document.getElementById('weeklyChest');
const badgeGrid = document.getElementById('badgeGrid');
const statCorrect = document.getElementById('statCorrect');
const statFinished = document.getElementById('statFinished');
const statTopics = document.getElementById('statTopics');
const statCoins = document.getElementById('statCoins');
const coinsBank = document.getElementById('coinsBank');
const streakCount = document.getElementById('streakCount');
const levelNo = document.getElementById('levelNo');
const streakStrong = document.getElementById('streakStrong');
const toast = document.getElementById('toast');

const ICONS = {"Animals":"🐾","Colors":"🎨","Numbers":"🔢","Fruits":"🍎","Weather":"🌦️","Transportation":"🚌","Body Parts":"🙂","Family":"👨‍👩‍👧","Food":"🍽️","Clothes":"👚","Toys":"🧸","Music":"🎵","Space":"🚀","Ocean Life":"🐠","Plants":"🌱","Community Helpers":"🧑‍🚒","Time":"⏰","Emotions":"😊","Safety":"🛡️","Sports":"🏆"};

const store = {
  get(){ try{ return JSON.parse(localStorage.getItem('tz_state')) || {coins:0, streak:0, lastCheckin:null, totalCorrect:0, quizzesFinished:0, topicsCompleted:{}, badges:{}, level:1, weeklyClaimed:false}; } catch(e){ return {coins:0, streak:0, lastCheckin:null, totalCorrect:0, quizzesFinished:0, topicsCompleted:{}, badges:{}, level:1, weeklyClaimed:false}; } },
  set(s){ localStorage.setItem('tz_state', JSON.stringify(s)); }
};
let S = store.get();

let AC, master; let musicGain, bgOn=false;
function audio(){ if(!AC){ AC = new (window.AudioContext||window.webkitAudioContext)(); master = AC.createGain(); master.gain.value=.12; master.connect(AC.destination); } return AC; }
function beep(f=800, t=.12){ const ac=audio(); const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(master); const now=ac.currentTime; g.gain.value=0; g.gain.linearRampToValueAtTime(.3, now+.01); g.gain.exponentialRampToValueAtTime(.0001, now+t); o.start(now); o.stop(now+t+.01); }
function chord(freqs=[261.63,329.63,392.0], t=.18){ const ac=audio(), now=ac.currentTime; freqs.forEach((f,i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(master); const st=now+i*0.03; g.gain.value=0; g.gain.linearRampToValueAtTime(.25, st+.01); g.gain.exponentialRampToValueAtTime(.0001, st+t); o.start(st); o.stop(st+t+.02); }); }
function startMusic(){ if(bgOn) return; const ac=audio(); musicGain=ac.createGain(); musicGain.gain.value=.06; musicGain.connect(master); const tempo=100, beat=60/tempo; const notes=[262,330,392,523,392,330]; let t=ac.currentTime+.1; for(let i=0;i<64;i++){ for(const f of notes){ const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(musicGain); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.16,t+.02); g.gain.exponentialRampToValueAtTime(.00001,t+beat); o.start(t); o.stop(t+beat); t+=beat; } } bgOn=true; }
function stopMusic(){ if(musicGain){ musicGain.gain.value=0; } bgOn=false; }

let flakes=[];
function sizeCanvas(){ confetti.width = confetti.offsetWidth; confetti.height = confetti.offsetHeight; }
window.addEventListener('resize', sizeCanvas); sizeCanvas();
function burstConfetti(n=80){ sizeCanvas(); flakes=[]; for(let i=0;i<n;i++){ flakes.push({ x: confetti.width/2, y: confetti.height/2, vx:(Math.random()*2-1)*3, vy:(Math.random()*-2-1)*3, r:Math.random()*4+2, a:1, hue:Math.floor(Math.random()*360)}); } }
function drawConfetti(){ const c=ctx2d; c.clearRect(0,0,confetti.width,confetti.height); flakes.forEach(f=>{ f.x+=f.vx; f.y+=f.vy; f.vy+=0.05; f.a-=0.01; c.globalAlpha=Math.max(f.a,0); c.fillStyle=`hsl(${f.hue},90%,60%)`; c.beginPath(); c.arc(f.x,f.y,f.r,0,Math.PI*2); c.fill(); }); flakes=flakes.filter(f=>f.a>0 && f.y<confetti.height+20); requestAnimationFrame(drawConfetti); }
requestAnimationFrame(drawConfetti);

function spawnFloaters(){ const wrap=document.getElementById('floaters'); const emojis=['⭐','✨','🎈','🎉','💫','🌈']; for(let i=0;i<14;i++){ const s=document.createElement('div'); s.textContent=emojis[i%emojis.length]; s.style.position='absolute'; s.style.left=Math.random()*90+5+'%'; s.style.top=Math.random()*90+5+'%'; s.style.fontSize=(Math.random()*16+12)+'px'; s.style.animation=`float ${4+Math.random()*4}s infinite ease-in-out`; wrap.appendChild(s);} }
const st=document.createElement('style'); st.textContent='@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'; document.head.appendChild(st);

const BADGES = [
  {id:'first_quiz', name:'First Finish', desc:'Finish any quiz', icon:'🏁'},
  {id:'perfect10', name:'Perfect 10', desc:'Score 10/10', icon:'💯'},
  {id:'five_topics', name:'Explorer 5', desc:'Complete 5 topics', icon:'🧭'},
  {id:'ten_topics', name:'Explorer 10', desc:'Complete 10 topics', icon:'🚀'},
  {id:'hundred_correct', name:'Bright 100', desc:'Get 100 answers right', icon:'🌟'},
];

function el(id){ return document.getElementById(id); }
function show(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); refreshHUD(); }

function init(){
  spawnFloaters();
  screens.splash.addEventListener('pointerdown', ()=>{ audio(); show('home'); }, {once:true});

  DATA.forEach((t, i)=>{
    const b=document.createElement('button');
    b.className='topic';
    b.innerHTML = `<div class="ico">${ICONS[t.topic]||'⭐'}</div><div class="name">${t.topic}</div>`;
    b.onclick = ()=>startTopic(i);
    grid.appendChild(b);
    setTimeout(()=> b.classList.add('wiggle'), 200 + i*60);
    setTimeout(()=> b.classList.remove('wiggle'), 1200 + i*60);
  });

  rewardsBtn.onclick = ()=>{ show('rewards'); buildRewards(); };
  reBack.onclick = ()=> show('home');
  claimDaily.onclick = claimDailyReward;
  weeklyChest.onclick = claimWeeklyChest;

  buildRewards();
  refreshHUD();
}

let tIndex=0, qIndex=0, score=0, answered=false;
function startTopic(i){ tIndex=i; qIndex=0; score=0; topicTitle.textContent=DATA[tIndex].topic; show('quiz'); loadQ(); startMusic(); }
function loadQ(){ const q=DATA[tIndex].questions[qIndex]; qtext.textContent = `Q${qIndex+1}. ${q.q}`; opts.innerHTML=''; feedback.textContent=''; nextBtn.disabled=true; answered=false; q.opts.forEach((text, idx)=>{ const btn=document.createElement('button'); btn.textContent=text; btn.onclick=()=>choose(idx); opts.appendChild(btn); }); bar.style.width = ((qIndex)/DATA[tIndex].questions.length*100)+'%'; }
function choose(idx){ if(answered) return; const q=DATA[tIndex].questions[qIndex]; [...opts.children].forEach((b,j)=>{ if(j===q.a) b.classList.add('correct'); if(j===idx && idx!==q.a) b.classList.add('wrong'); }); if(idx===q.a){ feedback.textContent='Great job! ✨'; chord([523.25,659.25,783.99]); S.totalCorrect++; S.coins+=2; save(); } else { feedback.textContent='Try again 😊'; beep(220,.18);} nextBtn.disabled=false; answered=true; }
nextBtn.onclick = ()=>{ if(!answered) return; const q=DATA[tIndex].questions[qIndex]; if(q.a!==undefined && [...opts.children][q.a].classList.contains('correct')) score++; qIndex++; if(qIndex>=DATA[tIndex].questions.length){ finishQuiz(); } else { loadQ(); } };
back.onclick = ()=>{ stopMusic(); show('home'); };
again.onclick = ()=>{ show('home'); };

function finishQuiz(){
  stopMusic();
  const topicName = DATA[tIndex].topic;
  if(!S.topicsCompleted[topicName]){ S.topicsCompleted[topicName]=true; }
  S.quizzesFinished++;
  S.level = 1 + Math.floor(S.quizzesFinished/5);
  const earnedNow = 10 + Math.max(0, score-5);
  S.coins += earnedNow;
  save();
  const unlocks = [];
  if(!S.badges.first_quiz){ S.badges.first_quiz = true; unlocks.push('first_quiz'); }
  if(score===10 && !S.badges.perfect10){ S.badges.perfect10=true; unlocks.push('perfect10'); }
  const uniq = Object.keys(S.topicsCompleted).length;
  if(uniq>=5 && !S.badges.five_topics){ S.badges.five_topics=true; unlocks.push('five_topics'); }
  if(uniq>=10 && !S.badges.ten_topics){ S.badges.ten_topics=true; unlocks.push('ten_topics'); }
  if(S.totalCorrect>=100 && !S.badges.hundred_correct){ S.badges.hundred_correct=true; unlocks.push('hundred_correct'); }
  save();

  scoreline.textContent = `You scored ${score} / ${DATA[tIndex].questions.length} 🎉`;
  earned.textContent = `You earned ⭐ ${earnedNow} (plus +2 per correct)`;
  buildBadgeUnlocks(unlocks);
  burstConfetti(120);
  show('result');
}

function buildRewards(){
  const pct = Math.min((S.streak%7)/7, 1);
  document.querySelector('.ring').style.background = `conic-gradient(#3DA9FC ${pct*360}deg, #dfefff ${pct*360}deg)`;
  streakRing.textContent = S.streak%7 + '/7';
  streakStrong.textContent = S.streak;
  weeklyChest.classList.toggle('disabled', S.streak<7 || S.weeklyClaimed===true);

  badgeGrid.innerHTML='';
  BADGES.forEach(b=>{
    const got = !!S.badges[b.id];
    const el = document.createElement('div');
    el.className = 'badge-item'+(got?'':' locked');
    el.innerHTML = `<div style="font-size:22px">${b.icon}</div><div>${b.name}</div>`;
    badgeGrid.appendChild(el);
  });

  statCorrect.textContent = S.totalCorrect;
  statFinished.textContent = S.quizzesFinished;
  statTopics.textContent = Object.keys(S.topicsCompleted).length;
  statCoins.textContent = S.coins;
}

function claimDailyReward(){
  const today = new Date().toDateString();
  if(S.lastCheckin===today){ return toastMsg('Already claimed today ✅'); }
  S.lastCheckin = today;
  S.streak += 1;
  S.coins += 10;
  S.weeklyClaimed = false;
  save();
  toastMsg('Claimed ⭐ +10! Streak +1 🔥');
  buildRewards(); refreshHUD();
}
function claimWeeklyChest(){
  if(S.streak<7) return toastMsg('Need 7-day streak 🔒');
  if(S.weeklyClaimed) return toastMsg('Weekly chest already claimed ✅');
  S.coins += 50;
  S.weeklyClaimed = true;
  save();
  toastMsg('Weekly Chest 🎁 ⭐ +50');
  buildRewards(); refreshHUD();
}

function buildBadgeUnlocks(ids){
  const area = document.getElementById('badgeUnlocks');
  area.innerHTML='';
  ids.forEach(id=>{
    const meta = BADGES.find(b=>b.id===id);
    if(!meta) return;
    const b = document.createElement('div');
    b.className='badge';
    b.innerHTML = `${meta.icon} <strong>${meta.name}</strong>`;
    area.appendChild(b);
  });
}

function refreshHUD(){
  coinsBank.textContent = S.coins;
  streakCount.textContent = S.streak;
  levelNo.textContent = S.level;
}

function save(){ store.set(S); }
function toastMsg(t){ toast.textContent=t; toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'), 900); }
