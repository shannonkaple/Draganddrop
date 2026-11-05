import {openTeacherTools} from './teacher-tools.mjs?v=teacher-tools-20261105b';
import {GRID,PLANETS,MISSION_NAMES,createMission,createProgress,completedCount,bonusCompletedCount,BONUS_STAGES,planetUnlocked,stageUnlocked,sceneUnlocked,SPACE_SHOP} from './curriculum.mjs?v=neon2-star-resize-20261105r7';
import {clone,initialMission,selectObject,arrowAction,resizeByHandle,finishMission,purchase,validatedSave,occupiedCells,mazeEnemyTick,fireLaser} from './mechanics.mjs?v=neon-resize-select-r3';
import {GALAXY_MAP,GALAXY_STOPS,LEVEL_STOPS,planetImage} from './art-assets.mjs';
import {PLAYERS,SHOP_SPRITES,PUZZLE_SPRITES,playerPortrait,friendPortrait,enemyPortrait,earnedItems} from './sprite-assets.mjs?v=map-two-locked-r2';
import {mountMapTwo} from './map-two.mjs?v=lost-worlds-8themes-r2';
const root=document.getElementById('app');
let disposeMapTwo=null;
const $=selector=>root.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={teacher:null,student:null,teachers:[],progress:null,view:'teachers',planet:0,mission:null,run:null,modal:null,message:'',error:'',dataError:'',key:null,scenePending:null};
const saveKey=(teacher,number)=>`mskaple-arrownaut-v1:${teacher}:${number}`;
const idOf=mission=>mission.id;
function speak(text){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){notify('Speech is unavailable on this browser.');return}
 window.speechSynthesis.cancel();let u=new window.SpeechSynthesisUtterance(text);u.rate=.82;window.speechSynthesis.speak(u);
}
function notify(message,isError=false){state.message=message;state.error=isError?message:'';let status=$('#live-status');if(status){status.textContent=message;status.classList.toggle('error',isError)}}
function persist(next){
 if(!state.key||state.dataError){notify('The saved student record could not be read. Nothing has been overwritten.',true);return false}
 try{const text=JSON.stringify(next);localStorage.setItem(state.key,text);
  if(localStorage.getItem(state.key)!==text)throw Error('Write did not verify');
  state.progress=next;state.dataError='';return true;
 }catch(error){notify('NOT SAVED. Your previous work is safe. Tell your teacher and try again.',true);return false}
}
// All 64 original Map One missions, not eight levels from one planet.
const mapTwoUnlocked=()=>!!state.progress&&PLANETS.every((_,i)=>completedCount(state.progress,i)===8);
const progressText=()=>state.progress?`${state.progress.stars} stars`:'0 stars';
/** Render the ENTIRE transparent PNG. Never use atlas background-position cropping. */
const art=(src,alt,cls='asset-image')=>`<img class="asset-image ${cls}" src="${esc(src||'./assets/standalone/pickup_star.png')}" alt="${esc(alt)}" draggable="false" loading="eager">`;
const playerImg=()=>art(playerPortrait(state.progress?.playerId),'Your chosen Arrow-Naut','header-player-img');
function header(){
 const hasStudent=!!state.progress;
 const studentText=hasStudent?`${state.teachers.find(t=>t.id===state.teacher)?.name||'Teacher'} · #${state.student}`:'';
 return `<header class="topbar" id="main-header"><div class="brand"><strong>Ms. Kaple's ARROW-NAUT Space Adventure</strong><small>${hasStudent?esc(studentText):'SECOND GRADE · CLICK · MOVE · RESIZE · FIT'}</small></div>
 <nav class="center-controls" aria-label="Game controls">${hasStudent?
  `<button data-action="home">Home</button>${mapTwoUnlocked()?`<button data-action="map-two" class="map-two-entry">MAP TWO · THE LOST WORLDS</button>`:''}<button data-action="shop">Star Shop · ${state.progress.stars}</button><button data-action="stuff">My Stuff</button><button data-action="player" class="choose-player-button">${playerImg()}<span>Change Character</span></button>`:''}</nav>
 <nav class="right-controls" aria-label="Help and student controls"><button type="button" data-action="fullscreen" aria-label="Toggle full screen">Full Screen</button><button data-action="help">How to Play</button><button data-action="teacher">Teacher</button>${hasStudent?'<button data-action="logout">Change Student</button>':''}</nav></header>`;
}
function entry(){
 if(state.view==='teachers')return `<main class="main"><section class="hero"><span class="tag">WELCOME, SPACE EXPLORER</span><h1>Choose Your Teacher</h1><p>Click carefully. Get ready to use your trackpad and arrow keys on an out-of-this-world mission!</p></section>
 ${state.error?`<p class="error-banner" role="alert">${esc(state.error)} <button data-action="reload-teachers">Try Again</button></p>`:''}
 <section class="entry"><h2>Who is your teacher?</h2><div class="selection-grid">${state.teachers.map(t=>`<button data-teacher="${esc(t.id)}">${esc(t.name)}</button>`).join('')}</div></section></main>`;
 return `<main class="main"><section class="entry"><button data-action="teachers">← Teachers</button><h1>Choose Your Student Number</h1><p>Use your classroom number. Your progress stays with this teacher and number on this Chromebook.</p>
 <div class="selection-grid number-grid">${Array.from({length:30},(_,i)=>`<button data-student="${i+1}">${i+1}</button>`).join('')}</div></section></main>`;
}
function home(){
 return `<main class="main galaxy-home"><section class="galaxy-map-wrap" aria-label="Choose one of eight space planets">
 <div class="galaxy-map-stage"><img class="galaxy-map-art" src="${GALAXY_MAP}" alt="Eight bright cartoon planet islands joined by a rainbow space trail" draggable="false">
 ${PLANETS.map((p,i)=>{const unlocked=planetUnlocked(state.progress,i),done=completedCount(state.progress,i),pad=GALAXY_STOPS[i];return `<button class="galaxy-stop${unlocked?'':' is-locked'}" style="left:${pad.x}%;top:${pad.y}%" data-planet="${i}" ${unlocked?'':'disabled'} aria-label="${esc(p.name)} Planet, ${done} of 8 levels complete${unlocked?'':' locked'}"><span class="stop-icon">${unlocked?'GO':'LOCK'}</span><span class="stop-name">${esc(p.name)}</span><span class="stop-count">${unlocked?`${done}/8 complete`:'Locked'}</span></button>`}).join('')}
 <div class="galaxy-progress" aria-live="polite">${state.progress.stars} stars · ${PLANETS.reduce((n,_,i)=>n+completedCount(state.progress,i),0)}/64 original missions · ${state.progress.completed.filter(id=>id.includes('-bonus-')).length} extra labs · Beat the final maze to unlock each new planet</div>
 </div></section></main>`;
}
function planetMap(){
 const p=PLANETS[state.planet],done=completedCount(state.progress,state.planet);
 return `<main class="main planet-map-page"><section class="planet-map-wrap" aria-label="${esc(p.name)} planet level map">
 <div class="planet-map-stage"><img class="planet-map-art" src="${planetImage(state.planet)}" alt="Illustrated scenery for ${esc(p.name)}" draggable="false">
 <div class="planet-map-heading"><strong>${esc(p.name)} World</strong><span>${done}/8 Missions · Rescue ${esc(p.friend)}</span></div>
 ${Array.from({length:8},(_,i)=>{const title=createMission(state.planet,i).title,completed=state.progress.completed.includes(`${p.id}-${i+1}`),unlocked=stageUnlocked(state.progress,state.planet,i),pin=LEVEL_STOPS[i];return `<button class="planet-level-pin${completed?' is-complete':''}" data-level="${i}" style="left:${pin.x}%;top:${pin.y}%" ${unlocked?'':'disabled'} aria-label="${esc(p.name)} level ${i+1}: ${esc(i===7?'FINAL MAZE - 10 STARS':title)}${completed?', completed':''}${unlocked?'':', locked'}"><strong>${unlocked?i+1:'LOCK'}</strong><span>${esc(title)}</span>${completed?'<small>DONE</small>':''}</button>`}).join('')}
 <button class="map-home-button" data-action="home">All Planets</button>
 </div></section>
 </main>`;
}
function positionStyle(piece){return `left:${piece.x/GRID.columns*100}%;top:${piece.y/GRID.rows*100}%;width:${piece.w/GRID.columns*100}%;height:${piece.h/GRID.rows*100}%;`}
function goalShape(piece){
 const g=piece.goal;if(!g)return '';
 const bbox={...piece,x:g.x,y:g.y,w:g.w??piece.w,h:g.h??piece.h};
 const label=piece.name.toUpperCase();
 return `<div class="goal matching-dock" style="${positionStyle(bbox)}" role="img" aria-label="Destination for ${esc(piece.name)}">
   ${art(PUZZLE_SPRITES[piece.id], '', 'goal-ghost')}
   <span class="goal-label">${esc(label)}</span></div>`;
}
function gamePieceArt(piece){return art(PUZZLE_SPRITES[piece.id]||'./assets/standalone/crate_blue.png',piece.name,'whole-piece-art');}
function pieceHtml(piece){
 const selected=state.run.selected===piece.id,cls=`piece ${piece.cells?'poly-piece ':''}${piece.color||'blue'}${selected?' selected':''}`;
 const inner=`<button class="${piece.cells?'poly-art-button':'piece-interior'}" type="button" data-select="${esc(piece.id)}" aria-label="Click the middle of ${esc(piece.name)} to select">
 ${gamePieceArt(piece)}<span class="piece-name">${esc(piece.name)}</span></button>`;
 return `<div class="${cls}" data-boundary="${esc(piece.id)}" style="${positionStyle(piece)}">${inner}${piece.resize&&selected?['nw','n','ne','e','se','s','sw','w'].map(handle=>`<button type="button" class="resize-handle handle-${handle}" data-resize="${esc(piece.id)}" data-handle="${handle}" title="Hold and drag to resize" aria-label="Drag ${handle} handle"></button>`).join(''):''}</div>`;
}

function finalePage(){
 const m=state.mission,run=state.run,z=100/GRID.columns,h=100/GRID.rows;
 const walls=m.walls.map(([x,y])=>`<div class="finale-wall" aria-hidden="true" style="left:${x*z}%;top:${y*h}%;width:${z}%;height:${h}%"></div>`).join('');
 const creatures=run.maze.enemies.map((e,i)=>`<div class="finale-enemy" aria-label="Moving space bad guy ${i+1}" role="img" style="left:${e.x*z}%;top:${e.y*h}%;width:${z}%;height:${h}%">${art(enemyPortrait(m.planetIndex*3+i),'Bad guy '+(i+1),'finale-enemy-pic')}</div>`).join('');
 const player=`<div class="finale-player" aria-label="Your space explorer" style="left:${run.maze.x*z}%;top:${run.maze.y*h}%;width:${z}%;height:${h}%">${art(playerPortrait(state.progress.playerId),'Your character','finale-player-pic')}</div>`;
 const goal=`<div class="finale-goal" role="img" aria-label="Rescue finish" style="left:${m.mazeGoal.x*z}%;top:${m.mazeGoal.y*h}%;width:${z}%;height:${h}%">${art(friendPortrait(m.planetIndex),'Rescue '+m.planet.friend,'finale-rescue-art')}<span>EXIT</span></div>`;
 const shot=run.maze.shot;
 const beam=shot?(()=>{
  const a=shot.from,b=shot.to,horizontal=a.y===b.y;
  const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);
  const style=horizontal?`left:${(x+.5)*z}%;top:${(a.y+.5)*h}%;width:${Math.max(1,Math.abs(b.x-a.x)*z)}%;height:5px`:
   `left:${(a.x+.5)*z}%;top:${(y+.5)*h}%;width:5px;height:${Math.max(1,Math.abs(b.y-a.y)*h)}%`;
  return `<div class="finale-laser-beam" aria-hidden="true" style="${style}"></div>${shot.hit?`<div class="laser-hit-word" style="left:${(b.x+.5)*z}%;top:${(b.y+.5)*h}%">ZAP!</div>`:''}`;
 })():'';
 return `<main class="main playing final-maze-page"><div class="mission-head"><h1>${esc(m.planet.name)} · FINAL SPACE MAZE</h1><span class="mode-label">10 stars · Hits: ${run.maze.hits} · Zapped: ${run.maze.zapped||0}</span><button class="back" data-action="planet">Back to World Map</button></div>
 <section class="mission-frame"><div class="directions-bar"><p>Move with arrow keys. Press SPACE or use FIRE LASER to zap bad guys. Gain 1 charge every 4 moves. Reach EXIT for 10 stars!</p><button class="speak" data-action="listen" aria-label="Hear directions">Listen</button><button type="button" class="laser-fire-button" data-action="laser" ${(run.maze.energy??3)<=0?"disabled":""}>FIRE LASER · SPACE (${run.maze.energy??3}/3)</button></div>
 <div class="board-frame"><div class="space-board finale-board" id="space-board" style="--world-hue:${m.planet.hue}" role="group" aria-label="Maze: arrow keys move the explorer; avoid four moving enemies; walls block movement.">
 <img class="mission-scenery" src="${planetImage(m.planetIndex)}" alt="" draggable="false"><div class="grid-lines"></div>${walls}${goal}${creatures}${player}${beam}</div></div></section>
 <div class="feedback${state.error?' error':''}" id="live-status" role="status">${esc(state.message||'Find your way to EXIT. Bad guys send you back to START, but your stars are safe.')}</div></main>`;
}
function missionPage(){
 const m=state.mission,run=state.run;
 if(m.kind==='final-maze')return finalePage();
 if(m.kind==='arrow-sequence'){
  const i=run.patternIndex||0;
  const arrows={ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓',ArrowLeft:'←'};
  return `<main class="main playing"><h1>${esc(m.title)}</h1><div class="directions-bar"><p>${esc(m.directions)}</p></div><div class="signal-code-stage"><img src="${planetImage(m.planetIndex)}" alt="" draggable="false"><strong>${arrows[m.pattern[i]||'ArrowUp']}</strong><p>PRESS THE MATCHING KEYBOARD ARROW · ${i} / ${m.pattern.length}</p></div><button data-action="planet">Back to Map</button><p id="live-status" class="feedback" role="status">${esc(state.message)}</p></main>`;
 }

 const boardTargets=m.pieces.filter(p=>p.goal).map(p=>goalShape(p)).join('');
 const pickups=(m.pickups||[]).filter(p=>!run.collected?.includes(p.id)).map(p=>`<div class="mission-pickup" style="left:${p.x/GRID.columns*100}%;top:${p.y/GRID.rows*100}%;width:${100/GRID.columns}%;height:${100/GRID.rows}%" role="img" aria-label="${esc(p.name)}"><span class="pickup-visible-star" aria-hidden="true">⭐</span>${art(p.image||'./assets/standalone/pickup_star.png',p.name,'mission-pickup-art')}<span>COLLECT</span></div>`).join('');
 const obstacles=(m.obstacles||[]).map(([x,y],i)=>`<div aria-hidden="true" class="obstacle" style="left:${x/12*100}%;top:${y/7*100}%;width:${100/12}%;height:${100/7}%">${art(enemyPortrait(m.planetIndex+i),'Space bad guy','obstacle-enemy')}</div>`).join('');
 const patrols=(run.hazards||[]).map((enemy,i)=>`<div aria-hidden="true" class="moving-hazard" style="left:${enemy.x/GRID.columns*100}%;top:${enemy.y/GRID.rows*100}%;width:${100/GRID.columns}%;height:${100/GRID.rows}%">${art(enemyPortrait(m.planetIndex+i+2),'Moving space bad guy','moving-hazard-image')}</div>`).join('');
 return `<main class="main playing"><div class="mission-head"><h1>${esc(m.planet.name)} · Level ${m.stage+1}: ${esc(m.title)}</h1><span class="mode-label">${(m.pickups||[]).length?`Stars: ${run.collected?.length||0}/${m.pickups.length} · `:''}${run.selected?`Selected: ${esc(run.pieces.find(p=>p.id===run.selected)?.name)}`:'Click the MIDDLE to select'}</span><button class="back" data-action="planet">Back to ${esc(m.planet.name)} Map</button></div>
 <section class="mission-frame" aria-label="Arrow-key computer skills game"><div class="directions-bar"><p>${esc(m.directions)}</p><button class="speak" data-action="listen" aria-label="Read directions aloud" title="Read directions aloud">🔊</button></div>
 <div class="board-frame"><div class="space-board" id="space-board" style="--world-hue:${m.planet.hue}" tabindex="0" role="group" aria-label="Space puzzle. Click inside to select, arrows move, and dragging handles with the trackpad changes size."><img class="mission-scenery" src="${planetImage(m.planetIndex)}" alt="" aria-hidden="true" draggable="false"><div class="grid-lines"></div>${boardTargets}${obstacles}${patrols}${pickups}${run.pieces.map(pieceHtml).join('')}<div class="space-helper" aria-hidden="true">${art(playerPortrait(state.progress.playerId),'','space-helper-art')}</div><div class="rescue-preview" aria-label="Friend to rescue: ${esc(m.planet.friend)}">${art(friendPortrait(m.planetIndex),m.planet.friend,'rescue-preview-art')}<small>RESCUE</small></div></div></div></section>
 <div class="feedback${state.error?' error':''}" role="status" id="live-status">${esc(state.message||'Click an object inside its border, then use your arrow keys.')}</div></main>`;
}
function shop(){return `<main class="main"><div class="page-head"><div><h1>Space Star Shop</h1><p>Stars: ${progressText()} · Earn 1 star per new regular level and 10 stars for a final maze. Replays are practice only!</p></div><button data-action="home">Home</button></div><div class="shop-grid">${SPACE_SHOP.map(item=>{const bought=state.progress.purchases.includes(item.id);return `<div class="shop-item card">${art(SHOP_SPRITES[item.id]||'./assets/sprites/comet-star.png',item.name,'shop-art')}<strong>${esc(item.name)}</strong><p>Decorate your own space station.</p><button data-buy="${esc(item.id)}" ${bought||state.progress.stars<item.price?'disabled':''}>${bought?'Owned':`Buy for ${item.price}`}</button></div>`}).join('')}</div></main>`}
function stuff(){
 const requested=Number.isInteger(state.progress.scenePlanet)?state.progress.scenePlanet:0;
 const unlockedWorlds=PLANETS.map((_,i)=>i).filter(i=>sceneUnlocked(state.progress,i));
 const sceneWorld=unlockedWorlds.includes(requested)?requested:(unlockedWorlds[0]??-1);
 if(sceneWorld<0)return `<main class="main"><section class="entry"><h1>MY STUFF IS LOCKED</h1><p>Finish all eight levels of Candy Moon, including its rescue maze, to unlock your first world background.</p><p>Purchased decorations and stars are safe and will be available after the map is completed.</p><button data-action="home">Back to Planets</button></section></main>`;
 const collected=earnedItems(state.progress);
 const owned=state.progress.purchases.map(id=>SPACE_SHOP.find(x=>x.id===id)).filter(Boolean);
 const rescued=state.progress.rescued.map(id=>PLANETS.findIndex(p=>p.id===id)).filter(i=>i>=0);
 const inventory=[
  ...owned.map(x=>({id:'shop:'+x.id,name:x.name,image:SHOP_SPRITES[x.id]})),
  ...rescued.map(i=>({id:'friend:'+PLANETS[i].id,name:PLANETS[i].friend,image:friendPortrait(i)})),
  ...collected.map(x=>({id:'earned:'+x.id,name:x.name,image:x.image}))
 ];
 const arranged=(Array.isArray(state.progress.worldScene)?state.progress.worldScene:[])
  .filter(e=>e.planet===sceneWorld&&inventory.some(i=>i.id===e.id));
 return `<main class="main"><div class="page-head"><div><h1>My Space Station</h1><p>Everything you earned, rescued, or bought is here. Your stars and progress are safe.</p></div><button data-action="shop">Star Shop</button></div><div class="space-world-tabs">${PLANETS.map((w,i)=>`<button type="button" data-scene-world="${i}" ${sceneUnlocked(state.progress,i)?'':'disabled title="Beat all eight levels of this world first"'} aria-pressed="${sceneWorld===i}">${esc(w.name)} ${sceneUnlocked(state.progress,i)?'':'· LOCKED'}</button>`).join("")}</div><section class="scene space-scene"><div class="space-arrange-surface" data-scene-board="true" aria-label="Your decorated space world"><img class="space-arrange-background" src="${planetImage(sceneWorld)}" alt="${esc(PLANETS[sceneWorld].name)}" draggable="false">${arranged.map(e=>{const item=inventory.find(i=>i.id===e.id);return `<div class="space-placed" data-move-scene="${esc(e.id)}" style="left:${Math.max(7,Math.min(93,e.x))}%;top:${Math.max(10,Math.min(90,e.y))}%">${art(item.image,item.name,'space-placed-image')}<button type="button" data-put-away="${esc(e.id)}" title="Put away ${esc(item.name)}">×</button></div>`}).join('')}</div><p class="arrange-instructions" role="status">${state.scenePending?'Click an empty place in the picture to put down your selected item.':'Click an owned item below to place it, then hold and drag objects anywhere in the picture to rearrange them.'}</p><div class="scene-objects">${owned.map(item=>`<button type="button" class="scene-object" data-place-item="shop:${esc(item.id)}">${art(SHOP_SPRITES[item.id],item.name,'scene-object-image')}<small>${esc(item.name)}</small></button>`).join('')}${rescued.map(i=>`<button type="button" class="scene-object rescued-friend" data-place-item="friend:${esc(PLANETS[i].id)}">${art(friendPortrait(i),PLANETS[i].friend,'scene-object-image')}<small>${esc(PLANETS[i].friend)}</small></button>`).join('')}${collected.map(item=>`<button type="button" class="scene-object collected-object" data-place-item="earned:${esc(item.id)}">${art(item.image,item.name,'scene-object-image')}<small>${esc(item.name)}</small></button>`).join('')||'<p>Complete missions to rescue friends, collect treasures, and shop for decorations.</p>'}</div></section></main>`
}
function errorPage(){return `<main class="main"><section class="entry" role="alert"><h1>Saved student record needs help</h1><p>${esc(state.dataError)}</p><p>This record has NOT been overwritten. Ask your teacher before trying again.</p><button data-action="students">↩️ Choose Another Number</button></section></main>`}
function help(){return `<main class="main"><section class="entry how-to"><h1>🚀 How to Control Your Arrow-Naut</h1><ol>
 <li><strong>Click INSIDE</strong> a space object. Clicking its border is not the same as clicking inside.</li>
 <li><strong>Press keyboard arrows</strong> ↑ ↓ ← → to move the selected object one square at a time.</li>
 <li><strong>To resize:</strong> click INSIDE the object. Then CLICK AND HOLD a little square on its edge or corner. DRAG the handle using the trackpad, and release to save its new size.</li>
 <li><strong>Fit blocks carefully:</strong> move each object into its dotted outline. Avoid walls and other objects.</li>
 <li><strong>Final maze:</strong> use arrow keys to move, SPACE to fire a laser, and recharge your laser by moving. You can clear bad guys, but you must reach EXIT to unlock the next world.</li>
 <li><strong>Earn stars:</strong> 1 on the first clear of a regular mission, and 10 for beating each final maze. Replays are practice only.</li>
 </ol><p><strong>Drag only resize handles. Use keyboard arrows to move objects. No touch or cropping.</strong> Use the Chromebook trackpad and keyboard.</p><button data-action="home">Back to Planets</button></section></main>`}
function modalHtml(){const modal=state.modal;if(!modal)return '';
 let content='';
 if(modal.kind==='intro'){
  const p=PLANETS[modal.planet];
  content=`<h2>Meet ${esc(p.friend)}!</h2>${art(friendPortrait(modal.planet),p.friend,'friend-portrait')}<p>Complete eight ${esc(p.name)} missions to rescue your new space friend.</p><button data-action="intro-ok">OK</button>`;
 }else if(modal.kind==='reward'){
  const planetIndex=PLANETS.findIndex(p=>p.friend===modal.friend);
  content=`<h2>${modal.friend?'YOU DID IT!':'Mission Complete!'}</h2>${modal.friend?`${art(friendPortrait(planetIndex),modal.friend,'friend-portrait')}<p>You've rescued <strong>${esc(modal.friend)}</strong>!</p>`:''}<div class="big-reward">${modal.stars?"+"+modal.stars+" stars":"Practice replay · No new stars"}</div><button data-action="reward-ok">OK</button>`;
 }else if(modal.kind==='player'){
  content=`<h2>Choose Your Arrow-Naut</h2><p>Click your space explorer!</p><div class="player-pick-grid">${PLAYERS.map(player=>`<button type="button" data-player="${esc(player.id)}" ${state.progress?.playerId===player.id?'aria-pressed="true"':''}>${art(player.image,player.name,'player-choice-art')}<strong>${esc(player.name)}</strong></button>`).join('')}</div><button data-action="player-close">OK</button>`;
 }
 return `<div class="dialog-scrim"><section class="dialog-panel ${modal.kind==='player'?'player-selection-dialog':''}" role="dialog" aria-modal="true" aria-label="${modal.kind==='intro'?'Meet your rescue friend':modal.kind==='player'?'Choose your Arrow-Naut':'Mission complete'}">${content}${state.error?`<p class="error-banner" role="alert">${esc(state.error)}</p>`:''}</section></div>`;
}
function render(){
 if(disposeMapTwo){disposeMapTwo();disposeMapTwo=null}
 root.innerHTML=header()+(state.view==='map-two'?'<div id="map-two-root" class="map-two-mount"></div>':
 (state.view==='teachers'||state.view==='students'?entry():state.view==='home'?home():state.view==='planet'?planetMap():state.view==='mission'?missionPage():state.view==='shop'?shop():state.view==='stuff'?stuff():state.view==='error'?errorPage():help()))+modalHtml();
 if(state.view==='map-two'&&mapTwoUnlocked()){
  disposeMapTwo=mountMapTwo($('#map-two-root'),{
   read:()=>state.progress,
   save:next=>persist(next),
   exit:()=>{state.view='home';state.modal=null;render()}
  });
 }
 scheduleFit();syncFinaleClock()
}
function scheduleFit(){requestAnimationFrame(()=>{const header=$('#main-header');const board=$('#space-board');if(!header)return;const height=Math.round(header.getBoundingClientRect().height);root.style.setProperty('--bar-height',height+'px');if(!board)return;const frame=$('.board-frame');if(!frame)return;const rect=frame.getBoundingClientRect();const w=Math.max(100,Math.min(rect.width-6,(rect.height-6)*1672/941));root.style.setProperty('--board-width',Math.floor(w)+'px')})}
function showPlanet(i){if(!planetUnlocked(state.progress,i))return;state.planet=i;state.view='planet';state.mission=null;state.run=null;state.message='';state.error='';render();
 const p=PLANETS[i];if(!state.progress.seenIntros.includes(p.id)){state.modal={kind:'intro',planet:i};render()}}
function startMission(stage){if(!Number.isInteger(stage)||stage<0||stage>7||!stageUnlocked(state.progress,state.planet,stage))return;
 const m=createMission(state.planet,stage),old=state.progress.active;
 // Preserve a student's already-correct pink picture and collected star when
 // removing the accidental Solar Tile requirement from this specific level.
 if(m.planetIndex===2&&m.stage===1&&old?.id===m.id&&!old.complete&&
    Array.isArray(old.pieces)&&Array.isArray(old.collected)){
  const target=m.pieces.find(p=>p.id===m.clickTarget);
  const placed=old.pieces.find(p=>p.id===target.id);
  const atGoal=placed&&placed.x===target.goal.x&&placed.y===target.goal.y&&
    placed.w===target.w&&placed.h===target.h;
  const hasStars=(m.pickups||[]).every(p=>old.collected.includes(p.id));
  if(atGoal&&hasStars){
   const result=finishMission(state.progress,m);
   if(!persist(result.progress))return;
   state.mission=m;state.run={...initialMission(m),complete:true,
    pieces:m.pieces.map(p=>p.id===target.id?{...p,x:placed.x,y:placed.y}:p),
    collected:[...old.collected],selected:target.id};
   state.view='mission';state.modal={kind:'reward',friend:result.friend,stars:result.stars};
   state.message='Pink picture delivered! Mission complete!';state.error='';render();return;
  }
 }
 const resume=old?.id===m.id&&!old.complete&&old.layoutVersion===m.layoutVersion;
 // Migrate ALL old boss saves to safe-branch patrols without changing stars or level IDs.
 const migrate=resume&&m.kind==='final-maze'&&(!old.maze||old.maze.version!==2||
  !Array.isArray(old.maze.enemies));
 const run=resume&&!migrate?clone(old):initialMission(m);
 if(migrate){
  run.attempts=Number.isFinite(old.attempts)?old.attempts:0;
  run.maze.hits=Number.isFinite(old.maze?.hits)?old.maze.hits:0;
  const x=old.maze?.x,y=old.maze?.y;
  if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<GRID.columns&&y>=0&&y<GRID.rows&&
     !m.walls.some(([wx,wy])=>wx===x&&wy===y)){
   run.maze.x=x;run.maze.y=y;
  }
 }
 if(!resume||migrate){if(!persist({...state.progress,active:clone(run)}))return;}
 state.mission=m;state.run=run;state.view='mission';state.message=m.kind==='final-maze'?'Use arrow keys to dodge the moving bad guys and reach EXIT!':'Click INSIDE to select. Arrows MOVE; hold and DRAG a resize handle to STRETCH.';state.error='';render();}
function saveMissionAction(nextRun,message){const next={...state.progress,active:clone(nextRun)};if(!persist(next))return;
 state.run=nextRun;state.message=message;state.error='';if(nextRun.complete){award();return}render();}
function award(){
 // The 64th ORIGINAL mission is the final Map One rescue. Only the first
 // transition from 63/64 to 64/64 automatically launches Map Two.
 const justUnlockedMapTwo=!mapTwoUnlocked();
 const result=finishMission(state.progress,state.mission);
 if(!persist(result.progress))return;
 state.message='';state.error='';
 state.modal={kind:'reward',friend:result.friend,stars:result.stars,
  launchMapTwo:justUnlockedMapTwo&&mapTwoUnlocked()};
 render();
}
function chooseObject(id,mode){if(state.view!=='mission'||state.modal)return;
 const result=selectObject(state.mission,state.run,id,mode);if(!result.ok){notify(result.reason,true);return}
 saveMissionAction(result.state,result.reason);
}
function onLaser(){
 if(state.view!=='mission'||state.mission?.kind!=='final-maze'||state.modal)return;
 const outcome=fireLaser(state.mission,state.run);
 if(!outcome.ok){notify(outcome.reason,true);return}
 saveMissionAction(outcome.state,outcome.reason);
}
function onArrow(key){if(state.view!=='mission'||state.modal)return;const result=arrowAction(state.mission,state.run,key);
 if(!result.ok){notify(result.reason,true);return}
 saveMissionAction(result.state,result.reason);
}

let finaleClock=null;
function syncFinaleClock(){
 const shouldTick=state.view==='mission'&&state.mission?.kind==='final-maze'&&!state.modal&&!state.run?.complete;
 if(!shouldTick){if(finaleClock){clearInterval(finaleClock);finaleClock=null}return}
 if(finaleClock)return;
 const delay=Math.max(600,1480-state.mission.planetIndex*95);
 finaleClock=setInterval(()=>{
  if(state.view!=='mission'||state.mission?.kind!=='final-maze'||state.modal||state.error.startsWith('NOT SAVED'))return;
  const tick=mazeEnemyTick(state.mission,state.run);
  if(!tick.ok)return;
  const next={...state.progress,active:clone(tick.state)};
  if(!persist(next))return;
  state.run=tick.state;state.message=tick.reason;render();
 },delay);
}
function applyPurchase(id){const item=SPACE_SHOP.find(x=>x.id===id);if(!item)return;const result=purchase(state.progress,item);if(!result.ok){notify(result.reason,true);return}if(persist(result.progress)){state.message='You bought '+item.name+'!';state.error='';render();}}
function openStudent(number){state.student=number;state.key=saveKey(state.teacher,number);state.dataError='';let loaded;
 try{loaded=validatedSave(localStorage.getItem(state.key))}catch(e){state.dataError=e.message;state.error=e.message;state.view='error';render();return}
 state.progress=loaded;state.view='home';state.message='';state.error='';render();}
function logOut(){state.teacher=null;state.student=null;state.progress=null;state.key=null;state.view='teachers';state.modal=null;state.mission=null;state.run=null;state.dataError='';render()}
function onAction(action){
 switch(action){case 'teacher':openTeacherTools({teachers:state.teachers,teacherId:state.teacher,prefix:'mskaple-arrownaut-v1:',onReset:(id,nums)=>{if(id===state.teacher&&nums.includes(state.student))window.location.reload()}});break;
 case 'teachers':state.view='teachers';render();break;
 case 'students':state.view='students';state.dataError='';state.error='';state.progress=null;render();break;
 case 'logout':logOut();break;
 case 'home':if(state.progress){state.view='home';state.modal=null;state.mission=null;state.run=null;render()}break;
  case 'map-two':if(mapTwoUnlocked()){state.view='map-two';state.modal=null;state.mission=null;state.run=null;render()}break;
 case 'planet':showPlanet(state.planet);break;
 case 'shop':if(state.progress){state.view='shop';state.modal=null;render()}break;
 case 'player':if(state.progress){state.modal={kind:'player'};render()}break;
 case 'player-close':state.modal=null;render();break;
 case 'stuff':if(state.progress){state.view='stuff';state.modal=null;render()}break;
 case 'help':state.view='help';state.modal=null;render();break;
 case 'fullscreen':{const target=document.documentElement;if(document.fullscreenElement){document.exitFullscreen?.().catch?.(()=>notify('Full screen could not close.',true));}else{target.requestFullscreen?.().catch?.(()=>notify('Full screen is unavailable in this browser.',true));}break;}
 case 'listen':if(state.mission)speak(state.mission.directions);break;
  case 'laser':onLaser();break;
 case 'intro-ok':{const next={...state.progress,seenIntros:[...state.progress.seenIntros,PLANETS[state.modal.planet].id]};if(persist(next)){state.modal=null;state.error='';render()};break}
 case 'reward-ok':{
  const goToMapTwo=!!state.modal?.launchMapTwo&&mapTwoUnlocked();
  state.modal=null;
  if(goToMapTwo){state.view='map-two';state.mission=null;state.run=null;render()}
  else showPlanet(state.planet);
  break;
 }
 case 'reload-teachers':loadTeachers();break;
 }
}
function mouseEligible(event){return !event.pointerType||event.pointerType==='mouse'||event.detail===0}
root.addEventListener('click',event=>{
 if(!mouseEligible(event)){notify('Use the trackpad and keyboard—not the touchscreen.',true);return}
 const scene=event.target.closest('[data-scene-board]');
 if(scene&&state.scenePending&&!event.target.closest('[data-put-away]')){
  const planet=Number.isInteger(state.progress.scenePlanet)?state.progress.scenePlanet:0;
  const rect=scene.getBoundingClientRect();
  const x=Math.max(7,Math.min(93,Math.round(100*(event.clientX-rect.left)/rect.width)));
  const y=Math.max(10,Math.min(90,Math.round(100*(event.clientY-rect.top)/rect.height)));
  const previous=Array.isArray(state.progress.worldScene)?state.progress.worldScene:[];
  const next={...state.progress,worldScene:[...previous.filter(v=>!(v.id===state.scenePending&&v.planet===planet)),{id:state.scenePending,planet,x,y}]};
  if(persist(next)){state.scenePending=null;state.error='';render()}
  return;
 }
 const el=event.target.closest('button,[data-boundary]');if(!el)return;
 if(el.dataset.action){onAction(el.dataset.action);return}
 if(el.dataset.teacher){state.teacher=el.dataset.teacher;state.view='students';state.error='';render();return}
 if(el.dataset.student){openStudent(Number(el.dataset.student));return}
 if(el.dataset.planet){showPlanet(Number(el.dataset.planet));return}
 if(el.dataset.level!==undefined){startMission(Number(el.dataset.level));return}
 if(el.dataset.sceneWorld!==undefined){const i=Number(el.dataset.sceneWorld);if(sceneUnlocked(state.progress,i)&&persist({...state.progress,scenePlanet:i})){state.error='';render()}return}
 if(el.dataset.placeItem){state.scenePending=el.dataset.placeItem;state.error='';render();return}
 if(el.dataset.putAway){
  const planet=Number.isInteger(state.progress.scenePlanet)?state.progress.scenePlanet:0;
  const current=Array.isArray(state.progress.worldScene)?state.progress.worldScene:[];
  if(persist({...state.progress,worldScene:current.filter(x=>!(x.id===el.dataset.putAway&&x.planet===planet))})){state.error='';render()}return;
 }
 if(el.dataset.buy){applyPurchase(el.dataset.buy);return}
 if(el.dataset.player){if(state.progress&&PLAYERS.some(p=>p.id===el.dataset.player)){if(persist({...state.progress,playerId:el.dataset.player})){state.error='';state.modal=null;render()}}return}
 if(el.dataset.resize){return}
 if(el.dataset.select){chooseObject(el.dataset.select,'move');return}
 if(el.dataset.boundary){notify('Click INSIDE the box, or click its corner handle to resize.',true);return}
});

 // Real-world Chromebook resize skill: hold and drag a handle, release to save.
 let resizeDrag=null;
 function resizeDelta(event,d){
  return {dx:Math.round((event.clientX-d.x)/d.board.width*GRID.columns),
          dy:Math.round((event.clientY-d.y)/d.board.height*GRID.rows)};
 }
 function previewResize(event){
  const d=resizeDrag;if(!d||d.pointerId!==event.pointerId)return;
  const {dx,dy}=resizeDelta(event,d);
  if(dx===d.dx&&dy===d.dy)return;
  d.dx=dx;d.dy=dy;
  const result=resizeByHandle(state.mission,d.base,d.id,d.handle,dx,dy);
  if(!result.ok){d.next=null;$('#live-status').textContent=result.reason;return}
  d.next=result;
  const p=result.state.pieces.find(p=>p.id===d.id),el=$('[data-boundary="'+d.id+'"]');
  if(!p||!el)return;
  el.style.left=(p.x/GRID.columns*100)+'%';el.style.top=(p.y/GRID.rows*100)+'%';
  el.style.width=(p.w/GRID.columns*100)+'%';el.style.height=(p.h/GRID.rows*100)+'%';
  $('#live-status').textContent='Keep holding and stretching. Release to save!';
 }
 root.addEventListener('pointerdown',event=>{
  const handle=event.target.closest('[data-resize][data-handle]');
  if(!handle||state.view!=='mission'||state.modal)return;
  if(event.pointerType!=='mouse'||event.button!==0){notify('Use the trackpad to drag a resize handle.',true);return}
  if(state.run.selected!==handle.dataset.resize){notify('Click INSIDE the object first, then grab a handle.',true);return}
  const board=$('#space-board');if(!board)return;
  event.preventDefault();event.stopPropagation();
  resizeDrag={pointerId:event.pointerId,id:handle.dataset.resize,handle:handle.dataset.handle,
   x:event.clientX,y:event.clientY,dx:0,dy:0,board:board.getBoundingClientRect(),base:clone(state.run),next:null};
  handle.setPointerCapture(event.pointerId);
  board.classList.add('resizing-with-trackpad');
  $('#live-status').textContent='Hold and drag the handle, then let go.';
 });
 root.addEventListener('pointermove',event=>{
  if(!resizeDrag||resizeDrag.pointerId!==event.pointerId)return;
  event.preventDefault();previewResize(event);
 });
 root.addEventListener('pointerup',event=>{
  if(!resizeDrag||resizeDrag.pointerId!==event.pointerId)return;
  event.preventDefault();previewResize(event);
  const d=resizeDrag;resizeDrag=null;
  $('#space-board')?.classList.remove('resizing-with-trackpad');
  if(d.next){saveMissionAction(d.next.state,d.next.reason);return}
  state.message='Hold a square handle and drag at least one puzzle square.';render();
 });
 function cancelResize(event){
  if(!resizeDrag||(event&&event.pointerId!==undefined&&resizeDrag.pointerId!==event.pointerId))return;
  resizeDrag=null;if(state.view==='mission')render();
 }
 root.addEventListener('pointercancel',cancelResize);
 window.addEventListener('blur',()=>cancelResize());

// MY STUFF: drag placed objects directly with a Chromebook trackpad.
// Store percentages so placements remain correct when the picture resizes.
let sceneDrag=null;
root.addEventListener('pointerdown',event=>{
 const piece=event.target.closest('[data-move-scene]');
 if(!piece||event.target.closest('[data-put-away],[data-remove]')||event.pointerType!=='mouse'||event.button!==0||!state.progress)return;
 const board=piece.closest('[data-scene-board]');if(!board)return;
 const world=Number.isInteger(state.progress.scenePlanet)?state.progress.scenePlanet:0;
 const original=(Array.isArray(state.progress.worldScene)?state.progress.worldScene:[]).find(x=>x.planet===world&&x.id===piece.dataset.moveScene);
 if(!original)return;
 event.preventDefault();
 const bounds=board.getBoundingClientRect();
 sceneDrag={pointerId:event.pointerId,piece,board,bounds,world,original,
  startX:event.clientX,startY:event.clientY,
  originX:original.x,originY:original.y,moved:false};
 piece.setPointerCapture?.(event.pointerId);
 piece.style.cursor='grabbing';
});
root.addEventListener('pointermove',event=>{
 const d=sceneDrag;if(!d||event.pointerId!==d.pointerId)return;
 event.preventDefault();
 const deltaX=(event.clientX-d.startX)/d.bounds.width*100;
 const deltaY=(event.clientY-d.startY)/d.bounds.height*100;
 const x=Math.max(7,Math.min(93,d.originX+deltaX));
 const y=Math.max(10,Math.min(90,d.originY+deltaY));
 d.x=x;d.y=y;
 if(Math.abs(deltaX)+Math.abs(deltaY)>.5)d.moved=true;
 d.piece.style.left=x+'%';d.piece.style.top=y+'%';
});
root.addEventListener('pointerup',event=>{
 const d=sceneDrag;if(!d||event.pointerId!==d.pointerId)return;
 event.preventDefault();sceneDrag=null;
 d.piece.style.cursor='';
 if(!d.moved)return;
 const all=Array.isArray(state.progress.worldScene)?state.progress.worldScene:[];
 const x=Math.round((d.x??d.originX)*10)/10,y=Math.round((d.y??d.originY)*10)/10;
 const next={...state.progress,worldScene:all.map(item=>item.planet===d.world&&item.id===d.original.id?{...item,x,y}:item)};
 if(!persist(next)){
  d.piece.style.left=d.originX+'%';d.piece.style.top=d.originY+'%';
 }else{render()}
});
root.addEventListener('pointercancel',event=>{
 if(sceneDrag&&sceneDrag.pointerId===event.pointerId){
  sceneDrag.piece.style.left=sceneDrag.originX+'%';sceneDrag.piece.style.top=sceneDrag.originY+'%';sceneDrag=null;
 }
});

root.addEventListener('dragstart',event=>event.preventDefault());
window.addEventListener('keydown',event=>{
 if((event.code==='Space'||event.key===' ')&&state.view==='mission'&&state.mission?.kind==='final-maze'&&!state.modal){
  if(!event.target.closest('input,textarea,select,button')){event.preventDefault();onLaser()}
  return;
 }
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)||state.view!=='mission'||state.modal)return;
 if(event.target.closest('input,select,textarea'))return;
 event.preventDefault();onArrow(event.key);
});
window.addEventListener('resize',scheduleFit);
async function loadTeachers(){state.view='teachers';state.error='';render();
 try{const r=await fetch('../drag-drop-adventure/teachers-grade2.json',{cache:'no-cache'});if(!r.ok)throw Error('Teacher roster not found');const data=await r.json();
  if(!Array.isArray(data)||!data.length||!data.every(t=>t.id&&t.name))throw Error('Teacher roster invalid');state.teachers=data;state.error='';
 }catch(e){state.error='Teacher list could not load. Check the connection and choose Try Again.';state.teachers=[]}
 render();}
loadTeachers();
