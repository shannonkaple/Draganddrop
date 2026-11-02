import {GRID,createProgress,PLANETS,completedCount} from './curriculum.mjs';
export const DIRECTIONS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
export const clone=value=>JSON.parse(JSON.stringify(value));
export function initialMission(mission){return {id:mission.id,selected:null,mode:'move',pieces:clone(mission.pieces),attempts:0,complete:false};}
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
export function missionComplete(mission,state){return mission.kind==='click'?state.complete:
 mission.pieces.filter(p=>p.goal).every(p=>goalMet(state.pieces.find(x=>x.id===p.id)));}
/** Clicking inside selects movement. Clicking an actual visible handle selects resizing. */
export function selectObject(mission,state,id,mode='move'){
 const piece=state.pieces.find(p=>p.id===id);
 if(!piece)return {ok:false,state,reason:'Click INSIDE an object.'};
 if(mode==='resize'&&state.selected!==id)return {ok:false,state,reason:'First click INSIDE the object to select it. Then click the corner handle.'};
 if(mode==='resize'&&!piece.resize)return {ok:false,state,reason:'This object cannot be resized. Click inside to move it.'};
 if(mission.kind==='click'){
  if(id!==mission.clickTarget)return {ok:false,state,reason:'Look for the requested color. Carefully click INSIDE that box.'};
  return {ok:true,state:{...state,selected:id,mode:'move',complete:true,attempts:state.attempts+1},reason:'Perfect click!'};
 }
 if(mission.kind==='precision'&&id!==mission.clickTarget)return {ok:false,state,reason:'That is the wrong module. Click INSIDE the blue one.'};
 return {ok:true,state:{...state,selected:id,mode,attempts:state.attempts+1},reason:mode==='resize'?'Resize handle selected. Use arrow keys.':'Selected! Use your arrow keys to move.'};
}
export function arrowAction(mission,state,key){
 if(!DIRECTIONS[key])return {ok:false,state,reason:'Use the arrow keys.'};
 if(!state.selected)return {ok:false,state,reason:'First click INSIDE the box you want to move.'};
 const piece=state.pieces.find(p=>p.id===state.selected);
 if(!piece)return {ok:false,state,reason:'Click INSIDE a box to select it.'};
 const [dx,dy]=DIRECTIONS[key],next=clone(state);
 const p=next.pieces.find(x=>x.id===state.selected);
 if(state.mode==='resize'){
  if(!p.resize||p.cells)return {ok:false,state,reason:'This object cannot be resized.'};
  // Anchored top-left, no cropping: width and height only change dimensions.
  // Right widens; left narrows; down makes taller; up makes shorter.
  p.w+=dx;p.h+=dy;
  if(p.w<1||p.h<1)return {ok:false,state,reason:'An object must stay at least one square wide and tall.'};
 }else{p.x+=dx;p.y+=dy;}
 if(!validPosition(mission,next.pieces,p.id))return {ok:false,state,reason:'That would hit a wall, another object, or the edge. Try a different arrow.'};
 next.attempts++;
 next.complete=missionComplete(mission,next);
 return {ok:true,state:next,reason:next.complete?'Mission complete!':'Great! Keep going.'};
}
/** Awards 3 stars on EVERY completed play, including replays, but unlocks once. */
export function finishMission(progress,mission){
 const next=clone(progress);if(!next.completed.includes(mission.id))next.completed.push(mission.id);
 next.stars+=3;next.active=null;
 const firstRescue=completedCount(next,mission.planetIndex)===8&&!next.rescued.includes(mission.planet.id);
 if(firstRescue)next.rescued.push(mission.planet.id);
 return {progress:next,stars:3,friend:firstRescue?PLANETS[mission.planetIndex].friend:null};
}
export function purchase(progress,item){
 if(progress.purchases.includes(item.id))return {ok:false,reason:'Already owned!',progress};
 if(progress.stars<item.price)return {ok:false,reason:'Earn more stars first!',progress};
 return {ok:true,progress:{...progress,stars:progress.stars-item.price,purchases:[...progress.purchases,item.id]},reason:'Purchased!'};
}
export function validatedSave(raw){if(raw===null)return createProgress();const value=JSON.parse(raw);
 if(!value||value.version!==1||!Array.isArray(value.completed)||!Array.isArray(value.purchases)||!Number.isFinite(value.stars))throw Error('Unrecognized or damaged Arrow-Naut save. It will not be overwritten.');
 return {...createProgress(),...value};
}