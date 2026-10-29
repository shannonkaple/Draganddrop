import assert from 'node:assert/strict';
import {makeLevel,WORLD_IDS,validateLevel} from './levels.mjs';
import {ACTIVITY_TYPES,ENGINES,stateFor,tryPlacement,targetsFor,progressFor,swept,positionAt,motionCollision,overlaps} from './engines.mjs';
const items=Array.from({length:10},(_,i)=>({id:'art-'+i,name:'Approved art '+i,image:'art-'+i+'.png'}));
const enemies=[{name:'Bad guy',image:'enemy.png'},{name:'Other bad guy',image:'enemy2.png'}];
let checked=0;
for(let wi=0;wi<8;wi++)for(let ai=0;ai<8;ai++){
 const level=makeLevel({id:'lab_'+WORLD_IDS[wi]+'_'+(ai+1),worldIndex:wi,worldStage:ai+1},{items,enemies,background:'background.jpg'});
 assert.equal(level.engine,ACTIVITY_TYPES[ai]);validateLevel(level);
 const state=stateFor(level);let iterations=0;
 if(level.engine!=='maze'){
  const bad=targetsFor(level,state).find(t=>!t.accept.includes(level.pieces[0].key));
  if(bad){const before=JSON.stringify(state);assert.equal(tryPlacement(level,state,level.pieces[0].id,bad.id).ok,false);assert.equal(JSON.stringify(state),before)}
 }
 while(!state.complete&&iterations++<40){
  const targets=targetsFor(level,state),p=level.pieces.find(p=>level.engine==='pattern'?targets.some(t=>!state.roundPlaced[t.id]&&t.accept.includes(p.key)):!state.placed[p.id]);
  const t=targets.find(t=>t.accept.includes(p.key)&&(level.engine==='pattern'?!state.roundPlaced[t.id]:t.capacity===0||!Object.values(state.placed).includes(t.id)));
  assert(t,'solvable '+level.id);assert(tryPlacement(level,state,p.id,t.id).ok);
  if(!state.complete)assert.deepEqual(stateFor(level,JSON.parse(JSON.stringify(state))),state);
 }
 assert(state.complete,level.id);const prior=JSON.stringify(state);assert.equal(tryPlacement(level,state,level.pieces[0].id,targetsFor(level,state)[0].id).ok,false);assert.equal(JSON.stringify(state),prior);
 if(level.engine==='maze'){
  const p=level.pieces[0];assert(ENGINES.maze.blocked(level,{x:p.x,y:p.y},{x:950,y:490},p,[]));
  // Grid search proves a connected route with the full-token collision radius.
  const start={x:100,y:120},end=level.targets[0],queue=[start],seen=new Set();let reachable=false;
  for(let j=0;j<queue.length;j++){
   const at=queue[j],key=at.x+','+at.y;if(seen.has(key))continue;seen.add(key);
   if(at.x>end.x&&at.y>end.y&&at.x<end.x+end.w&&at.y<end.y+end.h){reachable=true;break}
   for(const [dx,dy] of [[20,0],[-20,0],[0,20],[0,-20]]){const next={x:at.x+dx,y:at.y+dy};if(!ENGINES.maze.blocked(level,at,next,p,level.hazards))queue.push(next)}
  }
  assert(reachable,'maze reachable '+wi);
 }
 if(level.engine==='pack')for(let a=0;a<level.targets.length;a++)for(let b=a+1;b<level.targets.length;b++)assert(!overlaps(level.targets[a],level.targets[b]));
 if(level.engine==='deliver')for(const target of level.targets){assert.deepEqual(positionAt(target,1000,false),target);assert.notDeepEqual(positionAt(target,1000,true),target);for(let t=0;t<10000;t+=100){const p=positionAt(target,t,true);assert(p.x>=0&&p.x+p.w<=1000&&p.y>=0&&p.y+p.h<=600)}}
 checked++;
}
assert(swept({x:0,y:50},{x:1000,y:50},{x:400,y:0,w:50,h:100},20));
assert(motionCollision({x:150,y:50},{x:0,y:0,w:50,h:100},{x:200,y:0,w:50,h:100},10));
assert(!motionCollision({x:150,y:300},{x:0,y:0,w:50,h:100},{x:200,y:0,w:50,h:100},10));
assert.throws(()=>makeLevel({id:'bad',worldIndex:0,worldStage:1},{items:[{image:'shape.svg'}],enemies,background:'bg.jpg'}));
console.log('PASS: '+checked+' configurations; wrong drops, all completions, save/resume, maze reachability, packing geometry, all 5 patterns, motion bounds, swept collisions, reduced motion, raster-only collectibles.');
