import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decorations} from '../trackpad-adventure/economy.mjs';
import {buildLevel,tile,route,worldIds,pendingWorldRescue,rescueWorld,arrowPattern,buyWorld,migrateAdventure} from './adventure-core.mjs';
const a={completedLevelIds:[],worldFriends:{},ownedWorldIds:['background_candy'],wallet:{rainbowStars:25}};
for(let i=1;i<=7;i++){a.completedLevelIds.push('lab_candy_'+i);assert.equal(pendingWorldRescue(a),null)}
a.completedLevelIds.push('lab_candy_7');assert.equal(pendingWorldRescue(a),null,'replays cannot unlock rescue');
a.completedLevelIds.push('lab_candy_8');assert.equal(pendingWorldRescue(a),'candy');
assert.equal(rescueWorld(a,'pirate','background_candy'),false);assert.equal(rescueWorld(a,'candy','unowned'),false);
assert.equal(rescueWorld(a,'candy','background_candy'),true);assert.equal(rescueWorld(a,'candy','background_candy'),false);assert.equal(pendingWorldRescue(a),null);
for(const worldId of worldIds){
 const state={completedLevelIds:[],worldFriends:{},ownedWorldIds:['background_candy'],wallet:{rainbowStars:0}};
 for(let stage=1;stage<8;stage++){
   state.completedLevelIds.push(`lab_${worldId}_${stage}`);
   assert.equal(pendingWorldRescue(state),null,`${worldId}: rescue must wait for maze eight`);
 }
 state.completedLevelIds.push(`lab_${worldId}_8`);
 assert.equal(pendingWorldRescue(state),worldId,`${worldId}: rescue after eight distinct mazes`);
 assert.equal(rescueWorld(state,worldId,'background_candy'),true,`${worldId}: rescue into free starter home`);
 assert.equal(pendingWorldRescue(state),null,`${worldId}: no duplicate rescues`);
}
const patterns=Array.from({length:12},(_,i)=>arrowPattern(123,i));assert.equal(new Set(patterns.map(JSON.stringify)).size,6);assert.notDeepEqual(patterns[0],patterns[1]);
const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
const data=Object.fromEntries(['characters','rainbow_lands','levels','game_config'].map(n=>[n,JSON.parse(fs.readFileSync(new URL('../rainbow-road/data/'+n+'.json',import.meta.url)))]));
const defs=source.slice(source.indexOf(' const worldThemes='),source.indexOf(' let stored;'));
const {levels,lands,backgroundHomes,worldCosts}=new Function('data','storageKey','decorations',defs+';return {levels,lands,backgroundHomes,worldCosts}')(data,'test',decorations);
assert.equal(backgroundHomes.length,8);assert.deepEqual(backgroundHomes.map(l=>l.id),worldIds.map(id=>'background_'+id));
assert.equal(levels.length,64,'eight worlds with eight mazes each');
for(const def of levels){
 assert.equal(def.enemyIds.length,4,`${def.id} must have four enemies`);
 assert.equal(new Set(def.enemyIds).size,4,`${def.id} must have four DIFFERENT enemy types`);
 assert.ok(def.mazeGrid.width>=11&&def.mazeGrid.height>=9,`${def.id} needs enough safe space for four enemies`);
}

assert.match(source,/my-stuff-world-quickstrip/,'MY STUFF shows owned world previews beneath the scene without opening a separate page');
assert.match(source,/const decorationCards=ownedDecor\.map/,'MY STUFF shows all owned world decorations');
assert.match(source,/const friendCards=rescued\.map/,'MY STUFF shows all rescued friends');
assert.match(source,/const treasureCards=treasures\.map/,'MY STUFF shows all earned treasures');
assert.match(source,/decorationCards\+friendCards\+treasureCards/,'MY STUFF shows everything together in one tray');
assert.match(source,/collectedComputerGearIds\|\|\[\]/,'computer equipment is available to decorate the scene');
assert.match(source,/earnedSkillBadgeIds\|\|\[\]/,'earned skill badges are available to decorate the scene');
assert.doesNotMatch(source,/data-stuff-tab/,'no hidden collection category tabs should interrupt scene play');
assert.match(source,/const appScroll=\\$\\('app'\\)\\.scrollTop, pageScroll=window\\.scrollY/,'adding items preserves page and tray scroll positions');
assert.match(source,/Object\\.values\\(a\\.decorations\\|\\|\\{\\}\\)\\.flat\\(\\)/,'MY STUFF shows all decorations purchased across all owned worlds');
assert.match(source,/Move to This World/,'MY STUFF offers cross-world decoration moves without buying again');
// Exercise the ACTUAL installed MY STUFF click handler with two saved worlds.
const decorHandler=source.slice(source.indexOf("  document.querySelectorAll('[data-stuff-decor]')"),source.indexOf("  document.querySelectorAll('[data-stuff-friend]')"));
assert.ok(decorHandler.includes("a.decorations[from].splice"),'moves remove one source-world item, not all saved purchases');
const attachDecorHandler=new Function('document','a','id','save','refresh',decorHandler);
const savedStuff={decorations:{background_candy:['cupcake','donut'],background_pirate:['flag']},hiddenDecorations:{background_candy:['cupcake']},positions:{background_candy:{'decor:cupcake':{x:40,y:42},'decor:donut':{x:10,y:20}}},wallet:{rainbowStars:45},completedLevelIds:['lab_candy_1'],worldFriends:{candy:{homeLandId:'background_candy'}}};
const clickDecor=(state,world,key)=>{const button={dataset:{stuffDecor:key}};let saves=0;attachDecorHandler({querySelectorAll:()=>[button]},state,world,()=>saves++,()=>{});button.onclick();assert.equal(saves,1)};
clickDecor(savedStuff,'background_pirate','cupcake');
assert.deepEqual(savedStuff.decorations,{background_candy:['donut'],background_pirate:['flag','cupcake']});
assert.equal(savedStuff.wallet.rainbowStars,45,'moving an owned item never charges stars');
assert.deepEqual(savedStuff.completedLevelIds,['lab_candy_1'],'moving decorations preserves completed mazes');
assert.deepEqual(savedStuff.worldFriends,{candy:{homeLandId:'background_candy'}},'moving decorations preserves rescues');
assert.deepEqual(savedStuff.positions.background_candy,{'decor:donut':{x:10,y:20}},'other item positions remain intact');
clickDecor(savedStuff,'background_pirate','cupcake');
assert.ok(savedStuff.hiddenDecorations.background_pirate.includes('cupcake'),'put away without deleting ownership');
clickDecor(savedStuff,'background_pirate','cupcake');
assert.ok(!savedStuff.hiddenDecorations.background_pirate.includes('cupcake'),'restore without repurchase');
const legacyStuff={decorations:{background_candy:['cupcake'],background_pirate:[]},hiddenDecorations:{}};
clickDecor(legacyStuff,'background_pirate','cupcake');
assert.deepEqual(legacyStuff.decorations.background_pirate,['cupcake'],'old saves without positions remain compatible');
assert.match(source,/hiddenDecorations/,'students can put decorations away without losing purchases');
assert.match(source,/hiddenCompanions/,'students can put friends away without losing rescues');
assert.match(source,/collectionExtraObjects/,'students can add or put away earned items without losing progress');
assert.match(source,/const starterWorldId='background_candy'/,'every new student gets a free starter world');
assert.match(source,/if\(!a\.selectedPlayerCharacterId\)selectCharacter\(\)/,'first-time student must choose a character');
assert.match(source,/if\(!changing\)enterWithStarterWorld\(\)/,'first-time character choice goes straight to starter world');
assert.doesNotMatch(source,/changing\?map\(\):chooseLand\(\)/,'no second home-selection screen');
assert.match(source,/if\(def\.worldStage===8&&\(r\.finalArrowIndex\|\|0\)<10\)\{finalArrowChallenge\(\);return\}/,'world finale requires all ten arrows');
assert.match(source,/const valid=old&&old\.id===def\.id/,'saved maze run can be resumed');
assert.ok(buyWorld(a,'background_pirate',lands,worldCosts));assert.equal(a.wallet.rainbowStars,19);assert.ok(buyWorld(a,'background_pirate',lands,worldCosts));assert.equal(a.wallet.rainbowStars,19);
const old={selectedPlayerCharacterId:data.characters[0].id,primaryRainbowLandId:data.rainbow_lands[0].id,ownedWorldIds:[data.rainbow_lands[0].id],friends:{[data.characters[0].id]:{isRescued:true,upgradeStage:'power_up',homeLandId:data.rainbow_lands[0].id}},worldFriends:{candy:{homeLandId:'background_candy'}},positions:{rainbow_meadow:{astro_ace:{x:30,y:40}}},wallet:{rainbowStars:17},completedLevelIds:['lab_candy_1']};
const migrated=migrateAdventure(structuredClone(old),{},data.characters,lands);for(const key of Object.keys(old))assert.deepEqual(migrated[key],old[key]);
let longPatrols=0,runs=0;
for(const def of levels)for(let seed=1;seed<=40;seed++){
 const r=buildLevel(def,seed);runs++;const occupied=new Set();
 const distance=(p,q)=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y);
 if(r.items.length===2)assert.ok(distance(r.items[0],r.items[1])>=2,'items must be separated');
 assert.equal(r.hazards.length,4,`${def.id} seed ${seed}: missing enemy`);
 assert.equal(new Set(r.hazards.map(enemy=>enemy.id)).size,4,`${def.id} seed ${seed}: duplicate enemy`);
 for(const enemy of r.hazards){const own=new Set(enemy.path.map(tile));for(const pos of own){assert.ok(!occupied.has(pos));occupied.add(pos)}
  if(own.size>2)longPatrols++;
  enemy.path.forEach((p,i)=>{assert.equal(r.grid[p.y][p.x],0);assert.ok(!r.items.some(q=>tile(p)===tile(q)));if(enemy.path.length>1)assert.equal(distance(p,enemy.path[(i+1)%enemy.path.length]),1,'no jumps through walls, including loop wrap')});
 }
 let p=r.start;for(const stop of [...r.items,...(r.skill?[r.skill]:[]),r.goal]){assert.ok(route(r.grid,p,stop,occupied));p=stop}
}
assert.ok(longPatrols>0,'moving enemies have longer patrols');
console.log(`PASS: fixed eight-maze rescues; six changing patterns; eight purchasable worlds; first-play starter world; ten-arrow gate; legacy saves; ${runs} safe layouts; ${longPatrols} extended patrols with no wall crossings.`);
