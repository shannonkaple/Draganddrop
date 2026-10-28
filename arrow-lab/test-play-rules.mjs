import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decorations} from '../trackpad-adventure/economy.mjs';
import {buildLevel,tile,route,directions,worldIds,pendingWorldRescue,rescueWorld,arrowPattern,buyWorld,migrateAdventure,unlockedFromSavedProgress} from './adventure-core.mjs';
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
 mazeRuns:{lab_candy_4:{id:'lab_candy_4',w:11,h:9,grid:[[0]],items:[],hazards:[],player:{x:1,y:1},seed:98}},
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
const highRun={id:'lab_space_6',w:11,h:9,grid:[[0]],items:[],hazards:[],complete:false};
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,mazeRuns:{lab_space_6:highRun}}),38,'valid unfinished Space maze stays reachable');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,activeRun:highRun}),38,'legacy single active run stays reachable');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_arctic_8']}),25,'completed Arctic world unlocks Castle maze one');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:60,completedLevelIds:['lab_candy_1']}),60,'do not reduce a valid higher unlock');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_fake_8','lab_candy_9'],mazeRuns:{lab_space_6:{id:'wrong'}}}),1,'ignore invalid stage IDs and mismatched runs');
assert.equal(unlockedFromSavedProgress({highestUnlockedLevel:1,completedLevelIds:['lab_lava_8']}),64,'final world is capped at maze 64');

const source=fs.readFileSync(new URL('./adventure.mjs',import.meta.url),'utf8');
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
 for(const level of character.levels)assert.equal(level.image,'pending:character:'+character.id,'never substitute an invalid image URL');
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
const missingPortrait=markerRender('pending:character:luna_axolotl','Luna Axolotl','friend-art');
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
assert.match(source,/class="enemy-direction"/,'moving bad guys show direction arrows');
assert.match(source,/enemy-path-next/,'next planned enemy tile remains visible');

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
assert.match(css,/body>header\.lab-image-header \.actions\{[\s\S]*?flex-flow:row wrap!important/,'header controls wrap rather than disappear');
assert.match(html,/visual-hotfix-20261027\.css\?v=world-shop-only-20261027c/,'published page references updated popup and shop styles');
assert.match(html,/game\.mjs\?v=resume-skill-20261027d/,'published page references new game module');


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
