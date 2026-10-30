import test from 'node:test';
import assert from 'node:assert/strict';
import {commitSceneChange} from './scene-mutation-transaction.mjs';

const base=()=>({wallet:{rainbowStars:30},decorations:{candy:['gift']},positions:{candy:{gift:{x:20,y:40}}},completedLevelIds:['lab_candy_1']});

test('successful verified change keeps nested edits and existing progress',()=>{
 const progress=base();let saves=0;
 assert.equal(commitSceneChange({progress,fields:['wallet','positions'],change:()=>{progress.wallet.rainbowStars-=5;progress.positions.candy.gift.x=50},persist:()=>{saves++;return true}}),true);
 assert.equal(saves,1);assert.equal(progress.wallet.rainbowStars,25);assert.equal(progress.positions.candy.gift.x,50);
 assert.deepEqual(progress.completedLevelIds,['lab_candy_1']);
});
test('rejected write restores nested wallet and scene positions',()=>{
 const progress=base();let rollbacks=0;
 assert.equal(commitSceneChange({progress,fields:['wallet','positions'],change:()=>{progress.wallet.rainbowStars-=5;progress.positions.candy.gift.x=90},persist:()=>false,onRollback:()=>rollbacks++}),false);
 assert.equal(progress.wallet.rainbowStars,30);assert.equal(progress.positions.candy.gift.x,20);assert.equal(rollbacks,1);
});
test('partially mutated invalid action returning false is fully rolled back',()=>{
 const progress=base();let saves=0;
 assert.equal(commitSceneChange({progress,fields:['decorations'],change:()=>{progress.decorations.candy.push('unowned');return false},persist:()=>{saves++;return true}}),false);
 assert.deepEqual(progress.decorations.candy,['gift']);assert.equal(saves,0);
});
test('throwing action is rolled back without attempting a write',()=>{
 const progress=base();let saves=0;
 assert.equal(commitSceneChange({progress,fields:['wallet'],change:()=>{progress.wallet.rainbowStars=0;throw Error('invalid placement')},persist:()=>{saves++;return true}}),false);
 assert.equal(progress.wallet.rainbowStars,30);assert.equal(saves,0);
});
test('throwing storage write rolls back the entire scene change',()=>{
 const progress=base();
 assert.equal(commitSceneChange({progress,fields:['wallet','decorations'],change:()=>{progress.wallet.rainbowStars=0;progress.decorations.candy=[]},persist:()=>{throw Error('QuotaExceededError')}}),false);
 assert.deepEqual(progress,base());
});
test('new fields are deleted on rejected writes and unrelated saves remain intact',()=>{
 const progress=base();
 assert.equal(commitSceneChange({progress,fields:['hiddenCompanions'],change:()=>{progress.hiddenCompanions=['parrot']},persist:()=>false}),false);
 assert.equal('hiddenCompanions' in progress,false);assert.deepEqual(progress.completedLevelIds,['lab_candy_1']);
});
test('successful falsey non-true persist result is not treated as durable',()=>{
 const progress=base();
 assert.equal(commitSceneChange({progress,fields:['wallet'],change:()=>{progress.wallet.rainbowStars=1},persist:()=>undefined}),false);
 assert.equal(progress.wallet.rainbowStars,30);
});
test('invalid inputs cannot alter student progress',()=>{
 const progress=base();
 assert.equal(commitSceneChange({progress,fields:null,change:()=>{progress.wallet.rainbowStars=0},persist:()=>true}),false);
 assert.equal(progress.wallet.rainbowStars,30);
});
