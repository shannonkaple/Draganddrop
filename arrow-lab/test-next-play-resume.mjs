// Run: node arrow-lab/test-next-play-resume.mjs
import assert from 'node:assert/strict';
import {nextPlayableLevel} from './level-map-model.mjs';
const levels=Array.from({length:64},(_,i)=>({id:'lab_'+(i+1),number:i+1}));
const run=n=>({id:'lab_'+n,complete:false,w:5,h:5,grid:Array.from({length:5},()=>Array(5).fill(0)),items:[],hazards:[],player:{x:1,y:1}});
const base={highestUnlockedLevel:4,completedLevelIds:['lab_1']};
assert.equal(nextPlayableLevel(levels,{...base,mazeRuns:{lab_3:run(3)}}).number,3,'resume saved run before opening a new level');
assert.equal(nextPlayableLevel(levels,{...base,activeRun:run(4),mazeRuns:{lab_3:run(3)}}).number,4,'prefer current valid active run');
assert.equal(nextPlayableLevel(levels,{...base,activeRun:{...run(4),complete:true},mazeRuns:{lab_3:run(3)}}).number,3,'completed active run is not resumable');
assert.equal(nextPlayableLevel(levels,{highestUnlockedLevel:2,completedLevelIds:[],activeRun:run(50)}).number,1,'never open a locked active run');
assert.equal(nextPlayableLevel(levels,{...base,mazeRuns:{lab_3:{id:'lab_3',complete:false}}}).number,2,'malformed run cannot hijack PLAY NEXT');
assert.equal(nextPlayableLevel(levels,{highestUnlockedLevel:4,completedLevelIds:['lab_1','lab_2','lab_3','lab_4']}).number,64,'all completed levels retain existing end-of-game behavior');
assert.equal(nextPlayableLevel([],base),null,'empty definitions handled safely');
console.log('PASS: seven PLAY NEXT resume, locked-run and stale-save regressions');
