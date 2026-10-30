import {libraryShopDecorations} from './shop-decor.mjs?v=world-scenes-20261030';
import {makeLevel,ACTIVITY_NAMES} from './activities/levels.mjs?v=roomy-20261030';
import {firstMazeLayout} from './activities/first-maze-layout.mjs?v=eight-worlds-20261030';
import {mountActivity} from './activities/runtime.mjs?v=mobiletouch-20261030';
import {ENGINES,stateFor,targetsFor,tryPlacement,progressFor} from './activities/engines.mjs?v=mobiletouch-20261030';
import {WORLD_STOP_POINTS_BY_WORLD,PUBLISHED_WORLD_LEVEL_MAPS} from '../arrow-lab/level-map-model.mjs';
import {isTeacherUnlocked} from './teacher-access.mjs?v=20261029-teacherlock1';
import {tellGuide,starIcon} from './viewport.mjs?v=library-decor-20261030';
import {decorations} from '../trackpad-adventure/economy.mjs?v=20261021-class24';
import {arrowLabCharacters} from '../arrow-lab/character-placeholders.mjs?v=approved-friends-luna-20261028a';

import {directions,tile,route,buildLevel,migrateAdventure,upgradeFriend,completeLevel,rescueWorld,rescueReady,pendingWorldRescue,arrowPattern,buyWorld,placeFriend,choosePlayerCharacter,restoreSavedEnemyRoster} from '../arrow-lab/adventure-core.mjs?v=varied-patterns-20261029';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=new URL('../',import.meta.url),asset=p=>new URL(p.replace(/^\//,''),root).href;
// Extra character entries were assigned generated: placeholder identifiers, not URLs.
// Never render an invalid <img>; show an honest named temporary illustration marker
// until each original high-resolution file has actually been published.
// A neutral labelled marker, not an invented or substituted illustration.
const img=(p,name,cls='')=>{
 const value=String(p||'');
 if(value.startsWith('generated:character:')||value.startsWith('pending:character:')){
   const initials=String(name||'?').trim().split(/\s+/).slice(0,2).map(word=>word.charAt(0)).join('').toUpperCase();
   return '<span class="'+cls+' pending-character-art" role="img" aria-label="'+esc(name)+' — character art coming soon"><span class="pending-character-initial" aria-hidden="true">'+esc(initials)+'</span><small class="pending-character-note" aria-hidden="true">ART COMING SOON</small></span>';
 }
 if(!value)return '<span class="'+cls+' pending-character-art" role="img" aria-label="'+esc(name)+'">✨</span>';
 return '<img class="'+cls+'" src="'+asset(value)+'" alt="'+esc(name)+'" loading="eager" draggable="false">';
};
const readJSON=async n=>{const r=await fetch(new URL('../rainbow-road/data/'+n+'.json',import.meta.url));if(!r.ok)throw Error('Could not load '+n);return r.json()};
let dataPromise;
export async function openAdventure({number,storageKey,teacherName,teachers,goPractice,onLogout,onTeacher,preview=false}){
 if(preview&&!isTeacherUnlocked())throw new Error('Teacher code required');
 const names=['characters','rainbow_lands','levels','game_config','enemies','computer_collectibles','skill_badges'];
 const values=await(dataPromise??=Promise.all(names.map(readJSON)));const data=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
 const worldThemes=[
 {name:'Candy',icon:'🍬',id:'candy',color:'#f66cba',backgroundImage:'/arrow-lab/my-stuff-backgrounds/candy_world_background.jpg'},
 {name:'Pirate',icon:'🏴‍☠️',id:'pirate',color:'#d39a54',backgroundImage:'/arrow-lab/my-stuff-backgrounds/pirate_world_background.jpg'},
 {name:'Arctic',icon:'🐧',id:'arctic',color:'#60c4f3',backgroundImage:'/arrow-lab/my-stuff-backgrounds/arctic_world_background.jpg'},
 {name:'Castle',icon:'🏰',id:'castle',color:'#9c7cdd',backgroundImage:'/arrow-lab/my-stuff-backgrounds/castle_world_background.jpg'},
 {name:'Space',icon:'🚀',id:'space',color:'#7659de',backgroundImage:'/arrow-lab/my-stuff-backgrounds/space_world_background.jpg'},
 {name:'Jurassic',icon:'🦕',id:'jurassic',color:'#5fbc74',backgroundImage:'/arrow-lab/my-stuff-backgrounds/jurassic_world_background.jpg'},
 {name:'Ocean',icon:'🐬',id:'ocean',color:'#41bce2',backgroundImage:'/arrow-lab/my-stuff-backgrounds/ocean_world_background.jpg'},
 {name:'Lava',icon:'🌋',id:'lava',color:'#ee7748',backgroundImage:'/arrow-lab/my-stuff-backgrounds/lava_world_background.jpg'}
 ];
 const activityNames=ACTIVITY_NAMES;
 const manifestResponse=await fetch(new URL('./activities/art-manifest.json?v=engines1',import.meta.url));
 if(!manifestResponse.ok)throw Error('Could not load activity artwork manifest');
 const artManifest=await manifestResponse.json();

 const REPLACEMENT_COLLECTIBLES={cotton_candy:['ice_cream','Ice Cream'],star_cookie:['donut','Donut'],marshmallow:['wrapped_candy','Wrapped Candy'],gumdrop:['gummy_bear','Gummy Bear'],candy_apple:['lollipop','Lollipop'],gingerbread_house:['cupcake','Cupcake']};
 const candyObjects=[
 ['lollipop','Lollipop'],['gummy_bear','Gummy Bear'],['cupcake','Cupcake'],['candy_cane','Candy Cane'],
 ['ice_cream','Ice Cream'],['wrapped_candy','Wrapped Candy'],['donut','Donut'],['candy_necklace','Candy Necklace'],
 ['chocolate_bar','Chocolate Bar'],['jellybean_jar','Jellybean Jar']
 ];
 const candyLabels=Object.fromEntries(candyObjects);
 const candyNames=['Lollipop Lane','Cupcake Creek','Ice Cream Island','Donut Ridge','Candy Castle','Gummy Grove','Chocolate Falls','Sweet Summit'];
 const candyStageBackgrounds=['01-lollipop-lane','02-cupcake-creek','03-ice-cream-island','04-donut-ridge','05-candy-castle','06-gummy-grove','07-chocolate-falls','08-sweet-summit'].map(n=>'/arrow-lab/candy-stages/'+n+'.jpg');

 const pirateObjects=[
 ['treasure_chest','Treasure Chest'],['pirate_hat','Pirate Hat'],['treasure_map','Treasure Map'],
 ['compass','Pirate Compass'],['parrot','Pirate Parrot'],['ship_wheel','Ship Wheel'],
 ['spyglass','Spyglass'],['anchor','Anchor'],['message_bottle','Message in a Bottle'],['gold_coins','Gold Coins']
 ];
 const arcticObjects=[["snowflake_crystal", "Snowflake Crystal"], ["mitten", "Mitten"], ["snow_globe", "Snow Globe"], ["polar_bear_plush", "Polar Bear Plush"], ["igloo", "Igloo"], ["ice_skate", "Ice Skate"], ["winter_scarf", "Winter Scarf"], ["hot_cocoa", "Hot Cocoa"], ["icicle_gem", "Icicle Gem"], ["snowflake_lantern", "Snowflake Lantern"]];
 const oceanObjects=[
 ['pearl_shell','Pearl Shell'],['seahorse','Seahorse'],['jellyfish','Jellyfish'],
 ['dolphin','Dolphin'],['coral_cluster','Coral Reef'],['pufferfish','Pufferfish'],
 ['sea_turtle','Sea Turtle'],['starfish','Starfish'],['ocean_message_bottle','Ocean Message Bottle'],
 ['octopus','Octopus']
 ];
 const oceanStageNames=['Coral Cove','Pearl Lagoon','Seahorse Garden','Jellyfish Glow','Dolphin Bay','Turtle Trail','Octopus Grotto','Rainbow Reef'];
 const pirateStageNames=['Treasure Cove',"Captain's Deck",'Palm Lagoon','Shipwreck Reef','Cannon Fort','Skull Rock','Mermaid Grotto','Treasure Island'];
 const stageNames={
  candy:candyNames,
  pirate:pirateStageNames,
  arctic:['Snowflake Meadow','Glacier Valley','Penguin Cove','Igloo Village','Crystal Cavern','Aurora Lake','Polar Palace','Blizzard Summit'],
  castle:['Royal Courtyard','Castle Gardens',"Knight's Bridge",'Enchanted Library','Tower Hall','Royal Ballroom','Dragon Gate','Throne Room'],
  space:['Starfield Gate','Moonbase','Ringed Planet','Comet Trail','Nebula Gardens','Meteor Fields','Cosmic Observatory','Galaxy Palace'],
  jurassic:['Fern Forest','Dinosaur Valley','Fossil Cliffs','Prehistoric River','Amber Cave','Dinosaur Nest','Volcano Trail','Jurassic Summit'],
  ocean:oceanStageNames,
  lava:['Ember Trail','Magma Falls','Fire Crystal Cavern','Volcanic Bridge','Obsidian Valley','Molten River','Phoenix Crater','Lava Throne']
 };
 const pirateStageBackgrounds=['01-treasure-cove','02-captains-deck','03-palm-lagoon','04-shipwreck-reef','05-cannon-fort','06-skull-rock','07-mermaid-grotto','08-treasure-island'].map(n=>'/arrow-lab/pirate-stages/'+n+'.jpg');
 const arcticStageBackgrounds=["01-snowflake-meadow", "02-glacier-valley", "03-penguin-cove", "04-igloo-village", "05-crystal-cavern", "06-aurora-lake", "07-polar-palace", "08-blizzard-summit"].map(n=>'/arrow-lab/arctic-stages/'+n+'.jpg');
 const oceanStageBackgrounds=['/arrow-lab/ocean-stages/01-coral-cove.jpg'];
 const objectGroups={candy:candyObjects,pirate:pirateObjects,arctic:arcticObjects,ocean:oceanObjects};
 const allWorldLabels=Object.fromEntries(Object.values(objectGroups).flat());
 const objectArtPaths=Object.fromEntries(Object.entries(objectGroups).flatMap(([world,items])=>items.map(([id])=>[id,'arrow-lab/collectibles/'+world+'/'+id+'.png'])));
 // Until the remaining four worlds' original transparent treasure art is
 // available, use two DISTINCT published computer-gear PNGs per maze instead
 // of the previous zero/one objectives. Do not invent missing art URLs.
 const fallbackGearPair=(stageIndex,legacyIds=[])=>{
   const ids=data.computer_collectibles.map(i=>i.id);
   const schedule=[[4,2],[3,1],[2,0],[3,4],[1,2],[1,0],[0,3],[4,1]];
   return [...new Set([...legacyIds.filter(id=>ids.includes(id)),...schedule[stageIndex].map(i=>ids[i])])].slice(0,2);
 };
 const pairFor=(worldIndex,stageIndex)=>{
  if(worldIndex===0){const count=candyObjects.length;return [candyObjects[(stageIndex*2)%count][0],candyObjects[(stageIndex*2+1)%count][0]];}
  const objects=worldIndex===1?pirateObjects:worldIndex===2?arcticObjects:worldIndex===6?oceanObjects:null;
  return objects?[objects[(stageIndex*3)%10][0],objects[(stageIndex*3+4)%10][0]]:undefined;
 };
 // Use the exact seven characters supplied by the teacher as the definitive rescue art.
// The approved 1254×1254 transparent PNGs must be uploaded unchanged to these paths.
const approvedFriendFiles={pirate:'arrow-lab/friends/pirate-parrot.png',arctic:'arrow-lab/friends/arctic-penguin.png',castle:'arrow-lab/friends/royal-dragon.png',space:'arrow-lab/friends/space-alien.png',jurassic:'arrow-lab/friends/explorer-dino.png',ocean:'arrow-lab/friends/ocean-dolphin.png',lava:'arrow-lab/friends/lava-dragon.png'};
const companions=[['Candy Bunny','🐰'],['Pirate Parrot','🦜'],['Arctic Penguin','🐧'],['Royal Dragon','🐉'],['Space Alien','👽'],['Explorer Dino','🦖'],['Ocean Dolphin','🐬'],['Lava Dragon','🐲']].map(([name,icon],i)=>({id:worldThemes[i].id,name,icon,art:i===0?'arrow-lab/friends/candy-bunny.png':approvedFriendFiles[worldThemes[i].id],approvedArtPath:i===0?'arrow-lab/friends/candy-bunny.png':approvedFriendFiles[worldThemes[i].id]}));
 const homeArt=worldThemes.map(w=>w.backgroundImage);
 const backgroundHomes=worldThemes.map((w,i)=>({id:'background_'+w.id,name:w.name+' World',homeBackground:homeArt[i],cardPreview:homeArt[i],availableAtStart:i===0,theme:w.id}));
 const themedGoods=[
 {id:'candy_cupcake',name:'Giant Cupcake',world:'candy',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/candy/cupcake.png'},
 {id:'candy_lollipop',name:'Rainbow Lollipop',world:'candy',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/candy/lollipop.png'},
 {id:'candy_treat',name:'Sweet Bunny Treat',world:'candy',kind:'gift',cost:2,artPath:'arrow-lab/collectibles/candy/wrapped_candy.png'},
 {id:'pirate_chest',name:'Treasure Chest',world:'pirate',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/pirate/treasure_chest.png'},
 {id:'pirate_anchor',name:'Pirate Anchor',world:'pirate',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/pirate/anchor.png'},
 {id:'pirate_compass',name:'Captain’s Compass',world:'pirate',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/pirate/compass.png'},
 {id:'arctic_igloo',name:'Little Igloo',world:'arctic',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/arctic/igloo.png'},
 {id:'arctic_globe',name:'Snow Globe',world:'arctic',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/arctic/snow_globe.png'},
 {id:'arctic_scarf',name:'Cozy Scarf',world:'arctic',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/arctic/winter_scarf.png'},
 {id:'castle_key',name:'Royal Golden Key',world:'castle',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/castle/golden_key.png'},
 {id:'castle_gift',name:'Golden Key for Griffin',world:'castle',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/castle/golden_key.png'},
 {id:'space_monitor',name:'Space Mission Console',world:'space',kind:'decor',cost:5,art:'monitor'},
 {id:'space_headphones',name:'Star Headphones',world:'space',kind:'gift',cost:3,art:'headphones'},
 {id:'jurassic_tree',name:'Dinosaur Garden Tree',world:'jurassic',kind:'decor',cost:3,art:'tree'},
 {id:'jurassic_garden',name:'Dino Garden Flowers',world:'jurassic',kind:'gift',cost:3,art:'flowers'},
 {id:'ocean_coral',name:'Coral Garden',world:'ocean',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/ocean/coral_cluster.png'},
 {id:'ocean_shell',name:'Pearl Shell',world:'ocean',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/ocean/pearl_shell.png'},
 {id:'ocean_star',name:'Starfish Present',world:'ocean',kind:'gift',cost:2,artPath:'arrow-lab/collectibles/ocean/starfish.png'},
 {id:'lava_crystals',name:'Fire Crystal Garden',world:'lava',kind:'decor',cost:4,art:'crystals'},
 {id:'lava_gift',name:'Glowing Crystal Present',world:'lava',kind:'gift',cost:3,art:'crystals'},
 // Themed shop additions reuse only native collectible art at display size;
 // no stretching and no borrowed world maps.
 {id:'candy_donut',name:'Sweet Donut Seat',world:'candy',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/candy/donut.png'},
 {id:'candy_icecream',name:'Ice Cream Sculpture',world:'candy',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/candy/ice_cream.png'},
 {id:'candy_gingerbread',name:'Cupcake Cottage',world:'candy',kind:'decor',cost:6,artPath:'arrow-lab/collectibles/candy/cupcake.png'},
 {id:'candy_cottoncandy',name:'Lollipop Tree',world:'candy',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/candy/lollipop.png'},
 {id:'candy_apple_present',name:'Wrapped Candy Gift',world:'candy',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/candy/wrapped_candy.png'},
 {id:'pirate_shipwheel',name:'Captain’s Ship Wheel',world:'pirate',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/pirate/ship_wheel.png'},
 {id:'pirate_goldcoins',name:'Gold Coin Pile',world:'pirate',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/pirate/gold_coins.png'},
 {id:'pirate_spyglass',name:'Pirate Spyglass',world:'pirate',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/pirate/spyglass.png'},
 {id:'pirate_messagebottle',name:'Bottle From the Sea',world:'pirate',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/pirate/message_bottle.png'},
 {id:'pirate_hat_present',name:'Captain’s Hat Gift',world:'pirate',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/pirate/pirate_hat.png'},
 {id:'arctic_bear',name:'Polar Bear Plush',world:'arctic',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/arctic/polar_bear_plush.png'},
 {id:'arctic_snowflakelamp',name:'Snowflake Lantern',world:'arctic',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/arctic/snowflake_lantern.png'},
 {id:'arctic_iciclegem',name:'Ice Crystal Gem',world:'arctic',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/arctic/icicle_gem.png'},
 {id:'arctic_skate',name:'Sparkly Ice Skate',world:'arctic',kind:'decor',cost:3,artPath:'arrow-lab/collectibles/arctic/ice_skate.png'},
 {id:'arctic_cocoa_present',name:'Warm Cocoa Gift',world:'arctic',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/arctic/hot_cocoa.png'},
 {id:'ocean_seahorse',name:'Seahorse Statue',world:'ocean',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/ocean/seahorse.png'},
 {id:'ocean_turtle',name:'Sea Turtle Figure',world:'ocean',kind:'decor',cost:5,artPath:'arrow-lab/collectibles/ocean/sea_turtle.png'},
 {id:'ocean_jellyfish',name:'Jellyfish Lamp',world:'ocean',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/ocean/jellyfish.png'},
 {id:'ocean_pufferfish',name:'Pufferfish Buddy',world:'ocean',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/ocean/pufferfish.png'},
 {id:'ocean_message',name:'Bottle Message Gift',world:'ocean',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/ocean/ocean_message_bottle.png'}
 ];
  // SHOP ONLY: new stable IDs not present in level pickups or completion rewards.
 // Native artwork is temporarily reused until original themed PNGs can be published.
 const shopExclusives=[
  {id:'shop_candy_sweet_tree',name:'Candy Tree',world:'candy',kind:'decor',shopOnly:true,cost:5,art:'tree'},
  {id:'shop_candy_butterfly_bench',name:'Butterfly Bench',world:'candy',kind:'decor',shopOnly:true,cost:7,art:'bench'},
  {id:'shop_candy_mushroom_cottage',name:'Candy Cottage',world:'candy',kind:'decor',shopOnly:true,cost:10,art:'cottage'},
  {id:'shop_pirate_treasure_display',name:'Captain’s Treasure Chest',world:'pirate',kind:'decor',shopOnly:true,cost:7,art:'treasure'},
  {id:'shop_pirate_trail_sign',name:'Pirate Trail Sign',world:'pirate',kind:'decor',shopOnly:true,cost:4,art:'signpost'},
  {id:'shop_pirate_crossing_bridge',name:'Island Crossing Bridge',world:'pirate',kind:'decor',shopOnly:true,cost:8,art:'bridge'},
  {id:'shop_arctic_ice_crystals',name:'Sparkling Ice Crystals',world:'arctic',kind:'decor',shopOnly:true,cost:6,art:'crystals'},
  {id:'shop_arctic_snow_cottage',name:'Cozy Snow Cottage',world:'arctic',kind:'decor',shopOnly:true,cost:10,art:'cottage'},
  {id:'shop_arctic_aurora_bench',name:'Aurora Watching Bench',world:'arctic',kind:'decor',shopOnly:true,cost:7,art:'bench'},
  {id:'shop_castle_garden_flowers',name:'Royal Garden Flowers',world:'castle',kind:'decor',shopOnly:true,cost:5,art:'flowers'},
  {id:'shop_castle_garden_bridge',name:'Royal Garden Bridge',world:'castle',kind:'decor',shopOnly:true,cost:8,art:'bridge'},
  {id:'shop_castle_treasure_chest',name:'Castle Treasure Chest',world:'castle',kind:'decor',shopOnly:true,cost:9,art:'treasure'},
  {id:'shop_space_command_monitor',name:'Rocket Command Monitor',world:'space',kind:'decor',shopOnly:true,cost:6,art:'monitor'},
  {id:'shop_space_navigation_keyboard',name:'Starship Navigation Keyboard',world:'space',kind:'decor',shopOnly:true,cost:6,art:'keyboard'},
  {id:'shop_space_astro_headphones',name:'Astronaut Headphones',world:'space',kind:'decor',shopOnly:true,cost:7,art:'headphones'},
  {id:'shop_jurassic_jungle_tree',name:'Dinosaur Jungle Tree',world:'jurassic',kind:'decor',shopOnly:true,cost:5,art:'tree'},
  {id:'shop_jurassic_trail_sign',name:'Explorer Trail Sign',world:'jurassic',kind:'decor',shopOnly:true,cost:4,art:'signpost'},
  {id:'shop_jurassic_river_bridge',name:'Dino River Bridge',world:'jurassic',kind:'decor',shopOnly:true,cost:8,art:'bridge'},
  {id:'shop_ocean_sea_crystals',name:'Mermaid Crystal Garden',world:'ocean',kind:'decor',shopOnly:true,cost:6,art:'crystals'},
  {id:'shop_ocean_seaside_bench',name:'Seaside Bench',world:'ocean',kind:'decor',shopOnly:true,cost:7,art:'bench'},
  {id:'shop_ocean_sunken_chest',name:'Sunken Treasure Chest',world:'ocean',kind:'decor',shopOnly:true,cost:9,art:'treasure'},
  {id:'shop_lava_fire_crystals',name:'Volcano Crystal Garden',world:'lava',kind:'decor',shopOnly:true,cost:6,art:'crystals'},
  {id:'shop_lava_magma_bridge',name:'Magma Crossing Bridge',world:'lava',kind:'decor',shopOnly:true,cost:8,art:'bridge'},
  {id:'shop_lava_treasure_chest',name:'Volcano Treasure Chest',world:'lava',kind:'decor',shopOnly:true,cost:9,art:'treasure'}
 ];
 const fullDecorations=[...decorations.map(d=>({...d,world:'all',kind:'decor'})),...themedGoods,...shopExclusives,...libraryShopDecorations];
 const findDecoration=id=>fullDecorations.find(d=>d.id===id);
 const enemyRosters=[
   ['purple_slime','chomper_plant','storm_cloud','prickly_cactus'], // Candy: four different playful monsters
   ['cranky_crab','rock_golem','whirly_tornado','purple_slime'],   // Pirate
   ['storm_cloud','rock_golem','cranky_crab','whirly_tornado'],    // Arctic
   ['rock_golem','chomper_plant','storm_cloud','purple_slime'],    // Castle
   ['whirly_tornado','purple_slime','lava_slime','storm_cloud'],   // Space
   ['chomper_plant','prickly_cactus','rock_golem','cranky_crab'],  // Jurassic
   ['cranky_crab','purple_slime','chomper_plant','storm_cloud'],   // Ocean
   ['lava_slime','rock_golem','whirly_tornado','prickly_cactus']   // Lava
 ];
 const chars=arrowLabCharacters(data.characters),lands=[...backgroundHomes,...data.rainbow_lands],worldCosts=lands.map((_,i)=>i<8?4+i*2:4+(i-8)*2),
 levels=worldThemes.flatMap((world,wi)=>activityNames.map((title,ai)=>{
   const template=data.levels[ai];
   return {...template,id:'lab_'+world.id+'_'+(ai+1),number:wi*8+ai+1,title:world.name+' · '+title,
     worldIndex:wi,worldStage:ai+1,backgroundImage:world.backgroundImage,individualBackdrop:true,sceneX:(ai%4)*100/3,sceneY:ai<4?0:100,primarySkill:'drag',collectibleIds:pairFor(wi,ai)||fallbackGearPair(ai,template.computerGearIds),
     mazeGrid:{width:Math.max(11,template.mazeGrid.width),height:Math.max(9,template.mazeGrid.height)},computerGearIds:[...template.computerGearIds],
     skillBadgeIds:[...template.skillBadgeIds],enemyIds:[...enemyRosters[wi]]};
 })),config=data.game_config,key=storageKey;
 config.levelCount=levels.length;
 let stored;try{stored=preview?{}:JSON.parse(localStorage.getItem(key)||'{}')}catch{stored={}}
 let a=migrateAdventure(stored.adventure,stored.wallet,chars,lands),r=null,def=null,duck=false,heldSpace=false,interval=null,warning=null,closed=false,view='map',pendingFriend=null,challengeKeys=null,report='Look, choose, press and release, check.',saved=true;
 let dragSession=null;
 let settings;try{settings=JSON.parse(localStorage.getItem('drag-drop-adventure-teacher-settings')||'{}')}catch{settings={}}
 settings={difficulty:'standard',speed:2200,hints:true,sound:false,reducedMotion:false,...settings,touchArrows:false};
 // Every student automatically owns one starter home. Never ask for a home during onboarding.
 // Retain all existing saved purchases and any established main home.
 const starterWorldId='background_candy';
 const characterSwitchCost=5;
 // Migration preserves every previously selected or purchased character.
 a.unlockedCharacterIds=[...new Set([...(a.unlockedCharacterIds||[]),...Object.keys(a.friends||{}),a.selectedPlayerCharacterId].filter(Boolean))];
 const hasPlayerCharacter=id=>a.unlockedCharacterIds.includes(id)&&!!a.friends?.[id];
 a.ownedWorldIds=[...new Set([...(a.ownedWorldIds||[]),...(a.ownedBackgroundIds||[]),starterWorldId])];
 if(!a.primaryRainbowLandId||!a.ownedWorldIds.includes(a.primaryRainbowLandId)||!lands.some(l=>l.id===a.primaryRainbowLandId)){
   a.primaryRainbowLandId=starterWorldId;
 }
 a.friendGifts??={};a.friendGiftEquipped??={};a.homeBackgrounds??={};
 // One durable run per maze. Migrate the previous single active run without losing progress.
 a.mazeRuns=(a.mazeRuns&&typeof a.mazeRuns==='object'&&!Array.isArray(a.mazeRuns))?a.mazeRuns:{};
 if(a.activeRun?.id&&!a.activeRun.complete&&!a.completedLevelIds.includes(a.activeRun.id))a.mazeRuns[a.activeRun.id]??=a.activeRun;
 // A saved student must never have to choose a new home merely to continue playing.
 if(!a.primaryRainbowLandId)a.primaryRainbowLandId=starterWorldId;
 if(preview){
  a.highestUnlockedLevel=levels.length;a.wallet.rainbowStars=99999;
  a.selectedPlayerCharacterId=chars[0].id;a.unlockedCharacterIds=chars.map(c=>c.id);
  a.friends=Object.fromEntries(chars.map(c=>[c.id,{isRescued:true,upgradeStage:'starter',homeLandId:starterWorldId}]));
  a.ownedWorldIds=lands.map(l=>l.id);a.ownedBackgroundIds=lands.map(l=>l.id);
  a.collectedWorldItems=Object.keys(allWorldLabels);a.collectedComputerGearIds=data.computer_collectibles.map(x=>x.id);
  a.worldFriends=Object.fromEntries(companions.map(c=>[c.id,{homeLandId:'background_'+c.id}]));
  a.decorations=Object.fromEntries(backgroundHomes.map(w=>[w.id,fullDecorations.filter(d=>d.world==='all'||d.world===w.theme).map(d=>d.id)]));
 }
 document.body.classList.toggle('teacher-preview',preview);
 const char=id=>chars.find(c=>c.id===id),land=id=>lands.find(l=>l.id===id),look=id=>char(id).levels.find(l=>l.id===(a.friends[id]?.upgradeStage||'starter'));
 const pic=id=>{const c=char(id);return c?img(look(id).image,c.name,'friend-art'):'<span class="friend-art pending-character-art" role="img" aria-label="'+esc(id)+' saved friend, illustration unavailable"><span class="pending-character-initial">?</span><small class="pending-character-note">SAVED FRIEND</small></span>';};

 const itemName=id=>REPLACEMENT_COLLECTIBLES[id]?.[1]||allWorldLabels[id]||data.computer_collectibles.find(i=>i.id===id)?.name||data.skill_badges.find(i=>i.id===id)?.name||id;
 const itemArt=id=>REPLACEMENT_COLLECTIBLES[id]?'arrow-lab/collectibles/candy/'+REPLACEMENT_COLLECTIBLES[id][0]+'.png':objectArtPaths[id]||(data.computer_collectibles.find(i=>i.id===id)?.thumbnail||data.computer_collectibles.find(i=>i.id===id)?.image)||(data.skill_badges.find(i=>i.id===id)?.thumbnail||data.skill_badges.find(i=>i.id===id)?.image);
 const activityLevels=levels.map(def=>{
  const group=objectGroups[worldThemes[def.worldIndex].id]||[];
  const ids=[...new Set([...group.map(x=>x[0]),...def.collectibleIds,...data.computer_collectibles.map(x=>x.id)])];
  const items=ids.filter(id=>/\.(png|jpe?g)(?:[?#]|$)/i.test(itemArt(id)||'')).map(id=>({id,name:itemName(id),image:asset(itemArt(id))}));
  const enemies=def.enemyIds.map(id=>data.enemies.find(e=>e.id===id)).filter(Boolean).map(e=>({name:e.name,image:asset(e.thumbnail)}));
  const activity=makeLevel(def,{items,enemies,background:asset(def.backgroundImage)},artManifest.levels?.[def.id]||{});
  // Every world's FIRST maze has a distinct route. Apply after optional art
  // overrides so approved art cannot accidentally put a bad guy inside a wall.
  // Existing activityState, IDs, purchases, save keys and all later levels remain intact.
  if(def.worldStage===1&&activity.engine==='maze'){
    const maze=firstMazeLayout(def.worldIndex,enemies);
    activity.walls=maze.walls;
    activity.hazards=maze.hazards;
    activity.solution=maze.solution;
  }
  return activity;
 });
 const currentStage=id=>['Starter','Power-Up','Super Power'][char(id).levels.findIndex(l=>l.id===(a.friends[id]?.upgradeStage||'starter'))];
 function save(){
  if(preview)return;
  try{
    if(r?.id){
      if(r.complete)delete a.mazeRuns[r.id];
      else a.mazeRuns[r.id]=r;
      a.activeRun=r;
    }
    const old=JSON.parse(localStorage.getItem(key)||'{}');
    localStorage.setItem(key,JSON.stringify({...old,adventure:{...a,activeRun:r||a.activeRun||null}}));
    saved=true;
  }catch{saved=false}
 }
 function clearClock(){clearInterval(interval);clearTimeout(warning);interval=null;warning=null;duck=false}
 function cleanup(){dragSession?.destroy();dragSession=null;closed=true;clearClock();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);observer?.disconnect();if($('kaple-guide'))document.body.append($('kaple-guide'));$('adventure-dialog')?.remove();document.body.classList.remove('adventure-mode','lab-collection-active','lab-map-active','activity-playing');}
 function sound(){if(!settings.sound)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),gain=ctx.createGain();o.frequency.setValueAtTime(660,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(990,ctx.currentTime+.25);gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.4);o.onended=()=>ctx.close()}catch{}}
 function modal(title,body,bind){
 dragSession?.cancel();
  clearClock();
  let d=$('adventure-dialog');
  if(!d){
    d=document.createElement('dialog');
    d.id='adventure-dialog';
    d.className='dialog adventure-dialog';
    document.body.append(d);
  }
  // Keep the controls in a dedicated row, and all content in a separate sizing
  // wrapper. A fresh wrapper prevents a stale, empty top-layer popup on reuse.
  if($('kaple-guide'))document.body.append($('kaple-guide'));
  d.classList.remove('final-arrow-modal');
  d.setAttribute('aria-labelledby','adventure-dialog-title');
  d.innerHTML='<div class="dialog-toolbar" role="group" aria-label="Popup navigation"></div><div class="dialog-content"><h2 id="adventure-dialog-title">'+esc(title)+'</h2>'+body+'</div>';
  const toolbar=d.querySelector('.dialog-toolbar');
  const home=document.createElement('button');
  home.type='button';home.className='modal-home';home.textContent='🏠 HOME';
  home.setAttribute('aria-label','Leave this activity and return home');
  home.onclick=()=>{challengeKeys=null;save();d.close();map()};
  const fullscreen=document.createElement('button');
  fullscreen.type='button';fullscreen.className='modal-fullscreen';
  fullscreen.textContent='⛶ FULL SCREEN';
  fullscreen.setAttribute('aria-label','Toggle full screen');
  fullscreen.onclick=()=>window.arrowLabToggleFullscreen?.();
  toolbar.append(home,fullscreen);
  tellGuide(d.querySelector('.dialog-content p')?.textContent||title,'⭐ → ✓');
  d.oncancel=e=>e.preventDefault();
  if(!d.open)d.showModal();
  d.scrollTop=0;
  bind?.(d);
  return d;
}
 function closeModal(){const guide=$('kaple-guide');if(guide)document.body.append(guide);$('adventure-dialog')?.close();if(view==='maze'){clock();requestAnimationFrame(()=>$('adventure-maze')?.focus({preventScroll:true}))}}
 function celebrate(title,id,after){
 sound();modal(title,'<div class="celebrate '+(settings.reducedMotion?'still':'')+'">🌟 '+(id?pic(id):'🌈')+' 🌟</div><p>You kept trying. Look what you earned!</p><button id="celebrate-next" class="primary">Hooray! →</button>',()=>{$('celebrate-next').onclick=()=>{closeModal();after()}})}
 function shell(title,content){
 dragSession?.destroy();dragSession=null;
 clearClock();document.body.classList.remove('playing','activity-playing');document.body.classList.add('adventure-mode');document.body.classList.toggle('lab-map-active',view==='map');document.body.classList.toggle('lab-world-active',view==='world-select');document.body.classList.toggle('lab-collection-active',view==='computer');document.body.classList.toggle('reduce-adventure-motion',settings.reducedMotion);
 $('who').classList.remove('hidden');$('who').textContent='Change student';$('who').onclick=()=>{save();cleanup();onLogout()};
 const ready=!!a.selectedPlayerCharacterId&&!!a.primaryRainbowLandId;
 $('header-stars').hidden=!ready;$('header-stuff').hidden=!ready;
 $('header-stars').textContent='⭐ '+(preview?'Preview Stars':a.wallet.rainbowStars+' Stars');
 $('header-profile').textContent=preview?'TEACHER PREVIEW · no student saves':teacherName+' · #'+number;
 // The active student and rescue meter live in the top toolbar on every page.
 const headerProgress=$('header-adventure-progress');
 if(headerProgress){
   headerProgress.hidden=!ready;
   if(ready){
     const hero=char(a.selectedPlayerCharacterId);
     const nextFriend=companions.find(c=>!a.worldFriends?.[c.id]);
     const worldIndex=nextFriend?companions.indexOf(nextFriend):7;
     const completed=Math.max(0,Math.min(8,worldDoneCount(worldIndex)));
     $('header-character-art').innerHTML=pic(hero.id);
     $('header-character-name').textContent=hero.name;
     $('header-progress-label').textContent=nextFriend
       ? completed+' / 8 · Rescue '+nextFriend.name
       : 'All world friends rescued!';
     $('header-world-meter').setAttribute('aria-valuenow',String(completed));
     $('header-world-meter').setAttribute('aria-label',nextFriend?'Activities toward rescuing '+nextFriend.name:'All friends rescued');
     $('header-meter-fill').style.width=(completed/8*100)+'%';
     $('header-change-player').onclick=()=>selectCharacter(true);
     const rescueButton=$('header-rescue-friend');
     rescueButton.hidden=!canRescue();
     rescueButton.onclick=continueRescue;
   }
 }

 $('who').textContent=preview?'Exit Teacher Mode':'Change student';
 $('app').innerHTML='<h1 class="adventure-title">'+title+'</h1>'+content+(saved?'':'<p role="alert">Progress could not save on this browser.</p>');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('setup-home')?.addEventListener('click',()=>{save();cleanup();onLogout()});
 const first=$('app').querySelector(':scope > p');tellGuide(({map:'Play activities to earn stars. Visit the Star Shop to buy upgrades, worlds, and decorations.',friends:'Choose a character to upgrade.',lands:'Buy a world, or visit one you own.',decor:'Choose something for your world.'}[view]||first?.textContent||title),'⭐ → 🏁');if(first&&view!=='select')first.hidden=true;
 }
 function navigate(where){if(r)save();if(where==='map')map();if(where==='stuff')computer();if(where==='shop')starShop();if(where==='play')playNext();if(where==='friends')friends();if(where==='lands')homeMap();if(where==='myworlds')myWorlds();if(where==='rescuegallery')rescuedFriends();if(where==='gifts')friendGiftShop();if(where==='decor')decorShop();if(where==='computer')computer()}
 function nextLevel(){const unfinished=levels.find(l=>!a.completedLevelIds.includes(l.id)&&l.number<=a.highestUnlockedLevel);const current=a.activeRun&&!a.activeRun.complete?levels.find(l=>l.id===a.activeRun.id):null;return current||unfinished||levels[levels.length-1]}
 function playNext(){startLevel(nextLevel().number)}
 function canRescue(){return rescueReady(a)}
 const companion=id=>companions.find(c=>c.id===id);
 const companionArt=id=>{const c=companion(id);return c.art?img(c.art,c.name,'world-friend-art'):'<span class="world-friend-icon" role="img" aria-label="'+esc(c.name)+'">'+c.icon+'</span>'};
 function continueRescue(){rescue()}
 function selectCharacter(changing=false){
 view='select';
 const instructions=changing
 ?'<p>Your first character was FREE! Each later switch costs <strong>⭐ '+characterSwitchCost+' stars</strong>. Paying for a new character unlocks it forever, but every later switch still costs stars. Your characters stay in their worlds.</p><p role="status">You have ⭐ '+a.wallet.rainbowStars+' stars.</p>'
 :'<p>Pick your first character FREE! Everyone gets a FREE starter world.</p>';
 shell(changing?'Change Your Character':'Choose Your Character!',instructions+
  (changing?'<button id="cancel-player" type="button">← Keep My Character</button>':'')+
  '<div class="adventure-cards character-switch-roster">'+chars.map(c=>{
   const active=changing&&c.id===a.selectedPlayerCharacterId,ownedChar=hasPlayerCharacter(c.id),poor=changing&&a.wallet.rainbowStars<characterSwitchCost;
   const action=!changing?'Choose Free':active?'✓ Playing Now':poor?'Need '+(characterSwitchCost-a.wallet.rainbowStars)+' More Stars':ownedChar?'⭐ Switch · '+characterSwitchCost+' Stars':'🔒 Unlock & Switch · '+characterSwitchCost+' Stars';
   return '<button type="button" data-hero="'+esc(c.id)+'" '+(active||poor?'disabled':'')+' aria-label="'+esc(c.name)+': '+action+'">'+
    img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong><small>'+(ownedChar?'✓ Owned':changing?'🔒 Locked':'Free first choice')+'</small><span>'+action+'</span></button>';
  }).join('')+'</div>');
 document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.hero,c=char(id);
   if(!c)return;
   if(!changing){if(a.selectedPlayerCharacterId)return map();if(choosePlayerCharacter(a,id,starterWorldId))enterWithStarterWorld();return}
   if(id===a.selectedPlayerCharacterId)return map();
   if(a.wallet.rainbowStars<characterSwitchCost){selectCharacter(true);return}
   const ownedChar=hasPlayerCharacter(id);
   modal(ownedChar?'Switch to '+c.name+'?':'Unlock '+c.name+'?',
    '<p>'+(ownedChar?'You own this character already.':'This character will be unlocked permanently and live in your current world.')+'</p>'+
    '<p>Spend <strong>⭐ '+characterSwitchCost+' stars</strong> to switch? Your old characters stay in their worlds. Your saved progress and purchases stay safe.</p>'+
    '<div class="actions"><button id="cancel-character-switch" type="button">Keep My Player</button><button id="confirm-character-switch" class="primary" type="button">Yes, Spend '+characterSwitchCost+' Stars</button></div>',()=>{
    $('cancel-character-switch').onclick=()=>{closeModal();selectCharacter(true)};
    $('confirm-character-switch').onclick=()=>{
     if(id===a.selectedPlayerCharacterId||!char(id)||a.wallet.rainbowStars<characterSwitchCost){closeModal();selectCharacter(true);return}
     const home=owned(a.primaryRainbowLandId)?a.primaryRainbowLandId:starterWorldId;
     a.wallet.rainbowStars-=characterSwitchCost;
     choosePlayerCharacter(a,id,home);
     a.unlockedCharacterIds=[...new Set([...a.unlockedCharacterIds,id])];
     save();closeModal();map();
    };
   });
 });
 if(changing)$('cancel-player').onclick=map;
 }
 function enterWithStarterWorld(){
   // The starter world is granted silently, not an extra player setup screen.
   if(!a.ownedWorldIds.includes(starterWorldId))a.ownedWorldIds.push(starterWorldId);
   if(!a.primaryRainbowLandId||!owned(a.primaryRainbowLandId))a.primaryRainbowLandId=starterWorldId;
   a.friends[a.selectedPlayerCharacterId]??={isRescued:true,upgradeStage:'starter',homeLandId:starterWorldId};
   save();
   map();
 }
 function landCards(){return '<div class="adventure-cards land-cards">'+backgroundHomes.map(l=>'<article>'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong></article>').join('')+'</div>'}



 function isWorldUnlocked(i){return a.highestUnlockedLevel>=i*8+1}
 function worldDoneCount(i){return levels.slice(i*8,i*8+8).filter(l=>a.completedLevelIds.includes(l.id)).length}
 function map(){
  view='map';
  const next=nextLevel(),playerId=a.selectedPlayerCharacterId;
  const nextFriend=companions.find(c=>!a.worldFriends?.[c.id]);
  const friendIndex=nextFriend?companions.indexOf(nextFriend):7,doneForFriend=worldDoneCount(friendIndex);
  const progress=canRescue()?companion(pendingWorldRescue(a)).name+' is ready!':nextFriend?(8-doneForFriend)+' more activities to rescue '+nextFriend.name+'!':'All 8 world friends rescued!';
  // These are the exact eight landing-pad centers in the shared, approved 2048×682 world map.
  const coords=[[7.5,57],[19.7,45.8],[32.3,59.7],[43.2,45.6],[56.1,60.8],[67.6,45.6],[81.1,60.9],[92.7,45.7]];
  const nodes=worldThemes.map((world,i)=>{
   const count=worldDoneCount(i),open=isWorldUnlocked(i),current=next.worldIndex===i;
   return '<button type="button" class="lab-world-node'+(count===8?' completed':'')+(current?' current':'')+'" data-world-index="'+i+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" '+(open?'aria-disabled="false"':'aria-disabled="true"')+' aria-label="'+world.name+' world, '+count+' of 8 activities complete, '+(open?'open':'locked')+'">'+
    '<span class="lab-world-pin" aria-hidden="true">'+(count===8?'⭐':open?'▶':'🔒')+'</span><span class="lab-world-name">'+(i+1)+'. '+world.name+'</span><span class="lab-world-count">'+(open?count+' / 8':'LOCKED')+'</span></button>';
  }).join('');
  const rescueAction=canRescue()?'<button id="ready-rescue" class="lab-rescue" type="button">🐾 Rescue Friend!</button>':'';
  const now=worldThemes[next.worldIndex]||worldThemes[7];
  shell('Rainbow World Map',
   '<section class="lab-map-home" aria-label="Interactive eight-world rainbow map">'+
    '<div class="lab-map-art-frame"><div class="lab-map-canvas" role="group" aria-label="Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava">'+
    '<img class="lab-main-map-art" src="'+asset('arrow-lab/assets/arrow-adventure-eight-worlds-user-20261028-hq.jpg?v=20261029-shared-map')+'" width="2048" height="682" alt="Eight illustrated worlds: Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean and Lava" draggable="false" loading="eager" decoding="async" onerror="this.onerror=null;this.src=\''+asset('arrow-lab/assets/arrow-adventure-eight-worlds-user-20261028.jpg')+'\'">'+nodes+'</div></div>'+
    '<button id="continue-adventure" type="button" class="lab-next-play">▶ PLAY NEXT <small>'+esc(now.name)+' · Activity '+next.worldStage+'</small></button>'+
    '<nav class="lab-main-nav" aria-label="Game navigation"><button type="button" data-nav="map">🏠 <span>Home</span></button><button type="button" data-nav="shop">⭐ <span>Star Shop</span></button><button type="button" data-nav="computer" class="lab-my-stuff-entry">🧸 <span>MY STUFF</span></button></nav>'+
    '<details class="lab-overflow"><summary>⚙ More</summary><button type="button" data-nav="computer">🧸 MY STUFF — Make My Scene</button><button type="button" id="endless">Drag Practice</button>'+(preview?'<button type="button" id="teacher-settings">Teacher Settings</button>':'')+'</details>'+
   '</section>'
  );
  // Character selection and rescue progress now live in the shared header.
  $('continue-adventure').onclick=playNext;
  $('ready-rescue')?.addEventListener('click',continueRescue);
  $('teacher-settings')?.addEventListener('click',onTeacher);
  $('endless').onclick=playNext;
  document.querySelectorAll('[data-world-index]').forEach(b=>b.onclick=()=>{
    const i=Number(b.dataset.worldIndex);
    if(!isWorldUnlocked(i)){
      const previous=worldThemes[i-1],locked=worldThemes[i];
      modal(locked.name+' World is locked',
        '<p>Finish all eight '+esc(previous.name)+' World activities to unlock '+esc(locked.name)+' World.</p><button id="locked-world-back" type="button" class="primary">Back to World Map</button>',()=>{
          $('locked-world-back').onclick=closeModal;
        });
      return;
    }
    openWorld(i);
  });
 }

 function openCandyWorld(){openWorld(0)}
 function openWorld(i){
  if(!isWorldUnlocked(i))return map();
  const world=worldThemes[i],stages=levels.slice(i*8,i*8+8);view='world-select';
  const buttons=stages.map((l,k)=>{
   const done=a.completedLevelIds.includes(l.id),open=done||l.number<=a.highestUnlockedLevel,point=WORLD_STOP_POINTS_BY_WORLD[world.id][k];
   return '<button type="button" class="lab-candy-node'+(done?' done':'')+(open?'':' locked')+'" data-level="'+l.number+'" style="--x:'+point.x+'%;--y:'+point.y+'%" aria-disabled="'+(!open)+'" aria-label="'+(k+1)+'. '+esc(activityNames[k])+(done?' — completed, replay':open?' — ready':' — locked')+'"><span class="lab-map-node-number">'+(k+1)+'</span><span class="lab-map-node-indicator">'+(done?'✓':open?'▶':'🔒')+'</span></button>';
  }).join('');
  shell(world.name+' World','<section class="lab-candy-world"><div class="lab-candy-scenery" role="group" aria-label="'+esc(world.name)+' illustrated activity map"><img class="lab-candy-map-art" width="2048" height="682" src="'+asset(PUBLISHED_WORLD_LEVEL_MAPS[world.id])+'" alt="'+esc(world.name)+' map">'+buttons+'</div><div class="activity-map-legend">'+stages.map((l,k)=>'<button type="button" data-level="'+l.number+'" aria-disabled="'+(!(a.completedLevelIds.includes(l.id)||l.number<=a.highestUnlockedLevel))+'">'+(k+1)+'. '+esc(activityNames[k])+(a.completedLevelIds.includes(l.id)?' ✓':'')+'</button>').join('')+'</div>'+(canRescue()?'<button id="world-rescue">Rescue your friend</button>':'')+'</section>');
  tellGuide(world.name+' World — '+worldDoneCount(i)+' / 8 games complete','⭐ → 🏁');
  $('world-rescue')?.addEventListener('click',continueRescue);
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{
   if(b.getAttribute('aria-disabled')==='true'){modal('Activity locked','<p>Finish the previous activity first.</p><button id="locked-back">Back to map</button>',()=>{$('locked-back').onclick=closeModal});return}
   startLevel(Number(b.dataset.level));
  });
 }

 function stuff(){map()}
 function owned(id){return a.ownedWorldIds.includes(id)}

 function buyHome(id){
  const world=land(id);if(!world)return false;
  if(!owned(id)){
   const cost=worldCosts[lands.indexOf(world)];
   if(a.wallet.rainbowStars<cost)return false;
   a.wallet.rainbowStars-=cost;
   a.ownedWorldIds.push(id);
  }
  a.primaryRainbowLandId=id;save();return true;
 }
 function shopArt(d){
  return d.artPath?img(d.artPath,d.name,'shop-decoration'):d.art?img('trackpad-adventure/decorations/'+d.art+'.webp',d.name,'shop-decoration'):'<span class="shop-emoji">'+(d.emoji||'⭐')+'</span>'}
 function buyShopExclusive(worldId,itemId){
   const item=fullDecorations.find(x=>x.shopOnly&&x.id===itemId&&x.world===backgroundHomes.find(w=>w.id===worldId)?.theme);
   if(!item||!owned(worldId)||Object.values(a.decorations||{}).some(list=>list.includes(itemId))||a.wallet.rainbowStars<item.cost)return false;
   a.wallet.rainbowStars-=item.cost;
   (a.decorations[worldId]??=[]).push(itemId);
   if(a.hiddenDecorations?.[worldId])a.hiddenDecorations[worldId]=a.hiddenDecorations[worldId].filter(x=>x!==itemId);
   save();return true;
  }
  function starShop(){
  view='shop';shell('Star Shop',
  '<p>Earn stars to buy worlds, decorate them, and give presents to rescued friends!</p>'+
  '<div class="home-menu shop-menu"><button data-nav="lands">'+img(backgroundHomes[0].cardPreview,'World Shop')+'<strong>🌍 Buy Worlds</strong></button>'+
  '<button data-nav="computer">'+img(land(a.primaryRainbowLandId).cardPreview,'My Stuff')+'<strong>🧸 MY STUFF</strong></button>'+
  '<button data-nav="decor">'+img('trackpad-adventure/decorations/cottage.webp','Decorations')+'<strong>🌷 Decorations</strong></button>'+
  '<button id="shop-rescued">'+img('arrow-lab/friends/candy-bunny.png','Friends')+'<strong>🐾 Rescued Friends</strong></button>'+
  '<button data-nav="friends">'+pic(a.selectedPlayerCharacterId)+'<strong>🌟 Player Upgrades</strong></button></div>');
  $('shop-rescued').onclick=rescuedFriends;
 }
 function myWorlds(){computer();}
 function rescuedFriends(){
  view='rescue-gallery';
  shell('My Rescued Friends','<p>Finish all 8 activities in a world to rescue its friend.</p>'+
   '<div class="adventure-cards">'+companions.map(c=>{
    const found=!!a.worldFriends?.[c.id],where=found?land(a.worldFriends[c.id].homeLandId):null;
    return '<article class="'+(found?'earned-item':'waiting-item')+'">'+companionArt(c.id)+'<strong>'+esc(c.name)+'</strong><p>'+(found?'Lives in '+esc(where?.name||'a world'):'Still needs rescuing')+'</p>'+(found?'<button data-friend-world="'+c.id+'">🌍 Change World</button><button data-friend-gift="'+c.id+'">🎁 Give a Gift</button>':'')+'</article>';
   }).join('')+'</div><button id="friend-go-worlds">🏡 My Worlds</button>');
  $('friend-go-worlds').onclick=myWorlds;
  document.querySelectorAll('[data-friend-world]').forEach(b=>b.onclick=()=>moveCompanion(b.dataset.friendWorld));document.querySelectorAll('[data-friend-gift]').forEach(b=>b.onclick=()=>friendGiftShop(b.dataset.friendGift));
 }
 function moveCompanion(id){
  if(!a.worldFriends?.[id])return rescuedFriends();view='move-friend';
  shell('Change '+companion(id).name+'’s World','<p>Choose one of your purchased worlds.</p><div class="adventure-cards land-cards">'+
   lands.filter(l=>owned(l.id)).map(l=>'<button data-move-to="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong></button>').join('')+'</div><button id="move-back">← Friends</button>');
  $('move-back').onclick=rescuedFriends;
  document.querySelectorAll('[data-move-to]').forEach(b=>b.onclick=()=>{a.worldFriends[id].homeLandId=b.dataset.moveTo;save();computer(b.dataset.moveTo,'friends')});
 }

 function decorShop(){
  view='decor';
  if(!owned(a.primaryRainbowLandId))a.primaryRainbowLandId=a.ownedWorldIds.find(id=>land(id))||'background_candy';
  const id=a.primaryRainbowLandId,world=land(id),theme=backgroundHomes.find(x=>x.id===id)?.theme||'all';
  const goods=fullDecorations.filter(d=>d.kind==='decor'&&(d.world==='all'||d.world===theme));
  shell('Decorate My World','<p>Buy special decorations you cannot collect in activities. Then arrange them in MY STUFF using your trackpad.</p>'+
   '<div class="world-tabs">'+lands.filter(l=>owned(l.id)).map(l=>'<button data-decor-world="'+l.id+'" aria-pressed="'+(l.id===id)+'">'+esc(l.name)+'</button>').join('')+'</div>'+
   '<h2>For '+esc(world.name)+'</h2><p>⭐ '+a.wallet.rainbowStars+' stars</p>'+
   '<div class="world-hub-actions"><button id="shop-home">🏡 Visit My World</button><button id="decor-change">🌍 Change World</button><button id="decor-gifts">🎁 Friend Gifts</button></div>'+
   '<div class="adventure-cards decoration-cards">'+goods.map(d=>{
     const has=(a.decorations[id]||[]).includes(d.id),ownedAnywhere=d.shopOnly&&Object.values(a.decorations||{}).some(list=>list.includes(d.id));
     return '<article>'+shopArt(d)+'<strong>'+esc(d.name)+'</strong>'+(d.shopOnly?'<span class="shop-only-label">⭐ SHOP ONLY · NOT IN ACTIVITIES</span>':'')+'<span>'+(has?'✓ Purchased':ownedAnywhere?'✓ Owned in MY STUFF':'⭐ '+d.cost)+'</span>'+
      '<button data-buy-decor="'+d.id+'" '+(has||ownedAnywhere||a.wallet.rainbowStars<d.cost?'disabled':'')+'>'+(has?'Already in world':ownedAnywhere?'Move from MY STUFF':'Buy Decoration')+'</button></article>';
   }).join('')+'</div>');
  $('shop-home').onclick=()=>computer(id,'decor');$('decor-change').onclick=myWorlds;$('decor-gifts').onclick=()=>friendGiftShop();
  document.querySelectorAll('[data-decor-world]').forEach(b=>b.onclick=()=>{a.primaryRainbowLandId=b.dataset.decorWorld;save();decorShop()});
  document.querySelectorAll('[data-buy-decor]').forEach(b=>b.onclick=()=>{
   const d=goods.find(x=>x.id===b.dataset.buyDecor);
   if(!d||!owned(id)||a.wallet.rainbowStars<d.cost||(a.decorations[id]||[]).includes(d.id))return;
   if(d.shopOnly){if(!buyShopExclusive(id,d.id))return;}
   else{a.wallet.rainbowStars-=d.cost;(a.decorations[id]??=[]).push(d.id);save();}
   decorShop();
  });
 }
 function friendGiftShop(selectedId=null){
  view='gifts';const rescued=companions.filter(c=>a.worldFriends?.[c.id]);
  if(!rescued.length){
   shell('Friend Gifts','<p>Rescue your first friend by completing all 8 activities in a play world. Then you can buy them gifts!</p><button id="see-friends">🐾 All Friends</button>');
   $('see-friends').onclick=rescuedFriends;return;
  }
  const chosen=rescued.find(c=>c.id===selectedId)||rescued[0];
  const gifts=themedGoods.filter(x=>x.kind==='gift'&&x.world===chosen.id);
  const bought=a.friendGifts[chosen.id]||[];
  shell('Gifts for '+chosen.name,'<p>Buy a gift for your rescued friend. The gift stays with them when they move to another world.</p>'+
   '<div class="world-tabs">'+rescued.map(c=>'<button data-gift-friend="'+c.id+'" aria-pressed="'+(chosen.id===c.id)+'">'+esc(c.name)+'</button>').join('')+'</div>'+
   '<div class="placing-friend">'+companionArt(chosen.id)+'</div>'+
   '<div class="adventure-cards decoration-cards">'+gifts.map(d=>{
     const has=bought.includes(d.id),equipped=a.friendGiftEquipped[chosen.id]===d.id;
     return '<article>'+shopArt(d)+'<strong>'+esc(d.name)+'</strong><span>'+(equipped?'✓ Given to friend':has?'✓ Purchased':'⭐ '+d.cost)+'</span>'+
     '<button data-buy-gift="'+d.id+'" '+(equipped||(!has&&a.wallet.rainbowStars<d.cost)?'disabled':'')+'>'+(has?'Give this Gift':'Buy Gift')+'</button></article>';
   }).join('')+'</div><button id="gift-friends">🐾 All Rescued Friends</button>');
  $('gift-friends').onclick=rescuedFriends;
  document.querySelectorAll('[data-gift-friend]').forEach(b=>b.onclick=()=>friendGiftShop(b.dataset.giftFriend));
  document.querySelectorAll('[data-buy-gift]').forEach(b=>b.onclick=()=>{
   const d=gifts.find(x=>x.id===b.dataset.buyGift);if(!d)return;
   if(!a.friendGifts[chosen.id]?.includes(d.id)){
     if(a.wallet.rainbowStars<d.cost)return;
     a.wallet.rainbowStars-=d.cost;(a.friendGifts[chosen.id]??=[]).push(d.id);
   }
   a.friendGiftEquipped[chosen.id]=d.id;save();friendGiftShop(chosen.id);
  });
 }
 function homeMap(){
  view='lands';shell('World Shop','<p>Buy a whole world to visit, arrange, decorate, and share with rescued friends. Activity worlds unlock through play, not spending stars.</p>'+
   '<div class="world-hub-actions"><button id="shop-owned-worlds">🧸 MY STUFF</button><strong>⭐ '+a.wallet.rainbowStars+'</strong></div>'+
   '<div class="adventure-cards land-cards">'+backgroundHomes.map(w=>{
     const has=owned(w.id),price=worldCosts[lands.indexOf(w)];
     return '<article>'+img(w.cardPreview,w.name)+'<strong>'+esc(w.name)+'</strong><p>'+(has?'✓ Owned':'⭐ '+price+' stars')+'</p>'+
      '<button data-world-to-buy="'+w.id+'" '+(!has&&a.wallet.rainbowStars<price?'disabled':'')+'>'+(has?'Visit World':'Buy World')+'</button></article>';
   }).join('')+'</div>');
  $('shop-owned-worlds').onclick=()=>computer();
  document.querySelectorAll('[data-world-to-buy]').forEach(b=>b.onclick=()=>{if(buyHome(b.dataset.worldToBuy))computer(b.dataset.worldToBuy,"worlds")});
 }
 // Legacy callers must open the single MY STUFF playroom, never a second world editor.
 function visit(id){computer(id);}

 function friends(){
 view='friends';const costs=config.progression.upgradeCost;
 shell('Character Upgrades','<p>Use your stars to help a friend grow. You have '+a.wallet.rainbowStars+' stars.</p><div class="adventure-cards friend-cards">'+[char(a.selectedPlayerCharacterId),...chars.filter(c=>c.id!==a.selectedPlayerCharacterId)].map(c=>{const f=a.friends[c.id];if(!f)return '<div class="locked-friend">'+img(c.levels[0].thumbnail,c.name)+'<strong>'+esc(c.name)+'</strong><p>Waiting to be rescued</p></div>';const cost=f.upgradeStage==='starter'?costs.power_up:costs.super_power_additional;return '<article>'+pic(c.id)+'<h3>'+esc(c.name)+(c.id===a.selectedPlayerCharacterId?' · My player':'')+'</h3><p>'+currentStage(c.id)+' · '+esc(look(c.id).name)+'</p><p>'+esc(land(f.homeLandId).name)+'</p><button data-upgrade="'+c.id+'" '+(f.upgradeStage==='super_power'||a.wallet.rainbowStars<cost?'disabled':'')+'>'+(f.upgradeStage==='super_power'?'★ Fully grown!':a.wallet.rainbowStars<cost?'Need '+(cost-a.wallet.rainbowStars)+' more stars':'🌟 Grow · '+cost+' stars')+'</button><button data-move="'+c.id+'">🏡 Choose home</button></article>'}).join('')+'</div>');
 document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(upgradeFriend(a,b.dataset.upgrade,costs)){save();celebrate(currentStage(b.dataset.upgrade)+' unlocked!',b.dataset.upgrade,friends)}});
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>place(b.dataset.move));
 }
 function place(id,rescuing=false){
 pendingFriend=id;view='place';const worlds=lands.filter(l=>owned(l.id));
 shell('Where will '+esc(char(id).name)+' live?','<p>'+(worlds.length?'Choose one of your worlds. Adding a friend is free.':'Your friend needs a home. Visit Worlds to buy your first world, then come back to place your friend.')+'</p><div class="placing-friend">'+pic(id)+'</div><div class="adventure-cards land-cards">'+worlds.map(l=>'<button data-land="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong><span>Owned ✓ · Add friend free</span></button>').join('')+'</div>'+(!worlds.length?'<button id="placement-worlds" class="primary">🌍 Go to Worlds</button>':'')+'<button id="place-back">← '+(rescuing?'Choose a different friend':'Upgrades')+'</button>');
 $('placement-worlds')?.addEventListener('click',homeMap);$('place-back').onclick=()=>{if(rescuing){a.pendingRescueFriendId=null;save();rescue()}else friends()};
 document.querySelectorAll('[data-land]').forEach(b=>b.onclick=()=>{const world=b.dataset.land;if(!owned(world))return;const placed=placeFriend(a,id,world);if(!placed)return;pendingFriend=null;save();sound();computer(world,rescuing?'friends':'decor')});
 }
 const worldTreasureCards=(world,arr)=>'<h2>'+world.toUpperCase()+' TREASURES</h2><div class="adventure-cards lab-candy-collection">'+arr.map(([id,name])=>'<article class="'+((a.collectedWorldItems||[]).includes(id)?'earned-item':'waiting-item')+'">'+img(itemArt(id),name)+'<strong>'+esc(name)+'</strong><p>'+((a.collectedWorldItems||[]).includes(id)?'✓ FOUND':'Find in '+world+' World')+'</p></article>').join('')+'</div>';

 function sceneTreasures(id){
  const theme=backgroundHomes.find(w=>w.id===id)?.theme||backgroundHomes.find(w=>w.id===a.homeBackgrounds[id])?.theme||'candy';
  const eligible=new Set(levels.filter(l=>worldThemes[l.worldIndex].id===theme).flatMap(l=>l.collectibleIds||[]));
  return [...new Set([...(a.collectedWorldItems||[]),...(a.collectedComputerGearIds||[])])].filter(key=>(eligible.has(key)||(theme==='candy'&&REPLACEMENT_COLLECTIBLES[key]))&&/\.(png|jpe?g)(?:[?#]|$)/i.test(itemArt(key)||'')).slice(0,10);
 }
 function collectionStage(id){
  const l=land(id),residents=Object.keys(a.friends).filter(c=>hasPlayerCharacter(c)&&a.friends[c]?.homeLandId===id);
  const companionsHere=companions.filter(c=>a.worldFriends?.[c.id]?.homeLandId===id&&!a.hiddenCompanions?.includes(c.id));
  const goods=(a.decorations[id]||[]).filter(key=>!a.hiddenDecorations?.[id]?.includes(key));
  const treasureGoods=(a.collectionExtraObjects?.[id]||[]).filter(key=>sceneTreasures(id).includes(key));
  const positions=a.positions[id]||{};
  const at=(key,i)=>positions[key]||{x:14+(i%5)*18,y:28+(Math.floor(i/5)%3)*24};
  const personArt=residents.map((c,i)=>{
    const p=at(c,i),name=char(c)?.name||c.replaceAll('_',' ');return '<div class="world-object world-friend" data-world-object="'+c+'" style="left:'+p.x+'%;top:'+p.y+'%" role="img" aria-label="'+esc(name)+'">'+pic(c)+'<span>'+esc(name)+'</span></div>';
  }).join('');
  const friendArt=companionsHere.map((c,i)=>{
    const p=at('companion:'+c.id,residents.length+i);
    const gift=findDecoration(a.friendGiftEquipped[c.id]);
    return '<div class="world-object world-companion" data-world-object="companion:'+c.id+'" style="left:'+p.x+'%;top:'+p.y+'%" role="img" aria-label="'+esc(c.name)+'">'+companionArt(c.id)+'<span>'+esc(c.name)+'</span>'+(gift?'<span class="world-friend-gift">'+shopArt(gift)+'</span>':'')+'</div>';
  }).join('');
  const decorArt=goods.map((d,i)=>{
    const item=findDecoration(d);if(!item)return '';
    const p=at('decor:'+d,residents.length+companionsHere.length+i);
    return '<div class="world-object world-prop" data-world-object="decor:'+d+'" style="left:'+p.x+'%;top:'+p.y+'%" role="img" aria-label="'+esc(item.name)+'">'+shopArt(item)+'</div>';
  }).join('');
  const treasureArt=treasureGoods.map((key,i)=>{const p=at('treasure:'+key,residents.length+companionsHere.length+goods.length+i);
    return '<div class="world-object world-prop" data-world-object="treasure:'+key+'" role="img" aria-label="Move '+esc(itemName(key))+'" style="left:'+p.x+'%;top:'+p.y+'%">'+img(itemArt(key),itemName(key),'shop-decoration')+'</div>';
  }).join('');
  const picture=id.startsWith('background_')?l.homeBackground:(backgroundHomes.find(w=>w.id===a.homeBackgrounds[id])?.homeBackground||l.homeBackground);
  return '<div id="collection-scene" class="land-scene free-world collection-scene" role="group" aria-label="'+esc(l.name)+', including your arranged friends and decorations" style="background-image:url('+asset(picture)+')"><img class="collection-background-size" src="'+asset(picture)+'" alt="" draggable="false">'+personArt+friendArt+decorArt+treasureArt+'</div>';
 }
 function enableCollectionDrag(id){
   const scene=$('collection-scene');if(!scene)return()=>false;
   let drag=null,selectedCharacter=null,ignoreClick=false;
   const tell=text=>{if($('collection-report'))$('collection-report').textContent=text};
   function pickCharacter(characterId){
     if(!hasPlayerCharacter(characterId)||a.friends[characterId]?.homeLandId!==id)return false;
     selectedCharacter=characterId;
     scene.classList.add('placing-character');
     scene.querySelectorAll('[data-world-object]').forEach(el=>el.classList.toggle('selected-character',el.dataset.worldObject===characterId));
     tell('Click any spot in the big picture to place '+char(characterId).name+'. You do not have to drag!');
     return true;
   }
   scene.onpointerdown=e=>{
     const el=e.target.closest('[data-world-object]');
     if(!el||selectedCharacter||e.pointerType!=='mouse'||e.button!==0)return;
     e.preventDefault();const rect=el.getBoundingClientRect();
     drag={el,key:el.dataset.worldObject,pointer:e.pointerId,dx:e.clientX-rect.left-rect.width/2,dy:e.clientY-rect.top-rect.height/2,oldX:el.style.left,oldY:el.style.top,startX:e.clientX,startY:e.clientY,moved:false};
     el.setPointerCapture(e.pointerId);el.classList.add('moving');
   };
   scene.onpointermove=e=>{
     if(!drag||drag.pointer!==e.pointerId)return;
     const rect=scene.getBoundingClientRect();
     const x=Math.max(10,Math.min(90,(e.clientX-drag.dx-rect.left)/rect.width*100));
     const y=Math.max(18,Math.min(85,(e.clientY-drag.dy-rect.top)/rect.height*100));
     if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;
     e.preventDefault();drag.x=x;drag.y=y;drag.el.style.left=x+'%';drag.el.style.top=y+'%';
   };
   scene.onpointerup=e=>{
     if(!drag||drag.pointer!==e.pointerId)return;
     if(drag.moved&&drag.x!==undefined){
       (a.positions[id]??={})[drag.key]={x:drag.x,y:drag.y};save();
       tell('Saved! Your arrangement will be here next time.');
       ignoreClick=true;
     }else{drag.el.style.left=drag.oldX;drag.el.style.top=drag.oldY}
     drag.el.classList.remove('moving');drag=null;
   };
   scene.onpointercancel=scene.onlostpointercapture=()=>{
     if(!drag)return;drag.el.style.left=drag.oldX;drag.el.style.top=drag.oldY;drag.el.classList.remove('moving');drag=null;
   };
   scene.addEventListener('click',e=>{
     if(ignoreClick){ignoreClick=false;return}
     const clicked=e.target.closest('[data-world-object]')?.dataset.worldObject;
     if(!selectedCharacter){
       if(clicked&&hasPlayerCharacter(clicked)&&a.friends[clicked]?.homeLandId===id)pickCharacter(clicked);
       return;
     }
     if(clicked!==selectedCharacter&&hasPlayerCharacter(clicked)&&a.friends[clicked]?.homeLandId===id){pickCharacter(clicked);return}
     const bounds=scene.getBoundingClientRect(),chosen=selectedCharacter;
     (a.positions[id]??={})[chosen]={
       x:Math.max(10,Math.min(90,(e.clientX-bounds.left)/bounds.width*100)),
       y:Math.max(18,Math.min(85,(e.clientY-bounds.top)/bounds.height*100))
     };
     const figure=[...scene.querySelectorAll('[data-world-object]')].find(el=>el.dataset.worldObject===chosen);
     if(figure){figure.style.left=a.positions[id][chosen].x+'%';figure.style.top=a.positions[id][chosen].y+'%';figure.classList.remove('selected-character')}
     selectedCharacter=null;scene.classList.remove('placing-character');save();
     tell('Saved! '+(char(chosen)?.name||'Your character')+' will stay in this spot.');
   });
   return pickCharacter;
 }
 function computer(worldId=null,section=null,placeCharacterId=null){
  view='computer';
  a.hiddenDecorations??={};a.hiddenCompanions??=[];a.collectionExtraObjects??={};
  const purchased=lands.filter(l=>owned(l.id));
  const requested=worldId||a.collectionWorldId||a.primaryRainbowLandId;
  const id=purchased.some(l=>l.id===requested)?requested:purchased[0]?.id;
  if(!id)return homeMap();
  // A playroom, not four inventory pages: show every usable object together.
  // The old collectionTab is left intact for save compatibility, but never gates the tray.
  a.collectionWorldId=id;a.primaryRainbowLandId=id;save();
  // The playroom tray is a student's complete inventory, not just the items in this world.
  // Keep the legacy per-world decoration arrays so old saves and arrangements survive.
  const ownedDecor=[...new Set(Object.values(a.decorations||{}).flat())];
  const ownedPlayers=chars.filter(c=>hasPlayerCharacter(c.id));
  const rescued=companions.filter(c=>a.worldFriends?.[c.id]);
  const treasures=sceneTreasures(id);
  const decorationCards=ownedDecor.map(key=>{
    const d=findDecoration(key);if(!d)return '';
    const here=(a.decorations[id]||[]).includes(key);
    const placed=here&&!a.hiddenDecorations[id]?.includes(key);
    const elsewhere=!here&&Object.entries(a.decorations||{}).some(([world,items])=>world!==id&&items.includes(key));
    return '<article class="my-stuff-item" data-stuff-kind="decoration">'+shopArt(d)+
      '<strong>'+esc(d.name)+'</strong><button type="button" data-stuff-decor="'+d.id+'" aria-pressed="'+placed+'">'+
      (placed?'✓ In Scene · Put Away':elsewhere?'＋ Move to This World':'＋ Add to Scene')+'</button></article>';
  }).join('');
  const playerCards=ownedPlayers.map(c=>{
   const here=a.friends[c.id].homeLandId===id;
   return '<article class="my-stuff-item" data-stuff-kind="player">'+pic(c.id)+
    '<strong>'+esc(c.name)+'</strong><small>✓ Owned Character</small>'+
    '<button type="button" data-stuff-player="'+esc(c.id)+'" '+(here?'disabled':'')+'>'+
    (here?'✓ Lives Here':'＋ Move to This World')+'</button></article>';
  }).join('');
  const friendCards=rescued.map(c=>{
    const here=a.worldFriends[c.id].homeLandId===id;
    const placed=here&&!a.hiddenCompanions.includes(c.id);
    return '<article class="my-stuff-item" data-stuff-kind="friend">'+companionArt(c.id)+
      '<strong>'+esc(c.name)+'</strong><button type="button" data-stuff-friend="'+c.id+'" aria-pressed="'+placed+'">'+
      (placed?'✓ Here · Put Away':here?'＋ Add to Scene':'＋ Bring to This World')+'</button></article>';
  }).join('');
  const treasureCards=treasures.map(key=>{
    const placed=(a.collectionExtraObjects[id]||[]).includes(key);
    return '<article class="my-stuff-item" data-stuff-kind="treasure">'+
      img(itemArt(key),itemName(key),'my-stuff-thumb')+'<strong>'+esc(itemName(key))+'</strong>'+
      '<button type="button" data-stuff-treasure="'+key+'" aria-pressed="'+placed+'">'+
      (placed?'✓ In Scene · Put Away':'＋ Add to Scene')+'</button></article>';
  }).join('');
  const hasObjects=!!(ownedDecor.length||rescued.length||treasures.length);
  const worldOnlyGoods=fullDecorations.filter(d=>d.shopOnly&&d.world===backgroundHomes.find(w=>w.id===id)?.theme);
  const exclusiveStore='<section class="my-stuff-exclusive-store" aria-label="Shop-only decorations for '+esc(land(id).name)+'">'+
   '<h3>⭐ '+esc(land(id).name)+' · SHOP ONLY</h3><p>These items cannot be collected in activities. Spend stars to buy them for your world!</p>'+
   '<div class="my-stuff-exclusive-cards">'+worldOnlyGoods.map(d=>{
    const here=(a.decorations[id]||[]).includes(d.id),ownedAnywhere=Object.values(a.decorations||{}).some(list=>list.includes(d.id));
    return '<article class="my-stuff-exclusive-item">'+shopArt(d)+'<strong>'+esc(d.name)+'</strong><small>⭐ '+d.cost+' stars · Shop Only</small>'+
      '<button type="button" data-buy-shop-only="'+d.id+'" '+(ownedAnywhere||a.wallet.rainbowStars<d.cost?'disabled':'')+'>'+
      (here?'✓ Owned':ownedAnywhere?'✓ Owned · Move from Tray':a.wallet.rainbowStars<d.cost?'Earn More Stars':'⭐ Buy for '+d.cost+' Stars')+'</button></article>';
   }).join('')+'</div></section>';
  const tray='<p>Up to 10 collected treasures from this world, plus your purchased decorations and friends.</p>'+
    '<div class="my-stuff-tray-controls" aria-label="Browse my decorations"><button id="stuff-scroll-prev" type="button" aria-label="Previous decorations">◀</button><strong>My Decorations, Friends & Treasures</strong><button id="stuff-scroll-next" type="button" aria-label="More decorations">▶</button></div>'+
    '<div id="my-stuff-tray" class="my-stuff-tray" tabindex="0" role="region" aria-label="My earned decorations, rescued friends, and treasures. Scroll horizontally.">'+
      (hasObjects?decorationCards+friendCards+treasureCards:
      '<p class="my-stuff-empty">Your collection starts here! Finish activities to earn treasures, rescue friends and buy decorations.</p>')+
    '</div><div class="my-stuff-shop-actions">'+
      '<button class="my-stuff-action" type="button" id="stuff-decor-shop">⭐ Get More Decorations</button>'+
      '<button class="my-stuff-action" type="button" id="stuff-buy-world">🌍 Get Another World</button></div>';
  const worldCards=purchased.map(l=>'<article class="my-stuff-item my-stuff-world-item">'+
    '<button class="my-stuff-world-card" type="button" data-stuff-world="'+l.id+'" aria-pressed="'+(l.id===id)+'">'+
    img(l.cardPreview,l.name,'my-stuff-thumb')+'<strong>'+esc(l.name)+'</strong></button></article>').join('');
  // One shelf is the only inventory surface. Selecting a tab changes its contents,
  // not the scene, world positions, purchases or saved student inventory.
  const characterCards=ownedPlayers.map(c=>{
    const here=a.friends[c.id].homeLandId===id;
    return '<article class="my-stuff-item my-stuff-character-item">'+pic(c.id)+
      '<button type="button" class="my-stuff-info" data-stuff-character-info="'+esc(c.id)+'">🔎 '+esc(c.name)+'</button>'+
      '<button type="button" data-stage-player="'+esc(c.id)+'">'+(here?'✋ Move':'＋ Place Here')+'</button></article>';
  }).join('')+rescued.map(c=>{
    const here=a.worldFriends[c.id].homeLandId===id;
    return '<article class="my-stuff-item my-stuff-character-item">'+companionArt(c.id)+
      '<button type="button" class="my-stuff-info" data-stuff-character-info="'+esc(c.id)+'">🔎 '+esc(c.name)+'</button>'+
      '<button type="button" data-stuff-friend="'+esc(c.id)+'">'+(here?'Put Away / Show':'＋ Bring Here')+'</button></article>';
  }).join('');
  shell('MY STUFF','<section class="lab-collection-page my-stuff-room my-stuff-full-room" aria-label="My Stuff: arrange your world">'+
    '<div class="my-stuff-heading"><div><h2>'+esc(land(id).name)+'</h2></div>'+
    '<div class="my-stuff-scene-actions"><button id="stuff-home" type="button">🏠 Home</button><button id="stuff-help" type="button">✋ How to Move</button><button id="stuff-store" type="button">⭐ Store</button></div></div>'+
    '<div class="my-stuff-stage"><div class="collection-world-showcase">'+collectionStage(id)+'</div>'+
    '<p id="collection-report" role="status">Click a character, then click where you want it to stand. Or drag with your trackpad.</p></div>'+
    '<div class="my-stuff-unified-shelf" aria-label="Browse worlds, characters, and purchases and collections">'+
      '<div class="my-stuff-unified-tabs" role="group" aria-label="Choose what to browse">'+
        '<button data-stuff-tab="worlds" aria-pressed="false" type="button">🌍 Worlds</button>'+
        '<button data-stuff-tab="characters" aria-pressed="false" type="button">🐾 Characters</button>'+
        '<button data-stuff-tab="items" aria-pressed="true" type="button">🎁 Purchases / Collections</button></div>'+
      '<div class="my-stuff-tray-controls"><button id="stuff-scroll-prev" type="button" aria-label="Previous items">◀</button>'+
        '<div id="my-stuff-tray" class="my-stuff-tray" tabindex="0" role="region" aria-label="Browse items left and right">'+
          '<div class="my-stuff-shelf-page" data-stuff-page="worlds" hidden>'+worldCards+'</div>'+
          '<div class="my-stuff-shelf-page" data-stuff-page="characters" hidden>'+characterCards+'</div>'+
          '<div class="my-stuff-shelf-page" data-stuff-page="items">'+(hasObjects?decorationCards+friendCards+treasureCards:'<p>Finish activities to fill your collection.</p>')+'</div>'+
        '</div><button id="stuff-scroll-next" type="button" aria-label="Next items">▶</button></div>'+
      '</div></section>');
  // Use the existing dialog mechanism without navigating out of the arranged scene.
  let infoDialog=document.getElementById('stuff-character-dialog');
  if(!infoDialog){infoDialog=document.createElement('dialog');infoDialog.id='stuff-character-dialog';infoDialog.className='dialog my-stuff-character-dialog';document.body.append(infoDialog);}
  const tabs=[...document.querySelectorAll('[data-stuff-tab]')];
  const selectTab=(name)=>{
    tabs.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stuffTab===name)));
    document.querySelectorAll('[data-stuff-page]').forEach(page=>page.hidden=page.dataset.stuffPage!==name);
    $('my-stuff-tray').scrollLeft=0;
    a.collectionTab=name;save();
  };
  tabs.forEach(b=>b.onclick=()=>selectTab(b.dataset.stuffTab));
  selectTab(['worlds','characters','items'].includes(section)?section:['worlds','characters','items'].includes(a.collectionTab)?a.collectionTab:'items');
  document.querySelectorAll('[data-stuff-character-info]').forEach(b=>b.onclick=()=>{
    const key=b.dataset.stuffCharacterInfo;
    const player=chars.find(c=>c.id===key),friend=companions.find(c=>c.id===key);
    const who=player||friend;if(!who)return;
    const home=player?a.friends[key]?.homeLandId:a.worldFriends?.[key]?.homeLandId;
    infoDialog.innerHTML='<div class="my-stuff-character-profile">'+(player?pic(key):companionArt(key))+
      '<h2>'+esc(who.name)+'</h2><p>'+(player?'Your collected player character':'Your rescued friend')+
      '</p><p>Home: '+esc(land(home)?.name||'Your collection')+'</p>'+
      '<button type="button" id="stuff-close-profile">Close</button></div>';
    infoDialog.querySelector('#stuff-close-profile').onclick=()=>infoDialog.close();
    infoDialog.showModal();
  });
  $('stuff-store').onclick=()=>{a.primaryRainbowLandId=id;save();decorShop()};
  const sceneImage=$('collection-scene').querySelector('.collection-background-size');
  const sizeScene=()=>fit();
  sceneImage.addEventListener('load',sizeScene,{once:true});sizeScene();
  const armCharacter=enableCollectionDrag(id);
  if(placeCharacterId)armCharacter(placeCharacterId);
  $('stuff-home').onclick=map;
  $('stuff-help').onclick=()=>{$('collection-report').textContent='Click a character ONCE, then click where it should stand. Or click their Move button below the picture. Dragging still works!'};
  // Keep the tray in view after adding/putting away several objects in a row.
  const refresh=(characterId=null)=>{
    const appScroll=$('app').scrollTop, pageScroll=window.scrollY, trayScroll=$('my-stuff-tray')?.scrollLeft||0;
    computer(id,a.collectionTab,characterId);
    $('app').scrollTop=appScroll;
    if($('my-stuff-tray'))$('my-stuff-tray').scrollLeft=trayScroll;
    // Depending on Chromebook viewport, either the page or the app is scrollable.
    window.scrollTo?.(0,pageScroll);
    requestAnimationFrame(()=>{$('app').scrollTop=appScroll;if($('my-stuff-tray'))$('my-stuff-tray').scrollLeft=trayScroll;window.scrollTo?.(0,pageScroll)});
  };
  const scrollTray=dir=>{const tray=$('my-stuff-tray');if(tray)tray.scrollBy({left:dir*Math.max(150,Math.floor(tray.clientWidth*.75)),behavior:'smooth'});};
  $('stuff-scroll-prev').onclick=()=>scrollTray(-1);
  $('stuff-scroll-next').onclick=()=>scrollTray(1);
  // Chromebook trackpads commonly send vertical wheel deltas. Move the
  // horizontal shelf only while there are more items in that direction;
  // at either end, let the page scroll normally (no scroll trap).
  const collectionShelf=$('my-stuff-tray');
  collectionShelf?.addEventListener('wheel',event=>{
    if(event.ctrlKey||collectionShelf.scrollWidth<=collectionShelf.clientWidth+1)return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(!delta)return;
    const max=collectionShelf.scrollWidth-collectionShelf.clientWidth;
    if((delta<0&&collectionShelf.scrollLeft<=1)||(delta>0&&collectionShelf.scrollLeft>=max-1))return;
    event.preventDefault();
    collectionShelf.scrollLeft=Math.max(0,Math.min(max,collectionShelf.scrollLeft+delta));
  },{passive:false});
  collectionShelf?.addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();scrollTray(event.key==='ArrowLeft'?-1:1);
  });
  document.querySelectorAll('[data-stuff-world]').forEach(b=>b.onclick=()=>computer(b.dataset.stuffWorld,'worlds'));
  document.querySelectorAll('[data-stuff-decor]').forEach(b=>b.onclick=()=>{
    const key=b.dataset.stuffDecor,hidden=(a.hiddenDecorations[id]??=[]);
    if((a.decorations[id]||[]).includes(key)){
      if(hidden.includes(key))a.hiddenDecorations[id]=hidden.filter(x=>x!==key);
      else hidden.push(key);
    }else{
      // Move one purchased item, without charging stars, duplicating it or clearing other saves.
      const from=Object.keys(a.decorations||{}).find(world=>world!==id&&a.decorations[world]?.includes(key));
      if(!from)return;
      a.decorations[from].splice(a.decorations[from].indexOf(key),1);
      if(a.hiddenDecorations[from])a.hiddenDecorations[from]=a.hiddenDecorations[from].filter(item=>item!==key);
      if(a.positions?.[from])delete a.positions[from]['decor:'+key];
      (a.decorations[id]??=[]).push(key);
      a.hiddenDecorations[id]=hidden.filter(item=>item!==key);
    }
    save();refresh();
  });
  const movePlayer=characterId=>{
    if(!hasPlayerCharacter(characterId)||!owned(id))return;
    if(a.friends[characterId].homeLandId!==id){
      if(!placeFriend(a,characterId,id))return;
      save();refresh(characterId);
    }else armCharacter(characterId);
  };
  document.querySelectorAll('[data-stage-player]').forEach(b=>b.onclick=()=>movePlayer(b.dataset.stagePlayer));
  document.querySelectorAll('[data-stuff-player]').forEach(b=>b.onclick=()=>movePlayer(b.dataset.stuffPlayer));
  document.querySelectorAll('[data-stuff-friend]').forEach(b=>b.onclick=()=>{
    const key=b.dataset.stuffFriend,friend=a.worldFriends?.[key];if(!friend)return;
    const here=friend.homeLandId===id,hidden=a.hiddenCompanions.includes(key);
    if(here&&!hidden)a.hiddenCompanions.push(key);
    else{friend.homeLandId=id;a.hiddenCompanions=a.hiddenCompanions.filter(x=>x!==key);}
    save();refresh();
  });
  document.querySelectorAll('[data-stuff-treasure]').forEach(b=>b.onclick=()=>{
    const key=b.dataset.stuffTreasure,active=(a.collectionExtraObjects[id]??=[]);
    if(active.includes(key))a.collectionExtraObjects[id]=active.filter(x=>x!==key);else active.push(key);
    save();refresh();
  });
  document.querySelectorAll('[data-buy-shop-only]').forEach(button=>button.onclick=()=>{
    if(buyShopExclusive(id,button.dataset.buyShopOnly))refresh();
  });
  $('stuff-decor-shop')?.addEventListener('click',()=>{a.primaryRainbowLandId=id;save();decorShop()});
  // Worlds and store are now available from the unified shelf and Store button.
 }
 function finale(){view='finale';sound();shell('You Built Your Rainbow Computer!','<div class="computer-build celebrate '+(settings.reducedMotion?'still':'')+'">'+data.computer_collectibles.map(i=>img(i.image,i.name)).join('')+'</div><p>You used your arrow keys, explored, and kept trying!</p><button id="more-adventures" class="primary">Keep adventuring →</button>');a.computerBuilt=true;save();$('more-adventures').onclick=map;}
 // Non-destructive migration for existing unfinished activity saves created
 // before two objectives were guaranteed in every world. Keep their original
 // maze, player position, enemy patrols, collected items and rewards intact.
 function ensureRunObjectives(run,definition){
   const required=definition.collectibleIds||[];
   if(!required.length||!Array.isArray(run.items))return;
   const occupied=new Set([
     ...run.items.map(tile),tile(run.start||{x:1,y:1}),tile(run.goal),tile(run.player),
     ...(run.skill?[tile(run.skill)]:[]),...(run.barrier?[tile(run.barrier)]:[]),
     ...run.hazards.flatMap(enemy=>enemy.path.map(tile))
   ]);
   const distance=(p,q)=>Math.abs(p.x-q.x)+Math.abs(p.y-q.y);
   for(const id of required){
     if(run.items.some(item=>item.id===id))continue;
     let best=null,bestScore=-Infinity;
     for(let y=1;y<run.h-1;y++)for(let x=1;x<run.w-1;x++){
       const p={x,y};
       if(run.grid[y][x]!==0||occupied.has(tile(p))||!route(run.grid,run.player,p))continue;
       const anchors=[run.player,run.start||{x:1,y:1},run.goal,...run.items];
       const score=Math.min(...anchors.map(q=>distance(p,q)))*100+distance(p,run.player);
       if(score>bestScore){best=p;bestScore=score}
     }
     if(!best)continue; // Never discard a saved run just to add an objective.
     run.items.push({id,x:best.x,y:best.y,collected:false});
     occupied.add(tile(best));
   }
 }
 function startLevel(n,restart=false){
 clearClock();def=levels[n-1];if(!def||n>a.highestUnlockedLevel&&!a.completedLevelIds.includes(def.id))return;
 const previous=a.mazeRuns?.[def.id];
 const current=activityLevels[n-1];
 const level=!restart&&previous?.activityState&&previous.patternVersion!==2&&current.legacyPattern?current.legacyPattern:current;
 let activityState=stateFor(level,!restart&&previous?.activityState);
 if(!restart&&previous?.dragVersion===1&&!previous.complete){
  // Preserve credit from an unfinished old matching activity; never erase its source run.
  const credit=Math.min(progressFor(level,activityState).total-1,Math.floor((previous.drops||0)/(3+def.worldStage)*progressFor(level,activityState).total));
  for(let i=0;i<credit;i++){
   const target=targetsFor(level,activityState).find(t=>level.engine==='pattern'?!activityState.roundPlaced[t.id]:t.capacity===0||!Object.values(activityState.placed).includes(t.id));
   const piece=level.pieces.find(p=>(level.engine==='pattern'||!activityState.placed[p.id])&&target?.accept.includes(p.key));
   if(piece&&target)tryPlacement(level,activityState,piece.id,target.id);
  }
 }
 r={id:def.id,dragVersion:2,patternVersion:level.patternVersion||1,activityState,items:[],complete:false,rewarded:a.completedLevelIds.includes(def.id),...(!restart&&previous?.dragVersion===1?{legacyDragV1:previous}:{})};
 view='drag';shell(esc(def.title),'<div id="drag-activity"></div>');document.body.classList.add('activity-playing');
 dragSession=mountActivity($('drag-activity'),{level,saved:activityState,reducedMotion:settings.reducedMotion||settings.difficulty==='gentle',speed:settings.speed,
  onProgress:state=>{r.activityState=state;save()},
  onComplete:()=>{
   for(const id of def.collectibleIds||[])if(!(a.collectedWorldItems??=[]).includes(id))a.collectedWorldItems.push(id);
   r.items=(def.collectibleIds||[]).map(id=>({id,collected:true}));r.skill={done:true,type:level.engine};finish();
  }
 });
 tellGuide(ENGINES[level.engine].instruction,'CLICK · HOLD · MOVE · LET GO');a.activeRun=r;save();
 }
 function maze(){
 view='maze';shell(esc(def.title),'<div class="quest-strip"><span>ACTIVITY '+def.number+'</span><span id="quest-items"></span></div><div class="play-layout adventure-layout"><section><div class="board-wrap scenic-board'+(def.worldIndex===0?' lab-candy-maze':def.individualBackdrop?' lab-individual-maze':'')+'" style="--lab-sprite-x:'+def.sceneX+'%;--lab-sprite-y:'+def.sceneY+'%;background-image:url('+asset(def.backgroundImage)+')"><div id="adventure-maze" class="maze" tabindex="0" aria-label="Use your keyboard arrows. Start at the star. Collect the items and reach the checkered flag."></div></div><p id="adventure-status" class="caption" role="status">'+esc(report)+'</p></section></div><div class="maze-controls"><button hidden id="maze-shop" class="star-shop-button">'+starIcon+'<span>Star Shop</span></button><button id="hint-route">💡 Help me</button><button id="duck-button" aria-pressed="false" '+(!r.barrier?'hidden':'')+'>Hold SPACE to duck</button><button id="restart-level">Start over</button><button id="adventure-full" type="button">⛶ Full Screen</button></div>');
 document.body.classList.add('playing');
 $('maze-shop').onclick=()=>{save();starShop()};$('restart-level').onclick=()=>modal('Start this activity over?',
    '<p>This will restart <strong>only this activity</strong>. Your other activities, stars, friends, and decorations stay saved.</p>'+
    '<p>Your current position and items collected in this activity will be lost.</p>'+
    '<button id="keep-maze" class="primary" type="button">Keep My Progress</button>'+
    '<button id="confirm-restart" type="button">Yes, Start This Activity Over</button>',()=>{
      $('keep-maze').onclick=()=>{closeModal();status('Your activity progress is safe. Keep going!')};
      $('confirm-restart').onclick=()=>{challengeKeys=null;closeModal();startLevel(def.number,true)};
    });$('hint-route').onclick=()=>{if(!settings.hints){status('Your teacher has turned hints off. Stop, look, and try one arrow.');return}const target=r.items.find(i=>!i.collected)||(!r.skill?.done&&r.skill)||r.goal;status(safeHint(r,target));};
 $('adventure-full').onclick=()=>window.arrowLabToggleFullscreen?.();
 const db=$('duck-button');db.onpointerdown=e=>{if(e.pointerType!=='mouse')return;e.preventDefault();db.setPointerCapture(e.pointerId);setDuck(true)};db.onpointerup=db.onpointercancel=db.onlostpointercapture=()=>setDuck(false);db.onkeydown=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();setDuck(true)}};db.onkeyup=()=>setDuck(false);
 draw();clock();requestAnimationFrame(()=>{$('adventure-maze')?.focus({preventScroll:true});fit()});
 }
 // Hints must never direct a student into a bad guy's current OR future
 // patrol square. The generator guarantees a separate reachable safe route.
 function safeHint(run,target){
   const blocked=new Set((run.hazards||[]).flatMap(enemy=>(enemy.path||[]).map(tile)));
   const keys=route(run.grid,run.player,target,blocked);
   if(!keys)return 'No safe shortcut from here. Return toward the rainbow path and avoid the bad guys.';
   if(!keys.length)return 'You are at your next stop.';
   const key=keys[0],direction=key.slice(5).toUpperCase(),[dx,dy]=directions[key];
   const next={x:run.player.x+dx,y:run.player.y+dy};
   return run.barrier&&tile(next)===tile(run.barrier)
     ?'Hold SPACE and press '+direction+' to duck under the bridge.'
     :'Try '+direction+' next.';
 }
 function status(t){report=t;tellGuide(t);if($('adventure-status'))$('adventure-status').textContent=t}
 function setDuck(v){duck=v;$('duck-button')?.setAttribute('aria-pressed',String(v));$('adventure-maze')?.classList.toggle('ducking',v)}
 function draw(){
 if(view!=='maze'||!r)return;const m=$('adventure-maze');if(!m)return;m.style.setProperty('--w',r.w);m.style.setProperty('--h',r.h);let html='';
 for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const p={x,y},id=tile(p),item=r.items.find(i=>tile(i)===id&&!i.collected),enemy=r.hazards.find(e=>tile(e.path[e.index])===id),here=tile(r.player)===id,bridge=r.barrier&&tile(r.barrier)===id,skill=r.skill&&!r.skill.done&&tile(r.skill)===id;
 let art='';if(x===1&&y===1)art='<span class="tile-symbol">⭐</span>';if(tile(r.goal)===id)art='<span class="tile-symbol">🏁</span>';if(item)art=img(itemArt(item.id),itemName(item.id),'tile-art');if(skill){const badge=data.skill_badges.find(b=>b.id===r.skill.type)||data.computer_collectibles.find(g=>g.id==='trackpad');art=img(badge.thumbnail,'Skill stop','tile-art skill-tile')}if(bridge)art+='<span class="low-bridge" title="Hold SPACE to duck">DUCK</span>';if(enemy){
   art+=img(data.enemies.find(e=>e.id===enemy.id).thumbnail,'Moving bad guy: '+data.enemies.find(e=>e.id===enemy.id).name,'tile-art enemy-art'+(enemy.warning?' enemy-about-to-move':''));
  }
  if(here)art+='<span class="player character-player">'+pic(a.selectedPlayerCharacterId)+'</span>';
 html+='<div class="cell '+(r.grid[y][x]?'wall':'road')+''+'" style="--c:'+['#FF2D8D','#FF8A00','#FFD600','#6BCB24','#24A8F2','#A450E0'][(x+y)%6]+'">'+art+'</div>';
 }m.innerHTML=html;m.classList.toggle('ducking',duck);const tasks=r.items.map(i=>({image:itemArt(i.id),name:itemName(i.id),done:i.collected}));
 if(r.skill)tasks.push({image:(data.skill_badges.find(b=>b.id===r.skill.type)||data.computer_collectibles.find(g=>g.id==='trackpad')).thumbnail,name:'Skill stop',done:r.skill.done});
 const pictureSteps=tasks.map(t=>'<span class="quest-picture '+(t.done?'task-done':'')+'">'+img(t.image,t.name)+'<span>'+(t.done?'✓':'Find')+'</span></span>').join('')+'<span class="quest-finish">→ 🏁</span>';
 const nextItem=r.items.find(i=>!i.collected);const nextWords=nextItem?'Find the '+itemName(nextItem.id)+'.':r.skill&&!r.skill.done?'Find the arrow stop. Follow the arrows.':'Go to the checkered flag!';tellGuide(nextWords+' Press an arrow key. Let go. Look.','<div class="guide-keys" aria-label="Up, left, down, right arrow keys"><span>↑</span><span>←</span><span>↓</span><span>→</span></div>'+pictureSteps);
 fit();
 }
 function fit(){
 if(view==='computer'){const scene=$('collection-scene'),box=scene?.parentElement;if(scene&&box){const image=scene.querySelector('.collection-background-size'),ratio=image?.naturalWidth&&image?.naturalHeight?image.naturalWidth/image.naturalHeight:16/9;const width=Math.min(image?.naturalWidth||1672,box.clientWidth,box.clientHeight*ratio);scene.style.setProperty('width',width+'px','important');scene.style.setProperty('height',(width/ratio)+'px','important');}return}
 if(view!=='maze'||!r)return;document.documentElement.style.setProperty('--view-height',(window.visualViewport?.height||innerHeight)+'px');
 const m=$('adventure-maze'),box=document.querySelector('.scenic-board');if(!m||!box)return;const viewport=window.visualViewport?.height||innerHeight;
 const controls=document.querySelector('.maze-controls');const reserve=Math.max(70,(controls?.getBoundingClientRect().height||0)+24);const remaining=Math.max(r.h,viewport-box.getBoundingClientRect().top-reserve-16);const size=Math.max(1,Math.floor(Math.min((box.clientWidth-24)/r.w,(box.clientHeight-24)/r.h,remaining/r.h)));m.style.width=size*r.w+'px';m.style.height=size*r.h+'px';
 }
 function hit(){
  // Collision is a restart of the player's route, not a new maze roll or a loss of earned rewards.
  // Keep the same generated obstacles/collectibles and saved maze state.
  r.player={...r.start};
  r.checkpoint={...r.start};
  r.trail=[[r.start.x,r.start.y]];
  status('A bad guy caught you! Back to the START of this activity. Watch their rhythm and time your next move!');
  save();draw();
 }
 function move(key){
 if(view!=='maze'||!r||r.complete||$('adventure-dialog')?.open)return;const d=directions[key];if(!d)return;const pressed=document.querySelector('[data-direction="'+key+'"]');pressed?.classList.add('on');setTimeout(()=>pressed?.classList.remove('on'),180);
 const p={x:r.player.x+d[0],y:r.player.y+d[1]};if(r.grid[p.y]?.[p.x]!==0){status('A wall. Stop, look, and try another arrow.');return}
 if(r.barrier&&tile(p)===tile(r.barrier)&&!duck){status('Low bridge! Hold SPACE and press your arrow to duck under.');return}
 r.player=p;r.steps++;if(r.hazards.some(e=>tile(e.path[e.index])===tile(p))){hit();return}
 if(r.safe.includes(tile(p))&&r.steps%5===0)r.checkpoint={...p};
 for(const item of r.items)if(!item.collected&&tile(item)===tile(p)){item.collected=true;const bucket=allWorldLabels[item.id]?(a.collectedWorldItems??=[]):a.collectedComputerGearIds;if(!bucket.includes(item.id))bucket.push(item.id);sound();status('You found the '+itemName(item.id)+'!');}
 save();draw();
 if(r.skill&&!r.skill.done&&tile(r.skill)===tile(p)){challenge(r.skill.type);return}
 if(tile(p)===tile(r.goal)){if(r.items.some(i=>!i.collected)||r.skill&&!r.skill.done){status('Collect your equipment and finish the keyboard skill stop, then return to the flag.');return}finish()}
 }
 function clock(){
 clearInterval(interval);if(view!=='maze'||settings.difficulty==='gentle'||r.complete||$('adventure-dialog')?.open)return;
 interval=setInterval(()=>{if(closed||view!=='maze'||document.hidden||$('adventure-dialog')?.open)return;
 for(const e of r.hazards)if(e.path.length>1)e.warning=true;draw();clearTimeout(warning);warning=setTimeout(()=>{if(closed||view!=='maze'||$('adventure-dialog')?.open)return;for(const e of r.hazards){if(e.warning){e.index=(e.index+1)%e.path.length;delete e.warning}}if(r.hazards.some(e=>tile(e.path[e.index])===tile(r.player)))hit();else{save();draw()}},Math.min(800,settings.speed*.4));},settings.speed);
 }
 // Keep the same arrow pattern and correct presses in the existing maze save.
 // Never reroll on Home, reload or returning to this level.
 function ensureSkillArrowSequence(run){
   const valid=Array.isArray(run.skillArrowSequence)&&run.skillArrowSequence.length===4&&run.skillArrowSequence.every(key=>!!directions[key]);
   if(!valid){
     run.skillArrowSequence=arrowPattern(run.seed,run.patternAttempt||0);
     run.patternAttempt=(run.patternAttempt||0)+1;
     run.skillArrowIndex=0;
   }
   run.skillArrowIndex=Math.min(4,Math.max(0,Math.floor(Number(run.skillArrowIndex)||0)));
   return run.skillArrowSequence;
 }
 function challenge(kind){kind='arrows';
 const sequence=ensureSkillArrowSequence(r);let i=r.skillArrowIndex;save();const symbols={ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓',ArrowLeft:'←'};
 const sequenceHtml=i=>sequence.map((k,j)=>'<span class="pattern-arrow '+(j<i?'done':j===i?'current':'')+'" aria-label="'+(j<i?'Done':k.replace('Arrow',''))+'">'+(j<i?'✓':symbols[k])+'</span>').join('');
 const win=()=>{r.skill.done=true;for(const id of def.skillBadgeIds)if(!a.earnedSkillBadgeIds.includes(id))a.earnedSkillBadgeIds.push(id);save();challengeKeys=null;closeModal();status('Skill challenge complete! Head to the flag.');sound();draw()};
 const back='<p id="skill-feedback" role="status"></p><button id="try-later">Back to the maze</button>';
 let body='';
 if(kind==='click')body='<p>Click the big star once.</p><button id="skill-target" class="skill-target">⭐</button>';
 if(kind==='double_click')body='<p>Click the star TWO times quickly: click-click! Take as many tries as you need.</p><button id="skill-target" class="skill-target">⭐</button>';
 if(kind==='typing')body='<p>Type <strong>cat</strong> in the box.</p><input id="skill-type" aria-label="Type cat" autocomplete="off" spellcheck="false"><button id="check-type">Check</button>';
 if(kind==='arrows')body='<p>Use your keyboard to follow these directions. Your progress is saved if you leave and return.</p><div id="skill-sequence" aria-label="Arrow pattern">'+sequenceHtml(i)+'</div>';
 if(kind==='drag_and_drop')body='<p>Click and hold the keyboard. Drag it into the box, then let go.</p><div class="drag-space"><div id="drag-picture" tabindex="0" role="button" aria-label="Drag keyboard. Keyboard alternative: press Enter to pick up, Tab to box, Enter to drop.">'+img(data.computer_collectibles.find(i=>i.id==='keyboard').thumbnail,'Keyboard')+'</div><div id="drag-box" tabindex="0" role="button" aria-label="Keyboard drop box">Drop here</div></div>';
 modal('Computer skill stop',body+back,()=>{
 $('try-later').onclick=()=>{challengeKeys=null;closeModal();save();draw()};
 if(kind==='click')$('skill-target').onclick=win;
 if(kind==='double_click'){let last=null;$('skill-target').onclick=()=>{const now=performance.now();if(last!==null&&now-last<=1300){win();last=null}else{last=now;$('skill-feedback').textContent='One click—click once more!'}};}
 if(kind==='typing'){const check=()=>{if($('skill-type').value.trim().toLowerCase()==='cat')win();else $('skill-feedback').textContent='Look at c a t. Try again!'};$('check-type').onclick=check;$('skill-type').onkeydown=e=>{if(e.key==='Enter')check()};$('skill-type').focus();}
 if(kind==='arrows'){
   if(i>=4){win();return}
   challengeKeys=k=>{
     if(k===sequence[i]){
       i++;r.skillArrowIndex=i;save();
       if(i===4)win();
       else{$('skill-sequence').innerHTML=sequenceHtml(i);$('skill-feedback').textContent='Great! Keep going.'}
     }else $('skill-feedback').textContent='Look at the next arrow. Try it again!';
   };
 }
 if(kind==='drag_and_drop'){
 const source=$('drag-picture'),box=$('drag-box');let held=false,pointer=null,ghost=null;
 const clean=()=>{ghost?.remove();ghost=null;source.classList.remove('picked-up')};
 source.onpointerdown=e=>{if(e.pointerType!=='mouse')return;e.preventDefault();held=true;pointer=e.pointerId;source.setPointerCapture(pointer);source.classList.add('picked-up');ghost=source.querySelector('img').cloneNode();ghost.style.cssText='position:fixed;width:90px;height:90px;object-fit:contain;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)';$('adventure-dialog').append(ghost);ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'};
 source.onpointermove=e=>{if(held&&ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}};
 source.onpointerup=e=>{if(!held||e.pointerId!==pointer)return;held=false;const b=box.getBoundingClientRect(),inside=e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom;clean();if(inside)win();else $('skill-feedback').textContent='Hold, move to the box, then let go. Try again!'};
 source.onpointercancel=()=>{held=false;clean()};
 source.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();held=true;source.classList.add('picked-up');box.focus()}};
 box.onkeydown=e=>{if(held&&(e.key==='Enter'||e.key===' ')){e.preventDefault();clean();win()}};
}
 });
 }
 function finalArrowChallenge(){
  // World finales require ten separate arrow presses before completion or rescue.
  clearClock();
  if(!Array.isArray(r.finalArrowSequence)||r.finalArrowSequence.length!==10){
    const keys=Object.keys(directions),random=new Uint32Array(10);
    crypto.getRandomValues(random);
    r.finalArrowSequence=[];
    for(let i=0;i<10;i++){
      const options=i?keys.filter(key=>key!==r.finalArrowSequence[i-1]):keys;
      r.finalArrowSequence.push(options[random[i]%options.length]);
    }
    r.finalArrowIndex=0;save();
  }
  let at=Math.min(10,Math.max(0,Number(r.finalArrowIndex)||0));
  const symbols={ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓',ArrowLeft:'←'};
  const bg=asset(def.backgroundImage);
  const contents='<p class="final-arrow-instruction">The final challenge! Watch each flashing arrow. Press the matching arrow key 10 times to rescue your friend!</p>'+
   '<div class="final-arrow-scene" style="background-image:url('+bg+')">'+
   '<div class="final-arrow-frost"><div id="final-arrow-count" class="final-arrow-count" aria-live="polite"></div>'+
   '<div id="final-arrow-big" class="final-arrow-big" role="img" aria-label="Follow this arrow"></div>'+
   '<div id="final-arrow-feedback" class="final-arrow-feedback" role="status">Look at the arrow. Press the matching key!</div></div></div>'+
   '<p class="final-arrow-keyboard-note">Use your keyboard arrow keys.</p>';
  modal('Final Arrow Rescue Challenge!',contents,d=>{
    d.classList.add('final-arrow-modal');
    const count=d.querySelector('#final-arrow-count'),big=d.querySelector('#final-arrow-big'),feedback=d.querySelector('#final-arrow-feedback');
    const show=()=>{count.textContent='ARROW '+(at+1)+' / 10';big.textContent=symbols[r.finalArrowSequence[at]];big.setAttribute('aria-label',r.finalArrowSequence[at].slice(5));
      big.classList.remove('flash-arrow');void big.offsetWidth;big.classList.add('flash-arrow')};
    challengeKeys=k=>{
      if(k!==r.finalArrowSequence[at]){feedback.textContent='Not quite! Look again and try the same arrow.';big.classList.remove('flash-arrow');void big.offsetWidth;big.classList.add('flash-arrow');return}
      at++;r.finalArrowIndex=at;save();sound();
      if(at===10){challengeKeys=null;d.classList.remove('final-arrow-modal');d.close();finish();return}
      feedback.textContent='Great! Here is your next arrow.';show();
    };
    show();
  });
 }
 function finish(){

 r.complete=true;if(def.collectibleIds)for(const id of def.computerGearIds||[])if(!a.collectedComputerGearIds.includes(id))a.collectedComputerGearIds.push(id);const stars=completeLevel(a,r,def,config);save();sound();const ready=canRescue(),left=8-worldDoneCount(def.worldIndex);
 modal('Great dragging and dropping!','<p class="reward-stars">+'+stars+' Rainbow Stars ⭐</p><p>You finished activity '+def.number+'!</p><p>'+(ready?companion(pendingWorldRescue(a)).name+' is ready to come home!':left>0?left+' more '+(left===1?'activity':'activities')+' to rescue '+companions[def.worldIndex].name+'.':'Keep earning stars for your worlds!')+'</p><button id="level-next" class="primary big-next">'+('🗺 '+worldThemes[def.worldIndex].name+' Map')+'</button>',()=>{$('level-next').onclick=()=>{closeModal();if(ready)rescue();else afterLevel()}});
 // Optional completed-level replays do not grant extra stars or count as new finishes.
 try{if(stars>0){const old=JSON.parse(localStorage.getItem(key)||'{}');if(old.wallet){old.wallet.total+=5;old.wallet.earned+=5;old.wallet.finished+=1;localStorage.setItem(key,JSON.stringify(old))}}}catch{}
 }
 function afterLevel(){if(def?.worldIndex!=null){openWorld(def.worldIndex);return}map()}
 function rescue(){
 const id=pendingWorldRescue(a);if(!id){map();return}const c=companion(id);view='rescue';
 shell('You rescued '+c.name+'!','<p>You finished all 8 '+worldThemes[companions.indexOf(c)].name+' activities! Choose a world for '+c.name+'.</p><div class="placing-friend">'+companionArt(id)+'</div><div class="adventure-cards land-cards">'+lands.filter(l=>owned(l.id)).map(l=>'<button data-companion-home="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong></button>').join('')+'</div><button id="rescue-background-shop">Buy a World</button>');
 $('rescue-background-shop').onclick=homeMap;
 document.querySelectorAll('[data-companion-home]').forEach(b=>b.onclick=()=>{if(rescueWorld(a,id,b.dataset.companionHome)){save();sound();computer(b.dataset.companionHome,"friends")}});
 }
 function teacher(){
 if(!preview||!isTeacherUnlocked()){onTeacher?.();return}
 const choices=[['sound','Celebration sound'],['reducedMotion','Reduce motion']];
 const content='<p>These settings apply to <strong>every class and student on this browser</strong>. Export settings and import them on other classroom devices to use the same setup.</p><label>Bad guys <select id="set-difficulty"><option value="standard">Moving and stationary</option><option value="gentle">Stationary only</option></select></label><label>Movement pace <select id="set-speed"><option value="1600">Slow</option><option value="2200">Slower</option><option value="3200">Slowest</option></select></label>'+choices.map(([id,label])=>'<label><input id="set-'+id+'" type="checkbox"> '+label+'</label>').join('')+'<label>Power-Up stars <input id="cost-power" type="number" min="1" max="20" value="'+config.progression.upgradeCost.power_up+'"></label><label>Super Power stars <input id="cost-super" type="number" min="1" max="30" value="'+config.progression.upgradeCost.super_power_additional+'"></label><div class="actions"><button id="save-settings" class="primary">Save for all classes</button><button id="export-settings">Export settings</button><label class="settings-import">Import settings<input id="import-settings" type="file" accept="application/json,.json"></label></div><p id="teacher-note" role="status"></p><h3>All 64 levels · teacher preview</h3><p>Every world and level is open here. Preview stars, purchases, and progress never change a student save.</p><div class="teacher-levels">'+worldThemes.map((w,i)=>'<section><h3>'+esc(w.name)+'</h3><div>'+levels.slice(i*8,i*8+8).map(l=>'<button type="button" data-preview-level="'+l.number+'">'+l.worldStage+' · '+esc(l.title)+'</button>').join('')+'</div></section>').join('')+'</div><div class="actions"><button id="close-settings">Preview world map</button><button id="exit-teacher">Lock & exit teacher mode</button></div>';
 modal('Teacher controls · all classes',content,()=>{
 const note=()=>$('teacher-note');
 $('set-difficulty').value=settings.difficulty;$('set-speed').value=settings.speed;
 for(const [k] of choices)$('set-'+k).checked=settings[k];
 const read=()=>({...settings,difficulty:$('set-difficulty').value,speed:Number($('set-speed').value),sound:$('set-sound').checked,reducedMotion:$('set-reducedMotion').checked,costs:{power_up:Math.max(1,Math.min(20,Number($('cost-power').value)||2)),super_power_additional:Math.max(1,Math.min(30,Number($('cost-super').value)||4))}});
 const persist=next=>{localStorage.setItem('drag-drop-adventure-teacher-settings',JSON.stringify(next));settings=next;config.progression.upgradeCost={...settings.costs}};
 $('save-settings').onclick=()=>{try{persist(read());note().textContent='Saved for all classes on this browser.'}catch{note().textContent='Settings could not save. Check browser storage.'}};
 $('export-settings').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,settings:read()},null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='drag-drop-class-settings.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 $('import-settings').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text()),x=data.settings;if(data.version!==1||!x||!['standard','gentle'].includes(x.difficulty)||![1600,2200,3200].includes(x.speed)||typeof x.sound!=='boolean'||typeof x.reducedMotion!=='boolean'||!Number.isFinite(x.costs?.power_up)||x.costs.power_up<1||x.costs.power_up>20||!Number.isFinite(x.costs?.super_power_additional)||x.costs.super_power_additional<1||x.costs.super_power_additional>30)throw Error();persist({...settings,difficulty:x.difficulty,speed:x.speed,sound:x.sound,reducedMotion:x.reducedMotion,costs:{...x.costs}});teacher();$('teacher-note').textContent='Imported for all classes on this browser.'}catch{note().textContent='Use a settings file exported from this game.'}};
 document.querySelectorAll('[data-preview-level]').forEach(b=>b.onclick=()=>{closeModal();startLevel(Number(b.dataset.previewLevel),true)});
 $('close-settings').onclick=()=>{closeModal();map()};$('exit-teacher').onclick=()=>{cleanup();onLogout()};
 });
 }
 function keydown(e){
 if(closed)return;if(e.code==='Space'&&heldSpace&&$('adventure-dialog')?.open){e.preventDefault();return}const target=e.target;if(target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement)return;
 if($('adventure-dialog')?.open){if(challengeKeys&&directions[e.key]){e.preventDefault();if(!e.repeat)challengeKeys(e.key)}return}
 if(view!=='maze')return;
 if(e.code==='Space'&&target.id!=='duck-button'){e.preventDefault();heldSpace=true;setDuck(true);return}
 if(directions[e.key]){e.preventDefault();if(!e.repeat)move(e.key)}
 }
 function keyup(e){if(e.code==='Space'){if(heldSpace)e.preventDefault();heldSpace=false;setDuck(false)}}
 function blur(){heldSpace=false;setDuck(false)}
 const observer='ResizeObserver'in window?new ResizeObserver(()=>requestAnimationFrame(fit)):null;observer?.observe($('app'));
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',blur);window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 if(settings.costs)config.progression.upgradeCost={...settings.costs};
 $('help').onclick=()=>{
  // Do not overwrite an unfinished keyboard challenge or rescue dialog.
  if($('adventure-dialog')?.open)return;
  const t=view==='drag'?ENGINES[activityLevels[def.number-1].engine].instruction:'Each world has eight different drag-and-drop activities. Click and hold a picture, move it, then let go. Finish the eight activities to rescue your friend.';
  modal('How to Play','<p>'+esc(t)+'</p><div class="actions"><button id="help-read-aloud" type="button">🔊 Read aloud</button><button id="help-back" class="primary" type="button">Back to adventure</button></div>',()=>{
    const speech=window.speechSynthesis,read=$('help-read-aloud');
    read.disabled=!(speech&&window.SpeechSynthesisUtterance);
    read.onclick=()=>{if(read.disabled)return;try{speech.cancel();const u=new window.SpeechSynthesisUtterance(t);u.rate=.85;speech.speak(u)}catch{}};
    $('help-back').onclick=()=>{try{speech?.cancel()}catch{}closeModal()};
  });
 };
 if(!a.selectedPlayerCharacterId)selectCharacter();else if(canRescue())continueRescue();else map();
 return {cleanup,teacherSettings:teacher,goShop:()=>{closeModal();starShop()},goStuff:()=>{closeModal();computer()},goHome:()=>{challengeKeys=null;$('adventure-dialog')?.close();if(a.selectedPlayerCharacterId)map();else{cleanup();onLogout()}}};
}
