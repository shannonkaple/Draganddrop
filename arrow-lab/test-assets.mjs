import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decorations} from '../trackpad-adventure/economy.mjs';
import {arrowLabCharacters} from './character-placeholders.mjs';
import {buildLevel, route, tile, migrateAdventure} from './adventure-core.mjs';

const load=name=>JSON.parse(fs.readFileSync(new URL('../rainbow-road/data/'+name+'.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('./ASSET_PRODUCTION_MANIFEST.json',import.meta.url)));
const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const definitions=source.slice(source.indexOf(' const worldThemes='),source.indexOf(' let stored;'));
const data=Object.fromEntries(['characters','rainbow_lands','levels','game_config','computer_collectibles'].map(n=>[n,load(n)]));
const {levels}=new Function('data','storageKey','decorations','arrowLabCharacters',definitions+';return {levels};')(data,'test-only',decorations,arrowLabCharacters);
assert.equal(levels.length,64);
let runs=0;
for(const [worldIndex,world] of manifest.worlds.entries()){
 const defs=levels.filter(l=>l.worldIndex===worldIndex);
 assert.equal(defs.length,8);
 for(const def of defs){
  assert.equal(def.id,`lab_${world.name}_${def.worldStage}`);
  assert.ok(fs.existsSync(new URL('..'+def.backgroundImage.split('?')[0],import.meta.url)),def.backgroundImage);
  if(def.collectibleIds)assert.equal(new Set(def.collectibleIds).size,2);
  for(let seed=1;seed<=40;seed++){
   const run=buildLevel(def,seed),blocked=new Set(run.hazards.flatMap(h=>h.path.map(tile)));
   let p=run.start;
   for(const stop of [...run.items,...(run.skill?[run.skill]:[]),run.goal]){
    assert.ok(route(run.grid,p,stop,blocked),`${def.id} seed ${seed}: inaccessible objective`);p=stop;
   }
   runs++;
  }
 }
}
const chars=data.characters,lands=data.rainbow_lands;
const saved={selectedPlayerCharacterId:chars[0].id,primaryRainbowLandId:lands[0].id,highestUnlockedLevel:30,wallet:{rainbowStars:57},completedLevelIds:['lab_candy_1','lab_pirate_1'],collectedWorldItems:['lollipop','treasure_chest','pearl_shell'],friends:{[chars[0].id]:{isRescued:true,upgradeStage:'power_up',homeLandId:lands[0].id}},positions:{[lands[0].id]:{[chars[0].id]:{x:30,y:40}}},activeRun:{id:'lab_pirate_2',seed:10}};
const migrated=migrateAdventure(structuredClone(saved),{},chars,lands);
for(const field of Object.keys(saved))assert.deepEqual(migrated[field],saved[field],`Save field changed: ${field}`);
assert.match(source,/function afterLevel\(\)\{if\(def\?\.worldIndex!=null\)\{openWorld\(def.worldIndex\)/);
console.log(`PASS: ${runs} solvable maze runs across all 64 stages; background paths; paired collectibles; saved stars, friends, positions, collections and active run; current-world return retained.`);
