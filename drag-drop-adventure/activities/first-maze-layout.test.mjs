import test from 'node:test';
import assert from 'node:assert/strict';
import {firstMazeLayout,boxesOverlap} from './first-maze-layout.mjs';

function sweeps(from,to,box,radius=23){
 let low=0,high=1;
 for(const axis of ['x','y']){
  const delta=to[axis]-from[axis],size=axis==='x'?'w':'h';
  const min=box[axis]-radius,max=box[axis]+box[size]+radius;
  if(Math.abs(delta)<1e-8){if(from[axis]<min||from[axis]>max)return false;continue}
  const a=(min-from[axis])/delta,b=(max-from[axis])/delta;
  low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));
  if(low>high)return false;
 }
 return true;
}
function envelope(h){
 const bounds={...h};
 if(h.motion?.axis==='x'){bounds.x-=h.motion.range;bounds.w+=2*h.motion.range}
 if(h.motion?.axis==='y'){bounds.y-=h.motion.range;bounds.h+=2*h.motion.range}
 return bounds;
}
const art=[{name:'World Enemy A',image:'enemy_a.png'},{name:'World Enemy B',image:'enemy_b.png'}];
test('all eight stage-one worlds use different wall positions',()=>{
 const signatures=new Set();
 for(let world=0;world<8;world++){
  const l=firstMazeLayout(world,art);
  assert.equal(l.walls.length,2);
  signatures.add(JSON.stringify(l.walls));
 }
 assert.equal(signatures.size,8);
});
test('first Candy maze is enemy-free',()=>assert.equal(firstMazeLayout(0,art).hazards.length,0));
for(let world=0;world<8;world++){
 test('world '+world+' has clear moving enemies and a traversable sample route',()=>{
  const l=firstMazeLayout(world,art);
  for(const h of l.hazards)for(const w of l.walls)
   assert.equal(boxesOverlap(envelope(h),w),false,'moving enemy touches a wall');
  for(let k=1;k<l.solution.length;k++){
   for(const barrier of [...l.walls,...l.hazards.map(envelope)])
    assert.equal(sweeps(l.solution[k-1],l.solution[k],barrier),false,'hint route crosses barrier');
  }
  assert.ok(l.solution[0].x<130&&l.solution.at(-1).x>850);
 });
}
