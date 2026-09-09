const screens=[...document.querySelectorAll('.screen')];
const state={audio:false,muted:false,ctx:null,master:null,music:null};
const $=s=>document.querySelector(s);

function ensureAudio(){
  if(state.ctx)return;
  try{
    state.ctx=new(window.AudioContext||window.webkitAudioContext)();
    state.master=state.ctx.createGain();
    state.master.gain.value=state.muted?0:.055;
    state.master.connect(state.ctx.destination);
    state.audio=true;
  }catch(e){console.warn('Audio unavailable',e)}
}

function resumeAudio(){
  ensureAudio();
  if(state.ctx&&state.ctx.state==='suspended')state.ctx.resume();
}

function beep(freq=440,dur=.09,type='sine',gain=.045){
  try{
    resumeAudio();
    if(!state.ctx||state.muted)return;
    const o=state.ctx.createOscillator(),g=state.ctx.createGain(),now=state.ctx.currentTime;
    o.type=type;o.frequency.setValueAtTime(freq,now);
    g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o.connect(g);g.connect(state.master);o.start(now);o.stop(now+dur+.02);
  }catch(e){}
}

function chord(notes,duration=3){
  if(!state.ctx||state.muted)return;
  const now=state.ctx.currentTime;
  notes.forEach((freq,i)=>{
    const o=state.ctx.createOscillator(),g=state.ctx.createGain();
    o.type=i%2?'triangle':'sine';o.frequency.value=freq;
    g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(.012,now+.45);g.gain.exponentialRampToValueAtTime(.0001,now+duration);
    o.connect(g);g.connect(state.master);o.start(now);o.stop(now+duration+.1);
  });
}

function startMusic(){
  resumeAudio();
  if(!state.ctx||state.music||state.muted)return;
  const ctx=state.ctx;
  const master=ctx.createGain();master.gain.value=.9;master.connect(state.master);
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1250;filter.Q.value=.5;filter.connect(master);
  const notes=[130.81,164.81,196,246.94,196,164.81,146.83,220];
  let index=0;
  const play=()=>{
    if(state.muted)return;
    const now=ctx.currentTime;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle';o.frequency.setValueAtTime(notes[index%notes.length],now);
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+.22);g.gain.exponentialRampToValueAtTime(.0001,now+2.7);
    o.connect(g);g.connect(filter);o.start(now);o.stop(now+2.8);index++;
  };
  play();state.music=setInterval(play,1400);
  chord([130.81,164.81,196],4.8);
}

function stopMusic(){if(state.music){clearInterval(state.music);state.music=null}}
function setMuted(value){
  state.muted=value;ensureAudio();
  if(state.master)state.master.gain.setTargetAtTime(value?0:.055,state.ctx.currentTime,.08);
  const b=$('#soundToggle');if(b)b.textContent=value?'SOUND: OFF':'SOUND: ON';
  if(value)stopMusic();else startMusic();
}

function show(name){
  screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
  window.scrollTo({top:0,behavior:'smooth'});
  resumeAudio();
  if(name!=='boot'&&!state.muted)startMusic();
  if(name==='complete')revealClassification();
  if(name==='birthday'){launchCelebration(70);birthdayChime()}
  if(name==='final'){launchCelebration(150);finalChime()}
}

function typeLog(lines){
  const box=$('#bootLog');let i=0;
  function next(){
    if(i>=lines.length){$('#enterBtn').classList.remove('hidden');return}
    const p=document.createElement('div');p.textContent='> '+lines[i];box.appendChild(p);
    beep(520+i*55,.07,'square',.032);i++;setTimeout(next,360)
  }next()
}

(function boot(){
  const bar=$('#bootProgress');let p=0;
  const timer=setInterval(()=>{
    p+=Math.random()*17+7;
    if(p>=100){p=100;clearInterval(timer);typeLog(['Establishing secure friendship channel...','Searching subject database...','Subject found: RATUL','Birthday signature verified: 10.09.2026','Protocol ready.'])}
    bar.style.width=p+'%'
  },170)
})();

$('#enterBtn').addEventListener('click',()=>{resumeAudio();startMusic();beep(180,.22,'sawtooth',.07);setTimeout(()=>beep(360,.12,'triangle',.04),100);show('profile')});
$('#soundToggle').addEventListener('click',()=>{resumeAudio();setMuted(!state.muted)});

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-next]');
  if(b){beep(680,.09,'triangle',.045);show(b.dataset.next)}
});

document.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');
  const p=btn.dataset.path;
  const messages={medical:'SIMULATION RESULT: Doctor Ratul.exe detected. Please prescribe common sense.',engineering:'SIMULATION RESULT: Engineer Ratul.exe detected. System may require debugging.',buet:'TARGET LOCKED: BUET CRACK PROTOCOL ACTIVE. Still a dream. Still possible. Keep going, bro.',unknown:'SYSTEM RESPONSE: Same bro. Nobody has the whole map. Figure it out one step at a time.'};
  const box=$('#futureResult');box.textContent=messages[p];box.classList.remove('hidden');$('#futureContinue').classList.remove('hidden');
  beep(760,.12,'triangle',.06);setTimeout(()=>beep(980,.1,'sine',.035),90);
}));

function revealClassification(){
  const c=$('#classification');c.innerHTML='CLASSIFICATION:<br><strong></strong><br><span>STATUS: FRIEND.</span>';
  const out=c.querySelector('strong'),word='RATUL';let i=0;
  const timer=setInterval(()=>{out.textContent=word.slice(0,++i);beep(320+i*45,.055,'square',.03);if(i===word.length){clearInterval(timer);setTimeout(()=>$('#birthdayReveal').classList.remove('hidden'),650)}},180)
}

function birthdayChime(){
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>beep(f,.5,'sine',.07),i*130));
}
function finalChime(){
  [392,523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>beep(f,.55,'triangle',.065),i*120));
}

function launchCelebration(n=70){
  const root=$('#confetti');root.innerHTML='';
  for(let i=0;i<n;i++){
    const p=document.createElement('i');p.className='piece';p.style.left=Math.random()*100+'vw';p.style.setProperty('--x',(Math.random()*80-40)+'vw');p.style.animationDuration=(2.2+Math.random()*2.5)+'s';p.style.animationDelay=(Math.random()*.7)+'s';p.style.opacity=.7+Math.random()*.3;root.appendChild(p)
  }
  setTimeout(()=>root.innerHTML='',6000)
}

$('#finishBtn').addEventListener('click',()=>{beep(880,.16,'sine',.08);show('final')});
$('#replayBtn').addEventListener('click',()=>location.reload());
setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString('en-GB',{hour12:false})},1000);
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&e.target.tagName!=='INPUT')location.reload()});