import test from 'node:test';
import assert from 'node:assert/strict';
import {allMissions,createProgress,PLANETS,WORLD_ORDERS,createMission} from './curriculum.mjs';
import {initialMission,selectObject,arrowAction,resizeByHandle,validPosition,goalMet,mazeEnemyTick,finishMission} from './mechanics.mjs';

const DIRS=[['ArrowRight',1,0],['ArrowLeft',-1,0],['ArrowDown',0,1],['ArrowUp',0,-1]];
function planPiece(mission,run,id){
 const start=run.pieces.find(p=>p.id===id),goal=start.goal,pickups=mission.pickups||[];
 const completeMask=(1<<pickups.length)-1;
 const startMask=pickups.reduce((acc,p,i)=>acc|((run.collected||[]).includes(p.id)?1<<i:0),0);
 const key=node=>[node.p.x,node.p.y,node.p.w,node.p.h,node.mask].join(',');
 const nodes=[{p:start,mask:startMask,parent:-1,action:null}],seen=new Set([key(nodes[0])]);
 for(let i=0;i<nodes.length&&i<30000;i++){
  const node=nodes[i],p=node.p;
  if(p.x===goal.x&&p.y===goal.y&&(goal.w===undefined||p.w===goal.w)&&(goal.h===undefined||p.h===goal.h)&&node.mask===completeMask){
   const actions=[];let current=i;
   while(current>0){actions.unshift(nodes[current].action);current=nodes[current].parent}
   return actions;
  }
  const choices=DIRS.map(([key,dx,dy])=>({p:{...p,x:p.x+dx,y:p.y+dy},action:{kind:'move',key}}));
  if(p.resize){
   for(const delta of [-1,1]){
    choices.push({p:{...p,w:p.w+delta},action:{kind:'resize',handle:'e',dx:delta,dy:0}});
    choices.push({p:{...p,h:p.h+delta},action:{kind:'resize',handle:'s',dx:0,dy:delta}});
   }
  }
  for(const item of choices){
   const next=item.p;if(next.w<1||next.h<1)continue;
   const positions=run.pieces.map(p=>p.id===id?next:p);
   if(!validPosition(mission,positions,id))continue;
   let mask=node.mask;
   if(item.action.kind==='move'){
    for(let j=0;j<pickups.length;j++)
     if(next.x===pickups[j].x&&next.y===pickups[j].y)mask|=1<<j;
   }
   const candidate={p:next,mask,parent:i,action:item.action};
   if(seen.has(key(candidate)))continue;
   seen.add(key(candidate));nodes.push(candidate);
  }
 }
 return null;
}
function permutations(arr){
 if(arr.length<2)return [arr];
 return arr.flatMap((item,i)=>permutations(arr.filter((_,j)=>j!==i)).map(rest=>[item,...rest]));
}
function solveNormal(mission){
 for(const order of permutations(mission.pieces.filter(p=>p.goal).map(p=>p.id))){
  let run=initialMission(mission),valid=true;
  for(const id of order){
   const actions=planPiece(mission,run,id);
   if(!actions){valid=false;break}
   const selected=selectObject(mission,run,id);
   if(!selected.ok){valid=false;break}run=selected.state;
   for(const a of actions){
    const outcome=a.kind==='move'?arrowAction(mission,run,a.key):
      resizeByHandle(mission,run,id,a.handle,a.dx,a.dy);
    if(!outcome.ok){valid=false;break}
    run=outcome.state;
   }
   if(!valid||!goalMet(run.pieces.find(p=>p.id===id))){valid=false;break}
  }
  if(valid&&run.complete)return run;
 }
 return null;
}
test('all 64 Arrow-Naut missions are actually beatable using clicking, arrows, and trackpad resize handles',()=>{
 const missions=allMissions();
 assert.equal(missions.length,64);
 assert.equal(new Set(missions.map(m=>m.id)).size,64);
 for(const mission of missions){
  if(mission.kind==='click'){
   const result=selectObject(mission,initialMission(mission),mission.clickTarget);
   assert.equal(result.ok,true,mission.id);assert.equal(result.state.complete,true,mission.id);
  }else if(mission.kind==='final-maze'){
   const path=[...mission.safeRoute].reverse().map(s=>s.split(',').map(Number));
   for(let phase=0;phase<5;phase++){
    let run=initialMission(mission);
    for(let i=0;i<phase;i++)run=mazeEnemyTick(mission,run).state;
    for(let i=1;i<path.length;i++){
     const [ax,ay]=path[i-1],[bx,by]=path[i];
     const key=bx>ax?'ArrowRight':bx<ax?'ArrowLeft':by>ay?'ArrowDown':'ArrowUp';
     const result=arrowAction(mission,run,key);
     assert.equal(result.ok,true,mission.id+' step '+i);
     run=result.state;
     if(!run.complete)run=mazeEnemyTick(mission,run).state;
    }
    assert.equal(run.complete,true,mission.id+' boss must be escapable');
    assert.equal(run.maze.hits,0,'no forced enemy collisions in '+mission.id);
   }
  }else{
   const result=solveNormal(mission);
   assert.ok(result,mission.id+' has no playable route to the required goals and collectibles');
  }
 }
});
test('eight world mission orders differ, final maze always gates progress, and earned stars cannot be farmed',()=>{
 assert.equal(new Set(WORLD_ORDERS.map(p=>p.join(','))).size,8);
 for(let planet=0;planet<8;planet++){
  const p=PLANETS[planet],final=createMission(planet,7);
  assert.equal(final.kind,'final-maze');
  assert.equal(final.id,p.id+'-8');
  let progress=createProgress();
  const regular=createMission(planet,0);
  let result=finishMission(progress,regular);
  assert.equal(result.stars,1);
  result=finishMission(result.progress,regular);
  assert.equal(result.stars,0);
  result=finishMission(result.progress,final);
  assert.equal(result.stars,10);
  result=finishMission(result.progress,final);
  assert.equal(result.stars,0);
 }
});
