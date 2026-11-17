import assert from 'node:assert/strict';
import {isResumableRun,nextPlayableLevel,worldStopStatus} from './level-map-model.mjs';
const levels=Array.from({length:8},(_,i)=>({id:'lab_candy_'+(i+1),number:i+1}));
const good={id:levels[1].id,w:7,h:5,grid:Array.from({length:5},()=>Array(7).fill(0)),items:[],hazards:[],player:{x:1,y:1},complete:false};
const base={highestUnlockedLevel:3,completedLevelIds:['lab_candy_1'],mazeRuns:{[good.id]:structuredClone(good)}};
assert.equal(isResumableRun(levels[1],good),true);
assert.equal(worldStopStatus(levels[1],base).started,true);
assert.equal(nextPlayableLevel(levels,base).id,good.id);
assert.equal(worldStopStatus(levels[0],base).completed,true);
for(const bad of [{...good,id:'lab_pirate_2'},{...good,grid:[[0]]},{...good,grid:[...good.grid.slice(0,4),[0]]},{...good,items:null},{...good,hazards:null},{...good,player:{x:100,y:1}},{...good,complete:true},{...good,w:7.5}]){
 const state={...base,mazeRuns:{[good.id]:bad}};
 assert.equal(isResumableRun(levels[1],bad),false);
 assert.equal(worldStopStatus(levels[1],state).started,false);
 assert.equal(nextPlayableLevel(levels,state).id,levels[1].id);
}
const stale={...base,mazeRuns:{},activeRun:{...good,id:'lab_pirate_2'}};
assert.equal(worldStopStatus(levels[1],stale).started,false);
assert.equal(nextPlayableLevel(levels,stale).id,levels[1].id);
assert.equal(worldStopStatus(levels[1],{...base,completedLevelIds:{}}).completed,false);
assert.deepEqual(base.mazeRuns[good.id],good);
console.log('Level-map save validation PASS');
