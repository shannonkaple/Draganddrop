import {teacherCanOpen} from './teacher-progress.mjs';
/** Arrow-Naut Map Two: The Lost Worlds.
 * Separate 16-mission curriculum; original 64 missions and storage keys untouched.
 * Trackpad dragging is Map Two only. No touchscreen gameplay, no CSS/SVG sprites.
 * All placement and rewards use the parent app's verified student-save callback.
 */
/** Separate, original 1672x941 JPEG playfields for every Map Two theme.
 * Keep illustrated navigation maps (scene) unchanged. Every puzzle in each
 * world uses its own clean playfield; unbuilt worlds remain locked. */
export const MAP_TWO_PUZZLE_SCENES=Object.freeze([
 './assets/map-two/aurora-garden-puzzle.jpg',
 './assets/map-two/clockwork-comet-puzzle.jpg',
 './assets/map-two/prism-reef-puzzle.jpg',
 './assets/map-two/cloud-carnival-puzzle.jpg',
 './assets/map-two/crystal-caverns-puzzle.jpg',
 './assets/map-two/nebula-library-puzzle.jpg',
 './assets/map-two/ember-workshop-puzzle.jpg',
 './assets/map-two/moonlight-jungle-puzzle.jpg'
]);
export const LOST_WORLDS = Object.freeze([
  {id:'lost-aurora',name:'Aurora Garden',friend:'Lumi the Star Deer',
    scene:'./assets/map-two/aurora-garden.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[0],friendImage:'./assets/map-two/lumi-star-deer.png',color:'#73d9c6',
    story:'Find the lost garden signals and rescue Lumi!'},
  {id:'lost-clockwork',name:'Clockwork Comet',friend:'Tiko the Gear Gecko',
    scene:'./assets/map-two/clockwork-comet.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[1],friendImage:'./assets/map-two/tiko-gear-gecko.png',color:'#efa45d',
    story:'Repair the comet workshop and rescue Tiko!'}
]);
// Map Two uses its OWN eight-theme galaxy map, never the original eight planets.
// Worlds 3–8 remain visibly unplayable until their new original missions and art exist.
export const MAP_TWO_THEMES = Object.freeze([
 {name:'Aurora Garden',scene:'./assets/map-two/aurora-garden.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[0],active:true},
 {name:'Clockwork Comet',scene:'./assets/map-two/clockwork-comet.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[1],active:true},
 {name:'Prism Reef',scene:'./assets/map-two/prism-reef.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[2],active:false},
 {name:'Cloud Carnival',scene:'./assets/map-two/cloud-carnival.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[3],active:false},
 {name:'Crystal Caverns',scene:'./assets/map-two/crystal-caverns.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[4],active:false},
 {name:'Nebula Library',scene:'./assets/map-two/nebula-library.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[5],active:false},
 {name:'Ember Workshop',scene:'./assets/map-two/ember-workshop.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[6],active:false},
 {name:'Moonlight Jungle',scene:'./assets/map-two/moonlight-jungle.jpg',puzzleScene:MAP_TWO_PUZZLE_SCENES[7],active:false}
]);
export const MAP_TWO_STOPS = Object.freeze([
 {x:17,y:39},{x:38,y:39},{x:62,y:39},{x:86,y:39},
 {x:85,y:73},{x:63,y:80},{x:38,y:81},{x:16,y:73}
]);
export const MAP_TWO_LEVEL_STOPS = Object.freeze([{x:16,y:32},{x:35,y:22},{x:57,y:26},{x:79,y:35},{x:84,y:65},{x:62,y:76},{x:40,y:73},{x:18,y:64}]);
export const LOST_STAGE_TYPES = Object.freeze([
  ['select','move','drag','resize','sort','rotate','mixed','rescue'],
  ['drag','select','resize','move','sort','move-rotate','move-resize','rescue']
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
export const mapTwoWorldUnlocked=(progress,world)=>world===0||(world===1&&mapTwoCount(progress,0)===8)||
 (world>=0&&world<LOST_WORLDS.length&&teacherCanOpen(progress,'two',world,0));
export const mapTwoStageUnlocked=(progress,world,stage)=>mapTwoWorldUnlocked(progress,world)&&
 (stage===0||teacherCanOpen(progress,'two',world,stage)||mapTwoData(progress).completed.includes(mapTwoId(world,stage-1)));
export function createMapTwoMission(world,stage){
 if(!Number.isInteger(world)||world<0||world>1||!Number.isInteger(stage)||stage<0||stage>7)
  throw Error('Unknown Map Two mission');
 const type=LOST_STAGE_TYPES[world][stage],label=LOST_STAGE_TITLES[world][stage];
 const base={id:mapTwoId(world,stage),world,stage,title:label,type,layoutVersion:stage===5?2:1,
  worldInfo:LOST_WORLDS[world],puzzleScene:MAP_TWO_PUZZLE_SCENES[world],pieces:[],targetId:null};
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
 if(type==='rotate')return {...base,pieces:[{...piece('turn-box','Aurora Signal Box','gear',4,2,2,2,{x:4,y:2,w:2,h:2,rotation:90},'rotate'),rotation:0}],
  instructions:'Click the box. Hold and DRAG the CURVED ARROW above it sideways to rotate the box to match its outline.'};
 if(type==='move-rotate')return {...base,pieces:[{...piece('turn-box','Comet Control Box','satellite',1,2,2,2,{x:7,y:3,w:2,h:2,rotation:180},'move-rotate'),rotation:0}],
  instructions:'Click the box. Move it with ARROWS. Hold and DRAG the CURVED ARROW above the box sideways to turn it and match its outline.'};
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
/** Show tiny action steps; no student must identify equipment by its name. */
export function mapTwoKidDirections(m){
 switch(m.type){
  case 'select':return 'Click the same picture.';
  case 'move':return '1. Click the picture. 2. Arrows to the outline.';
  case 'drag':return 'Hold and drag the picture to the outline.';
  case 'resize':return 'Click the picture. Drag a corner to fit.';
  case 'sort':return 'Drag each picture to its outline.';
  case 'move-resize':return '1. Arrows to move. 2. Drag a corner to fit.';
  case 'rotate':return '1. Click the box. 2. Drag ↻ sideways to turn it.';
  case 'move-rotate':return '1. Arrows to move. 2. Drag ↻ to turn.';
  case 'mixed':return 'Move one with arrows. Drag the other to match.';
  case 'rescue':return 'Move, resize, then drag to the outlines. Rescue your friend!';
  default:return 'Match the pictures!';
 }
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
export const atGoal=p=>!!p.goal&&p.x===p.goal.x&&p.y===p.goal.y&&p.w===p.goal.w&&p.h===p.goal.h&&(p.goal.rotation===undefined||((p.rotation||0)%360+360)%360===p.goal.rotation);
export function mapTwoSolved(mission,run){return mission.type==='select'?
  run.selected===mission.targetId:run.pieces.filter(p=>p.goal).every(atGoal)}
export function chooseMapTwo(mission,run,id){
 const p=run.pieces.find(x=>x.id===id);
 if(!p)return {ok:false,reason:'Click inside a picture.'};
 if(mission.type==='select'&&id!==mission.targetId)return {ok:false,reason:'Try another picture. Find the SAME picture shown above.'};
 const next={...copy(run),selected:id,attempts:run.attempts+1};
 next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Great selection!':'Selected! Follow the skill directions.'};
}
export function moveMapTwo(mission,run,key){
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
 if(!delta)return {ok:false,reason:'Use the keyboard arrow keys.'};
 const p=run.pieces.find(x=>x.id===run.selected);
 if(!p||!['move','resize','move-rotate'].includes(p.tool))return {ok:false,reason:'Click the movable picture first, then use the arrows.'};
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
export function rotateMapTwo(mission,run,id,quarterTurns){
 const p=run.pieces.find(x=>x.id===id);
 if(!p||!['rotate','move-rotate'].includes(p.tool)||run.selected!==id)
  return {ok:false,reason:'Click the box first, then use its curved rotate arrow.'};
 if(!Number.isInteger(quarterTurns)||quarterTurns===0||Math.abs(quarterTurns)>3)
  return {ok:false,reason:'Hold and drag the curved arrow sideways to turn the box.'};
 const next=copy(run),n=next.pieces.find(x=>x.id===id);
 n.rotation=(((n.rotation||0)+90*quarterTurns)%360+360)%360;
 next.attempts++;next.complete=mapTwoSolved(mission,next);
 return {ok:true,run:next,reason:next.complete?'Perfect rotation!':'Box turned! Match the faded picture.'};
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
export function mountMapTwo(node,{read,save,exit,teacherPreview=false,initialWorld=null,initialStage=null}){
 const assigned=Number.isInteger(initialWorld)&&initialWorld>=0&&initialWorld<LOST_WORLDS.length&&Number.isInteger(initialStage)&&initialStage>=0&&initialStage<8;
 let screen=assigned?'world':'map',world=assigned?initialWorld:0,stage=assigned?initialStage:0,run=null,notice='',modal=null,drag=null,lastDragTime=0;
 const progress=()=>read(),dataset=()=>mapTwoData(progress());
 function commit(nextRun){
  if(teacherPreview){run=nextRun;notice=nextRun.complete?'Preview complete. No student progress or stars changed.':'TEACHER PREVIEW — nothing is saved.';draw();return true}
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
 <img class="m2-galaxy-art" src="./assets/map-two/lost-worlds-illustrated.jpg?v=20261109" alt="Eight illustrated fantasy space worlds across a connected star trail" draggable="false" onload="this.parentNode.dataset.illustrated=this.currentSrc.includes('lost-worlds-illustrated.jpg')?'yes':'no'" onerror="this.onerror=null;this.parentNode.dataset.illustrated='no';this.src='./assets/map-two/lost-worlds-map.jpg'">
 ${MAP_TWO_THEMES.map((theme,i)=>{
  const ready=i<LOST_WORLDS.length;
  const unlocked=ready&&(teacherPreview||mapTwoWorldUnlocked(progress(),i));
  const done=ready?mapTwoCount(progress(),i):0;
  const at=MAP_TWO_STOPS[i];
  return `<button type="button" class="m2-world-stop" style="left:${at.x}%;top:${at.y}%" data-m2-world="${i}" ${unlocked?'':'disabled'} aria-label="${esc(theme.name)} ${unlocked?'open':ready?'locked':'coming soon'}" title="${esc(theme.name)} — ${ready?(unlocked?done+'/8 missions completed':'Locked'):'Coming soon'}">
   <b>${i+1}. ${esc(theme.name)}</b><small>${ready?(unlocked?done+'/8':'LOCKED'):'COMING SOON'}</small></button>`;
 }).join('')}</div>
 <p class="m2-map-note">Map Two is separate from the original planets. Complete each new world to unlock the next one. Additional original worlds and their full illustrations will be added here.</p>
 <button type="button" class="m2-return" data-m2-exit="1">Return to Map One</button>`;
 const worldPanel=()=>{const w=LOST_WORLDS[world];return `<div class="m2-page-head"><button data-m2-back="map">← Both Lost Worlds</button><h1>${esc(w.name)}</h1><p>Complete all 8 challenges to rescue ${esc(w.friend)}.</p></div><div class="planet-map-stage m2-planet-map-stage"><img class="planet-map-art" src="${esc(w.scene)}" alt="${esc(w.name)} illustrated level map" draggable="false">
 <div class="planet-map-heading"><strong>${esc(w.name)} WORLD</strong><span>${mapTwoCount(progress(),world)}/8 Missions · Rescue ${esc(w.friend)}</span></div>
 ${Array.from({length:8},(_,i)=>{
  const at=MAP_TWO_LEVEL_STOPS[i],unlock=teacherPreview||mapTwoStageUnlocked(progress(),world,i),done=dataset().completed.includes(mapTwoId(world,i));
  return `<button type="button" class="planet-level-pin m2-stage-pin${done?' is-complete':''}" style="left:${at.x}%;top:${at.y}%" data-m2-stage="${i}" ${unlock?'':'disabled'} aria-label="Level ${i+1}: ${esc(LOST_STAGE_TITLES[world][i])}${unlock?'':', locked'}"><strong>${unlock?i+1:'LOCK'}</strong><span>${esc(LOST_STAGE_TITLES[world][i])}</span>${done?'<small>DONE</small>':''}</button>`;
 }).join('')}</div><div class="m2-friend-line">${graphic(w.friendImage,w.friend,'m2-friend-art')}<span>${dataset().rescued.includes(w.id)?esc(w.friend)+' rescued!':'Rescue '+esc(w.friend)+' after mission 8'}</span></div>`};
 const boardPanel=()=>{const m=createMapTwoMission(world,stage);return `<div class="m2-game-head"><button data-m2-back="world">← ${esc(m.worldInfo.name)} Map</button><h1>Level ${stage+1}: ${esc(m.title)}</h1><span>${esc(m.type.toUpperCase())}</span></div>
  <div class="m2-instruction">${m.type==='select'?graphic(m.pieces.find(p=>p.id===m.targetId).art,'Find this picture','m2-target-cue'):''}<p>${esc(mapTwoKidDirections(m))}</p><button type="button" data-m2-speak="1" aria-label="Read directions aloud">🔊 Listen</button></div>
  <div class="m2-board-wrap"><div class="m2-board" id="m2-board" role="group" aria-label="Space puzzle. Use trackpad and keyboard arrows as instructed.">
   ${graphic(m.puzzleScene,'','m2-backdrop')}<div class="m2-soft-grid"></div>
   ${run.pieces.filter(p=>p.goal).map(p=>`<div class="m2-goal" style="${rectCSS(p.goal)}" aria-label="${esc(p.label)} target"><div class="m2-goal-inner">${graphic(p.art,'','m2-goal-image').replace('<img ','<img style="transform:rotate('+(p.goal.rotation||0)+'deg)" ')}<small>SAME PICTURE</small></div></div>`).join('')}
   ${run.pieces.map(p=>`<div class="m2-piece ${run.selected===p.id?'selected':''} ${p.tool==='drag'?'draggable':''}" style="${rectCSS(p)}" data-m2-piece="${esc(p.id)}" data-m2-drag="${p.tool==='drag'?'yes':'no'}" role="button" tabindex="0" aria-label="${esc(p.label)}: ${p.tool}">${graphic(p.art,p.label,'m2-object-image').replace('<img ','<img style="transform:rotate('+(p.rotation||0)+'deg)" ')}<b>${p.tool==='drag'?'DRAG':p.tool==='resize'?'MAKE BIGGER':p.tool==='move'?'ARROWS':''}</b>${run.selected===p.id&&p.tool==='resize'?['nw','n','ne','e','se','s','sw','w'].map(h=>`<span class="m2-handle m2-handle-${h}" data-m2-handle="${h}" data-m2-for="${esc(p.id)}" role="button" aria-label="Hold and drag ${h} resize handle"></span>`).join(''):''}${run.selected===p.id&&['rotate','move-rotate'].includes(p.tool)?`<span class="m2-rotate-handle" data-m2-rotate="${esc(p.id)}" role="button" aria-label="Hold and drag curved arrow sideways to rotate box">↻</span>`:''}</div>`).join('')}
  </div></div><div class="m2-feedback" id="m2-feedback" role="status">${esc(notice||'Carefully follow the directions above.')}</div>`};
 function draw(){node.innerHTML=`<main class="m2-page">${screen==='map'?mapPanel():screen==='world'?worldPanel():boardPanel()}${modal?`<div class="m2-modal-scrim" role="dialog" aria-modal="true"><div class="m2-modal"><h2>${modal.friend?'YOU RESCUED A FRIEND!':'MISSION COMPLETE!'}</h2>${modal.friend?graphic(LOST_WORLDS[world].friendImage,modal.friend,'m2-reward-friend'):''}<p>${modal.friend?esc(modal.friend)+' is safe!':'Great space skills!'}</p><strong>${modal.stars?`+${modal.stars} STARS`:'PRACTICE REPLAY'}</strong><button type="button" data-m2-reward="1">Continue</button></div></div>`:''}</main>`;}
 function enterStage(n){if(!teacherPreview&&!mapTwoStageUnlocked(progress(),world,n))return;
  stage=n;const m=createMapTwoMission(world,stage),old=dataset().active;
  if(teacherPreview){run=initialMapTwoRun(m);notice='TEACHER PREVIEW — nothing is saved.';screen='game';draw();return}
  if(old?.id===m.id&&old.layoutVersion===m.layoutVersion&&!old.complete)run=copy(old);
  else{const fresh=initialMapTwoRun(m),next=copy(progress());next.mapTwo={...mapTwoData(next),active:copy(fresh)};
   if(!save(next)){notice='NOT SAVED. Unable to start a new mission safely.';draw();return}run=fresh}
  notice='';screen='game';draw();}
 function action(kind,id,...args){const m=createMapTwoMission(world,stage);
  const result=kind==='select'?chooseMapTwo(m,run,id):kind==='move'?moveMapTwo(m,run,id):
   kind==='drop'?dropMapTwo(m,run,id,...args):kind==='rotate'?rotateMapTwo(m,run,id,...args):resizeMapTwo(m,run,id,...args);
  if(!result.ok){notice=result.reason;const box=node.querySelector('#m2-feedback');if(box)box.textContent=notice;return}
  commit(result.run);
 }
 function speak(){if(!window.speechSynthesis)return;const message=new SpeechSynthesisUtterance(mapTwoKidDirections(createMapTwoMission(world,stage)));message.rate=.86;window.speechSynthesis.cancel();window.speechSynthesis.speak(message)}
 function handleClick(event){event.stopPropagation();const button=event.target.closest('[data-m2-exit],[data-m2-world],[data-m2-back],[data-m2-stage],[data-m2-speak],[data-m2-reward],[data-m2-piece]');if(!button)return;
  if(Date.now()-lastDragTime<350)return;
  if(button.hasAttribute('data-m2-exit')){exit();return}
  if(button.hasAttribute('data-m2-world')){const n=Number(button.dataset.m2World);if(teacherPreview||mapTwoWorldUnlocked(progress(),n)){world=n;screen='world';notice='';draw()}return}
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
 function onPointerDown(event){const handle=event.target.closest('[data-m2-handle]'),turn=event.target.closest('[data-m2-rotate]'),item=event.target.closest('[data-m2-piece]');
  if(screen!=='game'||modal||(!handle&&!turn&&!item))return;
  if(event.pointerType!=='mouse'||event.button!==0)return;
  const board=node.querySelector('#m2-board');if(!board)return;
  const p=run.pieces.find(p=>p.id===(handle?.dataset.m2For||turn?.dataset.m2Rotate||item?.dataset.m2Piece));
  if(!p)return;
  if((handle||turn)&&run.selected!==p.id)return;
  if(!handle&&!turn&&p.tool!=='drag')return;
  event.preventDefault();event.stopPropagation();
  drag={pointerId:event.pointerId,pieceId:p.id,mode:turn?'rotate':handle?'resize':'drag',handle:handle?.dataset.m2Handle,
   base:copy(run),x:event.clientX,y:event.clientY,board:board.getBoundingClientRect(),lastX:0,lastY:0};
  (handle||turn||item).setPointerCapture(event.pointerId);
 }
 function onPointerMove(event){if(!drag||drag.pointerId!==event.pointerId)return;
  event.preventDefault();const x=event.clientX-drag.x,y=event.clientY-drag.y;drag.lastX=x;drag.lastY=y;
  const item=node.querySelector(`[data-m2-piece="${drag.pieceId}"]`);
  if(item&&drag.mode==='drag')item.style.transform=`translate(${x}px, ${y}px)`;
  if(item&&drag.mode==='rotate'){const turns=Math.max(-3,Math.min(3,Math.round(x/(drag.board.width/12))));const photo=item.querySelector('.m2-object-image');if(photo)photo.style.transform='rotate('+(((drag.base.pieces.find(p=>p.id===drag.pieceId)?.rotation||0)+turns*90+360)%360)+'deg)';}
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
  else if(d.mode==='rotate'){if(dx)action('rotate',d.pieceId,Math.max(-3,Math.min(3,dx)));else{notice='Hold the curved arrow and drag sideways to rotate.';draw()}}
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
 draw();if(assigned&&!teacherPreview)enterStage(initialStage);
 return ()=>{node.removeEventListener('click',handleClick);node.removeEventListener('pointerdown',onPointerDown);
  node.removeEventListener('pointermove',onPointerMove);node.removeEventListener('pointerup',onPointerUp);
  node.removeEventListener('pointercancel',onPointerCancel);window.removeEventListener('keydown',onKey)};
}