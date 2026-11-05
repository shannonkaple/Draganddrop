/** Arrow-Naut Map Two: The Lost Worlds.
 * Separate 16-mission curriculum; original 64 missions and storage keys untouched.
 * Trackpad dragging is Map Two only. No touchscreen gameplay, no CSS/SVG sprites.
 * All placement and rewards use the parent app's verified student-save callback.
 */
export const LOST_WORLDS = Object.freeze([
  {id:'lost-aurora',name:'Aurora Garden',friend:'Lumi the Star Deer',
    scene:'./assets/map-two/aurora-garden.jpg',friendImage:'./assets/map-two/lumi-star-deer.png',color:'#73d9c6',
    story:'Find the lost garden signals and rescue Lumi!'},
  {id:'lost-clockwork',name:'Clockwork Comet',friend:'Tiko the Gear Gecko',
    scene:'./assets/map-two/clockwork-comet.jpg',friendImage:'./assets/map-two/tiko-gear-gecko.png',color:'#efa45d',
    story:'Repair the comet workshop and rescue Tiko!'}
]);
// Map Two uses its OWN eight-theme galaxy map, never the original eight planets.
// Worlds 3–8 remain visibly unplayable until their new original missions and art exist.
export const MAP_TWO_THEMES = Object.freeze([
 {name:'Aurora Garden',scene:'./assets/map-two/aurora-garden.jpg',active:true},
 {name:'Clockwork Comet',scene:'./assets/map-two/clockwork-comet.jpg',active:true},
 {name:'Prism Reef',scene:'./assets/map-two/prism-reef.jpg',active:false},
 {name:'Cloud Carnival',scene:'./assets/map-two/cloud-carnival.jpg',active:false},
 {name:'Crystal Caverns',scene:'./assets/map-two/crystal-caverns.jpg',active:false},
 {name:'Nebula Library',scene:'./assets/map-two/nebula-library.jpg',active:false},
 {name:'Ember Workshop',scene:'./assets/map-two/ember-workshop.jpg',active:false},
 {name:'Moonlight Jungle',scene:'./assets/map-two/moonlight-jungle.jpg',active:false}
]);
export const MAP_TWO_STOPS = Object.freeze([
 {x:12,y:36},{x:34,y:19},{x:58,y:17},{x:81,y:35},
 {x:85,y:72},{x:62,y:79},{x:37,y:77},{x:13,y:70}
]);
export const LOST_STAGE_TYPES = Object.freeze([
  ['select','move','drag','resize','sort','move-resize','mixed','rescue'],
  ['drag','select','resize','move','sort','mixed','move-resize','rescue']
]);
export const LOST_STAGE_TITLES = Object.freeze([
  ['Find the Garden Signal','Navigate the Star Trail','Deliver the Light Crystal','Grow the Solar Panel','Sort the Galaxy Seeds','Repair the Aurora Bridge','Restore the Star Garden','Rescue Lumi!'],
  ['Dock the Comet Cargo','Find the Missing Gear','Resize the Rocket Shield','Navigate the Gear Trail','Sort the Comet Parts','Build the Clockwork Circuit','Fix the Comet Engine','Rescue Tiko!']
]);
export const LOST_GRID = Object.freeze({columns:12,rows:7});
const sprite = name=>'./assets/standalone/'+name+'.png';
const gadget = name=>'../arrow-naut-jr/assets/puzzle/'+name+'.png';
const ITEM_ART=Object.freeze({beacon:sprite('pickup_star'),rover:sprite('space_rover'),
 crystal:sprite('pickup_crystals'),panel:gadget('communications_satellite'),
 blue:sprite('crate_blue'),pink:sprite('crate_pink'),mint:sprite('crate_mint'),
 purple:sprite('crate_purple'),rocket:gadget('rocket'),satellite:gadget('space_station_satellite'),
 key:sprite('pickup_star'),gear:gadget('robot_probe')});
const copy=v=>JSON.parse(JSON.stringify(v));
const piece=(id,label,art,x,y,w,h,goal,tool='move')=>({id,label,art:ITEM_ART[art],x,y,w,h,goal,tool});
export const emptyMapTwo=()=>({version:1,completed:[],rescued:[],seenIntros:[],active:null});
export function mapTwoData(progress){
 const value=progress?.mapTwo;
 if(!value||value.version!==1)return emptyMapTwo();
 return {version:1,completed:Array.isArray(value.completed)?value.completed:[],
  rescued:Array.isArray(value.rescued)?value.rescued:[],
  seenIntros:Array.isArray(value.seenIntros)?value.seenIntros:[],active:value.active||null};
}
export const mapTwoId=(world,stage)=>LOST_WORLDS[world]?.id+'-'+(stage+1);
export const mapTwoCount=(progress,world)=>Array.from({length:8},(_,i)=>mapTwoId(world,i))
 .filter(id=>mapTwoData(progress).completed.includes(id)).length;
export const mapTwoWorldUnlocked=(progress,world)=>world===0||(world===1&&mapTwoCount(progress,0)===8);
export const mapTwoStageUnlocked=(progress,world,stage)=>mapTwoWorldUnlocked(progress,world)&&
 (stage===0||mapTwoData(progress).completed.includes(mapTwoId(world,stage-1)));
export function createMapTwoMission(world,stage){
 if(!Number.isInteger(world)||world<0||world>1||!Number.isInteger(stage)||stage<0||stage>7)
  throw Error('Unknown Map Two mission');
 const type=LOST_STAGE_TYPES[world][stage],label=LOST_STAGE_TITLES[world][stage];
 const base={id:mapTwoId(world,stage),world,stage,title:label,type,layoutVersion:1,
  worldInfo:LOST_WORLDS[world],pieces:[],targetId:null};
 const alternate=world===1;
 if(type==='select'){
  const target=alternate?'gear':'beacon';
  return {...base,targetId:target,pieces:[
   piece('beacon','Starlight Signal','beacon',2,2,2,2,null,'select'),
   piece('gear','Clockwork Gear','gear',5,2,2,2,null,'select'),
   piece('decoy','Space Cargo','pink',8,2,2,2,null,'select')],
  instructions:`Click the MIDDLE of the ${alternate?'clockwork gear':'starlight signal'}. Watch for the correct picture!`};
 }
 if(type==='move')return {...base,pieces:[piece('rover',alternate?'Gear Rover':'Star Rover','rover',1,2,1,1,{x:9,y:4,w:1,h:1},'move')],
  instructions:'Click the rover in the middle. Use the KEYBOARD ARROWS to reach its dotted landing dock.'};
 if(type==='drag')return {...base,pieces:[piece('crystal',alternate?'Comet Cargo':'Light Crystal',alternate?'blue':'crystal',1,2,2,2,{x:8,y:3,w:2,h:2},'drag')],
  instructions:'CLICK, HOLD, and DRAG the cargo with your TRACKPAD into the matching landing dock. Let go to drop.'};
 if(type==='resize')return {...base,pieces:[piece('panel',alternate?'Rocket Shield':'Solar Panel',alternate?'rocket':'panel',4,2,1,1,{x:4,y:2,w:3,h:2},'resize')],
  instructions:'Click INSIDE to select the picture. Hold and DRAG the corner or edge resize handle until it fits the dotted outline.'};
 if(type==='sort')return {...base,pieces:[
  piece('blue','Blue Space Cargo','blue',1,1,2,1,{x:8,y:1,w:2,h:1},'drag'),
  piece('pink','Pink Space Cargo','pink',1,5,2,1,{x:8,y:5,w:2,h:1},'drag')],
  instructions:'Sort TWO different cargo pictures. Drag each one with the TRACKPAD to its own matching outline.'};
 if(type==='move-resize')return {...base,pieces:[piece('satellite',alternate?'Comet Engine':'Aurora Bridge','satellite',1,1,1,1,{x:7,y:3,w:2,h:2},'resize')],
  instructions:'Click to select. Use ARROWS to move to the matching dock. Then hold and DRAG the handles to resize.'};
 if(type==='mixed')return {...base,pieces:[
  piece('rover','Signal Rover','rover',1,1,1,1,{x:8,y:2,w:1,h:1},'move'),
  piece('mint','Repair Cargo','mint',1,5,2,1,{x:8,y:5,w:2,h:1},'drag')],
  instructions:'Two jobs! Click the rover and MOVE with ARROWS. Then TRACKPAD-DRAG the green repair cargo to its dock.'};
 return {...base,pieces:[
  piece('beacon',alternate?'Rescue Transmitter':'Rescue Beacon','beacon',1,1,1,1,{x:8,y:2,w:2,h:2},'resize'),
  piece('key',alternate?'Comet Key':'Garden Key','key',1,5,1,1,{x:7,y:5,w:1,h:1},'drag')],
  instructions:`Final mission! MOVE the beacon with ARROWS, DRAG its resize handles to fit the docking zone, then DRAG the rescue key to unlock ${LOST_WORLDS[world].friend}.`};
}
export const initialMapTwoRun=mission=>({id:mission.id,layoutVersion:mission.layoutVersion,
 selected:null,pieces:copy(mission.pieces),complete:false,attempts:0});
const rect=p=>({x:p.x,y:p.y,w:p.w,h:p.h});
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const valid=(pieces,id)=>{
 const a=pieces.find(p=>p.id===id);
 if(!a||a.x<0||a.y<0||a.w<1||a.h<1||a.x+a.w>12||a.y+a.h>7)return false;
 return pieces.every(b=>b.id===a.id||!overlap(a,b));
};
export const atGoal=p=>!!p.goal&&p.x===p.goal.x&&p.y===p.goal.y&&p.w===p.goal.w&&p.h===p.goal.h;
export function mapTwoSolved(mission,run){return mission.type==='select'?
  run.selected===mission.targetId:run.pieces.filter(p=>p.goal).every(atGoal)}
export function chooseMapTwo(mission,run,id){
 const p=run.pieces.find(x=>x.id===id);
 if(!p)return {ok:false,reason:'Click inside a picture.'};
 if(mission.type==='select'&&id!==mission.targetId)return {ok:false,reason:'Try another picture. Find the one in the directions.'};
 const next={...copy(run),selected:id,attempts:run.attempts+1};
 next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Great selection!':'Selected! Follow the skill directions.'};
}
export function moveMapTwo(mission,run,key){
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
 if(!delta)return {ok:false,reason:'Use the keyboard arrow keys.'};
 const p=run.pieces.find(x=>x.id===run.selected);
 if(!p||!['move','resize'].includes(p.tool))return {ok:false,reason:'Click the movable picture first, then use the arrows.'};
 const next=copy(run),n=next.pieces.find(x=>x.id===p.id);
 n.x+=delta[0];n.y+=delta[1];
 if(!valid(next.pieces,n.id))return {ok:false,reason:'That spot is blocked or outside the board.'};
 next.attempts++;next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Mission complete!':'Nice arrow movement!'};
}
export function dropMapTwo(mission,run,id,x,y){
 const p=run.pieces.find(x=>x.id===id);
 if(!p||p.tool!=='drag')return {ok:false,reason:'This item needs arrow keys or a resize handle.'};
 if(!Number.isInteger(x)||!Number.isInteger(y))return {ok:false,reason:'Drop inside the board.'};
 const next=copy(run),n=next.pieces.find(x=>x.id===id);
 n.x=x;n.y=y;
 if(!valid(next.pieces,id))return {ok:false,reason:'The drop would overlap or leave the play area.'};
 next.selected=id;next.attempts++;next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Perfect drop!':'Cargo delivered! Keep going.'};
}
export function resizeMapTwo(mission,run,id,handle,dx,dy){
 const p=run.pieces.find(x=>x.id===id);
 if(!p||p.tool!=='resize'||run.selected!==id)return {ok:false,reason:'Select the resizable picture first.'};
 if(!['n','ne','e','se','s','sw','w','nw'].includes(handle)||!Number.isInteger(dx)||!Number.isInteger(dy))
  return {ok:false,reason:'Drag a visible resize handle.'};
 if(!dx&&!dy)return {ok:false,reason:'Drag the handle at least one grid square.'};
 const next=copy(run),n=next.pieces.find(x=>x.id===id);
 if(handle.includes('w')){n.x+=dx;n.w-=dx}
 if(handle.includes('e'))n.w+=dx;
 if(handle.includes('n')){n.y+=dy;n.h-=dy}
 if(handle.includes('s'))n.h+=dy;
 if(!valid(next.pieces,id))return {ok:false,reason:'That resize would overlap another picture or leave the board.'};
 next.attempts++;next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Perfect fit!':'Good resizing! Keep going.'};
}
export function finishMapTwo(progress,mission,run){
 if(!run.complete||run.id!==mission.id)throw Error('Unfinished or incorrect Map Two mission');
 const next=copy(progress),map=mapTwoData(next),already=map.completed.includes(mission.id);
 if(!already){map.completed.push(mission.id);next.stars+=mission.stage===7?10:1;}
 let friend=null;
 if(mission.stage===7&&Array.from({length:8},(_,i)=>mapTwoId(mission.world,i))
  .every(id=>map.completed.includes(id))&&!map.rescued.includes(mission.worldInfo.id)){
  map.rescued.push(mission.worldInfo.id);friend=mission.worldInfo.friend;
 }
 map.active=null;next.mapTwo=map;
 return {progress:next,stars:already?0:mission.stage===7?10:1,friend};
}
// Whole PNG/JPEG illustrations only; these are external files, not contact sheets.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const graphic=(path,alt,cls='')=>`<img class="${cls}" src="${esc(path)}" alt="${esc(alt)}" draggable="false">`;
const rectCSS=p=>`left:${p.x/12*100}%;top:${p.y/7*100}%;width:${p.w/12*100}%;height:${p.h/7*100}%;`;
export function mountMapTwo(node,{read,save,exit}){
 let screen='map',world=0,stage=0,run=null,notice='',modal=null,drag=null,lastDragTime=0;
 const progress=()=>read(),dataset=()=>mapTwoData(progress());
 function commit(nextRun){
  const mission=createMapTwoMission(world,stage),next=copy(progress());
  const result=nextRun.complete?finishMapTwo(next,mission,nextRun):null;
  if(result){if(!save(result.progress)){notice='NOT SAVED. Your earlier progress is safe; try again.';draw();return false}
   run=nextRun;modal={kind:'reward',stars:result.stars,friend:result.friend};notice='';draw();return true;
  }
  next.mapTwo={...mapTwoData(next),active:copy(nextRun)};
  if(!save(next)){notice='NOT SAVED. Your previous progress is safe. Try again.';draw();return false}
  run=nextRun;notice='';draw();return true;
 }
 const mapPanel=()=>`<section class="m2-intro"><strong>MAP TWO · THE LOST WORLDS</strong><p>A BRAND-NEW SPACE MAP · Eight new worlds · Your Map One stars and rescued friends are still saved.</p></section>
 <div class="m2-galaxy-stage" role="group" aria-label="New Map Two galaxy with eight different worlds">
 <img class="m2-galaxy-art" src="./assets/map-two/lost-worlds-map.jpg" alt="Eight original Map Two world islands joined by a star trail" draggable="false" onerror="this.hidden=true">
 ${MAP_TWO_THEMES.map((theme,i)=>{
  const ready=i<LOST_WORLDS.length;
  const unlocked=ready&&mapTwoWorldUnlocked(progress(),i);
  const done=ready?mapTwoCount(progress(),i):0;
  const at=MAP_TWO_STOPS[i];
  return `<button type="button" class="m2-world-stop" style="left:${at.x}%;top:${at.y}%" data-m2-world="${i}" ${unlocked?'':'disabled'} aria-label="${esc(theme.name)} ${unlocked?'open':ready?'locked':'coming soon'}">
   <b>${i+1}. ${esc(theme.name)}</b><small>${ready?(unlocked?done+'/8 complete':'LOCKED'):'COMING SOON'}</small></button>`;
 }).join('')}</div>
 <p class="m2-map-note">Map Two is separate from the original planets. Complete each new world to unlock the next one. Additional original worlds and their full illustrations will be added here.</p>
 <button type="button" class="m2-return" data-m2-exit="1">Return to Map One</button>`;
 const worldPanel=()=>{const w=LOST_WORLDS[world];return `<div class="m2-page-head"><button data-m2-back="map">← Both Lost Worlds</button><h1>${esc(w.name)}</h1><p>Complete all 8 challenges to rescue ${esc(w.friend)}.</p></div><div class="m2-level-grid">${Array.from({length:8},(_,i)=>{
  const unlock=mapTwoStageUnlocked(progress(),world,i),done=dataset().completed.includes(mapTwoId(world,i));
  return `<button type="button" class="m2-level" data-m2-stage="${i}" ${unlock?'':'disabled'}><span>${unlock?i+1:'LOCK'}</span><b>${esc(LOST_STAGE_TITLES[world][i])}</b><small>${done?'DONE · REPLAY':unlock?'PLAY':'Finish the previous level'}</small></button>`}).join('')}</div><div class="m2-friend-line">${graphic(w.friendImage,w.friend,'m2-friend-art')}<span>${dataset().rescued.includes(w.id)?esc(w.friend)+' rescued!':'Rescue '+esc(w.friend)+' after mission 8'}</span></div>`};
 const boardPanel=()=>{const m=createMapTwoMission(world,stage);return `<div class="m2-game-head"><button data-m2-back="world">← ${esc(m.worldInfo.name)} Map</button><h1>Level ${stage+1}: ${esc(m.title)}</h1><span>${esc(m.type.toUpperCase())}</span></div>
  <div class="m2-instruction"><p>${esc(m.instructions)}</p><button type="button" data-m2-speak="1" aria-label="Read directions aloud">🔊 Listen</button></div>
  <div class="m2-board-wrap"><div class="m2-board" id="m2-board" role="group" aria-label="Space puzzle. Use trackpad and keyboard arrows as instructed.">
   ${graphic(m.worldInfo.scene,'','m2-backdrop')}<div class="m2-soft-grid"></div>
   ${run.pieces.filter(p=>p.goal).map(p=>`<div class="m2-goal" style="${rectCSS(p.goal)}" aria-label="${esc(p.label)} target"><div class="m2-goal-inner">${graphic(p.art,'','m2-goal-image')}<small>DROP HERE</small></div></div>`).join('')}
   ${run.pieces.map(p=>`<div class="m2-piece ${run.selected===p.id?'selected':''} ${p.tool==='drag'?'draggable':''}" style="${rectCSS(p)}" data-m2-piece="${esc(p.id)}" data-m2-drag="${p.tool==='drag'?'yes':'no'}" role="button" tabindex="0" aria-label="${esc(p.label)}: ${p.tool}">${graphic(p.art,p.label,'m2-object-image')}<b>${esc(p.label)}</b>${run.selected===p.id&&p.tool==='resize'?['nw','n','ne','e','se','s','sw','w'].map(h=>`<span class="m2-handle m2-handle-${h}" data-m2-handle="${h}" data-m2-for="${esc(p.id)}" role="button" aria-label="Hold and drag ${h} resize handle"></span>`).join(''):''}</div>`).join('')}
  </div></div><div class="m2-feedback" id="m2-feedback" role="status">${esc(notice||'Carefully follow the directions above.')}</div>`};
 function draw(){node.innerHTML=`<main class="m2-page">${screen==='map'?mapPanel():screen==='world'?worldPanel():boardPanel()}${modal?`<div class="m2-modal-scrim" role="dialog" aria-modal="true"><div class="m2-modal"><h2>${modal.friend?'YOU RESCUED A FRIEND!':'MISSION COMPLETE!'}</h2>${modal.friend?graphic(LOST_WORLDS[world].friendImage,modal.friend,'m2-reward-friend'):''}<p>${modal.friend?esc(modal.friend)+' is safe!':'Great space skills!'}</p><strong>${modal.stars?`+${modal.stars} STARS`:'PRACTICE REPLAY'}</strong><button type="button" data-m2-reward="1">Continue</button></div></div>`:''}</main>`;}
 function enterStage(n){if(!mapTwoStageUnlocked(progress(),world,n))return;
  stage=n;const m=createMapTwoMission(world,stage),old=dataset().active;
  if(old?.id===m.id&&old.layoutVersion===m.layoutVersion&&!old.complete)run=copy(old);
  else{const fresh=initialMapTwoRun(m),next=copy(progress());next.mapTwo={...mapTwoData(next),active:copy(fresh)};
   if(!save(next)){notice='NOT SAVED. Unable to start a new mission safely.';draw();return}run=fresh}
  notice='';screen='game';draw();}
 function action(kind,id,...args){const m=createMapTwoMission(world,stage);
  const result=kind==='select'?chooseMapTwo(m,run,id):kind==='move'?moveMapTwo(m,run,id):
   kind==='drop'?dropMapTwo(m,run,id,...args):resizeMapTwo(m,run,id,...args);
  if(!result.ok){notice=result.reason;const box=node.querySelector('#m2-feedback');if(box)box.textContent=notice;return}
  commit(result.run);
 }
 function speak(){if(!window.speechSynthesis)return;const message=new SpeechSynthesisUtterance(createMapTwoMission(world,stage).instructions);message.rate=.86;window.speechSynthesis.cancel();window.speechSynthesis.speak(message)}
 function handleClick(event){event.stopPropagation();const button=event.target.closest('[data-m2-exit],[data-m2-world],[data-m2-back],[data-m2-stage],[data-m2-speak],[data-m2-reward],[data-m2-piece]');if(!button)return;
  if(Date.now()-lastDragTime<350)return;
  if(button.hasAttribute('data-m2-exit')){exit();return}
  if(button.hasAttribute('data-m2-world')){const n=Number(button.dataset.m2World);if(mapTwoWorldUnlocked(progress(),n)){world=n;screen='world';notice='';draw()}return}
  if(button.dataset.m2Back){screen=button.dataset.m2Back;notice='';draw();return}
  if(button.hasAttribute('data-m2-stage')){enterStage(Number(button.dataset.m2Stage));return}
  if(button.hasAttribute('data-m2-speak')){speak();return}
  if(button.hasAttribute('data-m2-reward')){
   // Regular new-world mission: its own eight-level map.
   // Eighth rescue: the new Map Two eight-world galaxy map.
   const finishedWorld=stage===7&&mapTwoCount(progress(),world)===8;
   modal=null;run=null;notice='';screen=finishedWorld?'map':'world';draw();return
  }
  if(button.dataset.m2Piece&&screen==='game'&&!modal){action('select',button.dataset.m2Piece)}
 }
 function onPointerDown(event){const handle=event.target.closest('[data-m2-handle]'),item=event.target.closest('[data-m2-piece]');
  if(screen!=='game'||modal||(!handle&&!item))return;
  if(event.pointerType!=='mouse'||event.button!==0)return;
  const board=node.querySelector('#m2-board');if(!board)return;
  const p=run.pieces.find(p=>p.id===(handle?.dataset.m2For||item?.dataset.m2Piece));
  if(!p)return;
  if(handle&&run.selected!==p.id)return;
  if(!handle&&p.tool!=='drag')return;
  event.preventDefault();event.stopPropagation();
  drag={pointerId:event.pointerId,pieceId:p.id,mode:handle?'resize':'drag',handle:handle?.dataset.m2Handle,
   base:copy(run),x:event.clientX,y:event.clientY,board:board.getBoundingClientRect(),lastX:0,lastY:0};
  (handle||item).setPointerCapture(event.pointerId);
 }
 function onPointerMove(event){if(!drag||drag.pointerId!==event.pointerId)return;
  event.preventDefault();const x=event.clientX-drag.x,y=event.clientY-drag.y;drag.lastX=x;drag.lastY=y;
  const item=node.querySelector(`[data-m2-piece="${drag.pieceId}"]`);
  if(item&&drag.mode==='drag')item.style.transform=`translate(${x}px, ${y}px)`;
  if(item&&drag.mode==='resize'){
   const dx=Math.round(x/drag.board.width*12),dy=Math.round(y/drag.board.height*7),m=createMapTwoMission(world,stage);
   const result=resizeMapTwo(m,drag.base,drag.pieceId,drag.handle,dx,dy);
   if(result.ok){const p=result.run.pieces.find(p=>p.id===drag.pieceId);item.style.left=p.x/12*100+'%';item.style.top=p.y/7*100+'%';item.style.width=p.w/12*100+'%';item.style.height=p.h/7*100+'%'}
  }
 }
 function onPointerUp(event){if(!drag||drag.pointerId!==event.pointerId)return;event.preventDefault();event.stopPropagation();
  const d=drag;drag=null;lastDragTime=Date.now();
  const dx=Math.round((event.clientX-d.x)/d.board.width*12),dy=Math.round((event.clientY-d.y)/d.board.height*7);
  const p=d.base.pieces.find(p=>p.id===d.pieceId);
  if(d.mode==='drag')action('drop',d.pieceId,p.x+dx,p.y+dy);
  else action('resize',d.pieceId,d.handle,dx,dy);
  if(node.querySelector('.m2-board')&&node.querySelector('[data-m2-piece="'+d.pieceId+'"]')?.style.transform)draw();
 }
 function onPointerCancel(){if(!drag)return;drag=null;draw()}
 function onKey(event){if(screen!=='game'||modal)return;
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  if(event.target.closest('input,select,textarea'))return;
  event.preventDefault();action('move',event.key)
 }
 node.addEventListener('click',handleClick);node.addEventListener('pointerdown',onPointerDown);
 node.addEventListener('pointermove',onPointerMove);node.addEventListener('pointerup',onPointerUp);
 node.addEventListener('pointercancel',onPointerCancel);window.addEventListener('keydown',onKey);
 draw();return ()=>{node.removeEventListener('click',handleClick);node.removeEventListener('pointerdown',onPointerDown);
  node.removeEventListener('pointermove',onPointerMove);node.removeEventListener('pointerup',onPointerUp);
  node.removeEventListener('pointercancel',onPointerCancel);window.removeEventListener('keydown',onKey)};
}