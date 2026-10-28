// Run: node arrow-lab/test-world-stop-resume.mjs
// Regression: legacy student saves may contain only activeRun, not mazeRuns.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {worldStopStatus,worldStopModels,WORLD_STOP_POINTS} from './level-map-model.mjs';
const level={id:'lab_candy_2',number:2};
const saved={highestUnlockedLevel:3,completedLevelIds:[],mazeRuns:{},activeRun:{id:level.id,complete:false,player:{x:4,y:3}}};
assert.equal(worldStopStatus(level,saved).started,true,'legacy activeRun is in progress');
assert.equal(worldStopStatus(level,saved).label,'In progress — continue');
assert.equal(worldStopStatus(level,{...saved,activeRun:{id:level.id,complete:true}}).started,false,'completed active run is not in progress');
assert.equal(worldStopStatus(level,{...saved,completedLevelIds:[level.id]}).started,false,'completed level takes precedence');
assert.equal(worldStopStatus(level,{...saved,activeRun:null,mazeRuns:{[level.id]:{complete:false}}}).started,true,'per-level save is in progress');
assert.equal(worldStopStatus({id:'lab_candy_3',number:3},saved).started,false,'other level is unaffected');
const levels=Array.from({length:64},(_,i)=>({id:'lab_'+(i+1),number:i+1}));
const active={...saved,activeRun:{id:'lab_2',complete:false}};
const candy=worldStopModels(0,levels,active);
assert.equal(candy.length,8);
assert.equal(candy[1].started,true);
assert.deepEqual(candy.map(p=>p.position),WORLD_STOP_POINTS);
const src=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
assert.match(src,/worldStopModels\(0,levels,a\)\.map\(\(p,k\)=>/,'Candy uses shared map model');
assert.match(src,/const l=p\.level,done=p\.completed,started=p\.started,unlocked=p\.unlocked/,'Candy uses resumed status');
console.log('PASS: legacy activeRun progress visible on Candy and all world maps; completed state protected');
