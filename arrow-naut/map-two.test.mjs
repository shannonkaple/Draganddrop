import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MAP_TWO_PUZZLE_SCENES,MAP_TWO_THEMES,LOST_WORLDS,LOST_STAGE_TYPES,createMapTwoMission,initialMapTwoRun,chooseMapTwo,moveMapTwo,dropMapTwo,resizeMapTwo,rotateMapTwo,finishMapTwo,mapTwoData,mapTwoStageUnlocked,mapTwoWorldUnlocked,mapTwoCount} from './map-two.mjs';
const base=()=>({version:1,completed:[],stars:17,rescued:['launch'],purchases:['telescope'],worldScene:[{id:'shop:telescope',planet:0,x:40,y:40}],active:{id:'launch-2'},mapTwo:undefined});
const repeat=(fn,num,first)=>{let s=first;for(let i=0;i<num;i++){const r=fn(s);assert.equal(r.ok,true,r.reason);s=r.run}return s};
function complete(m){let run=initialMapTwoRun(m);
 if(m.type==='select'){
  let o=chooseMapTwo(m,run,m.targetId);assert.equal(o.ok,true);run=o.run;
 }else for(const p of m.pieces){
  if(p.tool==='drag'){
   const o=dropMapTwo(m,run,p.id,p.goal.x,p.goal.y);assert.equal(o.ok,true,o.reason);run=o.run;
  }else{
   let o=chooseMapTwo(m,run,p.id);assert.equal(o.ok,true,o.reason);run=o.run;
   while(run.pieces.find(x=>x.id===p.id).x < p.goal.x){o=moveMapTwo(m,run,'ArrowRight');assert.equal(o.ok,true,o.reason);run=o.run}
   while(run.pieces.find(x=>x.id===p.id).y < p.goal.y){o=moveMapTwo(m,run,'ArrowDown');assert.equal(o.ok,true,o.reason);run=o.run}
   if(['rotate','move-rotate'].includes(p.tool)){
    o=rotateMapTwo(m,run,p.id,p.goal.rotation/90);assert.equal(o.ok,true,o.reason);run=o.run;
   }
   if(p.tool==='resize'){
    const now=run.pieces.find(x=>x.id===p.id);const dx=p.goal.w-now.w,dy=p.goal.h-now.h;
    if(dx||dy){o=resizeMapTwo(m,run,p.id,'se',dx,dy);assert.equal(o.ok,true,o.reason);run=o.run}
   }
  }
 }
 assert.equal(run.complete,true,`${m.id} should complete`);return run;
}
test('16 map two missions have unique IDs, two distinct orders, and valid starts',()=>{
 assert.equal(LOST_WORLDS.length,2);assert.notDeepEqual(LOST_STAGE_TYPES[0],LOST_STAGE_TYPES[1]);
 const missions=LOST_WORLDS.flatMap((_,w)=>Array.from({length:8},(_,s)=>createMapTwoMission(w,s)));
 assert.equal(new Set(missions.map(m=>m.id)).size,16);
 for(const m of missions){const r=initialMapTwoRun(m);assert.equal(r.layoutVersion,m.stage===5?2:1);assert.equal(r.id,m.id);assert.ok(r.pieces.every(p=>p.x>=0&&p.x+p.w<=12&&p.y>=0&&p.y+p.h<=7));}
});
test('all 16 selectable, arrow-moving, trackpad-dropping and trackpad-resizing missions are solvable',()=>{
 for(let w=0;w<2;w++)for(let s=0;s<8;s++)complete(createMapTwoMission(w,s));
});
test('distinct Map Two progress, world unlocks and two rescues preserve Map One saves and stars',()=>{
 let p=base();assert.equal(mapTwoWorldUnlocked(p,0),true);assert.equal(mapTwoWorldUnlocked(p,1),false);
 for(let w=0;w<2;w++)for(let s=0;s<8;s++){
  assert.equal(mapTwoStageUnlocked(p,w,s),true,`${w}-${s}`);
  const m=createMapTwoMission(w,s),out=finishMapTwo(p,m,complete(m));p=out.progress;
  assert.equal(out.stars,s===7?10:1);
 }
 assert.equal(p.stars,17+2*(7+10));assert.equal(p.completed.length,0);assert.deepEqual(p.rescued,['launch']);
 assert.deepEqual(p.purchases,['telescope']);assert.equal(p.active.id,'launch-2');
 assert.equal(mapTwoCount(p,0),8);assert.equal(mapTwoCount(p,1),8);
 assert.deepEqual(p.mapTwo.rescued,['lost-aurora','lost-clockwork']);
 const again=finishMapTwo(p,createMapTwoMission(0,7),complete(createMapTwoMission(0,7)));
 assert.equal(again.stars,0);assert.equal(again.friend,null);assert.equal(again.progress.stars,p.stars);
});
test('invalid drag, blocked cells, wrong selection and unselected resize do not mutate runs',()=>{
 let m=createMapTwoMission(0,0),run=initialMapTwoRun(m);assert.equal(chooseMapTwo(m,run,'gear').ok,false);assert.equal(run.selected,null);
 m=createMapTwoMission(0,2);run=initialMapTwoRun(m);
 assert.equal(dropMapTwo(m,run,'crystal',11,6).ok,false);assert.equal(run.pieces[0].x,1);
 m=createMapTwoMission(0,3);run=initialMapTwoRun(m);
 assert.equal(resizeMapTwo(m,run,'panel','se',2,1).ok,false);
 assert.equal(moveMapTwo(m,run,'ArrowLeft').ok,false);
});
test('curved arrow rotation snaps the selected box to a 90/180-degree goal without awarding map-one progress',()=>{
 const a=createMapTwoMission(0,5),b=createMapTwoMission(1,5);
 assert.equal(a.type,'rotate');assert.equal(b.type,'move-rotate');
 let run=initialMapTwoRun(a);
 assert.equal(rotateMapTwo(a,run,'turn-box',1).ok,false,'box must be selected');
 run=chooseMapTwo(a,run,'turn-box').run;
 assert.equal(rotateMapTwo(a,run,'turn-box',0).ok,false);
 const turned=rotateMapTwo(a,run,'turn-box',1);
 assert.equal(turned.ok,true);assert.equal(turned.run.pieces[0].rotation,90);assert.equal(turned.run.complete,true);
 const rotatedAgain=rotateMapTwo(a,turned.run,'turn-box',1);
 assert.equal(rotatedAgain.run.complete,false,'orientation matters, not just location');
 const c=complete(b);assert.equal(c.complete,true);assert.equal(c.pieces[0].rotation,180);
});
test('Map Two remains sequentially locked unless the teacher uses preview mode',()=>{
 const progress=base();
 assert.equal(mapTwoWorldUnlocked(progress,0),true);
 assert.equal(mapTwoWorldUnlocked(progress,1),false);
 assert.equal(mapTwoStageUnlocked(progress,0,0),true);
 assert.equal(mapTwoStageUnlocked(progress,0,1),false);
});

test('all eight themed puzzle backdrops are committed real JPEGs and each active mission uses its world image',()=>{
 assert.equal(MAP_TWO_PUZZLE_SCENES.length,8);
 assert.equal(new Set(MAP_TWO_PUZZLE_SCENES).size,8);
 for(let world=0;world<8;world++){
  const src=MAP_TWO_PUZZLE_SCENES[world];
  assert.equal(MAP_TWO_THEMES[world].puzzleScene,src);
  assert.ok(src.endsWith('.jpg'),src);
  const bytes=readFileSync(new URL(src.replace(/^\.\//,''),import.meta.url));
  assert.ok(bytes.byteLength>100000,src+' must be a full-resolution background');
  assert.equal(bytes[0],255,src+' must be a JPEG');
  assert.equal(bytes[1],216,src+' must be a JPEG');
 }
 for(let world=0;world<LOST_WORLDS.length;world++){
  assert.equal(LOST_WORLDS[world].puzzleScene,MAP_TWO_PUZZLE_SCENES[world]);
  for(let stage=0;stage<8;stage++){
   const mission=createMapTwoMission(world,stage);
   assert.equal(mission.puzzleScene,MAP_TWO_PUZZLE_SCENES[world]);
   assert.notEqual(mission.puzzleScene,mission.worldInfo.scene,'puzzle art must differ from map art');
  }
 }
});
