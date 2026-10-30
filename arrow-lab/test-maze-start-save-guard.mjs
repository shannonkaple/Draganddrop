import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotMazeStart,restoreMazeStart} from './maze-start-save-guard.mjs';

const make=()=>({activeRun:{id:'candy-1',player:{x:2,y:3},items:[{id:'a',collected:false}]},mazeRuns:{'candy-1':{id:'candy-1',player:{x:2,y:3},items:[{id:'a',collected:false}]}}});
test('rejected new maze start removes the unsaved new slot',()=>{
 const progress=make(),snapshot=snapshotMazeStart({run:progress.activeRun,definition:{id:'candy-1'},mapWorld:0,progress});
 progress.mazeRuns['pirate-1']={id:'pirate-1'};progress.activeRun=progress.mazeRuns['pirate-1'];
 const restored=restoreMazeStart(snapshot,progress);
 assert.equal(progress.mazeRuns['pirate-1'],undefined);assert.equal(progress.activeRun.id,'candy-1');assert.equal(restored.run.id,'candy-1');
});
test('rejected restart restores the deleted old maze run',()=>{
 const progress=make(),snapshot=snapshotMazeStart({run:progress.activeRun,definition:{id:'candy-1'},mapWorld:0,progress});
 delete progress.mazeRuns['candy-1'];progress.activeRun={id:'candy-1',player:{x:1,y:1}};
 restoreMazeStart(snapshot,progress);
 assert.deepEqual(progress.mazeRuns['candy-1'].player,{x:2,y:3});
});
test('rejected resume repairs do not mutate saved pickups',()=>{
 const progress=make(),snapshot=snapshotMazeStart({run:progress.activeRun,definition:{id:'candy-1'},mapWorld:0,progress});
 progress.mazeRuns['candy-1'].items[0].collected=true;progress.activeRun.items.push({id:'b'});
 restoreMazeStart(snapshot,progress);
 assert.equal(progress.mazeRuns['candy-1'].items[0].collected,false);assert.equal(progress.activeRun.items.length,1);
});
test('restores previous view and run independently',()=>{
 const progress=make(),oldRun={id:'arctic-2',player:{x:4}},definition={id:'arctic-2'};
 const snapshot=snapshotMazeStart({run:oldRun,definition,mapWorld:2,progress});
 oldRun.player.x=8;const restored=restoreMazeStart(snapshot,progress);
 assert.equal(restored.run.player.x,4);assert.equal(restored.definition,definition);assert.equal(restored.mapWorld,2);
});
test('absent legacy activeRun and mazeRuns stay absent on failure',()=>{
 const progress={wallet:{rainbowStars:8}},snapshot=snapshotMazeStart({run:null,definition:null,mapWorld:0,progress});
 progress.mazeRuns={new:{id:'new'}};progress.activeRun={id:'new'};
 restoreMazeStart(snapshot,progress);
 assert.equal(Object.hasOwn(progress,'mazeRuns'),false);assert.equal(Object.hasOwn(progress,'activeRun'),false);
});
