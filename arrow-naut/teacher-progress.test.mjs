/** Student-safe teacher override tests: no counterfeit stars, awards, or rescues. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgress,PLANETS,planetUnlocked,stageUnlocked} from './curriculum.mjs';
import {mapTwoWorldUnlocked,mapTwoStageUnlocked} from './map-two.mjs';
import {teacherCanOpen,teacherThrough,grantTeacherLevel,levelIndex} from './teacher-progress.mjs';
import {earnedCharacterChoices,earnedCharacterPortrait,PLAYERS,FRIEND_SPRITES} from './sprite-assets.mjs';
test('teacher unlocks a target Map One level and all earlier levels without granting rewards',()=>{
 const before=createProgress();
 const after=grantTeacherLevel(before,{map:'one',world:3,stage:4});
 assert.equal(teacherThrough(after),28);
 for(let world=0;world<8;world++)for(let stage=0;stage<8;stage++)
  if(world*8+stage<=28)assert.equal(stageUnlocked(after,world,stage),true,world+':'+stage);
 assert.equal(planetUnlocked(after,4),false);
 assert.equal(stageUnlocked(after,3,5),false);
 assert.deepEqual(after.completed,[]);
 assert.deepEqual(after.rescued,[]);
 assert.deepEqual(after.purchases,[]);
 assert.equal(after.stars,0);
 assert.deepEqual(before,createProgress());
});
test('Map Two access allows previous worlds but does not mark Map One complete',()=>{
 const after=grantTeacherLevel(createProgress(),{map:'two',world:1,stage:3});
 assert.equal(after.teacherUnlockThrough,75);
 assert.equal(PLANETS.every((_,i)=>stageUnlocked(after,i,7)),true);
 for(let stage=0;stage<=3;stage++)assert.equal(mapTwoStageUnlocked(after,1,stage),true);
 assert.equal(mapTwoStageUnlocked(after,1,4),false);
 assert.equal(mapTwoWorldUnlocked(after,1),true);
 assert.equal(after.completed.length,0);
 assert.equal(after.mapTwo,undefined);
});
test('teacher cannot grant unbuilt world or backwards-lock already unlocked levels',()=>{
 assert.throws(()=>grantTeacherLevel(createProgress(),{map:'two',world:2,stage:0}),/not have playable/);
 let p=grantTeacherLevel(createProgress(),{map:'one',world:6,stage:2});
 p=grantTeacherLevel(p,{map:'one',world:1,stage:0});
 assert.equal(teacherThrough(p),50);
 assert.equal(teacherCanOpen(p,'one',6,2),true);
 assert.equal(levelIndex('two',0,0),64);
});
test('students may only select the starter and friends actually rescued',()=>{
 const p=createProgress();
 assert.deepEqual(earnedCharacterChoices(p).map(c=>c.id),['astro-pup']);
 p.playerId='comet-fox'; // A legacy freely switched portrait is NOT ownership.
 assert.equal(earnedCharacterPortrait(p),PLAYERS[0].image);
 p.rescued=['launch','crystal'];
 p.mapTwo={rescued:['lost-aurora']};
 const ids=earnedCharacterChoices(p).map(x=>x.id);
 assert.deepEqual(ids,['astro-pup','friend:launch','friend:crystal','lostfriend:lost-aurora']);
 p.playerId='friend:launch';
 assert.equal(earnedCharacterPortrait(p),FRIEND_SPRITES[0]);
});
