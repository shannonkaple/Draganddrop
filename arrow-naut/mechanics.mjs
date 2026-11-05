import {mazeInitial,mazeMove,mazeEnemyTick,fireLaser} from './finale-maze.mjs?v=all-boss-safe-lasers-20261102';
import {GRID,createProgress,PLANETS,completedCount} from './curriculum.mjs?v=neon-pink-2-fixed-20261105q';
export const DIRECTIONS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function initialMission(mission){return {id:mission.id,selected:null,mode:'move',pieces:clone(mission.pieces),layoutVersion:mission.layoutVersion??1,collected:[],delivered:[],patternIndex:0,attempts:0,complete:false,hazards:clone(mission.hazards||[]),...(mission.kind==='final-maze'?{maze:mazeInitial(mission)}:{})};}
export function occupiedCells(piece){if(piece.cells)return piece.cells.map(([dx,dy])=>[piece.x+dx,piece.y+dy]);const out=[];for(let y=0;y<piece.h;y++)for(let x=0;x<piece.w;x++)out.push([piece.x+x,piece.y+y]);return out;}
export function validPosition(mission,pieces,changedId){
 const selected=pieces.find(p=>p.id===changedId);if(!selected)return false;
 const locations=new Set(occupiedCells(selected).map(([x,y])=>x+','+y));
 if(occupiedCells(selected).some(([x,y])=>x<0||x>=GRID.columns||y<0||y>=GRID.rows))return false;
 if((mission.obstacles||[]).some(([x,y])=>locations.has(x+','+y)))return false;
 for(const other of pieces){if(other.id===changedId)continue;
  if(occupiedCells(other).some(([x,y])=>locations.has(x+','+y)))return false;
 }
 return true;
}
/** After each successful move, enemies take unpredictable but legal grid steps.
 * They may collide with the moving picture; the current mission restarts safely.
 * We never move an enemy onto an objective, fixed obstacle or stationery piece.
 */
export function movePatrollingEnemies(mission,state){
 if(!mission.hazards?.length)return {state,collision:false};
 const next=clone(state),player=next.pieces.find(p=>p.id===next.selected);
 if(!Array.isArray(next.hazards))next.hazards=clone(mission.hazards);
 const fixed=new Set((mission.obstacles||[]).map(v=>v.join(',')));
 for(const pick of mission.pickups||[])fixed.add(pick.x+','+pick.y);
 for(const piece of next.pieces){
  if(piece.goal){for(let y=piece.goal.y;y<piece.goal.y+(piece.goal.h||piece.h);y++)
    for(let x=piece.goal.x;x<piece.goal.x+(piece.goal.w||piece.w);x++)fixed.add(x+','+y);}
  if(piece.id!==next.selected)for(const pt of occupiedCells(piece))fixed.add(pt.join(','));
 }
 const playerCells=new Set(player?occupiedCells(player).map(p=>p.join(',')):[]);
 const occupied=new Set();
 let collision=next.hazards.some(enemy=>playerCells.has(enemy.x+','+enemy.y));
 for(const enemy of next.hazards){
  const candidates=[[0,0],[0,1],[0,-1],[1,0],[-1,0]]
   .map(([dx,dy])=>({x:enemy.x+dx,y:enemy.y+dy}))
   .filter(p=>p.x>=0&&p.x<GRID.columns&&p.y>=0&&p.y<GRID.rows&&!fixed.has(p.x+','+p.y)&&!occupied.has(p.x+','+p.y));
  const dest=candidates[Math.floor(Math.random()*candidates.length)]||enemy;
  enemy.x=dest.x;enemy.y=dest.y;
  occupied.add(enemy.x+','+enemy.y);
  if(playerCells.has(enemy.x+','+enemy.y))collision=true;
 }
 return {state:next,collision};
}
function markRelayDelivery(mission,run){
 if(mission.kind!=='picture-relay')return null;
 const expected=mission.deliveryOrder[(run.delivered||[]).length];
 const p=run.pieces.find(x=>x.id===expected);
 if(run.selected===expected&&p&&goalMet(p)){
  run.delivered=[...(run.delivered||[]),expected];run.selected=null;
  return 'Picture '+run.delivered.length+' of '+mission.deliveryOrder.length+' delivered! Select the NEXT highlighted picture.';
 }
 return null;
}
export function goalMet(piece){const g=piece.goal;return !!g&&piece.x===g.x&&piece.y===g.y&&
  (g.w===undefined||piece.w===g.w)&&(g.h===undefined||piece.h===g.h);}
export function missionComplete(mission,state){return mission.kind==='final-maze'||mission.kind==='arrow-sequence'?!!state.complete:mission.kind==='click'?state.complete:
 mission.kind==='picture-relay'?(state.delivered||[]).length===mission.deliveryOrder.length&&mission.pieces.filter(p=>p.goal).every(p=>goalMet(state.pieces.find(x=>x.id===p.id))):
 mission.pieces.filter(p=>p.goal).every(p=>goalMet(state.pieces.find(x=>x.id===p.id)))&&
 (mission.pickups||[]).every(p=>state.collected?.includes(p.id));}
/** A click INSIDE selects an object; arrow keys always MOVE it, never resize it. */
export function selectObject(mission,state,id,mode='move'){
 const piece=state.pieces.find(p=>p.id===id);
 if(!piece)return {ok:false,state,reason:'Click INSIDE an object.'};
 if(mode!=='move')return {ok:false,state,reason:'Hold and DRAG a resize handle with your trackpad to stretch the object.'};
 if(mission.kind==='click'){
  if(id!==mission.clickTarget)return {ok:false,state,reason:'Look for the requested color. Carefully click INSIDE that box.'};
  return {ok:true,state:{...state,selected:id,mode:'move',complete:true,attempts:state.attempts+1},reason:'Perfect click!'};
 }
 if(mission.kind==='picture-relay'){
  const expected=mission.deliveryOrder[(state.delivered||[]).length];
  if(id!==expected)return {ok:false,state,reason:'Deliver pictures IN ORDER. First click '+(mission.pieces.find(p=>p.id===expected)?.name||'the highlighted object')+'.'};
 }
 if(mission.kind==='precision'&&id!==mission.clickTarget&&!piece.resize){const correct=mission.pieces.find(p=>p.id===mission.clickTarget);return {ok:false,state,reason:'Not that picture. Click INSIDE the '+(correct?.color||'correct').toUpperCase()+' '+(correct?.name||'picture')+' instead.'};}
 return {ok:true,state:{...state,selected:id,mode:'move',attempts:state.attempts+1},reason:'Selected! Use the arrow keys to MOVE this object.'};
}
export function arrowAction(mission,state,key){
 if(mission.kind==='final-maze')return mazeMove(mission,state,key);
 if(mission.kind==='arrow-sequence'){
  if(!DIRECTIONS[key])return {ok:false,state,reason:'Use the keyboard arrow keys.'};
  const next=clone(state),correct=mission.pattern[next.patternIndex||0];
  next.attempts++;
  if(key!==correct){next.patternIndex=0;return {ok:true,state:next,reason:'Try that code again from the first arrow.'}}
  next.patternIndex=(next.patternIndex||0)+1;
  next.complete=next.patternIndex>=mission.pattern.length;
  return {ok:true,state:next,reason:next.complete?'Signal code complete!':'Correct! Look at your next arrow.'};
 }
 if(!DIRECTIONS[key])return {ok:false,state,reason:'Use the arrow keys.'};
 if(!state.selected)return {ok:false,state,reason:'First click INSIDE the box you want to move.'};
 const piece=state.pieces.find(p=>p.id===state.selected);
 if(!piece)return {ok:false,state,reason:'Click INSIDE a box to select it.'};
 const [dx,dy]=DIRECTIONS[key],next=clone(state),p=next.pieces.find(x=>x.id===state.selected);
 p.x+=dx;p.y+=dy;
 if(!validPosition(mission,next.pieces,p.id))return {ok:false,state,reason:'That would hit a wall, another object, or the edge. Try a different arrow.'};
 next.mode='move';next.attempts++;
 let collected=false;
 if(!Array.isArray(next.collected))next.collected=[];
 for(const item of mission.pickups||[]){
  if(next.collected.includes(item.id))continue;
  if(p.x===item.x&&p.y===item.y){next.collected.push(item.id);collected=true}
 }
 const deliveryMessage=markRelayDelivery(mission,next);
 const hazard=movePatrollingEnemies(mission,next);
 if(hazard.collision){
  const reset=initialMission(mission);reset.attempts=next.attempts;
  return {ok:true,state:reset,reason:'A moving bad guy bumped your picture! Start this challenge again.'};
 }
 hazard.state.complete=missionComplete(mission,hazard.state);
 return {ok:true,state:hazard.state,reason:hazard.state.complete?'Mission complete!':deliveryMessage|| (collected?'Star collected! Now reach your matching dock.':'Watch the moving bad guys! Keep going.')};
}
/** Grid-snapped handle dragging, with the opposite edge/corner held in place.
 * deltaColumns/deltaRows are pointer movement rounded to whole puzzle squares.
 * The same collision and bounds rules apply to both moving and stretching.
 */
export function resizeByHandle(mission,state,id,handle,deltaColumns,deltaRows){
 const piece=state.pieces.find(p=>p.id===id);
 if(!piece?.resize||piece.cells)return {ok:false,state,reason:'This object cannot be stretched.'};
 if(!['n','ne','e','se','s','sw','w','nw'].includes(handle))return {ok:false,state,reason:'Use a visible resize handle.'};
 if(!Number.isInteger(deltaColumns)||!Number.isInteger(deltaRows))return {ok:false,state,reason:'Drag the handle across the puzzle squares.'};
 const x=handle.includes('e')||handle.includes('w')?deltaColumns:0;
 const y=handle.includes('n')||handle.includes('s')?deltaRows:0;
 if(!x&&!y)return {ok:false,state,reason:'Hold the handle and drag it to stretch or shrink.'};
 const next=clone(state),p=next.pieces.find(p=>p.id===id);
 if(handle.includes('w')){p.x+=x;p.w-=x}
 if(handle.includes('e'))p.w+=x;
 if(handle.includes('n')){p.y+=y;p.h-=y}
 if(handle.includes('s'))p.h+=y;
 if(p.w<1||p.h<1)return {ok:false,state,reason:'Keep at least one square in each direction.'};
 if(!validPosition(mission,next.pieces,id))return {ok:false,state,reason:'That stretch would hit another object, a wall, or the edge.'};
 next.selected=id;next.mode='move';next.attempts++;
 const deliveryMessage=markRelayDelivery(mission,next);
 next.complete=missionComplete(mission,next);
 return {ok:true,state:next,reason:next.complete?'Mission complete!':deliveryMessage||'Good stretching! Now fit the object into its outline.'};
}
/** One-time star economy: regular missions 1 star, final maze 10 stars.
 * Replays remain available for practice but cannot mint more stars.
 * All legacy balances and purchases remain untouched.
 */
export function finishMission(progress,mission){
 const next=clone(progress),alreadyComplete=next.completed.includes(mission.id);
 if(!alreadyComplete)next.completed.push(mission.id);
 const earned=alreadyComplete?0:mission.kind==='final-maze'?10:1;
 next.stars+=earned;next.active=null;
 const firstRescue=mission.kind==='final-maze'&&completedCount(next,mission.planetIndex)===8&&
  !next.rescued.includes(mission.planet.id);
 if(firstRescue)next.rescued.push(mission.planet.id);
 return {progress:next,stars:earned,friend:firstRescue?PLANETS[mission.planetIndex].friend:null};
}
export {mazeEnemyTick,fireLaser};
export function purchase(progress,item){
 if(progress.purchases.includes(item.id))return {ok:false,reason:'Already owned!',progress};
 if(progress.stars<item.price)return {ok:false,reason:'Earn more stars first!',progress};
 return {ok:true,progress:{...progress,stars:progress.stars-item.price,purchases:[...progress.purchases,item.id]},reason:'Purchased!'};
}
export function validatedSave(raw){if(raw===null)return createProgress();const value=JSON.parse(raw);
 if(!value||value.version!==1||!Array.isArray(value.completed)||!Array.isArray(value.purchases)||!Number.isFinite(value.stars))throw Error('Unrecognized or damaged Arrow-Naut save. It will not be overwritten.');
 return {...createProgress(),...value};
}