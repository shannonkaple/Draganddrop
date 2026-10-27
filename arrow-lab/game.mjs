import './viewport.mjs?v=responsive-kbd-20261027a';
import {classKey,copyLegacy} from './identity.mjs?v=lab1';
const teachers=await fetch(new URL('../rainbow-road/data/teachers.json?v=20261021-all18',import.meta.url)).then(r=>r.json());
import '../rainbow-road/read-aloud.mjs?v=20261021-menu';
import {openAdventure} from './adventure.mjs?v=restore-characters-20261027b';
let adventureController=null,adventureActive=false;
import {makeMaze,step,nextRun,awardWallet} from '../rainbow-road/core.mjs';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rainbow=['#FF2D8D','#FF8A00','#FFD600','#6BCB24','#24A8F2','#A450E0'];
const colors=[{id:'violet',name:'Violet',hex:'#A450E0',cost:0},{id:'pink',name:'Pink',hex:'#FF2D8D',cost:20},{id:'blue',name:'Blue',hex:'#24A8F2',cost:20},{id:'mint',name:'Mint',hex:'#6BCB24',cost:20}];
const star='<svg class="marker" viewBox="0 0 100 100" aria-label="Start star"><path d="M50 7 63 34 93 38 71 59 77 90 50 75 23 90 29 59 7 38 37 34Z" fill="#FFD600" stroke="#000000" stroke-width="5"/></svg>';
const flag='<svg class="marker" viewBox="0 0 100 100" aria-label="Checkered finish flag"><path d="M23 91V10" stroke="#000000" stroke-width="7" stroke-linecap="round"/><path d="M27 13H87V61H27Z" fill="white" stroke="#000000" stroke-width="3"/><path d="M27 13H42V25H27ZM57 13H72V25H57ZM42 25H57V37H42ZM72 25H87V37H72ZM27 37H42V49H27ZM57 37H72V49H57ZM42 49H57V61H42ZM72 49H87V61H72Z" fill="#000000"/></svg>';
const gem='<svg class="gem" viewBox="0 0 30 36" aria-hidden="true"><path d="M15 2 28 17 22 17 22 33 8 33 8 17 2 17Z" fill="#A450E0" stroke="#000000" stroke-width="2"/><path d="M15 5V30M6 16H24" stroke="#FFFFFF" stroke-width="2"/></svg>';
let identity=null,run=null,wallet=null,saving=true;
function key(){return classKey(identity.teacherId,identity.number)}
function seed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]}
function save(){try{localStorage.setItem(key(),JSON.stringify({...JSON.parse(localStorage.getItem(key())||'{}'),run,wallet,teacherId:identity.teacherId,teacherName:identity.teacherName,studentNumber:identity.number}));saving=true}catch{saving=false}}
function restore(){let d;try{d=JSON.parse(localStorage.getItem(key())||'null')}catch{}const r=d?.run,w=d?.wallet;const valid=r&&Number.isInteger(r.level)&&r.level>0&&r.w>=5&&r.w<=9&&r.h>=5&&r.h<=9&&Array.isArray(r.grid)&&r.grid.length===r.h&&r.grid.every(row=>Array.isArray(row)&&row.length===r.w&&row.every(n=>n===0||n===1))&&Number.isInteger(r.player?.x)&&Number.isInteger(r.player?.y)&&r.grid[r.player.y]?.[r.player.x]===0&&r.start?.x===1&&r.start?.y===1&&r.goal?.x===r.w-2&&r.goal?.y===r.h-2&&Array.isArray(r.trail)&&r.trail.length<10000&&w&&[w.total,w.earned,w.finished].every(n=>Number.isSafeInteger(n)&&n>=0)&&Array.isArray(w.owned)&&colors.some(c=>c.id===w.color);
 if(valid){run=r;wallet=w}else{run=makeMaze(seed(),1);wallet={total:0,earned:0,finished:0,color:'violet',owned:['violet']}}}

const characterList=[['astro_ace','Astro Ace'],['beep_bop_robot','Beep Bop Robot'],['dizzy_dino','Dizzy Dino'],['penny_penguin','Penny Penguin'],['poppy_pup','Poppy Pup'],['rainbow_rocket_unicorn','Rainbow Rocket Unicorn'],['sunny_kitten','Sunny Kitten'],['twinkle_fairy','Twinkle Fairy']].map(([id,name],i)=>({id,name,cost:10+i*5,src:new URL('../'+id+'.png',import.meta.url).href}));
let availableCharacters=[];
const charactersReady=Promise.all(characterList.map(c=>new Promise(resolve=>{const img=new Image();const timer=setTimeout(()=>resolve(null),5000);img.onload=()=>{clearTimeout(timer);resolve(c)};img.onerror=()=>{clearTimeout(timer);resolve(null)};img.src=c.src}))).then(items=>{availableCharacters=items.filter(Boolean)});
function rider(){const c=availableCharacters.find(c=>c.id===wallet.character&&wallet.rescued?.includes(c.id));return c?'<span class="player character-player" aria-label="'+esc(c.name)+'"><img src="'+esc(c.src)+'" alt="" draggable="false"></span>':'<span class="player" aria-label="Your rider"></span>';}
function enterGame(){play();if(run.complete)showWin(false)}
async function chooseCharacter(){await charactersReady;if(!availableCharacters.length){enterGame();return}
 wallet.rescued=Array.isArray(wallet.rescued)?wallet.rescued.filter(id=>characterList.some(c=>c.id===id)):[];
 let dialog=$('characters');if(!dialog){dialog=document.createElement('dialog');dialog.id='characters';dialog.className='dialog character-dialog';dialog.setAttribute('aria-labelledby','character-title');document.body.append(dialog)}
 dialog.innerHTML='<h2 id="character-title">Rescue Rainbow Friends!</h2><p>Earn 5 Arrow Amethysts for each maze.<br>Spend your gems to rescue a friend. Keep every friend you rescue!</p><p>'+gem+' <strong>'+wallet.total+' Arrow Amethysts</strong></p><div class="character-grid">'+availableCharacters.map(c=>{const owned=wallet.rescued.includes(c.id),afford=wallet.total>=c.cost;return '<button data-character="'+c.id+'" '+(!owned&&!afford?'disabled':'')+'><img src="'+esc(c.src)+'" alt="" draggable="false"><span>'+esc(c.name)+'</span><span class="small">'+(owned?(wallet.character===c.id?'Your game piece':'Choose rescued friend'):'Rescue: '+c.cost+' gems')+'</span>'+(!owned&&!afford?'<span class="small">'+Math.ceil((c.cost-wallet.total)/5)+' more mazes</span>':'')+'</button>'}).join('')+'</div><p id="rescue-status" role="status"></p><button id="keep-playing" class="primary">Keep exploring →</button>';
 const resume=()=>{dialog.close();save();enterGame()};dialog.oncancel=e=>{e.preventDefault();resume()};$('keep-playing').onclick=resume;
 dialog.querySelectorAll('[data-character]').forEach(button=>button.onclick=()=>{const c=availableCharacters.find(c=>c.id===button.dataset.character);if(!c)return;if(!wallet.rescued.includes(c.id)){if(wallet.total<c.cost)return;wallet.total-=c.cost;wallet.rescued.push(c.id)}wallet.character=c.id;resume()});if(!dialog.open)dialog.showModal();
}

function login(){
 $('help').onclick=legacyHelp;adventureController?.cleanup();adventureController=null;adventureActive=false;document.body.classList.remove('playing');identity=null;run=null;wallet=null;$('who').classList.add('hidden');
 $('app').innerHTML='<div class="hero"><div class="rainbow">🌈</div><h1>MS. KAPLE’S A-MAZING<br>ARROW ADVENTURE!</h1><p>Choose your teacher. Then choose your classroom number.</p></div><section class="panel"><h2>1. Pick your teacher</h2><div class="adventure-cards">'+teachers.map(t=>'<button data-teacher="'+t.id+'">'+esc(t.name)+'</button>').join('')+'</div><details><summary>For the teacher</summary><p>Previous number-only saves stay on this browser. Assign them to their original homeroom once. Existing class saves will not be replaced.</p><label for="arrow-teacher-code">Teacher code</label><input id="arrow-teacher-code" type="password" inputmode="numeric" autocomplete="off"><div class="adventure-cards">'+teachers.map(t=>'<button data-import-arrow="'+t.id+'">Assign old saves to '+esc(t.name)+'</button>').join('')+'</div><p id="arrow-import-status" role="status"></p></details></section>';
 document.querySelectorAll('[data-teacher]').forEach(b=>b.onclick=()=>pickNumber(teachers.find(t=>t.id===b.dataset.teacher)));
 document.querySelectorAll('[data-import-arrow]').forEach(b=>b.onclick=()=>{if($('arrow-teacher-code').value!=='8714'){$('arrow-import-status').textContent='Enter the teacher code first.';return}const count=copyLegacy(localStorage,b.dataset.importArrow);$('arrow-import-status').textContent='Copied '+count+' old saves. Original backups were kept.'});
}
function pickNumber(teacher){
 $('app').innerHTML='<button id="other-teacher">← Change teacher</button><section class="panel"><h2>2. Pick your number</h2><p>'+esc(teacher.name)+'</p><div class="numbers">'+Array.from({length:24},(_,i)=>'<button data-number="'+(i+1)+'" aria-label="Play as number '+(i+1)+'">'+(i+1)+'</button>').join('')+'</div></section><p class="footnote">Progress saves by teacher and number on this browser. Use the same device and browser to resume.</p>';
 $('other-teacher').onclick=login;document.querySelectorAll('[data-number]').forEach(b=>b.onclick=()=>{identity={teacherId:teacher.id,teacherName:teacher.name,number:Number(b.dataset.number)};restore();save();launchAdventure()});
}
async function launchAdventure(){adventureActive=true;const number=identity.number;try{adventureController=await openAdventure({number,storageKey:key(),teacherName:identity.teacherName,teachers,onLogout:login,goPractice:()=>{$('help').onclick=legacyHelp;adventureActive=false;restore();$('who').onclick=()=>{save();login()};play();if(run.complete)showWin(false)}})}catch(error){adventureActive=false;$('app').innerHTML='<section class="panel"><h2>The adventure could not load.</h2><p>Please refresh and try again.</p><button id="practice-fallback">Open endless practice</button></section>';$('practice-fallback').onclick=()=>{restore();play()};console.error(error)}}
function play(){document.body.classList.add('playing');$('who').classList.remove('hidden');$('app').innerHTML='<div class="row" style="margin-bottom:16px"><span class="pill" id="road-level"></span><span class="small">'+esc(identity.teacherName)+' · #'+identity.number+'</span><span class="pill">'+gem+' <span id="wallet"></span></span></div><div class="play-layout"><section><div class="board-wrap"><div id="maze" class="maze" role="img" aria-label="Rainbow maze. Start at the star and finish at the checkered flag."></div></div><p class="caption" id="status" role="status">Find the flag. Look, choose, press and release, check.</p></section><aside class="side"><section class="panel"><h3>Use your keys</h3><div class="keypad" aria-label="Keyboard arrow layout"><div class="key up" id="ArrowUp">↑</div><div class="key left" id="ArrowLeft">←</div><div class="key down" id="ArrowDown">↓</div><div class="key right" id="ArrowRight">→</div></div><p>One press. One move.<br>Let the key come up.</p><p class="small">Use your keyboard. Touching the screen does not move the rider.</p></section><section class="panel"><h3>My Arrow Amethysts</h3><div class="stat" id="gem-total"></div><p id="finished" class="small"></p><button id="rescue-friends" class="small">Rescue friends</button></section><div class="actions tools"><button id="reset" class="small">Back to the star</button><button id="full" class="small">Full screen</button></div></aside></div><p class="footnote" id="storage-note"></p>';
 $('rescue-friends').onclick=chooseCharacter;$('reset').onclick=()=>{run.player={...run.start};run.trail=[[1,1]];run.steps=0;save();board();$('status').textContent='Back at the star. Try your route again.'};$('full').onclick=()=>window.arrowLabToggleFullscreen();board();stats();requestAnimationFrame(fitMaze);}
function fitMaze(){document.documentElement.style.setProperty('--view-height',(window.visualViewport?.height||window.innerHeight)+'px');if(!run||!$('maze'))return;const box=document.querySelector('.board-wrap');if(!box)return;const viewport=window.visualViewport?.height||window.innerHeight,caption=document.getElementById('status')?.getBoundingClientRect().height||30,foot=document.getElementById('storage-note')?.getBoundingClientRect().height||20;const availableH=Math.min(box.clientHeight-24,viewport-box.getBoundingClientRect().top-caption-foot-58);const size=Math.max(1,Math.floor(Math.min((box.clientWidth-24)/run.w,availableH/run.h)));$('maze').style.width=(size*run.w)+'px';$('maze').style.height=(size*run.h)+'px';}
window.addEventListener('resize',()=>requestAnimationFrame(fitMaze));window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(fitMaze));document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitMaze));
if('ResizeObserver'in window)new ResizeObserver(()=>requestAnimationFrame(fitMaze)).observe(document.getElementById('app'));
function stats(){$('wallet').textContent=wallet.total+' Arrow Amethysts';$('gem-total').textContent=wallet.total;$('finished').textContent=wallet.finished+' mazes finished';$('road-level').textContent='Rainbow road '+run.level;$('storage-note').textContent=saving?'Progress saves by teacher and number on this browser.':'This browser is not saving progress. You can still play this session.';}
function board(){const m=$('maze');m.style.setProperty('--w',run.w);m.style.setProperty('--h',run.h);m.style.setProperty('--player',colors.find(c=>c.id===wallet.color).hex);const trail=new Set(run.trail.map(p=>p.join(',')));let out='';for(let y=0;y<run.h;y++)for(let x=0;x<run.w;x++){const road=run.grid[y][x]===0,player=x===run.player.x&&y===run.player.y;out+='<div class="cell '+(road?'road':'wall')+(road&&trail.has(x+','+y)?' trail':'')+'" style="--c:'+rainbow[(x+y)%rainbow.length]+'">'+(x===1&&y===1?star:x===run.goal.x&&y===run.goal.y?flag:'')+(player?rider():'')+'</div>'}m.innerHTML=out;stats();requestAnimationFrame(fitMaze);}
function showWin(earned=true){$('earned').innerHTML=gem+(earned?' +5 Arrow Amethysts!':'This maze is already finished.')+'<br>You have '+wallet.total+' Arrow Amethysts.';if(!$('win').open)$('win').showModal();}
function next(){if(!run?.complete)return;$('win').close();run=nextRun(run);save();board();$('status').textContent='New maze! Start at the star and find the flag.';}
function openShop(){$('shop-items').innerHTML=colors.map(c=>'<button data-color="'+c.id+'"><span class="swatch" style="background:'+c.hex+'"></span>'+c.name+'<br><span class="small">'+(wallet.color===c.id?'Using now':wallet.owned.includes(c.id)?'Choose this color':c.cost+' Arrow Amethysts')+'</span></button>').join('');document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{const c=colors.find(c=>c.id===b.dataset.color);if(!wallet.owned.includes(c.id)){if(wallet.total<c.cost){$('shop-note').textContent='Keep exploring! Finish more mazes to unlock this color.';return}wallet.total-=c.cost;wallet.owned.push(c.id)}wallet.color=c.id;save();board();$('shop-note').textContent=c.name+' is ready!';openShop()});if(!$('shop').open)$('shop').showModal();}
const fullscreenButton=$('global-fullscreen');
function syncFullscreenButton(){
  const active=!!document.fullscreenElement;
  fullscreenButton.textContent=active?'⛶ Exit Full Screen':'⛶ Full Screen';
  fullscreenButton.setAttribute('aria-pressed',String(active));
  fullscreenButton.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');
  requestAnimationFrame(()=>{
    window.dispatchEvent(new Event('resize'));
    window.visualViewport?.dispatchEvent?.(new Event('resize'));
  });
}
async function toggleArrowLabFullscreen(){
  try{
    if(document.fullscreenElement){
      if(typeof document.exitFullscreen==='function') await document.exitFullscreen();
      else throw new Error('The browser does not support exiting full screen.');
    }else{
      const element=document.documentElement;
      if(typeof element.requestFullscreen!=='function')throw new Error('Full Screen API unavailable.');
      // Invoke requestFullscreen directly from the physical trackpad click.
      await element.requestFullscreen();
    }
  }catch(error){
    const message='Browser full screen was blocked. Click this button in the full browser tab, or press F11 on your Chromebook/keyboard.';
    alert(message);
  }
  syncFullscreenButton();
}
window.arrowLabToggleFullscreen=toggleArrowLabFullscreen;
fullscreenButton.addEventListener('click',toggleArrowLabFullscreen);
document.addEventListener('fullscreenchange',syncFullscreenButton);
// Arrow Lab is deliberately a TRACKPAD + PHYSICAL KEYBOARD activity.
// Blocking touch starts also suppresses synthesized touch clicks on UI buttons;
// real mouse/trackpad clicks, keyboard focus and wheel scrolling remain available.
document.addEventListener('touchstart',event=>{
  if(event.cancelable)event.preventDefault();
},{capture:true,passive:false});
document.addEventListener('pointerdown',event=>{
  if(event.pointerType && event.pointerType!=='mouse'){
    event.preventDefault();event.stopImmediatePropagation();
  }
},true);

document.addEventListener('fullscreenerror',()=>{
  fullscreenButton.title='Full screen was blocked by your browser.';
});
$('global-home').onclick=()=>{
 if(adventureActive&&adventureController?.goHome){adventureController.goHome();return}
 if(identity){
   for(const id of ['win','shop','characters'])document.getElementById(id)?.close?.();
   if(!adventureActive)launchAdventure();
   return;
 }
 login();
};
$('close-shop').onclick=()=>$('shop').close();$('next').onclick=next;$('win').addEventListener('cancel',e=>{e.preventDefault();next()});$('who').onclick=()=>{save();login()};
document.addEventListener('keydown',e=>{if(adventureActive||!run)return;if($('win').open){if(e.key==='Enter'){e.preventDefault();if(!e.repeat)next()}else if(e.key.startsWith('Arrow'))e.preventDefault();return}if($('shop').open||$('characters')?.open)return;if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();if(e.repeat)return;const keyEl=$(e.key);keyEl?.classList.add('on');setTimeout(()=>keyEl?.classList.remove('on'),150);const r=step(run,e.key);if(r.moved){if(run.trail.length>500)run.trail=run.trail.slice(-500);if(r.won)wallet=awardWallet(wallet);save();board();$('status').textContent=r.won?'You reached the checkered flag!':'You moved '+e.key.slice(5).toLowerCase()+'.';if(r.won)showWin()}else $('status').textContent='There is a wall. Stop, look, and try another arrow.';});
const legacyHelp=()=>{const t='Start at the star. Use the four arrow keys on your keyboard. Up, down, left, right. Press and let go to move one space. Follow the rainbow road to the checkered flag. Each maze earns five Arrow Amethysts. There is no timer. Take your time.';if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.85;speechSynthesis.speak(u)}else alert(t)};$('help').onclick=legacyHelp;
login();

