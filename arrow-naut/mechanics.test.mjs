import test from 'node:test';
import assert from 'node:assert/strict';
import {PLANETS,createMission,createProgress,allMissions,planetUnlocked,stageUnlocked} from './curriculum.mjs';
import {initialMission,selectObject,arrowAction,resizeByHandle,finishMission,occupiedCells,validPosition,purchase,validatedSave,goalMet,mazeEnemyTick,fireLaser} from './mechanics.mjs';

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
test('trackpad handle stretching changes size; keyboard arrows ONLY move',()=>{
 const m=createMission(0,3),s=initialMission(m);
 const firstClick=selectObject(m,s,'rocket');
 assert.equal(firstClick.ok,true);
 assert.equal(selectObject(m,firstClick.state,'rocket','resize').ok,false);
 const stretched=resizeByHandle(m,firstClick.state,'rocket','se',1,0);
 assert.equal(stretched.ok,true);assert.equal(stretched.state.pieces[0].w,3);
 assert.equal(stretched.state.pieces[0].h,2);
 const taller=resizeByHandle(m,stretched.state,'rocket','s',0,1);
 assert.equal(taller.ok,true);assert.equal(taller.state.pieces[0].h,3);
 const arrow=arrowAction(m,firstClick.state,'ArrowRight');
 assert.equal(arrow.ok,true);assert.equal(arrow.state.pieces[0].x,3);
 assert.equal(arrow.state.pieces[0].w,2);assert.equal(arrow.state.pieces[0].h,2);
 assert.equal(resizeByHandle(m,firstClick.state,'rocket','w',3,0).ok,false,'cannot shrink below one cell');
 assert.equal(resizeByHandle(m,firstClick.state,'rocket','e',20,0).ok,false,'cannot stretch beyond board');
 const east=resizeByHandle(m,firstClick.state,'rocket','e',1,0);
 assert.equal(east.ok,true);assert.equal(east.state.pieces[0].x,2);
 const west=resizeByHandle(m,firstClick.state,'rocket','w',-1,0);
 assert.equal(west.ok,true);assert.equal(west.state.pieces[0].x,1);
 assert.equal(west.state.pieces[0].w,3);
 assert.equal(s.pieces[0].w,2,'original state is unchanged');
});
test('puzzle difficulty grows across planets without changing IDs or starting skills',()=>{
 const first=Array.from({length:8},(_,p)=>createMission(p,0));
 assert.equal(first[0].pieces.length,3);
 assert.ok(first[7].pieces.length>first[0].pieces.length);
 assert.ok(createMission(7,1).obstacles.length>createMission(0,1).obstacles.length);
 assert.ok(createMission(7,3).pieces[0].goal.w>createMission(0,3).pieces[0].goal.w);
 assert.equal(createMission(7,7).enemies.length,4);
 assert.equal(createMission(0,7).kind,'final-maze');
 assert.equal(createMission(0,7).id,'launch-8');
 assert.equal(createMission(7,7).id,'core-8');
 for(let p=0;p<8;p++)for(let st=0;st<8;st++){
  const mission=createMission(p,st),pieces=mission.pieces;
  assert.ok(pieces.every(x=>x.x>=0&&x.y>=0&&x.x+x.w<=12&&x.y+x.h<=7));
  assert.ok(pieces.every(x=>!x.goal||x.goal.x>=0&&x.goal.y>=0&&
   x.goal.x+(x.goal.w??x.w)<=12&&x.goal.y+(x.goal.h??x.h)<=7));
 }
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
test('regular levels earn one star, final mazes ten; completed replays earn zero',()=>{
 const normal=createMission(0,0),boss=createMission(0,7),p=createProgress();
 const first=finishMission(p,normal);
 assert.equal(first.stars,1);assert.equal(first.progress.stars,1);
 const replay=finishMission(first.progress,normal);
 assert.equal(replay.stars,0);assert.equal(replay.progress.stars,1);
 const finish=finishMission(replay.progress,boss);
 assert.equal(finish.stars,10);assert.equal(finish.progress.stars,11);
 const bossReplay=finishMission(finish.progress,boss);
 assert.equal(bossReplay.stars,0);assert.equal(bossReplay.progress.stars,11);
 assert.equal(p.stars,0,'original balance unchanged');
});
test('eight unique finale mazes have four active moving enemies and solvable routes',()=>{
 for(let pi=0;pi<8;pi++){
  const m=createMission(pi,7);assert.equal(m.kind,'final-maze');
  assert.equal(m.enemies.length,4);
  const blocked=new Set(m.walls.map(cell=>cell.join(',')));
  assert.equal(blocked.has('1,1'),false);assert.equal(blocked.has('10,5'),false);
  const seen=new Set(['1,1']),queue=[[1,1]];let reached=false;
  while(queue.length){
   const [x,y]=queue.shift();
   if(x===10&&y===5){reached=true;break}
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy,k=nx+','+ny;
    if(nx<0||nx>=12||ny<0||ny>=7||seen.has(k)||blocked.has(k))continue;
    seen.add(k);queue.push([nx,ny]);
   }
  }
  assert.ok(reached,`maze ${pi} must have a route`);
  const run=initialMission(m);assert.equal(run.maze.enemies.length,4);
  const tick=mazeEnemyTick(m,run);assert.equal(tick.ok,true);
  assert.ok(tick.state.maze.enemies.some((e,i)=>e.x!==run.maze.enemies[i].x||e.y!==run.maze.enemies[i].y));
 }
});
test('laser uses Space/Fire action, removes one enemy, and safely recharges',()=>{
 const m=createMission(2,7),s=initialMission(m);
 assert.equal(s.maze.energy,3);
 const target=m.enemies[0];
 s.maze.x=target.b.x;s.maze.y=target.b.y;
 s.maze.facing=target.a.x>target.b.x?'ArrowRight':target.a.x<target.b.x?'ArrowLeft':target.a.y>target.b.y?'ArrowDown':'ArrowUp';
 const hit=fireLaser(m,s);
 assert.equal(hit.ok,true);
 assert.equal(hit.state.maze.zapped,1);
 assert.equal(hit.state.maze.enemies.length,3);
 assert.equal(hit.state.maze.energy,2);
 assert.equal(s.maze.enemies.length,4);
 let noCharge={...s,maze:{...s.maze,energy:0}};
 assert.equal(fireLaser(m,noCharge).ok,false);
});
test('safe escape remains clear at different enemy timings for every planet',()=>{
 for(let planet=0;planet<8;planet++){
  const m=createMission(planet,7);
  assert.equal(m.enemies.length,4);
  const route=new Set(m.safeRoute);
  assert.ok(route.has(m.mazeStart.x+','+m.mazeStart.y));
  assert.ok(route.has(m.mazeGoal.x+','+m.mazeGoal.y));
  assert.ok(m.enemies.every(e=>!route.has(e.a.x+','+e.a.y)&&!route.has(e.b.x+','+e.b.y)));
  const path=[...m.safeRoute].reverse().map(cell=>cell.split(',').map(Number));
  for(let phase=0;phase<8;phase++){
   let run=initialMission(m);
   for(let t=0;t<phase;t++)run=mazeEnemyTick(m,run).state;
   for(let i=1;i<path.length;i++){
    const [a,b]=path[i-1], [x,y]=path[i];
    const key=x>a?'ArrowRight':x<a?'ArrowLeft':y>b?'ArrowDown':'ArrowUp';
    const move=arrowAction(m,run,key);
    assert.equal(move.ok,true,`planet ${planet}, step ${i}`);
    run=move.state;
    if(!run.complete)run=mazeEnemyTick(m,run).state;
   }
   assert.equal(run.complete,true,`planet ${planet}, enemy phase ${phase}`);
   assert.equal(run.maze.hits,0,`planet ${planet}, enemy phase ${phase}`);
  }
 }
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