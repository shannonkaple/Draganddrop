import test from 'node:test';
import assert from 'node:assert/strict';
import {COLS,ROWS,createMission,allMissions} from './curriculum.mjs';
import {startRun,select,move,patrol} from './engine.mjs';
const directions=[['ArrowRight',1,0],['ArrowLeft',-1,0],['ArrowDown',0,1],['ArrowUp',0,-1]];
const key=(x,y)=>x+','+y;
function cells(p,x=p.x,y=p.y){
 const rel=p.shape==='L'?[[0,0],[0,1],[0,2],[1,2]]:
  p.shape==='T'?[[0,0],[1,0],[2,0],[1,1],[1,2]]:
  Array.from({length:p.w||1},(_,i)=>Array.from({length:p.h||1},(_,j)=>[i,j])).flat();
 return rel.map(([a,b])=>[a+x,b+y]);
}
function plan(m,run,id,goal){
 const piece=run.pieces.find(p=>p.id===id);
 const obstacles=new Set(m.rocks.map(v=>key(...v)));
 if(m.gate&&!run.gateOpen)obstacles.add(key(m.gate.x,m.gate.y));
 for(const other of run.pieces.filter(p=>p.id!==id))
  for(const cell of cells(other))obstacles.add(key(...cell));
 const begin=key(piece.x,piece.y),target=key(goal.x,goal.y);
 const seen=new Map([[begin,null]]),queue=[[piece.x,piece.y]];
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];if(key(x,y)===target)break;
  for(const [button,dx,dy] of directions){
   const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(seen.has(k))continue;
   if(cells(piece,nx,ny).some(([xx,yy])=>
      xx<0||yy<0||xx>=COLS||yy>=ROWS||obstacles.has(key(xx,yy))))continue;
   seen.set(k,{last:key(x,y),button});queue.push([nx,ny]);
  }
 }
 if(!seen.has(target))return null;
 const moves=[];let current=target;
 while(current!==begin){const step=seen.get(current);moves.unshift(step.button);current=step.last}
 return moves;
}
test('all 64 first-grade games finish with real arrow movement and space cargo fitting',()=>{
 // Keep the solvability proof independent from randomized collisions; actual
 // enemy hazards are exercised separately by the game mechanics tests.
 const savedRandom=Math.random;Math.random=()=>0;
 try{
 const missions=allMissions();assert.equal(missions.length,64);
 for(const mission of missions){
  let run=startRun(mission);
  if(mission.kind==='click'){
   const clicked=select(mission,run,mission.target);
   assert.equal(clicked.ok,true);assert.equal(clicked.run.complete,true);
   continue;
  }
  if(mission.kind==='maze'){
   run=select(mission,run,'explorer').run;
   const route=[...mission.safeRoute].reverse().map(v=>v.split(',').map(Number));
   for(let i=1;i<route.length;i++){
    const [x,y]=route[i-1],[nx,ny]=route[i];
    const button=nx>x?'ArrowRight':nx<x?'ArrowLeft':ny>y?'ArrowDown':'ArrowUp';
    const step=move(mission,run,button);assert.equal(step.ok,true,mission.id);
    run=step.run;if(!run.complete)run=patrol(mission,run).run;
   }
  }else{
   const order=mission.kind==='relay'?mission.deliveryOrder:
     mission.pieces.filter(p=>p.goal).map(p=>p.id);
   for(const id of order){
    const picked=select(mission,run,id);
    assert.equal(picked.ok,true,mission.id+' select '+id);
    run=picked.run;
    const goal=run.pieces.find(p=>p.id===id).goal;
    for(const waypoint of [...(mission.pickups||[]).filter(p=>!p.piece||p.piece===id),goal]){
     if(!waypoint)continue;
     const steps=plan(mission,run,id,waypoint);
     assert.ok(steps!==null,mission.id+' '+id+' cannot reach '+key(waypoint.x,waypoint.y));
     for(const button of steps){
      const step=move(mission,run,button);
      assert.equal(step.ok,true,mission.id+' blocked '+button);
      run=step.run;
     }
    }
   }
  }
  assert.equal(run.complete,true,mission.id+' failed to complete');
 }
 }finally{Math.random=savedRandom;}
});
test('every moving game demands horizontal AND vertical arrow control',()=>{
 for(let world=0;world<8;world++)for(let stage=1;stage<=6;stage++){
  const mission=createMission(world,stage);
  for(const p of mission.pieces.filter(p=>p.goal)){
   const stops=[...(mission.pickups||[]).filter(v=>!v.piece||v.piece===p.id),p.goal];
   assert.ok(stops.some(v=>v.x!==p.x),mission.id+' no horizontal arrows');
   assert.ok(stops.some(v=>v.y!==p.y),mission.id+' no vertical arrows');
  }
 }
});
test('large cargo must occupy its exact shape, cannot resize or pass other shapes',()=>{
 for(let w=0;w<8;w++){
  for(const activity of [3,6]){
   const m=Array.from({length:7},(_,i)=>createMission(w,i)).find(m=>m.activity===activity);
   const l=m.pieces.find(p=>p.shape==='L'),t=m.pieces.find(p=>p.shape==='T');
   assert.ok(l&&t,m.id+' needs both silhouette types');
   assert.equal(l.w,2);assert.equal(l.h,3);
   assert.equal(t.w,3);assert.equal(t.h,3);
   assert.ok(l.img.endsWith('.png')&&t.img.endsWith('.png'));
   assert.ok(!('resize' in l)&&!('resize' in t));
  }
 }
});
