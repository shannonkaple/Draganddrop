import {mazeInitial,mazeMove,mazeEnemyTick,fireLaser} from './finale-maze.mjs?v=all-boss-safe-lasers-20261102';
import {GRID,createProgress,PLANETS,completedCount} from './curriculum.mjs?v=naut-shop-unlock-20261105c';
export const DIRECTIONS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function initialMission(mission){return {id:mission.id,selected:null,mode:'move',pieces:clone(mission.pieces),layoutVersion:mission.layoutVersion??1,collected:[],attempts:0,complete:false,...(mission.kind==='final-maze'?{maze:mazeInitial(mission)}:{})};}
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
export function goalMet(piece){const g=piece.goal;return !!g&&piece.x===g.x&&piece.y===g.y&&
  (g.w===undefined||piece.w===g.w)&&(g.h===undefined||piece.h===g.h);}
export function missionComplete(mission,state){return mission.kind==='final-maze'?!!state.complete:mission.kind==='click'?state.complete:
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
 if(mission.kind==='precision'&&id!==mission.clickTarget)return {ok:false,state,reason:'That is the wrong module. Click INSIDE the blue one.'};
 return {ok:true,state:{...state,selected:id,mode:'move',attempts:state.attempts+1},reason:'Selected! Use the arrow keys to MOVE this object.'};
}
export function arrowAction(mission,state,key){
 if(mission.kind==='final-maze')return mazeMove(mission,state,key);
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
 next.complete=missionComplete(mission,next);
 return {ok:true,state:next,reason:next.complete?'Mission complete!':collected?'Star collected! Now reach your matching dock.':'Great! Keep going.'};
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
 next.selected=id;next.mode='move';next.attempts++;next.complete=missionComplete(mission,next);
 return {ok:true,state:next,reason:next.complete?'Mission complete!':'Good stretching! Now fit the object into its outline.'};
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