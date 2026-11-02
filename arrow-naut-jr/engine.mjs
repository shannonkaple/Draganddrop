import {COLS,ROWS,WORLDS,createProgress} from './curriculum.mjs';
import {mazeInitial,mazeMove,mazeEnemyTick} from '../arrow-naut/finale-maze.mjs?v=all-boss-safe-lasers-20261102';
export const clone=v=>JSON.parse(JSON.stringify(v));
const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
export function startRun(mission){
 return {id:mission.id,mechanicVersion:mission.mechanicVersion??1,
  selected:null,pieces:clone(mission.pieces),attempts:0,complete:false,
  collected:[],delivered:[],gateOpen:false,
  ...(mission.kind==='maze'?{maze:mazeInitial({mazeStart:mission.mazeStart,enemies:mission.enemies})}:{})};
}
export function select(mission,run,id){
 if(run.complete)return {ok:false,run,reason:'This mission is finished.'};
 if(mission.kind==='maze'){
  if(id!=='explorer')return {ok:false,run,reason:'Click your explorer to begin.'};
  return {ok:true,run:{...run,selected:id},reason:'Explorer selected! Use your keyboard arrows to find EXIT.'};
 }
 const piece=run.pieces.find(x=>x.id===id);
 if(!piece)return {ok:false,run,reason:'Click INSIDE one of the space pictures.'};
 if(mission.kind==='click'){
  if(mission.target!==id)return {ok:false,run,reason:'Try again! Find and click the golden star.'};
  return {ok:true,run:{...run,selected:id,complete:true,attempts:run.attempts+1},reason:'You clicked the golden star!'};
 }
 if(mission.kind==='precision'&&mission.target!==id)
  return {ok:false,run,reason:'Find the SECRET COMPUTER! Click its picture, not the others.'};
 if(mission.kind==='relay'){
  const remaining=mission.deliveryOrder.filter(name=>!(run.delivered||[]).includes(name));
  if(id!==remaining[0])return {ok:false,run,reason:'Look for the highlighted '+mission.pieces.find(p=>p.id===remaining[0])?.name+' first!'};
 }
 return {ok:true,run:{...run,selected:id,attempts:run.attempts+1},
  reason:'Selected! Now use the keyboard arrow keys.'};
}
export function move(mission,run,key){
 if(!directions[key])return {ok:false,run,reason:'Use the keyboard arrow keys.'};
 if(!run.selected)return {ok:false,run,reason:'FIRST click a space picture with your trackpad.'};
 if(run.complete)return {ok:false,run,reason:'This level is finished.'};
 if(mission.kind==='click')return {ok:false,run,reason:'Click the requested picture to finish this level.'};
 if(mission.kind==='maze'){
  const m={...mission,kind:'final-maze',planetIndex:mission.world,walls:mission.rocks};
  const result=mazeMove(m,run,key);
  return {ok:result.ok,run:result.state,reason:result.reason};
 }
 const piece=run.pieces.find(x=>x.id===run.selected);
 if(!piece)return {ok:false,run,reason:'Click a space picture first.'};
 const [dx,dy]=directions[key],x=piece.x+dx,y=piece.y+dy;
 if(x<0||y<0||x>=COLS||y>=ROWS||mission.rocks.some(([rx,ry])=>rx===x&&ry===y)||
  (mission.gate&&!run.gateOpen&&mission.gate.x===x&&mission.gate.y===y)||
  run.pieces.some(other=>other.id!==piece.id&&other.x===x&&other.y===y))
  return {ok:false,run,reason:mission.gate&&!run.gateOpen&&mission.gate.x===x&&mission.gate.y===y?
    'The force field is locked! Find its magic key first.':'Blocked! Try a different arrow key.'};
 const next=clone(run),update=next.pieces.find(p=>p.id===piece.id);
 update.x=x;update.y=y;next.attempts++;
 let reason='Great movement! Keep going.';
 const collected=Array.isArray(next.collected)?next.collected:[];
 for(const pickup of mission.pickups||[]){
  if(pickup.x!==x||pickup.y!==y||collected.includes(pickup.id)||
    (pickup.piece&&pickup.piece!==piece.id))continue;
  if(mission.pickupOrder==='ordered'){
   const first=(mission.pickups||[]).find(p=>!collected.includes(p.id));
   if(first.id!==pickup.id){reason='Collect the glowing stars in number order!';continue}
  }
  collected.push(pickup.id);
  reason=pickup.name+' collected! '+collected.length+' of '+mission.pickups.length+'.';
  if(mission.kind==='key-gate'){next.gateOpen=true;reason='Magic key collected! The force field is OPEN!'}
 }
 next.collected=collected;
 if(mission.kind==='relay'){
  const current=mission.deliveryOrder[(next.delivered||[]).length];
  if(piece.id===current&&piece.goal&&x===piece.goal.x&&y===piece.goal.y){
   next.delivered.push(piece.id);next.selected=null;
   reason='Signal '+next.delivered.length+' of 3 connected! Click the NEXT highlighted space tool.';
  }
  next.complete=next.delivered.length===mission.deliveryOrder.length;
 }else{
  const allDelivered=mission.pieces.filter(p=>p.goal).every(p=>{
   const target=next.pieces.find(moved=>moved.id===p.id);
   return target.x===p.goal.x&&target.y===p.goal.y;
  });
  const allCollected=(mission.pickups||[]).every(p=>collected.includes(p.id));
  next.complete=allDelivered&&allCollected&&(!mission.gate||next.gateOpen);
  if(!next.complete&&allDelivered&&!allCollected)
   reason='Almost! Collect the glowing stars or crystals before finishing!';
 }
 return {ok:true,run:next,reason:next.complete?'Mission complete!':reason};
}
export function patrol(mission,run){
 if(mission.kind!=='maze'||run.complete)return {ok:false,run};
 const result=mazeEnemyTick({...mission,kind:'final-maze',planetIndex:mission.world,walls:mission.rocks},run);
 return {ok:result.ok,run:result.state,reason:result.reason};
}
export function finish(progress,mission){
 const next=clone(progress);
 const fresh=!next.completed.includes(mission.id);
 if(fresh)next.completed.push(mission.id);
 const gained=fresh?(mission.kind==='maze'?10:1):0;
 next.stars+=gained;next.active=null;
 const rescue=mission.kind==='maze'&&!next.rescued.includes(WORLDS[mission.world].id)&&
  next.completed.filter(id=>id.startsWith(WORLDS[mission.world].id+'-')).length===8;
 if(rescue)next.rescued.push(WORLDS[mission.world].id);
 return {progress:next,stars:gained,rescue};
}
export function purchase(progress,item){
 if(progress.purchases.includes(item.id))return {ok:false,progress,reason:'Already owned!'};
 if(progress.stars<item.price)return {ok:false,progress,reason:'Earn more stars first.'};
 const next=clone(progress);next.stars-=item.price;next.purchases.push(item.id);
 return {ok:true,progress:next,reason:'New item for My Stuff!'};
}
export function readProgress(raw){
 if(raw===null)return createProgress();
 const v=JSON.parse(raw);
 if(!v||v.version!==1||!Array.isArray(v.completed)||!Array.isArray(v.purchases)||
  !Array.isArray(v.rescued)||!Number.isSafeInteger(v.stars)||v.stars<0||
  (v.active!==null&&v.active!==undefined&&(!v.active||typeof v.active.id!=='string')))
  throw Error('This student save could not be read safely. It was NOT reset.');
 return {...createProgress(),...v};
}
