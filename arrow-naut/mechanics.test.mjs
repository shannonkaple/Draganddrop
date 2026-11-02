import test from 'node:test';
import assert from 'node:assert/strict';
import {PLANETS,createMission,createProgress,allMissions,planetUnlocked,stageUnlocked} from './curriculum.mjs';
import {initialMission,selectObject,arrowAction,finishMission,occupiedCells,validPosition,purchase,validatedSave,goalMet} from './mechanics.mjs';

test('eight distinct planets each have eight no-crop missions',()=>{
 const missions=allMissions();assert.equal(PLANETS.length,8);assert.equal(missions.length,64);
 assert.equal(new Set(missions.map(m=>m.id)).size,64);
 assert.equal(missions.filter(m=>m.kind==='resize').length,8);
 assert.ok(missions.every(m=>!JSON.stringify(m).toLowerCase().includes('crop')));
});
test('careful click requires INSIDE desired colored box',()=>{
 const m=createMission(0,0),s=initialMission(m);
 const wrong=selectObject(m,s,'box-b');assert.equal(wrong.ok,false);
 assert.equal(s.complete,false);
 const right=selectObject(m,s,'box-a');assert.equal(right.ok,true);assert.equal(right.state.complete,true);
});
test('trackpad click selects a piece; keyboard moves in one-square steps',()=>{
 const m=createMission(0,1),s=initialMission(m);
 assert.equal(arrowAction(m,s,'ArrowRight').ok,false);
 const selected=selectObject(m,s,'rover');assert.equal(selected.ok,true);
 const step=arrowAction(m,selected.state,'ArrowRight');assert.equal(step.ok,true);
 assert.equal(step.state.pieces[0].x,2);assert.equal(step.state.pieces[0].y,5);
 assert.equal(s.pieces[0].x,1,'saved state cloned, not mutated');
});
test('maze obstacles prevent moving through a rock',()=>{
 const m=createMission(0,1),run=initialMission(m);
 run.pieces[0].x=3;run.pieces[0].y=2;run.selected='rover';
 const blocked=arrowAction(m,run,'ArrowRight');assert.equal(blocked.ok,false);
 assert.equal(blocked.state.pieces[0].x,3);
});
test('resize requires clicked handle; arrows change width/height but never crop',()=>{
 const m=createMission(0,3),s=initialMission(m);
 const move=selectObject(m,s,'rocket','move');
 const moved=arrowAction(m,move.state,'ArrowRight');assert.equal(moved.state.pieces[0].w,2);
  const mustClickInside=selectObject(m,s,'rocket','resize');assert.equal(mustClickInside.ok,false);
 const firstClick=selectObject(m,s,'rocket','move');
 const handle=selectObject(m,firstClick.state,'rocket','resize');
 const wider=arrowAction(m,handle.state,'ArrowRight');assert.equal(wider.ok,true);
 assert.equal(wider.state.pieces[0].w,3);assert.equal(wider.state.pieces[0].x,2);
 const taller=arrowAction(m,wider.state,'ArrowDown');assert.equal(taller.state.pieces[0].h,3);
 const left=arrowAction(m,handle.state,'ArrowLeft');assert.equal(left.state.pieces[0].w,1);
 const tooNarrow=arrowAction(m,left.state,'ArrowLeft');assert.equal(tooNarrow.ok,false);
});
test('Tetris-like pieces occupy only actual cells; cannot overlap',()=>{
 const m=createMission(0,2);assert.equal(m.kind,'fit');
 const s=initialMission(m);assert.equal(occupiedCells(s.pieces[0]).length,3);
 assert.equal(occupiedCells(s.pieces[1]).length,4);
 assert.equal(validPosition(m,s.pieces,'cargo-l'),true);
 const other=structuredClone(s.pieces);other[0].x=1;other[0].y=4;
 assert.equal(validPosition(m,other,'cargo-l'),false);
});
test('reaching a goal completes the mission',()=>{
 const m=createMission(0,1),s=initialMission(m);s.pieces[0].x=9;s.pieces[0].y=1;s.selected='rover';
 const step=arrowAction(m,s,'ArrowRight');assert.equal(step.ok,true);assert.equal(step.state.complete,true);
 assert.ok(goalMet(step.state.pieces[0]));
});
test('every completion, even a replay, earns three stars, without unlocking twice',()=>{
 const m=createMission(0,0),p=createProgress();const first=finishMission(p,m);
 assert.equal(first.stars,3);assert.equal(first.progress.stars,3);assert.equal(first.progress.completed.length,1);
 const replay=finishMission(first.progress,m);
 assert.equal(replay.progress.stars,6);assert.equal(replay.progress.completed.length,1);
 assert.equal(p.stars,0,'previous save object unchanged');
});
test('other seven planets stay locked until eight stages finished',()=>{
 const p=createProgress();assert.equal(planetUnlocked(p,0),true);assert.equal(planetUnlocked(p,1),false);
 assert.equal(stageUnlocked(p,0,0),true);assert.equal(stageUnlocked(p,0,1),false);
 let next=p;for(let s=0;s<8;s++)next=finishMission(next,createMission(0,s)).progress;
 assert.equal(planetUnlocked(next,1),true);assert.equal(next.rescued.length,1);assert.equal(next.rescued[0],'launch');
 assert.equal(stageUnlocked(next,1,0),true);
});
test('first rescue happens once, even on last mission replay',()=>{
 let p=createProgress();let f;
 for(let i=0;i<8;i++){f=finishMission(p,createMission(0,i));p=f.progress}
 assert.equal(f.friend,'Pip the Star Sprout');
 const replay=finishMission(p,createMission(0,7));assert.equal(replay.friend,null);assert.equal(replay.progress.rescued.length,1);
});
test('shop purchases require stars and are not given automatically',()=>{
 let p=createProgress();assert.deepEqual(p.purchases,[]);
 assert.equal(purchase(p,{id:'telescope',price:6}).ok,false);
 p.stars=9;const bought=purchase(p,{id:'telescope',price:6});assert.equal(bought.ok,true);
 assert.equal(bought.progress.stars,3);assert.equal(p.stars,9);
});
test('bad student data never resets to blank progress',()=>{
 assert.deepEqual(validatedSave(null),createProgress());
 assert.throws(()=>validatedSave('{invalid json'));
 assert.throws(()=>validatedSave(JSON.stringify({version:2,completed:[],stars:0,purchases:[]})));
 assert.throws(()=>validatedSave(JSON.stringify({version:1,completed:'no',stars:0,purchases:[]})));
});