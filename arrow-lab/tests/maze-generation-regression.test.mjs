// Run from repository root:
// node --test arrow-lab/tests/maze-generation-regression.test.mjs
// Read-only access to rainbow-road source data; no files outside /arrow-lab/ changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildLevel,restoreSavedEnemyRoster,route,tile} from '../adventure-core.mjs';

const baseLevels=JSON.parse(readFileSync(new URL('../../rainbow-road/data/levels.json',import.meta.url),'utf8'));
const adventureSource=readFileSync(new URL('../adventure.mjs',import.meta.url),'utf8');
const rosterSource=adventureSource.match(/const enemyRosters=\[([\s\S]*?)\];/);
assert.ok(rosterSource,'Find the eight actual enemy rosters in adventure.mjs');
const rosters=[...rosterSource[1].matchAll(/\[([^\]]+)\]/g)].map(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
assert.equal(rosters.length,8,'Exactly eight themed worlds');

const define=(world,stage)=>({
 ...baseLevels[stage],
 id:'lab_'+world+'_'+(stage+1),
 number:world*8+stage+1,
 mazeGrid:{
   width:Math.max(11,baseLevels[stage].mazeGrid.width),
   height:Math.max(9,baseLevels[stage].mazeGrid.height)
 },
 enemyIds:[...rosters[world]],
 collectibleIds:['test_collectible_one','test_collectible_two'],
 primarySkill:'arrows'
});

function checkRun(run,def,easy){
 assert.equal(run.items.length,2,'Two separate collectibles');
 assert.equal(run.hazards.length,4,'Four enemies in every level');
 assert.equal(new Set(run.hazards.map(e=>e.id)).size,4,'All four enemy sprites distinct');
 assert.deepEqual(run.hazards.map(e=>e.id).sort(),[...def.enemyIds].sort(),'World roster retained');
 const blocked=new Set();
 for(const enemy of run.hazards){
   assert.ok(enemy.path.length>0);
   if(easy)assert.equal(enemy.path.length,1,'Gentle mode enemies remain still');
   for(let i=0;i<enemy.path.length;i++){
     const point=enemy.path[i],key=tile(point);
     assert.equal(run.grid[point.y]?.[point.x],0,'Enemy walks only on open tiles');
     if(i>0)assert.equal(Math.abs(point.x-enemy.path[i-1].x)+Math.abs(point.y-enemy.path[i-1].y),1,'Connected enemy patrol');
     blocked.add(key);
   }
   if(enemy.path.length>1){
     const first=enemy.path[0],last=enemy.path.at(-1);
     assert.equal(Math.abs(first.x-last.x)+Math.abs(first.y-last.y),1,'Patrol wraps one tile at a time');
   }
 }
 const stops=[...run.items,...(run.skill?[run.skill]:[]),run.goal];
 let previous=run.start;
 for(const stop of stops){
   assert.ok(!blocked.has(tile(stop)),'Objectives are not covered by enemies');
   assert.ok(route(run.grid,previous,stop,blocked),'Student can reach every required stop in sequence without touching enemies');
   previous=stop;
 }
 assert.ok(!blocked.has(tile(run.start)),'Start is safe');
}

test('All 64 mazes have four unique connected enemies and reachable objectives across 5 seeds and both difficulty modes',()=>{
 for(let world=0;world<8;world++)for(let stage=0;stage<8;stage++){
   const def=define(world,stage);
   assert.equal(new Set(def.enemyIds).size,4);
   for(let seed=1;seed<=5;seed++)for(const easy of [false,true]){
     const run=buildLevel(def,seed+world*1000+stage*100,easy);
     checkRun(run,def,easy);
   }
 }
});

test('Repairing 320 legacy enemy rosters preserves player, items, skill progress, finale progress and original patrols',()=>{
 for(let world=0;world<8;world++)for(let stage=0;stage<8;stage++){
   const def=define(world,stage);
   for(let seed=1;seed<=5;seed++){
     const run=buildLevel(def,seed+world*1000+stage*100,false);
     run.player={...run.start};
     run.steps=23;run.skillArrowIndex=2;run.finalArrowIndex=4;
     run.items[0].collected=true;
     run.hazards=run.hazards.slice(0,2);
     const original=structuredClone(run.hazards);
     assert.equal(restoreSavedEnemyRoster(run,def,false),true);
     checkRun(run,def,false);
     assert.deepEqual(run.hazards.slice(0,2),original,'Existing valid patrols remain identical');
     assert.deepEqual(run.player,run.start);
     assert.equal(run.steps,23);
     assert.equal(run.skillArrowIndex,2);
     assert.equal(run.finalArrowIndex,4);
     assert.equal(run.items[0].collected,true);
     assert.equal(restoreSavedEnemyRoster(run,def,false),false,'Valid roster repair is idempotent');
   }
 }
});
