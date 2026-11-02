import test from 'node:test';
import assert from 'node:assert/strict';
import {COLS,ROWS,WORLDS,CHARACTERS,ITEMS,createMission,createProgress,allMissions,worldUnlocked,levelUnlocked} from './curriculum.mjs';
import {startRun,select,move,patrol,finish,purchase,readProgress} from './engine.mjs';
test('eight worlds, 64 unique grade-one levels, no resizing controls',()=>{
 const all=allMissions();assert.equal(WORLDS.length,8);assert.equal(all.length,64);
 assert.equal(new Set(all.map(x=>x.id)).size,64);
 assert.ok(all.every(m=>m.pieces.every(p=>p.w===1&&p.h===1&&!('resize' in p))));
 assert.ok(all.every(m=>['click','move','precision','maze'].includes(m.kind)));
});
test('picture must be clicked before an arrow moves it',()=>{
 const m=createMission(0,1),initial=startRun(m);
 assert.equal(move(m,initial,'ArrowRight').ok,false);
 const selected=select(m,initial,'rover');assert.equal(selected.ok,true);
 const result=move(m,selected.run,'ArrowRight');assert.equal(result.ok,true);
 assert.equal(result.run.pieces[0].x,3);assert.equal(initial.pieces[0].x,2);
 assert.equal(result.run.pieces[0].w,1);
});
test('target clicking counts, decoys do not',()=>{
 const mission=createMission(0,0),run=startRun(mission);
 assert.equal(select(mission,run,'decoy1').ok,false);
 assert.equal(select(mission,run,'star').run.complete,true);
});
test('precision challenges reject wrong selections',()=>{
 const mission=createMission(4,4),run=startRun(mission);
 assert.equal(select(mission,run,'decoy1').ok,false);
 assert.equal(select(mission,run,'target').ok,true);
});
test('arrows cannot move objects through rocks, other objects, or outside board',()=>{
 const mission=createMission(0,2),run=startRun(mission),selected=select(mission,run,'rover').run;
 const unsafe={...selected,pieces:selected.pieces.map(p=>({...p,x:3,y:3}))};
 assert.equal(move(mission,unsafe,'ArrowRight').ok,false);
 const border={...selected,pieces:selected.pieces.map(p=>({...p,x:0,y:0}))};
 assert.equal(move(mission,border,'ArrowLeft').ok,false);
 const pairs=createMission(0,3),p=startRun(pairs);p.selected='laptop';p.pieces[0].x=1;p.pieces[0].y=4;
 assert.equal(move(pairs,p,'ArrowDown').ok,false);
});
test('all boss mazes require selecting the explorer and have safe routes at multiple enemy timings',()=>{
 for(let w=0;w<8;w++){
  const m=createMission(w,7);assert.equal(m.enemies.length,4);
  let run=startRun(m);assert.equal(move(m,run,'ArrowRight').ok,false);
  run=select(m,run,'explorer').run;
  const safe=new Set(m.safeRoute);
  for(const e of m.enemies){assert.ok(!safe.has(e.a.x+','+e.a.y));assert.ok(!safe.has(e.b.x+','+e.b.y))}
  const path=[...safe].reverse().map(v=>v.split(',').map(Number));
  for(let delay=0;delay<6;delay++){
   let current=startRun(m);current=select(m,current,'explorer').run;
   for(let t=0;t<delay;t++)current=patrol(m,current).run;
   for(let i=1;i<path.length;i++){
    const [ax,ay]=path[i-1],[x,y]=path[i],key=x>ax?'ArrowRight':x<ax?'ArrowLeft':y>ay?'ArrowDown':'ArrowUp';
    const step=move(m,current,key);assert.equal(step.ok,true);
    current=step.run;
    if(!current.complete)current=patrol(m,current).run;
   }
   assert.equal(current.complete,true);
   assert.equal(current.maze.hits,0);
  }
 }
});
test('level unlocks, one star each, boss ten; replays cannot farm stars',()=>{
 let p=createProgress();
 assert.equal(worldUnlocked(p,0),true);assert.equal(worldUnlocked(p,1),false);
 assert.equal(levelUnlocked(p,0,1),false);
 for(let s=0;s<7;s++){
  const m=createMission(0,s),result=finish(p,m);
  assert.equal(result.stars,1);p=result.progress;
 }
 assert.equal(p.stars,7);assert.equal(levelUnlocked(p,0,7),true);
 const boss=finish(p,createMission(0,7));p=boss.progress;
 assert.equal(boss.stars,10);assert.equal(p.stars,17);
 assert.equal(worldUnlocked(p,1),true);assert.ok(p.rescued.includes('launch'));
 const replay=finish(p,createMission(0,7));
 assert.equal(replay.stars,0);assert.equal(replay.progress.stars,17);
});
test('shop spend and saved progress are separate',()=>{
 let p=createProgress();p.stars=9;
 const before=purchase(p,ITEMS[0]);assert.equal(before.ok,true);
 assert.equal(before.progress.stars,6);assert.equal(p.stars,9);
 assert.equal(purchase(before.progress,ITEMS[0]).ok,false);
 assert.deepEqual(readProgress(JSON.stringify(before.progress)).purchases,before.progress.purchases);
 assert.deepEqual(readProgress(null),createProgress());
 assert.throws(()=>readProgress('{'));
 assert.throws(()=>readProgress(JSON.stringify({version:2,completed:[],purchases:[],rescued:[],stars:0})));
});
