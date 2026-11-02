import {COLS,ROWS,WORLDS,GALAXY,WORLD_STOPS,LEVEL_STOPS,CHARACTERS,ENEMIES,ITEMS,NAMES,createMission,createProgress,completedCount,worldUnlocked,levelUnlocked} from './curriculum.mjs?v=jr-space-shape-match-20261102';
import {clone,startRun,select,move,patrol,finish,purchase,readProgress} from './engine.mjs?v=jr-space-shape-match-20261102';
import {touchGeneratedClick} from './input-policy.mjs?v=jr-trackpad-click-fix-20261102';
import {verifiedWrite,writeTabSession,readTabSession,clearTabSession,storageProbe} from './save-integrity.mjs?v=junior-safe-refresh-20261102';
const root=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const state={view:'teachers',teachers:[],teacher:null,number:null,key:null,progress:null,world:0,mission:null,run:null,modal:null,notice:'',error:'',brokenSave:'',pending:null,tabSignature:null,expectedSavedRaw:null};
const fileImg=(src,alt,cls='')=>'<img class="'+cls+'" src="'+src+'" alt="'+esc(alt)+'" draggable="false" loading="eager" onerror="this.onerror=null;this.src=\'../game-assets/collectibles/computer/laptop_512.png\'">';
const chosen=()=>CHARACTERS.find(x=>x.id===state.progress?.character)||CHARACTERS[0];
const saveKey=(teacher,num)=>'mskaple-arrownaut-junior-v1:'+teacher+':'+num;
function rememberTab(){
 if(!state.progress||!state.teacher||!state.number)return;
 const info={teacher:state.teacher,number:state.number,view:state.view,world:state.world,stage:state.mission?.stage??null};
 const signature=JSON.stringify(info);
 if(signature===state.tabSignature)return;
 try{if(writeTabSession(sessionStorage,info))state.tabSignature=signature}catch{}
}
function guardStudentNavigation(){
 return !state.progress||persist({...state.progress,active:state.view==='game'&&state.run&&!state.run.complete?clone(state.run):state.progress.active});
}
function notice(message,error=false){state.notice=message;state.error=error?message:'';const box=document.getElementById('feedback');if(box){box.textContent=message;box.classList.toggle('error',error)}}
function persist(progress){
 if(!state.key||state.brokenSave){notice('Student progress cannot be saved. Ask the teacher.',true);return false}
 try{
  // Never overwrite newer work from another tab using the same teacher/number.
  if(localStorage.getItem(state.key)!==state.expectedSavedRaw)
   throw Error('Another tab changed this student record');
  verifiedWrite(localStorage,state.key,progress);
  state.expectedSavedRaw=JSON.stringify(progress);
  state.progress=progress;
  const label=root.querySelector('#save-state');if(label){label.textContent='Saved';label.classList.remove('save-error')}
  return true;
 }catch(e){const label=root.querySelector('#save-state');if(label){label.textContent='NOT SAVED';label.classList.add('save-error')}notice('NOT SAVED. Do not close this tab. Tell your teacher.',true);return false}
}
function header(){
 const playing=!!state.progress;
 const teacher=state.teachers.find(t=>t.id===state.teacher)?.name||'';
 return '<header class="topbar" id="topbar"><div class="branding"><img class="astronaut-corner" src="./assets/explorers/space_panda.png" alt="Nova Panda astronaut game logo" draggable="false"><div><strong>ARROW-NAUT JUNIOR</strong><small>FIRST GRADE · CLICK + KEYBOARD ARROWS'+(playing?' · '+esc(teacher)+' #'+state.number:'')+'</small></div></div>'+
 (playing?'<nav class="center-nav" aria-label="Student navigation"><button data-action="home">Home</button><button data-action="shop">My Stars: '+state.progress.stars+'</button><button data-action="stuff">My Stuff</button><button data-action="characters">Change Explorer</button><span class="save-state" id="save-state" aria-live="polite">Saved</span></nav>':'<span></span>')+
 '<nav class="side-nav"><button data-action="help">How to Play</button>'+(playing?'<button data-action="logout">Change Student</button>':'')+'</nav></header>';
}
function login(){
 if(state.view==='teachers')return '<main class="entry"><h1>First Grade Space Explorers</h1><p>Choose your first-grade teacher.</p>'+
 (state.error?'<p class="error" role="alert">'+esc(state.error)+'</p>':'')+
 '<div class="choose-grid">'+state.teachers.map(t=>'<button data-teacher="'+esc(t.id)+'">'+esc(t.name)+'</button>').join('')+'</div></main>';
 return '<main class="entry"><button data-action="teachers">Back to Teachers</button><h1>Choose Your Student Number</h1>'+
 '<div class="choose-grid student-nums">'+Array.from({length:30},(_,i)=>'<button data-student="'+(i+1)+'">'+(i+1)+'</button>').join('')+'</div></main>';
}
function home(){
 return '<main class="map-page"><div class="map-stage"><img src="'+GALAXY+'" class="map-art" alt="Eight illustrated space planets" draggable="false">'+
 WORLDS.map((world,i)=>{
 const done=completedCount(state.progress,i),unlocked=worldUnlocked(state.progress,i),pad=WORLD_STOPS[i];
 return '<button class="world-pin" data-world="'+i+'" style="left:'+pad.x+'%;top:'+pad.y+'%" '+(unlocked?'':'disabled')+
 ' aria-label="'+esc(world.name)+(unlocked?'':' locked')+'"><strong>'+esc(world.name)+'</strong><small>'+ (unlocked?done+'/8 levels':'LOCKED')+'</small></button>';
 }).join('')+'<div class="map-note">'+state.progress.completed.length+'/64 levels · '+state.progress.stars+' stars · Click a planet!</div></div></main>';
}
function worldMap(){
 const w=WORLDS[state.world],done=completedCount(state.progress,state.world);
 return '<main class="map-page"><div class="map-stage"><img src="'+w.jpg+'" class="map-art" alt="'+esc(w.name)+' illustrated world" draggable="false">'+
 '<div class="map-heading">'+esc(w.name)+' · '+done+'/8 complete</div>'+
 NAMES.map((name,i)=>{
 const available=levelUnlocked(state.progress,state.world,i),completed=state.progress.completed.includes(w.id+'-'+(i+1)),at=LEVEL_STOPS[i];
 return '<button class="level-pin" data-level="'+i+'" style="left:'+at.x+'%;top:'+at.y+'%" '+(available?'':'disabled')+
 ' aria-label="Level '+(i+1)+' '+esc(name)+'"><strong>'+(available?i+1:'LOCK')+'</strong><small>'+esc(name)+(completed?' · DONE':'')+'</small></button>';
 }).join('')+'<button class="map-back" data-action="home">All Planets</button></div></main>';
}
const stylePos=(x,y,w=1,h=1)=>'left:'+(x/COLS*100)+'%;top:'+(y/ROWS*100)+'%;width:'+(w/COLS*100)+'%;height:'+(h/ROWS*100)+'%';
function piece(p){
 const selected=state.run.selected===p.id;
 const isNext=state.mission.kind==='relay'&&state.mission.deliveryOrder[(state.run.delivered||[]).length]===p.id;
 const delivered=state.mission.kind==='relay'&&(state.run.delivered||[]).includes(p.id);
 const graphic=p.id==='rover'?chosen().img:p.img;
 const pictureName=p.id==='rover'?chosen().name:p.name;
 return '<div class="piece'+(selected?' chosen':'')+(isNext?' next-up':'')+(delivered?' docked':'')+'" data-piece="'+esc(p.id)+'" style="'+stylePos(p.x,p.y,p.w,p.h)+'">'+
 '<button data-select="'+esc(p.id)+'" aria-label="Select '+esc(p.name)+'" title="Click inside '+esc(p.name)+' to select">'+
 fileImg(graphic,pictureName,'piece-picture')+'</button></div>';
}
function missionMeter(m,run){
 if(m.kind==='relay'){
  const n=(run.delivered||[]).length,active=m.pieces.find(p=>p.id===m.deliveryOrder[n]);
  return 'SIGNALS: '+n+' / 3 · CLICK '+(active?.name||'NEXT')+' NEXT';
 }
 if((m.pickups||[]).length){
  return (m.kind==='key-gate'?(run.gateOpen?'FIELD OPEN · ':'FIND THE KEY · '):
    m.kind==='trail'?'STAR TRAIL · ':m.kind==='collect'?'CRYSTAL HUNT · ':'SIGNAL SCAN · ')+
   (run.collected||[]).length+' / '+m.pickups.length+' COLLECTED';
 }
 return m.kind==='maze'?'RESCUE YOUR FRIEND · REACH EXIT':'CLICK THE GOLDEN STAR';
}
/** Update just the moving elements, preserving every image node between
 * arrow presses. No reloading dozens of PNGs and JPEGs per keyboard repeat.
 */
function refreshGameDisplay(){
 if(state.view!=='game'||!state.mission||!state.run)return;
 const board=root.querySelector('.game-board');
 if(!board){render();return}
 const run=state.run,m=state.mission;
 const selected=run.selected;
 for(const piece of run.pieces){
  const el=Array.from(board.querySelectorAll('[data-piece]')).find(x=>x.dataset.piece===piece.id);
  if(!el)continue;
  el.style.left=piece.x/COLS*100+'%';
  el.style.top=piece.y/ROWS*100+'%';
  el.classList.toggle('chosen',selected===piece.id);
  if(m.kind==='relay'){
   el.classList.toggle('next-up',m.deliveryOrder[(run.delivered||[]).length]===piece.id);
   el.classList.toggle('docked',(run.delivered||[]).includes(piece.id));
  }
 }
 const explorer=board.querySelector('[data-explorer]');
 if(explorer&&run.maze){
  explorer.style.left=run.maze.x/COLS*100+'%';
  explorer.style.top=run.maze.y/ROWS*100+'%';
  explorer.classList.toggle('chosen',selected==='explorer');
  for(const e of run.maze.enemies){
   const el=Array.from(board.querySelectorAll('[data-enemy]')).find(x=>x.dataset.enemy===e.id);
   if(el){el.style.left=e.x/COLS*100+'%';el.style.top=e.y/ROWS*100+'%'}
  }
 }
 for(const el of board.querySelectorAll('[data-pickup]'))
  el.hidden=(run.collected||[]).includes(el.dataset.pickup);
 const gate=board.querySelector('.force-gate');
 if(gate)gate.hidden=!!run.gateOpen;
 const meter=root.querySelector('.game-mini-meter');
 if(meter)meter.textContent=missionMeter(m,run);
 const feedback=root.querySelector('#feedback');
 if(feedback){feedback.textContent=state.notice;feedback.classList.toggle('error',!!state.error)}
}
function game(){
 const m=state.mission,run=state.run,w=WORLDS[m.world],isMaze=m.kind==='maze';
 const targets=m.pieces.filter(p=>p.goal).map(p=>'<div class="goal goal-dock'+(p.shape?' shape-match '+p.shape:(m.world%2===0?' dock-green':' dock-blue'))+'" style="'+stylePos(p.goal.x,p.goal.y,p.w,p.h)+'" title="Fit the '+esc(p.name)+' here">'+fileImg(p.id==='rover'?chosen().img:p.img,'','goal-picture')+'<small>'+(p.shape?'MATCH '+p.shape:'DOCK')+'</small></div>').join('');
 const pickups=(m.pickups||[]).filter(p=>!(run.collected||[]).includes(p.id)).map(p=>
  '<div class="pickup" data-pickup="'+esc(p.id)+'" style="'+stylePos(p.x,p.y)+'" role="img" aria-label="'+esc(p.name)+'">'+
   fileImg(p.img,p.name,'pickup-picture')+'<small>'+esc(p.name)+'</small></div>').join('');
 const gate=m.gate&&!run.gateOpen?'<div class="force-gate" style="'+stylePos(m.gate.x,m.gate.y)+'">'+
  fileImg(m.gate.img,'Locked force field','gate-picture')+'<small>LOCKED</small></div>':'';
 const meter=missionMeter(m,run);
 
 const walls=m.rocks.map(([x,y])=>'<div class="rock" style="'+stylePos(x,y)+'">'+
 fileImg(m.world===3?'./assets/move-find/ice_wall_four_blocks.png':'../game-assets/enemies/rock_golem_256.png',m.world===3?'Ice wall':'Space rock','rock-picture')+'</div>').join('');
 let mazePieces='';
 if(isMaze){
  const current=chosen();
  const enemies=run.maze.enemies.map((e,i)=>'<div class="enemy" data-enemy="'+esc(e.id)+'" style="'+stylePos(e.x,e.y)+'">'+fileImg(ENEMIES[(m.world+i)%ENEMIES.length],'Space bad guy','enemy-picture')+'</div>').join('');
  mazePieces='<div class="finish" style="'+stylePos(m.mazeGoal.x,m.mazeGoal.y)+'">EXIT</div>'+enemies+
   '<div class="explorer'+(run.selected==='explorer'?' chosen':'')+'" data-explorer="yes" style="'+stylePos(run.maze.x,run.maze.y)+'"><button data-select="explorer" aria-label="Select your space explorer">'+fileImg(current.img,current.name,'explorer-picture')+'</button></div>';
 }
 return '<main class="game-page"><div class="game-title"><h1>'+esc(w.name)+' · Level '+(m.stage+1)+': '+esc(m.name)+'</h1>'+
 '<span class="game-mini-meter" aria-live="polite">'+esc(meter)+'</span><button data-action="world">Back to World Map</button></div>'+
 '<div class="directions"><strong>'+esc(m.directions)+'</strong><button type="button" class="listen" data-action="listen" aria-label="Read the level directions aloud" title="Click to hear the instructions again"><span class="speaker-icon" aria-hidden="true">🔊</span><span class="listen-label">HEAR DIRECTIONS</span></button></div>'+
 '<div class="board-area"><div class="game-board" role="group" aria-label="First grade trackpad click and keyboard arrow puzzle" tabindex="-1">'+
 '<img class="board-backdrop" src="'+w.jpg+'" alt="" draggable="false">'+
 '<div class="grid"></div>'+targets+walls+gate+pickups+(isMaze?mazePieces:run.pieces.map(piece).join(''))+
 '</div></div><p id="feedback" class="feedback'+(state.error?' error':'')+'" role="status">'+esc(state.notice||'Click a picture with your trackpad. Move with keyboard arrows.')+'</p></main>';
}
function shop(){
 return '<main class="content-page"><h1>Space Star Shop</h1><p>You have '+state.progress.stars+' stars. Earn 1 star on a new level and 10 stars for a rescue maze. Replays are for practice.</p>'+
 '<div class="item-grid">'+ITEMS.map(x=>{
 const owned=state.progress.purchases.includes(x.id);
 return '<div class="shop-card">'+fileImg(x.img,x.name,'shop-picture')+'<strong>'+esc(x.name)+'</strong>'+
 '<button data-buy="'+x.id+'" '+(owned||state.progress.stars<x.price?'disabled':'')+'>'+
 (owned?'OWNED':'Buy · '+x.price+' stars')+'</button></div>';
 }).join('')+'</div></main>';
}
function stuff(){
 const p=state.progress,w=p.sceneWorld??0,owned=[
 ...p.purchases.map(id=>ITEMS.find(x=>x.id===id)).filter(Boolean).map(x=>({...x,key:'item:'+x.id})),
 ...p.rescued.map(id=>WORLDS.find(x=>x.id===id)).filter(Boolean).map(x=>({key:'friend:'+x.id,name:x.name+' Friend',img:x.friend}))
 ];
 const placed=(Array.isArray(p.worldScene)?p.worldScene:[]).filter(x=>x.world===w);
 return '<main class="stuff-page"><h1>My Space World</h1><p>Click an item, then click the background to place it. Put away an item whenever you want.</p>'+
 '<div class="world-tabs">'+WORLDS.map((x,i)=>'<button data-stuff-world="'+i+'" '+(i===w?'aria-pressed="true"':'')+'>'+esc(x.name)+'</button>').join('')+'</div>'+
 '<div class="decor-scene" data-scene="yes">'+fileImg(WORLDS[w].jpg,WORLDS[w].name,'scene-backdrop')+
 placed.map(x=>{const item=owned.find(i=>i.key===x.key);if(!item)return '';
 return '<div class="scene-decor" style="left:'+Math.min(94,Math.max(6,x.x))+'%;top:'+Math.min(91,Math.max(9,x.y))+'%">'+
 fileImg(item.img,item.name,'decor-image')+'<button data-remove="'+esc(x.key)+'" aria-label="Put '+esc(item.name)+' away">×</button></div>';
 }).join('')+'</div>'+
 '<p class="status-text">'+(state.pending?'Click a place on your world picture.':'Choose an item below to place it.')+'</p>'+
 '<div class="inventory">'+owned.map(x=>'<button data-place="'+esc(x.key)+'" '+(state.pending===x.key?'aria-pressed="true"':'')+'>'+
 fileImg(x.img,x.name,'inventory-image')+'<small>'+esc(x.name)+'</small></button>').join('')+
 (owned.length?'':'<p>Play levels to earn stars and rescue friends. Buy decorations at the Star Shop!</p>')+'</div></main>';
}
function help(){
 return '<main class="content-page"><h1>How to Play · First Grade</h1><div class="howto">'+
 '<p><strong>1. TRACKPAD:</strong> Move the pointer to the MIDDLE of a picture and CLICK once.</p>'+
 '<p><strong>2. KEYBOARD:</strong> Press the LEFT, RIGHT, UP, or DOWN arrow key to MOVE the selected picture.</p>'+
 '<p><strong>3. STARS AND CRYSTALS:</strong> Some missions ask you to TOUCH glowing pictures before docking. Watch the mission counter!</p>'+ 
 '<p><strong>4. GREEN DOCKS:</strong> Move the matching picture to its goal. In some missions you must scan cargo or unlock a gate first.</p>'+
 '<p><strong>5. RESCUE MAZE:</strong> CLICK your explorer first, then use KEYBOARD ARROWS to reach EXIT. Bad guys move on side paths.</p>'+
 '<p>Finish levels to earn stars. No dragging and no touchscreen play. Move just one square with each arrow press.</p></div>'+
 '<button data-action="home">Back to My Worlds</button></main>';
}
function modal(){
 if(!state.modal)return '';
 const x=state.modal;
 let inner='';
 if(x.type==='victory'){
  const friend=WORLDS[x.world].friend;
  inner='<h2>'+(x.rescue?'WORLD RESCUED!':'Mission Complete!')+'</h2>'+
  (x.rescue?fileImg(friend,'Rescued space friend','reward-image')+'<p>Your new friend is saved in My Stuff!</p>':'')+
  '<strong class="reward">'+(x.stars?'+'+x.stars+' STARS':'Practice Complete')+'</strong>'+
  '<button data-action="victory-ok">Continue</button>';
 }else if(x.type==='character'){
  inner='<h2>Choose Your Space Explorer</h2><div class="character-grid">'+
  CHARACTERS.map(p=>'<button data-character="'+p.id+'" '+(state.progress.character===p.id?'aria-pressed="true"':'')+'>'+
   fileImg(p.img,p.name,'character-image')+'<span>'+esc(p.name)+'</span></button>').join('')+
  '</div><button data-action="character-close">Done</button>';
 }
 return '<div class="veil"><section class="dialog" role="dialog" aria-modal="true">'+inner+'</section></div>';
}
function render(){
 root.innerHTML=header()+
 (state.view==='teachers'||state.view==='students'?login():state.view==='home'?home():state.view==='world'?worldMap():
  state.view==='game'?game():state.view==='shop'?shop():state.view==='stuff'?stuff():help())+modal();
 clockSync();
 rememberTab();
}
function openStudent(number,restore=null){
 if(!Number.isInteger(number)||number<1||number>30)return;
 state.number=number;state.key=saveKey(state.teacher,number);state.brokenSave='';
 try{const raw=localStorage.getItem(state.key);state.progress=readProgress(raw);state.expectedSavedRaw=raw;}
 catch(e){state.brokenSave=e.message;state.error=e.message;state.view='teachers';render();return}
 if(!storageProbe(localStorage)){
  state.brokenSave='Chromebook storage is blocked';state.error='Your Chromebook cannot save progress. Tell your teacher before starting.';
  state.view='teachers';render();return;
 }
 state.view='home';state.error='';state.notice='';
 // Old animal/fantasy choices are no longer available; change only the
 // portrait preference and preserve all stars, purchased/placed objects, and wins.
 if(!CHARACTERS.some(c=>c.id===state.progress.character)){
  if(!persist({...state.progress,character:CHARACTERS[0].id}))return;
 }
 if(restore&&worldUnlocked(state.progress,restore.world)){
  state.world=restore.world;
  if(restore.view==='game'&&restore.stage!==null&&levelUnlocked(state.progress,restore.world,restore.stage)){
   const missionId=WORLDS[restore.world].id+'-'+(restore.stage+1);
   if(state.progress.completed.includes(missionId)&&!state.progress.active){state.view='world';render();return}
   openLevel(restore.stage);return;
  }
  if(['world','shop','stuff','help'].includes(restore.view))state.view=restore.view;
 }else if(restore&&['shop','stuff','help'].includes(restore.view))state.view=restore.view;
 render();
}
function showWorld(i){
 if(!state.progress||!worldUnlocked(state.progress,i))return;
 state.world=i;state.view='world';state.run=null;state.mission=null;state.modal=null;state.error='';render();
}
function openLevel(stage){
 if(!levelUnlocked(state.progress,state.world,stage))return;
 const m=createMission(state.world,stage),old=state.progress.active;
 let resume=old&&old.id===m.id&&!old.complete&&Array.isArray(old.pieces)&&
  old.mechanicVersion===m.mechanicVersion;
 if(m.kind==='maze')resume=resume&&old.maze?.version===2&&Array.isArray(old.maze.enemies);
 // Unfinished pre-update puzzles restart in the new layout; completed levels, stars,
 // purchases and rescued friends remain exactly as previously saved.
 const run=resume?clone(old):startRun(m);
 if(!resume&&!persist({...state.progress,active:clone(run)}))return;
 state.mission=m;state.run=run;state.view='game';state.notice='Click inside a picture. Use keyboard arrows to move.';state.error='';render();
}
function actRun(next,msg){
 const result=next.complete?finish(state.progress,state.mission):null;
 // Completion + rewards + rescued friend are one verified transaction.
 const progress=result?result.progress:{...state.progress,active:clone(next)};
 if(!persist(progress))return;
 state.run=next;state.notice=msg;state.error='';
 if(result)state.modal={type:'victory',stars:result.stars,rescue:result.rescue,world:state.mission.world};
 if(result)render();else refreshGameDisplay();
}
function selectPiece(id){
 if(state.view!=='game'||state.modal)return;
 const r=select(state.mission,state.run,id);
 if(!r.ok){notice(r.reason,true);return}
 actRun(r.run,r.reason);
}
function moveArrow(key){
 if(state.view!=='game'||state.modal)return;
 const r=move(state.mission,state.run,key);
 if(!r.ok){notice(r.reason,true);return}
 actRun(r.run,r.reason);
}
let timer=null;
function clockSync(){
 const active=state.view==='game'&&state.mission?.kind==='maze'&&!state.modal&&!state.run?.complete;
 if(!active){if(timer){clearInterval(timer);timer=null}return}
 if(timer)return;
 timer=setInterval(()=>{
  if(state.view!=='game'||state.mission?.kind!=='maze'||state.modal)return;
  const t=patrol(state.mission,state.run);
  if(!t.ok)return;
  if(!persist({...state.progress,active:clone(t.run)}))return;
  state.run=t.run;state.notice=t.reason;refreshGameDisplay();
 },Math.max(1050,1650-state.mission.world*70));
}
function nav(action){
 if(['home','teachers','world','shop','stuff','help','logout'].includes(action)&&!guardStudentNavigation())return;
 switch(action){
  case 'home':state.view=state.progress?'home':'teachers';state.modal=null;state.run=null;state.mission=null;render();break;
  case 'teachers':state.view='teachers';state.error='';render();break;
  case 'world':showWorld(state.world);break;
  case 'shop':state.view='shop';state.modal=null;render();break;
  case 'stuff':state.view='stuff';state.modal=null;state.pending=null;render();break;
  case 'help':state.view='help';state.modal=null;render();break;
  case 'logout':try{clearTabSession(sessionStorage)}catch{}state.tabSignature=null;state.expectedSavedRaw=null;state.teacher=null;state.number=null;state.key=null;state.progress=null;state.view='teachers';state.modal=null;render();break;
  case 'characters':state.modal={type:'character'};render();break;
  case 'character-close':state.modal=null;render();break;
  case 'victory-ok':state.modal=null;showWorld(state.world);break;
  case 'listen':
   // Every mission can be reread on demand; clicking the speaker restarts it.
   if(!state.mission)break;
   if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){
    notice('Speech is not available on this Chromebook. Ask your teacher to help.',true);
    break;
   }
   window.speechSynthesis.cancel();
   const utterance=new SpeechSynthesisUtterance(state.mission.directions.replace(/!\s*/g,'. ').replace(/\bCLICK\b/g,'click').replace(/\bTRACKPAD\b/g,'trackpad'));
   utterance.lang='en-US';utterance.rate=.84;utterance.pitch=1;
   window.speechSynthesis.speak(utterance);
   break;
 }
}
let lastPointer='mouse';
root.addEventListener('pointerdown',e=>{
 // Trackpads report 'mouse'. Touch taps can generate a synthetic click too,
 // so remember where that click came from instead of trusting click alone.
 lastPointer=e.pointerType||lastPointer;
 if(e.target.closest('.game-board')&&(e.pointerType==='touch'||e.pointerType==='pen')){
  e.preventDefault();
 }
},true);
root.addEventListener('click',e=>{
 // First-grade puzzle selection MUST use a trackpad/mouse. Do not block
 // touchscreen navigation on the teacher, student, map, or shop screens.
 if(e.target.closest('.game-board')&&touchGeneratedClick(e,lastPointer)){
  e.preventDefault();
  notice('Use the Chromebook TRACKPAD to select pictures, not the touchscreen.',true);
  return;
 }
 const target=e.target.closest('button');
 if(target){
  const d=target.dataset;
  if(d.action){nav(d.action);return}
  if(d.teacher){state.teacher=d.teacher;state.view='students';state.error='';render();return}
  if(d.student){openStudent(Number(d.student));return}
  if(d.world!==undefined){showWorld(Number(d.world));return}
  if(d.level!==undefined){openLevel(Number(d.level));return}
  if(d.select){selectPiece(d.select);return}
  if(d.buy){
   const item=ITEMS.find(i=>i.id===d.buy);
   if(!item)return;const res=purchase(state.progress,item);
   if(!res.ok){notice(res.reason,true);return}
   if(persist(res.progress))render();return;
  }
  if(d.character){
   if(persist({...state.progress,character:d.character})){state.modal=null;render()}
   return;
  }
  if(d.stuffWorld!==undefined){
   if(persist({...state.progress,sceneWorld:Number(d.stuffWorld)})){state.pending=null;render()}
   return;
  }
  if(d.place){state.pending=d.place;render();return}
  if(d.remove){
   const p=state.progress,world=p.sceneWorld??0,scene=Array.isArray(p.worldScene)?p.worldScene:[];
   if(persist({...p,worldScene:scene.filter(x=>!(x.world===world&&x.key===d.remove))}))render();
   return;
  }
 }
 const scene=e.target.closest('[data-scene]');
 if(scene&&state.pending){
  const box=scene.getBoundingClientRect();
  const x=Math.max(6,Math.min(94,Math.round(100*(e.clientX-box.left)/box.width)));
  const y=Math.max(9,Math.min(91,Math.round(100*(e.clientY-box.top)/box.height)));
  const p=state.progress,world=p.sceneWorld??0,prev=Array.isArray(p.worldScene)?p.worldScene:[];
  const next={...p,worldScene:[...prev.filter(t=>!(t.key===state.pending&&t.world===world)),{world,key:state.pending,x,y}]};
  if(persist(next)){state.pending=null;render()}
 }
});
root.addEventListener('dragstart',e=>e.preventDefault());
root.addEventListener('touchstart',e=>{
 if(!e.target.closest('.game-board'))return;
 lastPointer='touch';
 if(e.cancelable)e.preventDefault(); // Suppresses compatibility mouse/click events.
 notice('Use the Chromebook TRACKPAD to select pictures, not the touchscreen.',true);
},{passive:false,capture:true});
window.addEventListener('keydown',e=>{
 if(state.view!=='game'||state.modal||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
 if(e.target.closest('input,textarea,select'))return;
 e.preventDefault();moveArrow(e.key);
});
async function init(){
 render();
 try{
  const response=await fetch('../rainbow-road/data/teachers.json',{cache:'no-cache'});
  if(!response.ok)throw Error('Teacher roster unavailable');
  const teachers=await response.json();
  if(!Array.isArray(teachers)||!teachers.length)throw Error('Teacher list invalid');
  state.teachers=teachers.filter(x=>x.id?.startsWith('grade1-'));
  if(!state.teachers.length)throw Error('No first-grade teachers in roster');
  state.error='';
  let previous=null;try{previous=readTabSession(sessionStorage)}catch{}
  if(previous&&state.teachers.some(t=>t.id===previous.teacher)){
   state.teacher=previous.teacher;state.tabSignature=null;
   openStudent(previous.number,previous);return;
  }
 }catch(e){state.error='The first-grade teacher list did not load. Refresh this page.'}
 render();
}
window.addEventListener('pagehide',()=>{
 // Every action was synchronously verified. Do not issue an unguarded
 // duplicate write on pagehide: another tab may have saved newer progress.
});
init();
