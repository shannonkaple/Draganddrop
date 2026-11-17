import test from 'node:test';
import assert from 'node:assert/strict';
import {commitWorldView} from './world-view-transaction.mjs';
const make=()=>({collectionWorldId:'background_candy',primaryRainbowLandId:'background_candy',wallet:{rainbowStars:14},mazeRuns:{lab_candy_2:{player:{x:4,y:5}}},decorations:{background_candy:['shop_candy_sweet_tree']},positions:{background_candy:{item:{x:23,y:61}}}});
test('successful world switch persists both selection fields without altering progress',()=>{
 const p=make();let calls=0;const before=structuredClone(p);
 assert.equal(commitWorldView({progress:p,worldId:'background_pirate',persist:()=>{calls++;return true}}),true);
 assert.equal(calls,1);assert.equal(p.collectionWorldId,'background_pirate');assert.equal(p.primaryRainbowLandId,'background_pirate');
 for(const k of ['wallet','mazeRuns','decorations','positions'])assert.deepEqual(p[k],before[k]);
});
test('silent failed write restores prior world and all progress',()=>{
 const p=make(),before=structuredClone(p);
 assert.equal(commitWorldView({progress:p,worldId:'background_pirate',persist:()=>false}),false);
 assert.deepEqual(p,before);
});
test('throwing storage write restores missing fields without inventing saved IDs',()=>{
 const p=make();delete p.collectionWorldId;const before=structuredClone(p);
 assert.equal(commitWorldView({progress:p,worldId:'background_arctic',persist:()=>{throw Error('QuotaExceededError')}}),false);
 assert.deepEqual(p,before);assert.equal(Object.hasOwn(p,'collectionWorldId'),false);
});
test('already-selected world causes no extra write',()=>{
 const p=make();let calls=0;
 assert.equal(commitWorldView({progress:p,worldId:'background_candy',persist:()=>{calls++;return false}}),true);
 assert.equal(calls,0);
});
test('decorations-only world switch restores primary world on failed write',()=>{
 const p=make(),before=structuredClone(p);
 assert.equal(commitWorldView({progress:p,worldId:'background_lava',fields:['primaryRainbowLandId'],persist:()=>false}),false);
 assert.deepEqual(p,before);
});
test('invalid input cannot mutate saved world',()=>{
 const p=make(),before=structuredClone(p);
 assert.equal(commitWorldView({progress:p,worldId:'background_space',fields:['wallet'],persist:()=>true}),false);
 assert.deepEqual(p,before);
});
