import test from 'node:test';
import assert from 'node:assert/strict';
import {commitDuckTutorial} from './duck-tutorial-save-transaction.mjs';

test('successful tutorial commits both flags exactly once',()=>{
 const run={duckLearned:false,steps:7},progress={duckTutorialSeen:false,stars:5};let writes=0;
 assert.equal(commitDuckTutorial({run,progress,persist:()=>{writes++;return true}}),true);
 assert.equal(writes,1);assert.equal(run.duckLearned,true);assert.equal(progress.duckTutorialSeen,true);
 assert.equal(run.steps,7);assert.equal(progress.stars,5);
});
test('ignored storage write rolls both flags back',()=>{
 const run={duckLearned:false,player:{x:3,y:2}},progress={duckTutorialSeen:false,completedLevelIds:['c1']};
 assert.equal(commitDuckTutorial({run,progress,persist:()=>false}),false);
 assert.equal(run.duckLearned,false);assert.equal(progress.duckTutorialSeen,false);
 assert.deepEqual(run.player,{x:3,y:2});assert.deepEqual(progress.completedLevelIds,['c1']);
});
test('thrown storage write rolls both flags back',()=>{
 const run={duckLearned:false},progress={duckTutorialSeen:false};
 assert.equal(commitDuckTutorial({run,progress,persist:()=>{throw Error('quota')}}),false);
 assert.equal(run.duckLearned,false);assert.equal(progress.duckTutorialSeen,false);
});
test('absent flags stay absent after failure',()=>{
 const run={steps:2},progress={wallet:{rainbowStars:10}};
 assert.equal(commitDuckTutorial({run,progress,persist:()=>false}),false);
 assert.equal('duckLearned' in run,false);assert.equal('duckTutorialSeen' in progress,false);
});
test('a retry after recovery can commit',()=>{
 const run={},progress={};let ok=false;
 assert.equal(commitDuckTutorial({run,progress,persist:()=>ok}),false);
 ok=true;assert.equal(commitDuckTutorial({run,progress,persist:()=>ok}),true);
 assert.equal(run.duckLearned,true);assert.equal(progress.duckTutorialSeen,true);
});
test('missing state cannot claim a saved tutorial',()=>{
 assert.equal(commitDuckTutorial({run:null,progress:{},persist:()=>true}),false);
 assert.equal(commitDuckTutorial({run:{},progress:null,persist:()=>true}),false);
});
