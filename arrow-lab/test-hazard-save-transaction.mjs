// Run: node arrow-lab/test-hazard-save-transaction.mjs
import assert from 'node:assert/strict';
import {advanceHazardsSafely} from './hazard-save-transaction.mjs';
const sample = () => ({
  id:'lab_candy_1', start:{x:1,y:1},player:{x:2,y:1},
  checkpoint:{x:2,y:1},trail:[[1,1],[2,1]],steps:4,
  items:[{id:'cupcake',collected:true}],
  hazards:[
    {index:0,warning:true,path:[{x:3,y:1},{x:2,y:1}]},
    {index:0,warning:true,path:[{x:5,y:5},{x:6,y:5}]}
  ]
});
{
  const run=sample(), result=advanceHazardsSafely(run,()=>true);
  assert.deepEqual(result,{saved:true,collision:true});
  assert.deepEqual(run.hazards.map(h=>h.index),[1,1]);
  assert.deepEqual(run.player,run.start);
  assert.deepEqual(run.checkpoint,run.start);
  assert.deepEqual(run.trail,[[1,1]]);
}
{
  const run=sample(), original=structuredClone(run);
  const result=advanceHazardsSafely(run,()=>false);
  assert.deepEqual(result,{saved:false,collision:false});
  assert.deepEqual(run,original,'failed collision must restore patrol and route');
}
{
  const run=sample(), original=structuredClone(run);
  const result=advanceHazardsSafely(run,()=>{throw Error('QuotaExceededError')});
  assert.equal(result.saved,false);
  assert.deepEqual(run,original,'thrown write must restore every field');
}
{
  const run=sample();run.player={x:8,y:8};
  const result=advanceHazardsSafely(run,()=>true);
  assert.deepEqual(result,{saved:true,collision:false});
  assert.deepEqual(run.player,{x:8,y:8});
  assert.deepEqual(run.hazards.map(h=>h.index),[1,1]);
  assert.equal(run.steps,4);
  assert.equal(run.items[0].collected,true);
}
{
  const run=sample();run.player={x:8,y:8};
  const original=structuredClone(run);
  assert.equal(advanceHazardsSafely(run,()=>false).saved,false);
  assert.deepEqual(run,original,'failed noncollision movement must also roll back');
}
{
  const run=sample();run.player={x:8,y:8};
  delete run.hazards[0].warning;
  const result=advanceHazardsSafely(run,()=>true);
  assert.equal(result.saved,true);
  assert.equal(run.hazards[0].index,0,'unwarned patrol stays still');
  assert.equal(Object.hasOwn(run.hazards[0],'warning'),false);
}
console.log('PASS: six enemy patrol save, collision and rollback regressions');
