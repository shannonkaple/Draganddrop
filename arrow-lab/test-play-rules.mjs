import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decorations} from '../trackpad-adventure/economy.mjs';
import {buildLevel,tile,route,directions,worldIds,pendingWorldRescue,rescueWorld,arrowPattern,buyWorld,migrateAdventure,unlockedFromSavedProgress,choosePlayerCharacter,rescueFriend,restoreSavedEnemyRoster} from './adventure-core.mjs';
import {arrowLabCharacters,pendingCharacters} from './character-placeholders.mjs';
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

const onboardingCharacters=[{id:'astro_ace'},{id:'sunny_kitten'}];
const onboardingLands=[{id:'background_candy'},{id:'background_pirate'}];
const practiceWallet={character:'astro_ace',rescued:['astro_ace']};
const firstTime=migrateAdventure(null,practiceWallet,onboardingCharacters,onboardingLands);
assert.equal(firstTime.selectedPlayerCharacterId,null,'first Arrow Lab visit must show character choice');
assert.ok(firstTime.friends.astro_ace,'legacy practice rescues are preserved while asking for a choice');
const returning=migrateAdventure({
 selectedPlayerCharacterId:'sunny_kitten',
 primaryRainbowLandId:'background_pirate',
 ownedWorldIds:['background_pirate'],
 friends:{sunny_kitten:{isRescued:true,upgradeStage:'power_up',homeLandId:'background_pirate'}},
 completedLevelIds:['lab_candy_1'],worldFriends:{candy:{homeLandId:'background_pirate'}},
 wallet:{rainbowStars:19}
},practiceWallet,onboardingCharacters,onboardingLands);
assert.equal(returning.selectedPlayerCharacterId,'sunny_kitten','returning student keeps their chosen player');
assert.equal(returning.primaryRainbowLandId,'background_pirate','existing purchased/home world survives');
assert.deepEqual(returning.completedLevelIds,['lab_candy_1'],'existing completed maze survives');
assert.equal(returning.friends.sunny_kitten.upgradeStage,'power_up','player upgrade survives');
assert.equal(returning.worldFriends.candy.homeLandId,'background_pirate','rescued world friend survives');
assert.equal(returning.wallet.rainbowStars,19,'earned stars survive');

const oldProgress={
 selectedPlayerCharacterId:'sunny_kitten',ownedWorldIds:['background_candy'],primaryRainbowLandId:'background_candy',
 friends:{sunny_kitten:{isRescued:true,upgradeStage:'power_up',homeLandId:'background_candy'}},
 completedLevelIds:['lab_candy_1','lab_candy_2','lab_candy_3'],
 wallet:{rainbowStars:37},highestUnlockedLevel:1,
 mazeRuns:{lab_candy_4:{id:'lab_candy_4',w:11,h:9,grid:Array.from({length:9},()=>Array(11).fill(0)),items:[],hazards:[],player:{x:1,y:1},seed:98}},
 positions:{background_candy:{'decor:flowers':{x:40,y:52}}},
 decorations:{background_candy:['flowers']},worldFriends:{candy:{homeLandId:'background_candy'}}
};
const recovered=migrateAdventure(structuredClone(oldProgress),{},onboardingCharacters,onboardingLands);
assert.equal(recovered.highestUnlockedLevel,4,'completed Candy mazes restore next playable maze despite stale counter');
assert.deepEqual(recovered.completedLevelIds,oldProgress.completedLevelIds,'completed mazes unchanged');
assert.deepEqual(recovered.mazeRuns,oldProgress.mazeRuns,'in-progress run never reset or rerolled');
assert.deepEqual(recovered.positions,oldProgress.positions,'world arrangements unchanged');
assert.deepEqual(recovered.decorations,oldProgress.decorations,'purchased decorations unchanged');
assert.deepEqual(recovered.worldFriends,oldProgress.worldFriends,'rescued friends unchanged');
assert.equal(recovered.wallet.rainbowStars,37,'no stars granted or lost');
assert.equal(recovered.friends.sunny_kitten.upgradeStage,'power_up','character upgrade retained');
const highRun={id:'lab_space_6',w:11,h:9,grid:Array.from({length:9},()=>Array(11).fill(0)),player:{x:1,y:1},items:[],hazards:[],complete:false};
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,mazeRuns:{lab_space_6:highRun}}),38,'valid unfinished Space maze stays reachable');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,activeRun:highRun}),38,'legacy single active run stays reachable');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,mazeRuns:{lab_space_6:{...highRun,grid:[[0]]}}}),1,'invalid saved maze geometry must not unlock stages');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_arctic_8']}),25,'completed Arctic world unlocks Castle maze one');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:60,completedLevelIds:['lab_candy_1']}),60,'do not reduce a valid higher unlock');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_fake_8','lab_candy_9'],mazeRuns:{lab_space_6:{id:'wrong'}}}),1,'ignore invalid stage IDs and mismatched runs');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_lava_8']}),64,'final world is capped at maze 64');

// Preserve legacy in-progress mazes when repairing old enemy rosters.
let legacyEnemyRepairs=0;
const legacyEnemyDef={id:'lab_candy_4',number:4,mazeGrid:{width:11,height:9},
 collectibleIds:['candy_a','candy_b'],computerGearIds:[],skillBadgeIds:[],
 primarySkill:'arrows',ducking:'none',enemyIds:['candy_one','candy_two','candy_three','candy_four']};
for(const gentle of [false,true])for(let seed=1;seed<=80;seed++){
 const saved=buildLevel(legacyEnemyDef,seed,gentle);
 const snapshot=structuredClone({player:saved.player,items:saved.items,skill:saved.skill,
   goal:saved.goal,trail:saved.trail,steps:saved.steps,seed:saved.seed});
 assert.equal(restoreSavedEnemyRoster(saved,legacyEnemyDef,gentle),false,'valid saved roster remains untouched');
 saved.hazards=saved.hazards.slice(0,2);
 const original=structuredClone(saved.hazards);
 assert.equal(restoreSavedEnemyRoster(saved,legacyEnemyDef,gentle),true,'legacy roster repaired');
 assert.equal(saved.hazards.length,4,'four enemies restored');
 assert.equal(new Set(saved.hazards.map(e=>e.id)).size,4,'four distinct world enemies');
 assert.deepEqual(saved.hazards.slice(0,2),original,'existing patrols unchanged');
 assert.deepEqual({player:saved.player,items:saved.items,skill:saved.skill,
   goal:saved.goal,trail:saved.trail,steps:saved.steps,seed:saved.seed},snapshot,
   'repair never resets student progress');
 const blocked=new Set(saved.hazards.flatMap(e=>e.path.map(tile)));
 for(const enemy of saved.hazards){
   assert.ok(enemy.path.every(p=>saved.grid[p.y]?.[p.x]===0),'no wall crossings');
   assert.ok(enemy.path.every(p=>!saved.safe.includes(tile(p))),'protected route untouched');
 }
 if(gentle)assert.ok(saved.hazards.every(e=>e.path.length===1),'Gentle enemies stationary');
 for(const goal of [...saved.items,...(saved.skill?[saved.skill]:[]),saved.goal])
   assert.ok(route(saved.grid,saved.start,goal,blocked),'objectives reachable');
 assert.equal(restoreSavedEnemyRoster(saved,legacyEnemyDef,gentle),false,'repair idempotent');
 legacyEnemyRepairs++;
}
const duplicateRun=buildLevel(legacyEnemyDef,91,false);
duplicateRun.hazards[1].id=duplicateRun.hazards[0].id;
const duplicatePaths=structuredClone(duplicateRun.hazards.map(e=>({path:e.path,index:e.index})));
assert.equal(restoreSavedEnemyRoster(duplicateRun,legacyEnemyDef),true,'duplicate enemy ID repaired');
assert.equal(new Set(duplicateRun.hazards.map(e=>e.id)).size,4);
assert.deepEqual(duplicateRun.hazards.map(e=>({path:e.path,index:e.index})),duplicatePaths,'patrols retained');
assert.match(fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8'),
 /restoreSavedEnemyRoster\(r,def,settings\.difficulty==='gentle'\)/,
 'resume invokes repair without restarting');

const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
// A partially saved legacy enemy may lack its patrol path entirely. Repair the
// roster BEFORE scanning enemy occupancy for missing pickups; never erase the run.
const resumeBlock=source.slice(source.indexOf(' function startLevel('),source.indexOf(' function maze(){'));
const repairPosition=resumeBlock.indexOf("restoreSavedEnemyRoster(r,def,settings.difficulty==='gentle')");
const objectivePosition=resumeBlock.indexOf("ensureRunObjectives(r,def)");
assert.ok(repairPosition>=0&&objectivePosition>repairPosition,'legacy patrol repair precedes missing-item placement');
const objectiveCode=source.slice(source.indexOf(' function ensureRunObjectives('),source.indexOf(' function startLevel('));
const addMissingObjectives=new Function('tile','route',objectiveCode+';return ensureRunObjectives;')(tile,route);
for(const gentle of [false,true]){
 const grid=Array.from({length:9},(_,y)=>Array.from({length:11},(_,x)=>x>0&&x<10&&y>0&&y<8?0:1));
 const saved={id:legacyEnemyDef.id,w:11,h:9,grid,start:{x:1,y:1},goal:{x:9,y:7},
  player:{x:1,y:1},checkpoint:{x:1,y:1},steps:13,seed:55,
  items:[{id:'candy_a',x:3,y:3,collected:true}],skill:null,barrier:null,
  hazards:[{id:'candy_one',index:0},null],trail:[[1,1]],safe:['1,1','2,1','3,1']};
 const before=structuredClone({player:saved.player,checkpoint:saved.checkpoint,steps:saved.steps,trail:saved.trail,seed:saved.seed});
 assert.equal(restoreSavedEnemyRoster(saved,legacyEnemyDef,gentle),true,'invalid legacy patrols repaired');
 assert.doesNotThrow(()=>addMissingObjectives(saved,legacyEnemyDef),'missing objectives never crash on legacy enemy data');
 assert.equal(saved.hazards.length,4,'all four distinct enemies restored from corrupt save');
 assert.equal(new Set(saved.hazards.map(enemy=>enemy.id)).size,4);
 assert.ok(saved.hazards.every(enemy=>enemy.path.length>0));
 if(gentle)assert.ok(saved.hazards.every(enemy=>enemy.path.length===1));
 assert.equal(saved.items.length,2,'missing collectible restored without regenerating maze');
 assert.equal(saved.items[0].collected,true,'previously collected item remains collected');
 assert.ok(route(saved.grid,saved.player,saved.items[1],new Set(saved.hazards.flatMap(enemy=>enemy.path.map(tile)))),'restored item is reachable without enemy patrol');
 assert.deepEqual({player:saved.player,checkpoint:saved.checkpoint,steps:saved.steps,trail:saved.trail,seed:saved.seed},before,'saved player and route untouched');
}


const switching={selectedPlayerCharacterId:'a',friends:{a:{upgradeStage:'super_power',homeLandId:'background_pirate'}},unlockedCharacterIds:['a','old'],wallet:{rainbowStars:15},ownedWorldIds:['background_pirate'],positions:{background_pirate:{a:{x:42,y:38}}}};
const snapshot=structuredClone(switching);
assert.equal(choosePlayerCharacter(switching,'b','background_candy'),true);
assert.deepEqual(switching.unlockedCharacterIds,['a','old','b']);
for(const key of ['wallet','ownedWorldIds','positions'])assert.deepEqual(switching[key],snapshot[key]);
assert.deepEqual(switching.friends.a,snapshot.friends.a);
assert.equal(choosePlayerCharacter(switching,'a','background_candy'),true);
assert.equal(switching.friends.a.upgradeStage,'super_power');
assert.equal(choosePlayerCharacter(switching,'','background_candy'),false);
// Regression: the previous migration silently dropped unlocked IDs not currently
// present in the friends object. This happened again on every Chromebook reload.
const savedUnlocks={
 selectedPlayerCharacterId:'sunny_kitten',
 friends:{sunny_kitten:{isRescued:true,upgradeStage:'super_power',homeLandId:'background_pirate'}},
 unlockedCharacterIds:['sunny_kitten','legacy_guest','retired_friend','sunny_kitten'],
 wallet:{rainbowStars:31},ownedWorldIds:['background_pirate'],
 primaryRainbowLandId:'background_pirate',completedLevelIds:['lab_candy_1'],
 positions:{background_pirate:{'decor:flowers':{x:34,y:58}}}
};
const preservedUnlocks=migrateAdventure(structuredClone(savedUnlocks),{},onboardingCharacters,onboardingLands);
assert.deepEqual(preservedUnlocks.unlockedCharacterIds,['sunny_kitten','legacy_guest','retired_friend'],
 'loading a saved student must not discard previously unlocked character IDs');
assert.deepEqual(migrateAdventure(structuredClone(preservedUnlocks),{},onboardingCharacters,onboardingLands).unlockedCharacterIds,
 preservedUnlocks.unlockedCharacterIds,'a second reload must preserve the same unlocked roster');
for(const field of ['wallet','ownedWorldIds','completedLevelIds','positions'])assert.deepEqual(preservedUnlocks[field],savedUnlocks[field]);
assert.equal(preservedUnlocks.friends.sunny_kitten.upgradeStage,'super_power');
const rescueKeepsUnlocks={
 friends:{sunny_kitten:{upgradeStage:'power_up',homeLandId:'background_candy'}},
 unlockedCharacterIds:['legacy_guest','sunny_kitten'],
 completedLevelIds:Array.from({length:8},(_,i)=>'lab_candy_'+(i+1)),
 rescuedAtLevelIds:[],worldFriends:{},ownedWorldIds:['background_candy']
};
assert.equal(rescueFriend(rescueKeepsUnlocks,'new_rescue','background_candy','lab_candy_8'),true);
assert.deepEqual(rescueKeepsUnlocks.unlockedCharacterIds,['legacy_guest','sunny_kitten','new_rescue'],
 'rescuing another character must not erase earlier unlock IDs');

assert.match(source,/chars\.map\(c=>/);
assert.match(source,/choosePlayerCharacter\(a,id,starterWorldId\)/);

const luna=pendingCharacters.find(c=>c.id==='luna_axolotl');
assert.ok(luna,'Luna keeps the same student character ID');
assert.equal(luna.artworkPending,false,'Luna uses her actual original individual PNG');
assert.deepEqual(luna.levels.map(l=>l.image),Array(3).fill('arrow-lab/characters/luna_axolotl.png'),'Luna PNG used consistently at all saved upgrade stages');
assert.equal(pendingCharacters.length,10,'all ten existing character IDs remain registered');
assert.equal(pendingCharacters.filter(c=>c.artworkPending).length,9,'unpublished characters retain honest labelled placeholders');
assert.ok(pendingCharacters.filter(c=>c.artworkPending).every(c=>c.levels.every(l=>l.image==='pending:character:'+c.id)),'do not substitute another character for missing art');
const suppliedFriends={
 pirate:'pirate-parrot',arctic:'arctic-penguin',castle:'royal-dragon',
 space:'space-alien',jurassic:'explorer-dino',ocean:'ocean-dolphin',lava:'lava-dragon'
};
const friendRosterText=source.slice(source.indexOf('const approvedFriendFiles='),source.indexOf(' const homeArt='));
assert.ok(friendRosterText.startsWith('const approvedFriendFiles='),'friend roster source is present');
const publishedFriends=new Function('worldThemes',friendRosterText+';return companions;')([{id:'candy'},...Object.keys(suppliedFriends).map(id=>({id}))]);
assert.equal(publishedFriends.length,8,'eight fixed world companions, not selectable substitutes');
assert.equal(publishedFriends[0].art,'arrow-lab/friends/candy-bunny.png','approved Candy Bunny remains unchanged');
for(const [world,slug] of Object.entries(suppliedFriends)){
 const friend=publishedFriends.find(c=>c.id===world);
 assert.equal(friend.art,'arrow-lab/friends/'+slug+'.png',world+' uses the exact teacher-supplied image');
 assert.equal(friend.approvedArtPath,friend.art,world+' displayed art matches approved file path');
}

const data=Object.fromEntries(['characters','rainbow_lands','levels','game_config','computer_collectibles'].map(n=>[n,JSON.parse(fs.readFileSync(new URL('../rainbow-road/data/'+n+'.json',import.meta.url)))]));
const defs=source.slice(source.indexOf(' const worldThemes='),source.indexOf(' let stored;'));

const {levels,lands,backgroundHomes,worldCosts}=new Function('data','storageKey','decorations','arrowLabCharacters',defs+';return {levels,lands,backgroundHomes,worldCosts}')(data,'test',decorations,arrowLabCharacters);

const shopText=source.slice(source.indexOf('const shopExclusives=['),source.indexOf('const fullDecorations=['));
const shopExclusives=new Function(shopText+';return shopExclusives;')();
assert.equal(shopExclusives.length,24,'24 genuinely shop-only decoration IDs');
assert.equal(new Set(shopExclusives.map(d=>d.id)).size,24,'no duplicate store item ID');
for(const world of worldIds){
 const offers=shopExclusives.filter(d=>d.world===world);
 assert.equal(offers.length,3,world+' must have three shop-only offers');
 for(const item of offers){
   assert.ok(item.shopOnly&&item.kind==='decor'&&item.cost>0);
   assert.ok(!levels.some(level=>level.collectibleIds?.includes(item.id)),'shop-only item never appears as a maze collectible');
   assert.ok(!levels.some(level=>level.computerGearIds?.includes(item.id)||level.skillBadgeIds?.includes(item.id)),'shop-only item never awarded during level completion');
 }
}
assert.match(source,/const worldOnlyGoods=shopExclusives\.filter/,'MY STUFF shows only current world store offers');
assert.match(source,/data-buy-shop-only/,'MY STUFF contains direct purchase controls');
assert.match(source,/exclusiveStore\+/, 'shop is on MY STUFF page below existing earned-items tray');
const purchaseBody=source.slice(source.indexOf('function buyShopExclusive('),source.indexOf('function starShop(){'));
const buyState={wallet:{rainbowStars:50},ownedWorldIds:['background_candy','background_pirate'],decorations:{background_candy:['legacy_cupcake'],background_pirate:['legacy_anchor']},hiddenDecorations:{background_candy:['shop_candy_sweet_tree']},completedLevelIds:['lab_candy_1'],mazeRuns:{lab_candy_2:{player:{x:4,y:5}}},worldFriends:{candy:{homeLandId:'background_candy'}}};
const beforeBuying=structuredClone({completedLevelIds:buyState.completedLevelIds,mazeRuns:buyState.mazeRuns,worldFriends:buyState.worldFriends});
let purchaseSaves=0;
const purchaseExclusive=new Function('shopExclusives','backgroundHomes','owned','a','save',purchaseBody+';return buyShopExclusive;')(shopExclusives,backgroundHomes,id=>buyState.ownedWorldIds.includes(id),buyState,()=>purchaseSaves++);
assert.equal(purchaseExclusive('background_candy','shop_candy_sweet_tree'),true);
assert.equal(purchaseExclusive('background_candy','shop_candy_sweet_tree'),false,'never charge twice');
assert.equal(purchaseExclusive('background_pirate','shop_candy_sweet_tree'),false,'shop excludes wrong-world offers');
assert.equal(purchaseExclusive('background_arctic','shop_arctic_ice_crystals'),false,'cannot buy into an unowned world');
assert.equal(purchaseExclusive('background_pirate','shop_pirate_trail_sign'),true);
assert.equal(buyState.wallet.rainbowStars,41,'deduct five Candy and four Pirate stars once only');
assert.equal(purchaseSaves,2,'save each successful purchase');
assert.deepEqual(buyState.decorations.background_candy,['legacy_cupcake','shop_candy_sweet_tree'],'legacy purchases retained');
assert.deepEqual(buyState.decorations.background_pirate,['legacy_anchor','shop_pirate_trail_sign'],'other world retained');
assert.ok(!buyState.hiddenDecorations.background_candy.includes('shop_candy_sweet_tree'),'purchased item starts available to place');
assert.deepEqual({completedLevelIds:buyState.completedLevelIds,mazeRuns:buyState.mazeRuns,worldFriends:buyState.worldFriends},beforeBuying,'purchases never erase saved game or rescues');

const allCharacters=arrowLabCharacters(data.characters);
assert.equal(pendingCharacters.length,10,'ten legacy characters are available in Arrow Lab only');
assert.equal(allCharacters.length,data.characters.length+10,'all ten missing character IDs restored');
assert.equal(new Set(allCharacters.map(c=>c.id)).size,allCharacters.length,'no duplicate IDs');
for(const character of pendingCharacters){
 assert.equal(character.levels.length,3,'all upgrade stages retained');
 for(const level of character.levels)assert.equal(level.image,character.id==='luna_axolotl'?'arrow-lab/characters/luna_axolotl.png':'pending:character:'+character.id,'published art or honest placeholder for each stable ID');
}
const legacyPlayerSave={
 selectedPlayerCharacterId:'luna_axolotl',ownedWorldIds:['background_pirate'],primaryRainbowLandId:'background_pirate',
 friends:{luna_axolotl:{isRescued:true,upgradeStage:'super_power',homeLandId:'background_pirate',customNote:'keep me'},
          retired_friend:{isRescued:true,homeLandId:'background_candy',gift:'heart'}},
 wallet:{rainbowStars:22},completedLevelIds:['lab_candy_1'],worldFriends:{candy:{homeLandId:'background_pirate'}}
};
const restoredPlayer=migrateAdventure(structuredClone(legacyPlayerSave),{},allCharacters,lands);
assert.equal(restoredPlayer.selectedPlayerCharacterId,'luna_axolotl','saved character must not force new onboarding');
assert.equal(restoredPlayer.friends.luna_axolotl.upgradeStage,'super_power','upgrade retained');
assert.equal(restoredPlayer.friends.luna_axolotl.customNote,'keep me','custom metadata retained');
assert.equal(restoredPlayer.friends.retired_friend.gift,'heart','unrecognized saved friend retained');
assert.equal(restoredPlayer.wallet.rainbowStars,22,'stars retained');
assert.equal(restoredPlayer.primaryRainbowLandId,'background_pirate','purchased home retained');
assert.deepEqual(restoredPlayer.completedLevelIds,['lab_candy_1'],'completed maze retained');
assert.deepEqual(restoredPlayer.worldFriends,legacyPlayerSave.worldFriends,'rescue retained');
const unavailable=migrateAdventure({selectedPlayerCharacterId:'retired_friend',friends:{retired_friend:{homeLandId:'background_candy'}}},{},allCharacters,lands);
assert.equal(unavailable.selectedPlayerCharacterId,null,'truly unknown character needs a new choice');
assert.equal(unavailable.unavailableSelectedPlayerCharacterId,'retired_friend','retain unknown selected ID for later restoration');
assert.ok(unavailable.friends.retired_friend,'retain original friend record');
assert.match(source,/const chars=arrowLabCharacters\(data\.characters\)/,'local roster is merged only for Arrow Lab');
assert.match(source,/pending-character-note/,'missing portraits visibly labelled');
const markerSource=source.slice(source.indexOf("const img=(p,name,cls='')=>"),source.indexOf('const readJSON=async'));
const markerRender=new Function('esc','asset',markerSource+';return img;')(s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),p=>p);
const missingPortrait=markerRender('pending:character:cosmo_fox','Cosmo Fox','friend-art');
assert.match(missingPortrait,/ART COMING SOON/,'portrait has honest placeholder label');
assert.doesNotMatch(missingPortrait,/<img/,'no broken image URL');
assert.match(source,/const p=at\(c,i\),name=char\(c\)\?\.name/,'unknown saved friends render safely in MY STUFF');



const starterMigration=source.slice(source.indexOf(" const starterWorldId='background_candy';"),source.indexOf(' const char='));
assert.ok(starterMigration.includes('ownedWorldIds'),'locate the real starter-world migration');
const grantStarter=new Function('a','lands',starterMigration+';return a');
const newStudent=grantStarter({ownedWorldIds:[],friends:{}},onboardingLands);
assert.ok(newStudent.ownedWorldIds.includes('background_candy'),'new student receives free Candy world');
assert.equal(newStudent.primaryRainbowLandId,'background_candy','new student has a world without home selection');
const existingStudent=grantStarter({
 ownedWorldIds:['background_pirate'],primaryRainbowLandId:'background_pirate',
 friends:{sunny_kitten:{homeLandId:'background_pirate'}},completedLevelIds:['lab_candy_1'],
 wallet:{rainbowStars:19}
},onboardingLands);
assert.ok(existingStudent.ownedWorldIds.includes('background_candy'),'returning student also owns free starter');
assert.equal(existingStudent.primaryRainbowLandId,'background_pirate','do not override returning student chosen home');
assert.equal(existingStudent.friends.sunny_kitten.homeLandId,'background_pirate','preserve friend home');
assert.deepEqual(existingStudent.completedLevelIds,['lab_candy_1'],'preserve maze completion');
assert.equal(existingStudent.wallet.rainbowStars,19,'do not change stars');
assert.equal(backgroundHomes.length,8);assert.deepEqual(backgroundHomes.map(l=>l.id),worldIds.map(id=>'background_'+id));
assert.equal(levels.length,64,'eight worlds with eight mazes each');
for(const def of levels){
 assert.equal(def.collectibleIds.length,2,`${def.id} must have two objective pickups`);
 assert.equal(new Set(def.collectibleIds).size,2,`${def.id} must have two distinct pickups`);
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
assert.ok(source.includes("const appScroll=$('app').scrollTop, pageScroll=window.scrollY"),'adding items preserves page and tray scroll positions');
assert.ok(source.includes('Object.values(a.decorations||{}).flat()'),'MY STUFF shows all decorations purchased across all owned worlds');
assert.match(source,/Move to This World/,'MY STUFF offers cross-world decoration moves without buying again');

assert.doesNotMatch(source,/💻 MY COLLECTIONS/,'Candy World navigation uses MY STUFF');
assert.match(source,/class="lab-activity-card.*aria-disabled=/,'other world level cards keep click handlers while locked');
const lockedHandler=source.match(/document\.querySelectorAll\('\.lab-activity-card\[data-level\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{([\s\S]*?)\n   \}\);/);
assert.ok(lockedHandler,'locate real non-Candy maze click handler');
const stageClick=new Function('b','i','world','modal','startLevel','esc','$','closeModal',lockedHandler[1]);
let launches=[],notices=[],backs=0,backButton={};
const showModal=(title,body,bind)=>{notices.push({title,body});bind({})};
const findButton=id=>{assert.equal(id,'locked-maze-back');return backButton};
const context=[1,{name:'Pirate'},showModal,n=>launches.push(n),s=>s,findButton,()=>backs++];
stageClick({dataset:{level:'11'},getAttribute:()=> 'true'},...context);
assert.equal(launches.length,0,'locked maze must not start');
assert.match(notices[0].body,/Pirate maze 2/,'identifies preceding maze');
backButton.onclick();assert.equal(backs,1,'return button works');
stageClick({dataset:{level:'10'},getAttribute:()=> 'false'},...context);
assert.deepEqual(launches,[10],'unlocked maze launches');

const enemyHit=source.match(/function hit\(\)\{([\s\S]*?)\n \}/);
assert.ok(enemyHit,'locate actual enemy collision handler');
const executeHit=new Function('r','status','save','draw',enemyHit[1]);
const hitState={start:{x:1,y:1},checkpoint:{x:7,y:7},player:{x:9,y:8},trail:[[1,1],[4,5]],items:[{id:'candy',collected:true}],hazards:[{id:'enemy',index:2}],finalArrowIndex:3};
let hitSaves=0,hitDraws=0,hitMessage='';
executeHit(hitState,message=>hitMessage=message,()=>hitSaves++,()=>hitDraws++);
assert.deepEqual(hitState.player,hitState.start,'bad guy contact returns player to maze start');
assert.deepEqual(hitState.checkpoint,hitState.start,'next bad guy cannot bounce player to old checkpoint');
assert.equal(hitState.items[0].collected,true,'collision does not erase collected objectives');
assert.equal(hitState.hazards[0].index,2,'collision does not reroll enemy patrol');
assert.equal(hitState.finalArrowIndex,3,'collision preserves saved final arrow progress');
assert.equal(hitSaves,1);assert.equal(hitDraws,1);
assert.match(hitMessage,/START/,'student hears the start reset rule');
assert.doesNotMatch(source,/class="enemy-direction"/,'there are no enemy direction arrow graphics');
assert.doesNotMatch(source,/class="enemy-next-tile"/,'there are no future destination markers');
assert.match(source,/enemy-about-to-move/,'enemy animates briefly at its OWN tile before stepping');

const migrateObjectives=source.slice(source.indexOf(' function ensureRunObjectives('),source.indexOf(' function startLevel('));
assert.ok(migrateObjectives.includes('run.items.push'),'old saved mazes gain missing objectives in-place');
const reconcile=new Function('tile','route',migrateObjectives+';return ensureRunObjectives')(tile,route);
const oldDef=levels.find(d=>d.id==='lab_space_2');
const savedOldRun=buildLevel(oldDef,317);
savedOldRun.items=[];savedOldRun.player={x:1,y:1};savedOldRun.checkpoint={x:3,y:3};savedOldRun.finalArrowIndex=4;
const savedGrid=structuredClone(savedOldRun.grid),savedEnemies=structuredClone(savedOldRun.hazards);
reconcile(savedOldRun,oldDef);
assert.equal(savedOldRun.items.length,2,'old zero-item maze gains two objectives without rerolling');
assert.deepEqual(savedOldRun.grid,savedGrid,'existing maze layout preserved');
assert.deepEqual(savedOldRun.hazards,savedEnemies,'enemy positions and paths preserved');
assert.deepEqual(savedOldRun.player,{x:1,y:1},'player position preserved');
assert.deepEqual(savedOldRun.checkpoint,{x:3,y:3},'saved checkpoint preserved');
assert.equal(savedOldRun.finalArrowIndex,4,'final arrow trial progress preserved');



const skillSequenceSource=source.slice(source.indexOf(' function ensureSkillArrowSequence('),source.indexOf(' function challenge(kind)'));
assert.ok(skillSequenceSource.includes('run.skillArrowSequence'),'the actual skill challenge must store its arrow sequence in the maze run');
const ensureSkillArrowSequence=new Function('arrowPattern','directions',skillSequenceSource+';return ensureSkillArrowSequence;')(arrowPattern,directions);
const interruptedSkill={seed:1234,patternAttempt:0,skill:{done:false},skillArrowIndex:0};
const originalSkill=ensureSkillArrowSequence(interruptedSkill);
assert.equal(originalSkill.length,4,'first skill pattern has four arrows');
const attemptsAfterStart=interruptedSkill.patternAttempt;
interruptedSkill.skillArrowIndex=2;
const reloadedSkill=structuredClone(interruptedSkill);
assert.deepEqual(ensureSkillArrowSequence(reloadedSkill),originalSkill,'returning to a skill tile reuses the saved sequence');
assert.equal(reloadedSkill.skillArrowIndex,2,'returning student retains two correct presses');
assert.equal(reloadedSkill.patternAttempt,attemptsAfterStart,'returning to challenge never increments pattern attempt');
const anotherSkill={seed:1234,patternAttempt:2};
assert.notDeepEqual(ensureSkillArrowSequence(anotherSkill),originalSkill,'a fresh later attempt uses a different arrow pattern');
const legacySkill={seed:12,patternAttempt:3,skill:{done:false}};
assert.equal(ensureSkillArrowSequence(legacySkill).length,4,'old saved maze without arrow fields migrates without a reset');
assert.match(source,/if\(r\.skill&&!r\.skill\.done&&tile\(r\.player\)===tile\(r\.skill\)\)/,'resume on the skill tile automatically reopens the challenge');
assert.match(source,/r\.skillArrowIndex=i;save\(\)/,'each correct keyboard press saves progress');
assert.match(source,/sequenceHtml\(i\)/,'reopened challenge shows the saved progress');
assert.doesNotMatch(source,/\$\('try-later'\)\.onclick=\(\)=>\{[^}]*r\.player=/,'leaving the skill popup does not teleport player to checkpoint');

const css=fs.readFileSync(new URL('./visual-hotfix-20261027.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
assert.match(source,/class="dialog-toolbar"/,'every in-game popup has a dedicated control row');
assert.match(source,/class="dialog-content"/,'every popup has a separate content wrapper');
assert.match(source,/d\.scrollTop=0/,'reused popups reset scroll to show the heading');
assert.match(source,/requestAnimationFrame\(\(\)=>\$\('adventure-maze'\)\?\.focus/,'closing a maze popup restores keyboard focus');
assert.match(css,/robust native-dialog sizing/,'native modal layout correction is installed');
assert.match(css,/height:max-content!important/,'dialogs size to their content instead of stretching to viewport');
assert.match(css,/max-height:calc\(100dvh - 24px\)/,'dialogs scroll inside the visible viewport');
assert.match(css,/\.dialog-toolbar\{/,'popup navigation stays visible while content scrolls');
assert.match(css,/\.dialog-content\{/,'popup content has independent safe sizing');
assert.match(css,/Responsive full-width illustrated JPEG heading/,'approved art fills the header');
assert.match(css,/\.brand>img\.lab-header-art\{/,'the header displays a single full-width image');
assert.match(css,/my-stuff-tray-controls/,'MY STUFF collection can be scrolled horizontally');
assert.match(css,/scroll-snap-type:x mandatory/,'items are organized in a one-row scrollable shelf');
assert.match(css,/background:#1b2b5c!important/,'walls are fully opaque');
assert.match(css,/color-mix\(in srgb,var\(--c\) 67%,white\)/,'rainbow paths stay colorful');
assert.match(css,/object-fit:contain!important/,'full-width approved JPEG header is never cropped or stretched');
assert.match(css,/height:clamp\(150px,min\(calc\(100vw \* 0\.143333 \+ 46px\),32dvh\),260px\)/,'header height accounts for the 3000:430 JPEG aspect at Chromebook width without cropping');
assert.match(html,/<img[^>]*id="lab-jpeg-banner"[^>]*src="\.\/assets\/arrow-adventure-header-permanent\.jpg\?v=20261028-static"[^>]*width="3000" height="430"/,'approved banner is a permanent, correctly proportioned JPEG asset');
assert.match(html,/visual-hotfix-20261027\.css\?v=fullwidth-chromebook-20261028a/,'published page references color and header fix');
assert.match(html,/game\.mjs\?v=visual-help-20261028a/,'published page references the updated game module');
assert.doesNotMatch(html,/toDataURL\(|createElement\('canvas'\)/,'the header is not generated by a browser canvas');
const bannerBytes=fs.readFileSync(new URL('./assets/arrow-adventure-header-permanent.jpg',import.meta.url));
assert.deepEqual([...bannerBytes.subarray(0,3)],[0xff,0xd8,0xff],'published header is a real JPEG, not renamed PNG bytes');
assert.ok(bannerBytes.length>100000,'permanent banner contains the actual approved illustrated artwork');
assert.match(fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8'),/adventure\.mjs\?v=visual-help-20261028a/,'published game requests the latest adventure module');


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
let longPatrols=0,runs=0,extendedMovingPatrols=0,eligibleMovingPatrols=0;
for(const def of levels)for(let seed=1;seed<=40;seed++){
 const r=buildLevel(def,seed);runs++;const occupied=new Set();
 const distance=(p,q)=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y);
 if(r.items.length===2)assert.ok(distance(r.items[0],r.items[1])>=2,'items must be separated');
 assert.equal(r.hazards.length,4,`${def.id} seed ${seed}: missing enemy`);
 assert.equal(new Set(r.hazards.map(enemy=>enemy.id)).size,4,`${def.id} seed ${seed}: duplicate enemy`);
 for(const enemy of r.hazards){const own=new Set(enemy.path.map(tile));for(const pos of own){assert.ok(!occupied.has(pos));assert.ok(!r.safe.includes(pos),'enemy never enters the protected student route');occupied.add(pos)}
  if(own.size>2)longPatrols++;
   if(def.number>=4&&!['prickly_cactus','chomper_plant'].includes(enemy.id)){
      eligibleMovingPatrols++;
      assert.ok(own.size>=3&&own.size<=5,`${def.id} seed ${seed} ${enemy.id}: moving bad guy must patrol 2–4 connected squares out and back`);
      extendedMovingPatrols++;
    }
   assert.ok(enemy.path.length===1||(enemy.path.length>=2&&enemy.path.length<=8&&enemy.path.length%2===0),'patrols must be 1–4 connected squares out and back');
   if(enemy.path.length>2){const out=enemy.path.length/2;for(let k=1;k<out;k++)assert.deepEqual(enemy.path[out+k],enemy.path[out-k],'return patrol retraces the exact outward path')};
  enemy.path.forEach((p,i)=>{assert.equal(r.grid[p.y][p.x],0);assert.ok(!r.items.some(q=>tile(p)===tile(q)));if(enemy.path.length>1)assert.equal(distance(p,enemy.path[(i+1)%enemy.path.length]),1,'no jumps through walls, including loop wrap')});
 }
 let p=r.start;for(const stop of [...r.items,...(r.skill?[r.skill]:[]),r.goal]){assert.ok(route(r.grid,p,stop,occupied));p=stop}
}
assert.ok(longPatrols>0,'moving enemies have longer patrols');
assert.equal(extendedMovingPatrols,eligibleMovingPatrols,'EVERY eligible moving enemy must have a 2–4-square outward patrol');
assert.match(fs.readFileSync(new URL('./adventure-core.mjs',import.meta.url),'utf8'),/Reserve connected, disjoint outward patrols/,'new runs allocate separate connected enemy patrols before spawning');
assert.match(source,/stuff-scroll-prev/,'MY STUFF has a previous button');
assert.match(source,/stuff-scroll-next/,'MY STUFF has a next button');
assert.match(source,/trayScroll=\$\('my-stuff-tray'\)/,'refresh preserves horizontal scroll position');
assert.match(source,/scrollBy\(\{left:dir\*Math\.max/,'trackpad shelf navigation moves horizontally by visible shelf width');
assert.match(source,/collectionShelf\?\.addEventListener\('wheel'/,'MY STUFF listens for trackpad wheel events');
assert.match(source,/collectionShelf\.scrollLeft=Math\.max\(0,Math\.min\(max,collectionShelf\.scrollLeft\+delta\)\)/,'shelf wheel movement is clamped');
assert.match(source,/event\.ctrlKey\|\|collectionShelf\.scrollWidth<=collectionShelf\.clientWidth\+1/,'wheel zoom and non-scrollable shelves are ignored');
assert.match(source,/collectionShelf\?\.addEventListener\('keydown'/,'shelf supports physical keyboard arrows');
assert.match(source,/Start this maze over\?/,'restart requires confirmation');
assert.match(source,/id="keep-maze"/,'restart offers a safe cancel button');
assert.match(source,/id="confirm-restart"/,'restart has explicit confirmation button');
assert.match(source,/if\(restart\)delete a\.mazeRuns\[def\.id\]/,'restart removes only current maze run');

// Exercise actual Chromebook wheel handler and prevent page-scroll trapping.
const fixtureShelfCode=source.slice(source.indexOf("  const collectionShelf=$('my-stuff-tray');"),source.indexOf("  document.querySelectorAll('[data-stuff-world]')"));
const fixtureListeners={};
const fixtureShelf={scrollWidth:900,clientWidth:300,scrollLeft:100,addEventListener:(type,fn,opts)=>{fixtureListeners[type]={fn,opts}}};
const fixtureSteps=[];
new Function('$','scrollTray',fixtureShelfCode)(()=>fixtureShelf,d=>fixtureSteps.push(d));
let fixturePrevent=0;
const fixtureWheel=(dx,dy,ctrl=false)=>fixtureListeners.wheel.fn({deltaX:dx,deltaY:dy,ctrlKey:ctrl,preventDefault:()=>fixturePrevent++});
fixtureWheel(0,85);assert.equal(fixtureShelf.scrollLeft,185,'two-finger vertical scroll moves shelf');
fixtureWheel(-25,0);assert.equal(fixtureShelf.scrollLeft,160,'horizontal scroll still works');
fixtureShelf.scrollLeft=0;fixtureWheel(0,-80);assert.equal(fixturePrevent,2,'scroll up at start passes to page');
fixtureShelf.scrollLeft=600;fixtureWheel(0,80);assert.equal(fixturePrevent,2,'scroll down at end passes to page');
fixtureShelf.scrollLeft=200;fixtureWheel(0,90,true);assert.equal(fixtureShelf.scrollLeft,200,'control-wheel zoom remains native');
fixtureListeners.keydown.fn({key:'ArrowLeft',preventDefault:()=>{}});
fixtureListeners.keydown.fn({key:'ArrowRight',preventDefault:()=>{}});
assert.deepEqual(fixtureSteps,[-1,1],'focused shelf supports left/right keyboard');

// A Start Over click is safe until the student explicitly confirms it.
const fixtureRestartStart=source.indexOf("$('restart-level').onclick=()=>modal('Start this maze over?'");
const fixtureRestartEnd=source.indexOf(";$('hint-route').onclick",fixtureRestartStart);
assert.ok(fixtureRestartStart>0&&fixtureRestartEnd>fixtureRestartStart,'restart handler is present');
const fixtureRestartCode=source.slice(fixtureRestartStart,fixtureRestartEnd)+';';
const fixtureButtons={'restart-level':{},'keep-maze':{},'confirm-restart':{}};
let fixtureDialogs=0,fixtureResets=[],fixtureCloses=0,fixtureNotice='';
new Function('$','modal','closeModal','status','startLevel','def','challengeKeys',fixtureRestartCode)(
 id=>fixtureButtons[id],
 (title,html,bind)=>{fixtureDialogs++;assert.match(title,/Start this maze over/);assert.match(html,/other mazes, stars, friends/);bind()},
 ()=>fixtureCloses++,message=>{fixtureNotice=message},(n,reset)=>fixtureResets.push([n,reset]),{number:17},null
);
fixtureButtons['restart-level'].onclick();
assert.equal(fixtureDialogs,1);assert.equal(fixtureResets.length,0,'opening restart confirmation does not reset');
fixtureButtons['keep-maze'].onclick();
assert.equal(fixtureResets.length,0,'Keep My Progress preserves maze');
assert.match(fixtureNotice,/progress is safe/);
fixtureButtons['restart-level'].onclick();fixtureButtons['confirm-restart'].onclick();
assert.deepEqual(fixtureResets,[[17,true]],'only explicit confirmation restarts current maze');
assert.equal(fixtureCloses,2,'cancel and confirm close popup');

// Gentle mode still has four different themed bad guys, but they stay put.
 // Hints must route around EVERY square in an enemy's patrol, not into danger.
const safeHintCode=source.slice(source.indexOf(' function safeHint('),source.indexOf(' function status('));
assert.match(safeHintCode,/blocked=new Set/,'hint avoids all enemy patrol tiles');
assert.match(source,/status\(safeHint\(r,target\)\)/,'Help Me actually calls the safe hint');
const safeHintFixture=new Function('route','tile','directions',safeHintCode+';return safeHint;')(route,tile,directions);
let gentleRuns=0;
for(const level of levels)for(let seed=1;seed<=20;seed++){
 const easyRun=buildLevel(level,seed,true);gentleRuns++;
 assert.equal(easyRun.hazards.length,4,`${level.id} gentle: four visible bad guys`);
 assert.equal(new Set(easyRun.hazards.map(e=>e.id)).size,4,`${level.id} gentle: distinct enemy types`);
 const blocked=new Set(easyRun.hazards.flatMap(enemy=>enemy.path.map(tile)));
 for(const enemy of easyRun.hazards){
   assert.equal(enemy.path.length,1,'gentle bad guys stay still');
   assert.ok(!easyRun.safe.includes(tile(enemy.path[0])),'gentle enemy stays off protected route');
 }
 let from=easyRun.start;
 for(const goal of [...easyRun.items,...(easyRun.skill?[easyRun.skill]:[]),easyRun.goal]){
   assert.ok(route(easyRun.grid,from,goal,blocked),`${level.id}: gentle objective stays reachable without crossing enemy`);
   from=goal;
 }
 assert.match(safeHintFixture(easyRun,easyRun.items[0]),/^(Try|Hold SPACE)/,'Help Me gives a safe next move');
}
const hintGrid=[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]];
const hintRun={grid:hintGrid,player:{x:1,y:1},hazards:[{path:[{x:2,y:1}]}],barrier:null};
assert.match(safeHintFixture(hintRun,{x:3,y:1}),/^Try DOWN/,'hint never recommends a direct step into an enemy');
hintRun.hazards=[];hintRun.barrier={x:2,y:1};
assert.match(safeHintFixture(hintRun,{x:3,y:1}),/^Hold SPACE and press RIGHT/,'hint teaches ducking at the bridge');

console.log(`PASS: fixed eight-maze rescues; six changing patterns; eight purchasable worlds; first-play starter world; ten-arrow gate; legacy saves; ${runs} safe layouts; ${longPatrols} extended patrols with no wall crossings; ${extendedMovingPatrols} moving enemies patrol 2–4 squares out and back; ${gentleRuns} gentle mazes retain four stationary bad guys and safe hints.`);



// Candy locked hotspots show a compact in-game dialog, not a browser alert.
const candyHandler=source.match(/document\.querySelectorAll\('\.lab-candy-node\[data-level\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{([\s\S]*?)\n   \}\);/);
assert.ok(candyHandler,'Candy hotspot handler exists');
const candyClick=new Function('b','modal','startLevel','$','closeModal',candyHandler[1]);
const candyButtons={'locked-candy-back':{}},candyNotices=[],candyLaunches=[];
const candyModal=(title,body,bind)=>{candyNotices.push({title,body});bind()};
candyClick({dataset:{level:'5'},getAttribute:()=> 'true'},candyModal,n=>candyLaunches.push(n),id=>candyButtons[id],()=>candyNotices.push({closed:true}));
assert.equal(candyLaunches.length,0,'locked Candy maze cannot launch');
assert.match(candyNotices[0].title,/Candy maze 5 is locked/);
assert.match(candyNotices[0].body,/First finish Candy maze 4/);
candyButtons['locked-candy-back'].onclick();
assert.equal(candyNotices.at(-1).closed,true,'Candy locked popup closes');
candyClick({dataset:{level:'5'},getAttribute:()=> 'false'},candyModal,n=>candyLaunches.push(n),id=>candyButtons[id],()=>{});
assert.deepEqual(candyLaunches,[5],'unlocked Candy maze launches');
assert.doesNotMatch(source,/alert\('Maze '\+number\+' is locked/,'Candy locked hotspots never use browser alert');

// Teacher-only skip opens the next maze while retaining all prior rewards,
// existing unfinished mazes and the completion list.
const skipStart=source.indexOf("$('skip-level').onclick=()=>{");
const skipEnd=source.indexOf("\n $('close-settings').onclick",skipStart);
assert.ok(skipStart>0&&skipEnd>skipStart,'teacher skip handler exists');
const skipCode=source.slice(skipStart,skipEnd);
const skipButtons={'skip-level':{disabled:false,textContent:''}};
const skipState={highestUnlockedLevel:9,wallet:{rainbowStars:28},completedLevelIds:['lab_candy_1'],mazeRuns:{lab_pirate_1:{id:'lab_pirate_1',player:{x:3,y:4}}}};
const skipSnapshot=structuredClone(skipState);
let skipSaves=0,skipCloses=0,skipOpens=[];
new Function('$','a','levels','save','closeModal','startLevel',skipCode)(
 id=>skipButtons[id],skipState,Array.from({length:64}),()=>skipSaves++,()=>skipCloses++,n=>skipOpens.push(n)
);
skipButtons['skip-level'].onclick();
assert.equal(skipState.highestUnlockedLevel,10,'teacher unlocks one next maze');
assert.deepEqual(skipOpens,[10],'teacher immediately opens next maze');
assert.equal(skipSaves,1);assert.equal(skipCloses,1);
for(const k of ['wallet','completedLevelIds','mazeRuns'])assert.deepEqual(skipState[k],skipSnapshot[k],'skip preserves '+k);
skipState.highestUnlockedLevel=64;skipButtons['skip-level'].onclick();
assert.deepEqual(skipOpens,[10],'skip at final maze does not reopen it');
assert.equal(skipButtons['skip-level'].disabled,true,'skip disabled at last maze');

// Main eight-world map locked stops use the same compact, dismissible dialog as maze stops.
const worldMapHandler=source.match(/document\.querySelectorAll\('\[data-world-index\]'\)\.forEach\(b=>b\.onclick=\(\)=>\{([\s\S]*?)\n  \}\);/);
assert.ok(worldMapHandler,'main world-map click handler exists');
const worldMapClick=new Function('b','isWorldUnlocked','worldThemes','modal','esc','$','closeModal','openWorld',worldMapHandler[1]);
const worldNames=['Candy','Pirate','Arctic','Castle','Space','Jurassic','Ocean','Lava'];
const worldButtons={'locked-world-back':{}},worldNotices=[],worldOpens=[];
const worldModal=(title,body,bind)=>{worldNotices.push({title,body});bind()};
const worldEsc=v=>String(v).replace(/&/g,'&amp;');
worldMapClick({dataset:{worldIndex:'3'}},()=>false,worldNames.map(name=>({name})),worldModal,worldEsc,id=>worldButtons[id],()=>worldNotices.push({closed:true}),i=>worldOpens.push(i));
assert.equal(worldOpens.length,0,'locked Castle world cannot open');
assert.match(worldNotices[0].title,/Castle World is locked/);
assert.match(worldNotices[0].body,/all eight Arctic World mazes/);
worldButtons['locked-world-back'].onclick();
assert.equal(worldNotices.at(-1).closed,true,'world-lock popup Back closes it');
worldMapClick({dataset:{worldIndex:'3'}},()=>true,worldNames.map(name=>({name})),worldModal,worldEsc,id=>worldButtons[id],()=>{},i=>worldOpens.push(i));
assert.deepEqual(worldOpens,[3],'unlocked Castle world opens normally');
assert.doesNotMatch(source,/alert\(worldThemes\[i\]\.name/,'world locks must never use browser alert');
const gameSource=fs.readFileSync(new URL('./game.mjs',import.meta.url),'utf8');
assert.match(gameSource,/fullscreenNotice\(message\)/,'Full Screen errors show accessible help');
assert.match(gameSource,/fullscreenNotice\('Full screen was blocked/,'fullscreenerror also shows help');
assert.doesNotMatch(gameSource,/alert\(message\)/,'Full Screen failures never block keyboard or trackpad with alert');
assert.match(gameSource,/note\.setAttribute\('role','alert'\)/,'Full Screen help is announced accessibly');
const layoutSource=fs.readFileSync(new URL('./layout-fixes.css',import.meta.url),'utf8');
assert.match(layoutSource,/\.arrow-lab-fullscreen-note\{position:fixed/,'Full Screen help stays visible in viewport');
assert.match(html,/layout-fixes\.css\?v=fullscreen-notice-20261028a/,'new Full Screen help CSS cache version is published');


// How to Play must be visible, dismissible and safe for unfinished arrow challenges.
const helpCode=source.slice(source.lastIndexOf(" $('help').onclick=()=>{"),source.lastIndexOf(" if(!a.selectedPlayerCharacterId)selectCharacter();"));
assert.match(helpCode,/modal\('How to Play'/);
assert.match(helpCode,/adventure-dialog'\)\?\.open/);
assert.doesNotMatch(source,/\balert\s*\(/);
assert.doesNotMatch(gameSource,/\balert\s*\(/);
assert.match(gameSource,/function legacyHelp\(\)/);
assert.match(gameSource,/arrow-lab-help-dialog'\)\?\.open\)return/);
assert.match(html,/game\.mjs\?v=visual-help-20261028a/);
assert.match(gameSource,/adventure\.mjs\?v=visual-help-20261028a/);
const helpButtons={help:{},'adventure-dialog':{open:false},'help-read-aloud':{},'help-back':{}};
let shown=0,spoken=0,closed=0;
new Function('$','modal','esc','closeModal','window',helpCode)(
 id=>helpButtons[id],(title,body,bind)=>{shown++;assert.match(body,/keyboard arrows/);bind()},s=>s,()=>closed++,
 {speechSynthesis:{cancel(){},speak(){spoken++}},SpeechSynthesisUtterance:function(t){this.text=t}}
);
helpButtons.help.onclick();helpButtons['help-read-aloud'].onclick();helpButtons['help-back'].onclick();
assert.equal(shown,1);assert.equal(spoken,1);assert.equal(closed,1);
helpButtons['adventure-dialog'].open=true;helpButtons.help.onclick();assert.equal(shown,1);
const legacyHelpCode=gameSource.slice(gameSource.indexOf('function legacyHelp(){'),gameSource.lastIndexOf("$('help').onclick=legacyHelp;"));
const buttons={win:{open:false},shop:{open:false},characters:{open:false},'arrow-lab-help-read':{},'arrow-lab-help-close':{},'arrow-lab-help-home':{},'global-home':{click(){homes++}}};
let homes=0,created=0;
const doc={body:{append(d){buttons[d.id]=d}},createElement(tag){assert.equal(tag,'dialog');created++;return {style:{},setAttribute(){},showModal(){this.open=true},close(){this.open=false;this.onclose?.()}}}};
const legacyFn=new Function('document','$','window','esc',legacyHelpCode+';return legacyHelp;')(doc,id=>buttons[id],{},s=>s);
legacyFn();assert.equal(created,1);assert.equal(buttons['arrow-lab-help-dialog'].open,true);
assert.match(buttons['arrow-lab-help-dialog'].innerHTML,/There is no timer/);
assert.equal(buttons['arrow-lab-help-read'].disabled,true);
buttons['arrow-lab-help-close'].onclick();assert.equal(buttons['arrow-lab-help-dialog'].open,false);
legacyFn();assert.equal(created,1);buttons['arrow-lab-help-home'].onclick();assert.equal(homes,1);
buttons.win.open=true;legacyFn();assert.equal(buttons['arrow-lab-help-dialog'].open,false);
