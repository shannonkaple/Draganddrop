import test from 'node:test';
import {touchGeneratedClick} from './input-policy.mjs';
import assert from 'node:assert/strict';
import {COLS,ROWS,WORLDS,CHARACTERS,ITEMS,createMission,createProgress,allMissions,worldUnlocked,levelUnlocked} from './curriculum.mjs';
import {startRun,select,move,patrol,finish,purchase,readProgress} from './engine.mjs';
test('eight worlds, 64 unique grade-one levels, no resizing controls',()=>{
 const all=allMissions();assert.equal(WORLDS.length,8);assert.equal(all.length,64);
 assert.equal(new Set(all.map(x=>x.id)).size,64);
 assert.ok(all.every(m=>m.pieces.every(p=>Number.isInteger(p.w)&&Number.isInteger(p.h)&&p.w>0&&p.h>0&&!('resize' in p))));
 assert.ok(all.every(m=>['click','trail','collect','delivery','precision','key-gate','relay','maze'].includes(m.kind)));
});
test('picture must be clicked before an arrow moves it',()=>{
 const m=createMission(0,1),initial=startRun(m);
 assert.equal(move(m,initial,'ArrowRight').ok,false);
 const selected=select(m,initial,'rover');assert.equal(selected.ok,true);
 const result=move(m,selected.run,'ArrowRight');assert.equal(result.ok,true);
 assert.equal(result.run.pieces[0].x,2);assert.equal(initial.pieces[0].x,1);
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
test('eight different age-appropriate activities use clicking and keyboard arrow movement only',()=>{
 for(let world=0;world<8;world++){
  const missions=Array.from({length:8},(_,i)=>createMission(world,i));
  assert.deepEqual(missions.map(x=>x.kind),['click','trail','collect','delivery','precision','key-gate','relay','maze']);
  assert.ok(missions.slice(1,7).every(m=>m.pieces.some(p=>p.goal)));
  assert.ok(missions.every(m=>m.pieces.every(p=>Number.isInteger(p.w)&&Number.isInteger(p.h)&&p.w>0&&p.h>0&&!('resize' in p))));
  assert.ok(missions.slice(1,6).every(m=>m.pickups.length>0));
  assert.equal(missions[5].gate.x,5);
  assert.equal(missions[6].deliveryOrder.length,3);
 }
});
test('star-trail checkpoints must be visited in numbered order before the goal counts',()=>{
 const m=createMission(0,1);
 let r=select(m,startRun(m),'rover').run;
 // Walk from (1,3) to the second star at (6,2), bypassing first.
 for(let step=0;step<5;step++)r=move(m,r,'ArrowRight').run;
 r=move(m,r,'ArrowUp').run;
 assert.deepEqual(r.collected,[],'second star cannot be collected before first');
 // Correct first star (3,4) and then second (6,2).
 r=move(m,r,'ArrowLeft').run;r=move(m,r,'ArrowLeft').run;r=move(m,r,'ArrowLeft').run;
 r=move(m,r,'ArrowDown').run;r=move(m,r,'ArrowDown').run;
 assert.deepEqual(r.collected,['trail-1']);
 for(let step=0;step<3;step++)r=move(m,r,'ArrowRight').run;
 r=move(m,r,'ArrowUp').run;r=move(m,r,'ArrowUp').run;
 assert.deepEqual(r.collected,['trail-1','trail-2']);
 assert.equal(r.complete,false,'stars alone do not finish; still reach green dock');
});
test('crystals must be collected before docking',()=>{
 const m=createMission(0,2);
 const r=startRun(m);
 assert.equal(m.pickups.length,2);
 let s=select(m,r,'rover').run;
 // Force the rover onto its target as a focused completion-condition test.
 s.pieces[0].x=m.pieces[0].goal.x;
 s.pieces[0].y=m.pieces[0].goal.y-1;
 const result=move(m,s,'ArrowDown');
 assert.equal(result.ok,true);
 assert.equal(result.run.complete,false,'goal alone is insufficient without fuel');
});
test('the magic key opens the otherwise impassable force-field gate',()=>{
 const m=createMission(0,5),initial=startRun(m),selected=select(m,initial,'keyboard').run;
 selected.pieces[0].x=4;selected.pieces[0].y=3;
 assert.equal(move(m,selected,'ArrowRight').ok,false,'locked gate blocks arrow movement');
 selected.pieces[0].x=2;selected.pieces[0].y=3;
 const picked=move(m,selected,'ArrowRight');
 assert.equal(picked.ok,true);
 assert.equal(picked.run.gateOpen,true);
 picked.run.pieces[0].x=4;picked.run.pieces[0].y=3;
 assert.equal(move(m,picked.run,'ArrowRight').ok,true,'open gate allows crossing');
});
test('signal relay requires clicking each piece in order and remembers progress',()=>{
 const m=createMission(1,6);
 let r=startRun(m);
 assert.deepEqual(m.deliveryOrder,['arrows','laptop','trackpad']);
 assert.equal(select(m,r,'laptop').ok,false,'later object cannot go first');
 r=select(m,r,'arrows').run;
 assert.equal(r.selected,'arrows');
 r.pieces.find(p=>p.id==='arrows').x=7;
 r.pieces.find(p=>p.id==='arrows').y=2;
 const dock=move(m,r,'ArrowRight');
 assert.equal(dock.ok,true);
 assert.deepEqual(dock.run.delivered,['arrows']);
 assert.equal(dock.run.selected,null);
 assert.equal(dock.run.complete,false);
 assert.equal(select(m,dock.run,'laptop').ok,true);
});
test('new mission format restarts only unfinished runs; completed stars and inventory stay unchanged',()=>{
 let p=createProgress();
 p=finish(p,createMission(0,0)).progress;
 p.purchases=['trackpad'];p.rescued=['launch'];
 p.active={id:'launch-3',pieces:[],attempts:5,complete:false};
 const restored=readProgress(JSON.stringify(p));
 assert.equal(restored.stars,1);
 assert.deepEqual(restored.completed,['launch-1']);
 assert.deepEqual(restored.purchases,['trackpad']);
 assert.equal(restored.active.id,'launch-3');
 assert.equal(createMission(0,2).mechanicVersion,3);
 assert.equal(startRun(createMission(0,2)).mechanicVersion,3);
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

test('all first-grade character choices are astronauts or helmeted space explorers',()=>{
 assert.ok(CHARACTERS.length>0);
 assert.ok(CHARACTERS.every(c=>/astro|astronaut|space|robot|naut/i.test(c.id+' '+c.name)));
});
test('shape-matching cargo retains its real size when moved with the arrow keys',()=>{
 const m=createMission(0,3),r=startRun(m),l=r.pieces.find(p=>p.id==='laptop'),t=r.pieces.find(p=>p.id==='keyboard');
 assert.deepEqual([l.w,l.h,l.shape],[2,2,'L']);
 assert.deepEqual([t.w,t.h,t.shape],[3,2,'T']);
 assert.equal(l.img.endsWith('l_shaped_cargo.png'),true);
 assert.equal(t.img.endsWith('t_shaped_cargo.png'),true);
 let selected=select(m,r,l.id).run;
 const before=JSON.stringify(selected.pieces.find(p=>p.id==='laptop'));
 const moved=move(m,selected,'ArrowRight');
 assert.equal(moved.ok,true);
 assert.equal(moved.run.pieces.find(p=>p.id==='laptop').w,2);
 assert.equal(moved.run.pieces.find(p=>p.id==='laptop').h,2);
 assert.equal(moved.run.pieces.find(p=>p.id==='laptop').x,l.x+1);
 assert.equal(selected.pieces.find(p=>p.id==='laptop').x,l.x);
});
test('each non-click mission requires a turn or directional change to finish',()=>{
 for(let w=0;w<8;w++)for(let stage=1;stage<=6;stage++){
  const m=createMission(w,stage);
  for(const p of m.pieces.filter(p=>p.goal)){
   const checkpoints=(m.pickups||[]).filter(x=>!x.piece||x.piece===p.id);
   const requiresVertical=p.goal.y!==p.y||checkpoints.some(x=>x.y!==p.y);
   const requiresHorizontal=p.goal.x!==p.x||checkpoints.some(x=>x.x!==p.x);
   assert.equal(requiresVertical&&requiresHorizontal,true,'world '+w+' stage '+stage+' piece '+p.id);
  }
 }
});
test('first-grade selection rejects touch and stylus clicks, including touch-generated mouse clicks',()=>{
 assert.equal(touchGeneratedClick({pointerType:'touch'},'touch'),true);
 assert.equal(touchGeneratedClick({pointerType:'pen'},'pen'),true);
 assert.equal(touchGeneratedClick({pointerType:'mouse',sourceCapabilities:{firesTouchEvents:true}},'mouse'),true);
 assert.equal(touchGeneratedClick({pointerType:'mouse'},'touch'),true);
 assert.equal(touchGeneratedClick({pointerType:'mouse'},'mouse'),false);
 assert.equal(touchGeneratedClick({pointerType:'mouse',sourceCapabilities:{firesTouchEvents:false}},'mouse'),false);
});
