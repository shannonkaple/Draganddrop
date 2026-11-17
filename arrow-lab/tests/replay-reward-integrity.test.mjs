// Run: node --test arrow-lab/tests/replay-reward-integrity.test.mjs
// Replaying a completed maze must never mint duplicate Rainbow Stars.
import test from 'node:test';
import assert from 'node:assert/strict';
import {completeLevel} from '../adventure-core.mjs';

const config={progression:{starRewards:{completion:5,itemCollection:2,skillChallenge:3}}};
const level={id:'lab_candy_1',number:1};
const newRun=()=>({rewarded:false,items:[{collected:true},{collected:true}],skill:{done:true}});
const student=()=>({
 wallet:{rainbowStars:17},lifetimeStarsEarned:43,mazesSinceRescue:1,
 completedLevelIds:[],highestUnlockedLevel:1,
 ownedWorldIds:['background_candy','background_pirate'],
 positions:{background_candy:{'decor:candy_lollipop':{x:31,y:49}}},
 worldFriends:{candy:{homeLandId:'background_candy'}}
});

test('first completion grants exactly one reward and unlocks next level',()=>{
 const a=student(),run=newRun();
 assert.equal(completeLevel(a,run,level,config),10);
 assert.equal(run.rewarded,true);
 assert.equal(a.wallet.rainbowStars,27);
 assert.equal(a.lifetimeStarsEarned,53);
 assert.deepEqual(a.completedLevelIds,[level.id]);
 assert.equal(a.highestUnlockedLevel,2);
 assert.equal(completeLevel(a,run,level,config),0);
 assert.equal(a.wallet.rainbowStars,27);
});

test('fresh replay run of already completed maze grants zero stars and preserves student data',()=>{
 const a=student();
 a.completedLevelIds=[level.id];
 a.highestUnlockedLevel=9;
 const before=structuredClone(a);
 const replay=newRun();
 assert.equal(completeLevel(a,replay,level,config),0);
 assert.equal(replay.rewarded,true);
 assert.deepEqual(a,before);
});

test('older saved completion without rewarded flag is not paid again',()=>{
 const a=student();
 a.completedLevelIds=[level.id];
 const run={...newRun()};
 delete run.rewarded;
 const before=structuredClone(a);
 assert.equal(completeLevel(a,run,level,config),0);
 assert.equal(run.rewarded,true);
 assert.deepEqual(a,before);
});
