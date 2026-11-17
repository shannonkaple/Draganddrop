import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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


function anyOrderPermutations(items){
 if(!items.length)return [[]];
 return items.flatMap((item,i)=>anyOrderPermutations(items.filter((_,j)=>j!==i))
  .map(rest=>[item,...rest]));
}
test('all eight space relay missions work in every one of the six object orders',()=>{
 for(let world=0;world<8;world++){
  const mission=Array.from({length:7},(_,i)=>createMission(world,i)).find(m=>m.kind==='relay');
  for(const order of anyOrderPermutations(mission.pieces.map(p=>p.id))){
   let run=startRun(mission);
   for(const id of order){
    const selected=select(mission,run,id);
    assert.equal(selected.ok,true,mission.id+' must allow selecting '+id);
    run=selected.run;
    const destination=run.pieces.find(p=>p.id===id).goal;
    const route=plan(mission,run,id,destination);
    assert.notEqual(route,null,mission.id+' order '+order.join(',')+' blocked '+id);
    for(const key of route){const step=move(mission,run,key);
     assert.equal(step.ok,true,mission.id+' order '+order.join(',')+' move '+key);
     run=step.run}
    assert.ok(run.delivered.includes(id),mission.id+' failed to save docked '+id);
   }
   assert.equal(run.complete,true,mission.id+' could not finish order '+order.join(','));
  }
 }
});
test('all eight force-field missions allow satellite first OR rover first',()=>{
 for(let world=0;world<8;world++){
  const mission=Array.from({length:7},(_,i)=>createMission(world,i)).find(m=>m.kind==='key-gate');
  for(const order of [['keyboard','mouse'],['mouse','keyboard']]){
   let run=startRun(mission);
   for(const id of order){
    const picked=select(mission,run,id);
    assert.equal(picked.ok,true,mission.id+' must allow '+id+' first');
    run=picked.run;
    const piece=run.pieces.find(p=>p.id===id);
    const checkpoints=[...mission.pickups.filter(p=>
      (!p.piece||p.piece===id)&&!run.collected.includes(p.id)),piece.goal];
    for(const point of checkpoints){
     const route=plan(mission,run,id,point);
     assert.notEqual(route,null,mission.id+' '+id+' cannot reach '+(point.id||'dock'));
     for(const key of route){const result=move(mission,run,key);
      assert.equal(result.ok,true,mission.id+' '+id+' blocked on '+key);
      run=result.run}
    }
   }
   assert.equal(run.gateOpen,true,mission.id+' key did not open gate');
   assert.equal(run.complete,true,mission.id+' cannot finish in order '+order.join(','));
  }
 }
});

test('L/T cargo and satellite have separate visible positions in all 8 worlds and bonus levels',()=>{
 const rectanglesOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 let checked=0;
 for(let world=0;world<8;world++)for(let stage=0;stage<16;stage++){
  const m=createMission(world,stage);
  if(m.kind!=='relay')continue;
  checked++;
  assert.equal(m.mechanicVersion,9,m.id+' must restart only its old overlapping active puzzle');
  assert.equal(m.rocks.length,0,m.id+' must not have unnecessary picture-covering blocks');
  const starts=m.pieces.map(p=>({id:p.id,x:p.x,y:p.y,w:p.w,h:p.h}));
  const goals=m.pieces.map(p=>({id:p.id,x:p.goal.x,y:p.goal.y,w:p.w,h:p.h}));
  assert.equal(m.pieces.length,3,m.id+' must show L, T and satellite');
  assert.ok(m.pieces.some(p=>p.shape==='L')&&m.pieces.some(p=>p.shape==='T'));
  assert.ok(m.pieces.some(p=>p.name==='Space Satellite'));
  for(const set of [starts,goals])for(let i=0;i<set.length;i++)for(let j=i+1;j<set.length;j++)
   assert.equal(rectanglesOverlap(set[i],set[j]),false,m.id+
    ' overlapping images: '+set[i].id+' and '+set[j].id);
  for(const p of m.pieces){
   const selected=select(m,startRun(m),p.id);
   assert.equal(selected.ok,true,m.id+' should allow selecting '+p.id);
   assert.notEqual(plan(m,selected.run,p.id,p.goal),null,
    m.id+' should have a path to the '+p.id+' faded image');
  }
 }
 assert.equal(checked,17,'every world and bonus version of the relay challenge was checked');
});
test('first-grade faded target pictures are clearly visible instead of almost transparent',()=>{
 const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
 assert.match(css,/FIRST-GRADE VISIBILITY/);
 assert.match(css,/\.game-board \.goal-dock \.goal-picture\{\s*opacity:\.86/);
 assert.match(css,/\.game-board \.goal\.shape-match \.goal-picture\{\s*opacity:\.86/);
 assert.match(css,/\.game-board \.goal-dock\.dock-green \.goal-picture,\.game-board \.goal-dock\.dock-blue \.goal-picture\{\s*opacity:\.88/);
});
