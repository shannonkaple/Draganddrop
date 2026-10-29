import {writeVerifiedStudentRecord} from './verified-student-write.mjs?v=verified-save-20261029a';
import {enablePickerArrows} from './picker-arrows.mjs?v=20261028';
import {isMobileTouchDevice} from './mobile-touch.mjs?v=mobile-touch-20261028a';
const mobileTouch = isMobileTouchDevice();
if(mobileTouch)document.body.classList.add('mobile-touch-enabled');
import './viewport.mjs?v=mobile-fullwidth-shelf-20261028a';
import {classKey,copyLegacy} from './identity.mjs?v=lab1';
const teachers=await fetch(new URL('../rainbow-road/data/teachers.json?v=20261021-all18',import.meta.url)).then(r=>r.json());
import '../rainbow-road/read-aloud.mjs?v=20261021-menu';
import {openAdventure} from './adventure.mjs?v=teacher-skip-save-20261029a';
import {canSaveStudentProgress} from './student-storage-probe.mjs?v=non-destructive-login-20261029a';
let adventureController=null,adventureActive=false;
import {makeMaze,step,nextRun,awardWallet} from '../rainbow-road/core.mjs';
const verifyTeacherCode=value=>value==='8714';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rainbow=['#FF2D8D','#FF8A00','#FFD600','#6BCB24','#24A8F2','#A450E0'];
const colors=[{id:'violet',name:'Violet',hex:'#A450E0',cost:0},{id:'pink',name:'Pink',hex:'#FF2D8D',cost:20},{id:'blue',name:'Blue',hex:'#24A8F2',cost:20},{id:'mint',name:'Mint',hex:'#6BCB24',cost:20}];
const star='<img class="marker" src="./assets/star-icon.png" alt="Start star">';
const flag='<img class="marker" src="./assets/flag-icon.png" alt="Checkered finish flag">';
const gem='<img class="gem" src="./assets/gem-icon.png" alt="Arrow Amethysts">';
let identity=null,run=null,wallet=null,saving=true;
function key(){return classKey(identity.teacherId,identity.number)}
function syncStudentBanner(){
 const wrapper=$('lab-student-header'),caption=$('lab-current-class');
 if(!wrapper||!caption)return;
 if(!identity){
  caption.textContent='';wrapper.classList.add('hidden');
  document.body.classList.remove('lab-student-selected');
  $('who')?.classList.add('hidden');return;
 }
 caption.textContent=identity.teacherName+' · #'+identity.number;
 wrapper.classList.remove('hidden');
 document.body.classList.add('lab-student-selected');
}

function seed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]}
// The login screen runs before the adventure's own storage guard. Never let
// its legacy-maze save overwrite an unreadable student adventure record.
// A failed first save must be visible BEFORE a child begins an adventure.
function showLoginStorageWarning(){
 let warning=document.getElementById('arrow-lab-storage-warning');
 if(warning)return;
 warning=document.createElement('div');
 warning.id='arrow-lab-storage-warning';
 warning.className='arrow-lab-fullscreen-note';
 warning.setAttribute('role','alert');
 warning.textContent='Your adventure is NOT saving on this Chromebook. Tell your teacher before playing. Do not close this tab until the problem is fixed.';
 document.body.append(warning);
}
function save(){
 try{
  const raw=localStorage.getItem(key());
  let previous={};
  if(raw!==null){
   previous=JSON.parse(raw);
   if(!previous||typeof previous!=='object'||Array.isArray(previous)||
      (previous.adventure!==undefined&&previous.adventure!==null&&
       (typeof previous.adventure!=='object'||Array.isArray(previous.adventure)))){
    throw Error('Existing student record is unreadable; refusing overwrite');
   }
  }
  writeVerifiedStudentRecord(localStorage,key(),{...previous,run,wallet,teacherId:identity.teacherId,teacherName:identity.teacherName,studentNumber:identity.number});
  saving=true;
  document.getElementById('arrow-lab-storage-warning')?.remove();
 }catch{
  saving=false;
  showLoginStorageWarning();
 }
}
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
 $('arrow-lab-help-dialog')?.close?.();
 $('help').onclick=legacyHelp;adventureController?.cleanup();adventureController=null;adventureActive=false;document.body.classList.remove('playing');identity=null;run=null;wallet=null;$('who').classList.add('hidden');syncStudentBanner();
 // The artwork in the banner already names the game. Keep teacher login short,
 // readable, and scrollable instead of repeating a huge second title.
 document.body.classList.remove('lab-number-active');
 document.body.classList.add('lab-teacher-active');
 $('app').innerHTML='<section class="lab-entry-screen" aria-label="Choose your teacher">'+
  '<div class="lab-entry-intro"><span class="lab-step-badge">STEP 1 OF 2</span><h1>Choose Your Teacher</h1>'+
  '<p>Tap or click your teacher, then choose your classroom number.</p>'+
  '<small>Or use keyboard arrows and press Enter.</small></div>'+
  '<div class="lab-teacher-list" role="group" aria-label="Teachers"><div class="adventure-cards lab-teacher-cards">'+
  teachers.map(t=>'<button type="button" data-teacher="'+t.id+'" aria-label="Choose '+esc(t.name)+'">'+esc(t.name)+'</button>').join('')+
  '</div></div><details class="lab-teacher-tools"><summary>Teacher tools</summary>'+
  '<p>Assign old number-only saves to the original homeroom. Backups remain.</p>'+
  '<label for="arrow-teacher-code">Teacher code</label><input id="arrow-teacher-code" type="password" inputmode="numeric" autocomplete="off">'+
  '<div class="adventure-cards lab-import-cards">'+teachers.map(t=>
   '<button type="button" data-import-arrow="'+t.id+'">Assign old saves to '+esc(t.name)+'</button>').join('')+
  '</div><p id="arrow-import-status" role="status"></p></details></section>';
 $('app').scrollTop=0;
 document.querySelectorAll('[data-teacher]').forEach(b=>b.onclick=()=>pickNumber(teachers.find(t=>t.id===b.dataset.teacher)));
 enablePickerArrows(document.querySelector('[data-teacher]').parentElement);
 document.querySelectorAll('[data-import-arrow]').forEach(b=>b.onclick=()=>{if(!verifyTeacherCode($('arrow-teacher-code').value)){$('arrow-import-status').textContent='Enter the teacher code first.';return}const count=copyLegacy(localStorage,b.dataset.importArrow);$('arrow-import-status').textContent='Copied '+count+' old saves. Original backups were kept.'});
}
function pickNumber(teacher){
 document.body.classList.remove('lab-teacher-active');
 document.body.classList.add('lab-number-active');
 $('app').innerHTML='<section class="lab-entry-screen lab-number-screen">'+
  '<div class="lab-entry-intro"><button id="other-teacher" type="button">← Change Teacher</button>'+
  '<span class="lab-step-badge">STEP 2 OF 2</span><h1>Choose Your Number</h1>'+
  '<p>'+esc(teacher.name)+'</p><small>Tap or click your classroom number to start or continue your adventure.</small></div>'+
  '<div class="lab-number-list"><div class="numbers">'+Array.from({length:24},(_,i)=>
    '<button type="button" data-number="'+(i+1)+'" aria-label="Play as classroom number '+(i+1)+'">'+(i+1)+'</button>').join('')+
  '</div></div><p class="lab-entry-note">Your stars, collected items and mazes save by teacher and number on this Chromebook.</p></section>';
 $('app').scrollTop=0;
 $('other-teacher').onclick=login;document.querySelectorAll('[data-number]').forEach(b=>b.onclick=()=>{identity={teacherId:teacher.id,teacherName:teacher.name,number:Number(b.dataset.number)};syncStudentBanner();restore();saving=canSaveStudentProgress();if(!saving)showLoginStorageWarning();launchAdventure()});
 enablePickerArrows(document.querySelector('.numbers'));
}
async function launchAdventure(){document.body.classList.remove('lab-teacher-active','lab-number-active');syncStudentBanner();adventureActive=true;const number=identity.number;try{adventureController=await openAdventure({number,storageKey:key(),teacherName:identity.teacherName,teachers,verifyTeacherCode,onLogout:login,goPractice:()=>{$('help').onclick=legacyHelp;adventureActive=false;restore();$('who').onclick=()=>{save();login()};play();if(run.complete)showWin(false)}})}catch(error){adventureActive=false;$('app').innerHTML='<section class="panel"><h2>The adventure could not load.</h2><p>Please refresh and try again.</p><button id="practice-fallback">Open endless practice</button></section>';$('practice-fallback').onclick=()=>{restore();play()};console.error(error)}}
function play(){document.body.classList.add('playing');syncStudentBanner();$('who').classList.remove('hidden');$('app').innerHTML='<div class="row" style="margin-bottom:16px"><span class="pill" id="road-level"></span><span class="pill">'+gem+' <span id="wallet"></span></span></div><div class="play-layout"><section><div class="board-wrap"><div id="maze" class="maze" role="img" aria-label="Rainbow maze. Start at the star and finish at the checkered flag."></div></div><p class="caption" id="status" role="status">Find the flag. Look, choose, press and release, check.</p></section><aside class="side"><section class="panel"><h3>Use your keys</h3><div class="keypad" aria-label="Keyboard arrow layout"><div class="key up" id="ArrowUp">↑</div><div class="key left" id="ArrowLeft">←</div><div class="key down" id="ArrowDown">↓</div><div class="key right" id="ArrowRight">→</div></div><p>One press. One move.<br>Let the key come up.</p><p class="small">Use your keyboard. '+(mobileTouch?'Tap the arrows to move the rider.':'Touching the screen does not move the rider.')+'</p></section><section class="panel"><h3>My Arrow Amethysts</h3><div class="stat" id="gem-total"></div><p id="finished" class="small"></p><button id="rescue-friends" class="small">Rescue friends</button></section><div class="actions tools"><button id="reset" class="small">Back to the star</button><button id="full" class="small">Full screen</button></div></aside></div><p class="footnote" id="storage-note"></p>';
 $('rescue-friends').onclick=chooseCharacter;$('reset').onclick=()=>{run.player={...run.start};run.trail=[[1,1]];run.steps=0;save();board();$('status').textContent='Back at the star. Try your route again.'};$('full').onclick=()=>window.arrowLabToggleFullscreen();
 if(mobileTouch)for(const key of ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight']){
   const target=$(key);if(!target)continue;
   target.setAttribute('role','button');target.tabIndex=0;
   target.setAttribute('aria-label','Move '+key.slice(5));
   target.onclick=()=>pressPracticeArrow(key);
   target.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();pressPracticeArrow(key)}};
 }
 board();stats();requestAnimationFrame(fitMaze);}
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
function fullscreenNotice(message){
  let note=$('arrow-lab-fullscreen-note');
  if(!note){
    note=document.createElement('div');
    note.id='arrow-lab-fullscreen-note';
    note.className='arrow-lab-fullscreen-note';
    note.setAttribute('role','alert');
    const text=document.createElement('span');
    text.className='arrow-lab-fullscreen-message';
    const dismiss=document.createElement('button');
    dismiss.type='button';dismiss.className='small';dismiss.textContent='Dismiss';
    dismiss.onclick=()=>note.remove();
    note.append(text,dismiss);
    document.body.append(note);
  }
  note.querySelector('.arrow-lab-fullscreen-message').textContent=message;
}
async function toggleArrowLabFullscreen(){
  // A native dialog and the fullscreen element both live in the browser top
  // layer. A new fullscreen request can otherwise hide an already-open popup.
  const dialogs=[...document.querySelectorAll('dialog[open]')];
  const focused=document.activeElement;
  const restoreFocus=dialogs.find(d=>d.contains(focused));
  for(const d of dialogs)d.close();
  try{
    if(document.fullscreenElement){
      if(typeof document.exitFullscreen==='function')await document.exitFullscreen();
      else throw new Error('The browser does not support exiting full screen.');
    }else{
      const element=document.documentElement;
      if(typeof element.requestFullscreen!=='function')throw new Error('Full Screen API unavailable.');
      await element.requestFullscreen();
    }
    $('arrow-lab-fullscreen-note')?.remove();
  }catch(error){
    fullscreenNotice('Browser full screen was blocked. Click Full Screen again in the browser tab, or press F11 on your Chromebook.');
  }finally{
    // Restore reward, challenge, instruction, rescue and help dialogs
    // without reconstructing HTML or resetting their attached handlers.
    for(const d of dialogs)if(d.isConnected&&!d.open){
      try{d.showModal()}catch{fullscreenNotice('The popup could not reopen. Use Home to return to the map.')}
    }
    if(restoreFocus?.open&&focused?.isConnected){
      try{focused.focus({preventScroll:true})}catch{}
    }
    syncFullscreenButton();
  }
}
window.arrowLabToggleFullscreen=toggleArrowLabFullscreen;
fullscreenButton.addEventListener('click',toggleArrowLabFullscreen);
document.addEventListener('fullscreenchange',syncFullscreenButton);
// Teacher and student-number PICKERS are tappable on mobile/touchscreen.
// Actual maze movement and trackpad-only drag challenges still reject touch.
// The old unconditional capture listeners also blocked mobile's synthetic clicks
// on the teacher buttons, preventing students from even logging in.
const touchLoginPickerOpen=()=>document.body.classList.contains('lab-teacher-active')||
  document.body.classList.contains('lab-number-active');
document.addEventListener('touchstart',event=>{
  if(mobileTouch||touchLoginPickerOpen())return; // Native touch on phones/tablets; login on all touchscreens.
  if(event.cancelable)event.preventDefault();
},{capture:true,passive:false});
document.addEventListener('pointerdown',event=>{
  if(mobileTouch||touchLoginPickerOpen())return;
  if(event.pointerType && event.pointerType!=='mouse'){
    event.preventDefault();event.stopImmediatePropagation();
  }
},true);

document.addEventListener('fullscreenerror',()=>{
  fullscreenButton.title='Full screen was blocked by your browser.';
  fullscreenNotice('Full screen was blocked. Try clicking Full Screen again in the browser tab, or use F11 on your Chromebook.');
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
// Both the physical keyboard and (only on mobile) the on-screen practice
// arrows use this same one-step movement and existing save/reward path.
function pressPracticeArrow(key){
 if(adventureActive||!run||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key))return;
 const keyEl=$(key);keyEl?.classList.add('on');setTimeout(()=>keyEl?.classList.remove('on'),150);
 const result=step(run,key);
 if(result.moved){
   if(run.trail.length>500)run.trail=run.trail.slice(-500);
   if(result.won)wallet=awardWallet(wallet);
   save();board();
   $('status').textContent=result.won?'You reached the checkered flag!':'You moved '+key.slice(5).toLowerCase()+'.';
   if(result.won)showWin();
 }else $('status').textContent='There is a wall. Stop, look, and try another arrow.';
}
document.addEventListener('keydown',e=>{if(adventureActive||!run)return;if($('win').open){if(e.key==='Enter'){e.preventDefault();if(!e.repeat)next()}else if(e.key.startsWith('Arrow'))e.preventDefault();return}if($('shop').open||$('characters')?.open||$('arrow-lab-help-dialog')?.open)return;if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();if(e.repeat)return;pressPracticeArrow(e.key);});
function legacyHelp(){
  // Keep written instructions available even when speech synthesis is missing.
  if($('win')?.open||$('shop')?.open||$('characters')?.open)return;
  const t='Start at the star. Use the four arrow keys on your keyboard. Up, down, left, right. Press and let go to move one space. Follow the rainbow road to the checkered flag. Each maze earns five Arrow Amethysts. There is no timer. Take your time.';
  let dialog=$('arrow-lab-help-dialog');
  if(!dialog){
    dialog=document.createElement('dialog');dialog.id='arrow-lab-help-dialog';dialog.className='dialog';
    dialog.setAttribute('aria-labelledby','arrow-lab-help-title');
    dialog.style.maxHeight='85dvh';dialog.style.overflowY='auto';document.body.append(dialog);
  }
  dialog.innerHTML='<h2 id="arrow-lab-help-title">How to Play</h2><p>'+esc(t)+'</p><div class="actions"><button id="arrow-lab-help-read" type="button">🔊 Read aloud</button><button id="arrow-lab-help-close" type="button" class="primary">Back to game</button><button id="arrow-lab-help-home" type="button">🏠 Home</button></div>';
  const speech=window.speechSynthesis,read=$('arrow-lab-help-read');
  read.disabled=!(speech&&window.SpeechSynthesisUtterance);
  read.onclick=()=>{if(read.disabled)return;try{speech.cancel();const u=new window.SpeechSynthesisUtterance(t);u.rate=.85;speech.speak(u)}catch{}};
  dialog.onclose=()=>{try{speech?.cancel()}catch{}};
  $('arrow-lab-help-close').onclick=()=>dialog.close();
  $('arrow-lab-help-home').onclick=()=>{dialog.close();$('global-home').click()};
  if(!dialog.open)dialog.showModal();
}
$('help').onclick=legacyHelp;
login();

