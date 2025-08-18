fetch('data.json').then(r=>r.json()).then(DATA=>{ window.DATA = DATA; init(); });
const MAIN_CATS = [
  {id:'brain', label:'Brain Quiz', icon:'🧠', subtitle:'20 Topics'},
  {id:'memory', label:'Memory Game', icon:'🧠', subtitle:'Matching & recall'},
  {id:'fun', label:'Fun Game', icon:'🎮', subtitle:'Mini-games'},
  {id:'puzzle', label:'Puzzle', icon:'🧩', subtitle:'Jigsaws & more'},
  {id:'letters', label:'Letters World', icon:'🔤', subtitle:'ABC & phonics'},
  {id:'numbers', label:'Number Arena', icon:'🔢', subtitle:'Counting & math'},
  {id:'color', label:'Colour Magic', icon:'🎨', subtitle:'Color games'},
  {id:'story', label:'Story Time', icon:'📖', subtitle:'Interactive stories'},
  {id:'music', label:'Music', icon:'🎵', subtitle:'Songs & rhythm'}
];
const screens = { splash:el('splash'), main:el('main'), sub:el('sub'), quiz:el('quiz'), result:el('result') };
const mainGrid = el('mainGrid'), subGrid = el('subGrid');
const backMain = el('backMain'), subTitle = el('subTitle');
const back = el('back'), topicTitle = el('topic-title');
const qtext = el('qtext'), opts = el('opts'), bar = el('bar'), feedback = el('feedback'), nextBtn = el('next');
const confetti = el('confetti'), ctx = confetti.getContext('2d');
let tIndex=0,qIndex=0,score=0,answered=false, currentTopicList=[];
function el(id){ return document.getElementById(id); }
function show(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); if(name==='sub') window.scrollTo(0,0); }
function spawnFloaters(){ const wrap=document.getElementById('floaters'); const emojis=['⭐','✨','🎈','🎉','💫','🌈']; for(let i=0;i<12;i++){ const s=document.createElement('div'); s.textContent=emojis[i%emojis.length]; s.style.position='absolute'; s.style.left=Math.random()*90+5+'%'; s.style.top=Math.random()*90+5+'%'; s.style.fontSize=(Math.random()*18+12)+'px'; s.style.opacity=.6; wrap.appendChild(s);} }
function init(){ spawnFloaters(); document.querySelector('#splash').addEventListener('pointerdown', ()=> show('main'), {once:true}); buildMain(); backMain.onclick = ()=> show('main'); back.onclick = ()=> { stopMusic(); show('sub'); }; nextBtn.onclick = ()=> nextQuestion(); }
function buildMain(){ mainGrid.innerHTML=''; MAIN_CATS.forEach(cat=>{ const c = document.createElement('div'); c.className='card'; c.innerHTML = `<div class="ico">${cat.icon}</div><div class="label">${cat.label}</div><div class="muted">${cat.subtitle||''}</div>`; c.onclick = ()=> openCategory(cat.id); mainGrid.appendChild(c); }); }
function openCategory(id){ if(id==='brain'){ subTitle.textContent = 'Brain Quiz'; const topics = window.DATA.map(t=>t.topic); buildSubgrid(topics); show('sub'); } else { subTitle.textContent = MAIN_CATS.find(c=>c.id===id).label; buildSubgrid([MAIN_CATS.find(c=>c.id===id).subtitle || 'Coming Soon'], true); show('sub'); } }
function buildSubgrid(list, placeholder=false){ subGrid.innerHTML=''; list.forEach((name, i)=>{ const elc = document.createElement('button'); elc.className = 'sub-card'; elc.innerHTML = `<div class="emoji">${placeholder? '🔜' : emojiFor(name)}</div><div class="name">${name}</div>`; if(!placeholder){ elc.onclick = ()=> startTopicByName(name); } else { elc.onclick = ()=> toast('Coming soon — we will add this!'); } subGrid.appendChild(elc); }); }
function emojiFor(name){ const map = {'Animals':'🐾','Colors':'🎨','Numbers':'🔢','Fruits':'🍎','Weather':'🌦️','Transportation':'🚌','Body Parts':'🙂','Family':'👨‍👩‍👧','Food':'🍽️','Clothes':'👚','Toys':'🧸','Music':'🎵','Space':'🚀','Ocean Life':'🐠','Plants':'🌱','Community Helpers':'🧑‍🚒','Time':'⏰','Emotions':'😊','Safety':'🛡️','Sports':'🏆'}; return map[name]||'⭐'; }
function startTopicByName(name){ const idx = window.DATA.findIndex(t=>t.topic===name); if(idx===-1) return toast('Topic data missing'); tIndex = idx; qIndex=0; score=0; topicTitle.textContent = name; currentTopicList = window.DATA[tIndex].questions; show('quiz'); loadQ(); startMusic(); }
function loadQ(){ const q = currentTopicList[qIndex]; qtext.textContent = `Q${qIndex+1}. ${q.q}`; opts.innerHTML=''; feedback.textContent=''; nextBtn.disabled=true; answered=false; q.opts.forEach((o,oi)=>{ const b=document.createElement('button'); b.textContent=o; b.onclick=()=> choose(oi); opts.appendChild(b); }); bar.style.width = ((qIndex)/currentTopicList.length*100)+'%'; }
function choose(idx){ if(answered) return; const q=currentTopicList[qIndex]; [...opts.children].forEach((b,j)=>{ if(j===q.a) b.classList.add('correct'); if(j===idx && idx!==q.a) b.classList.add('wrong'); }); if(idx===q.a){ feedback.textContent='Great!'; chord([523.25,659.25,783.99]); score++; } else { feedback.textContent='Try again 😊'; beep(220,.18); } answered=true; nextBtn.disabled=false; }
function nextQuestion(){ if(!answered) return; qIndex++; if(qIndex>=currentTopicList.length){ finishQuiz(); } else loadQ(); }
function finishQuiz(){ stopMusic(); document.getElementById('scoreline').textContent = `You scored ${score} / ${currentTopicList.length} 🎉`; document.getElementById('earned').textContent = `Well done!`; burstConfetti(120); show('result'); }
let AC, master, musicGain, bgOn=false;
function audio(){ if(!AC){ AC = new (window.AudioContext||window.webkitAudioContext)(); master = AC.createGain(); master.gain.value=.12; master.connect(AC.destination);} return AC; }
function beep(f=800,t=.12){ const ac=audio(); const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(master); const now=ac.currentTime; g.gain.value=0; g.gain.linearRampToValueAtTime(.3, now+.01); g.gain.exponentialRampToValueAtTime(.0001, now+t); o.start(now); o.stop(now+t+.01); }
function chord(freqs=[261.63,329.63,392.0], t=.18){ const ac=audio(), now=ac.currentTime; freqs.forEach((f,i)=>{ const o=ac.createOscillator(), g=ac.createGain(); o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(master); const st=now+i*0.03; g.gain.value=0; g.gain.linearRampToValueAtTime(.25, st+.01); g.gain.exponentialRampToValueAtTime(.0001, st+t); o.start(st); o.stop(st+t+.02); }); }
function startMusic(){ if(bgOn) return; const ac=audio(); musicGain=ac.createGain(); musicGain.gain.value=.05; musicGain.connect(master); const notes=[262,330,392,523]; let t=ac.currentTime+0.05; for(let i=0;i<32;i++){ for(const f of notes){ const o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(musicGain); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.12,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+0.25); o.start(t); o.stop(t+0.25); t+=0.25; } } bgOn=true; }
function stopMusic(){ if(musicGain) musicGain.gain.value=0; bgOn=false; }
let flakes=[];
function sizeCanvas(){ confetti.width = confetti.offsetWidth; confetti.height = confetti.offsetHeight; }
window.addEventListener('resize', sizeCanvas); sizeCanvas();
function burstConfetti(n=80){ sizeCanvas(); flakes=[]; for(let i=0;i<n;i++){ flakes.push({x:confetti.width/2,y:confetti.height/2,vx:(Math.random()*2-1)*4,vy:(Math.random()*-2-1)*4,r:Math.random()*4+2,a:1,hue:Math.floor(Math.random()*360)}); } }
function drawConfetti(){ ctx.clearRect(0,0,confetti.width,confetti.height); flakes.forEach(f=>{ f.x+=f.vx; f.y+=f.vy; f.vy+=0.06; f.a-=0.01; ctx.globalAlpha=Math.max(f.a,0); ctx.fillStyle=`hsl(${f.hue},90%,60%)`; ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill(); }); flakes=flakes.filter(f=>f.a>0 && f.y<confetti.height+20); requestAnimationFrame(drawConfetti); }
requestAnimationFrame(drawConfetti);
function toast(t){ const el = document.getElementById('qtext'); el.textContent = t; setTimeout(()=>{ if(currentTopicList && currentTopicList.length) loadQ(); },800); }
