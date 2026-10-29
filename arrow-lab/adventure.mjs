import {writeVerifiedStudentRecord} from './verified-student-write.mjs?v=verified-save-20261029a';
import {buildArrowLabProgressCsv} from './progress-export.mjs?v=csv-safety-20261028b';
import {isMobileTouchDevice,mobileArrowPadHtml,bindMobileArrows} from './mobile-touch.mjs?v=mobile-touch-20261028a';
const mobileTouch = isMobileTouchDevice();
import {tellGuide,starIcon} from './viewport.mjs?v=mobile-fullwidth-shelf-20261028a';
import {decorations} from '../trackpad-adventure/economy.mjs?v=20261021-class24';
import {arrowLabCharacters,pendingCharacters} from './character-placeholders.mjs?v=approved-portraits-20261028a';
import {WORLD_STOP_POINTS,PUBLISHED_WORLD_LEVEL_MAPS,worldStopModels} from './level-map-model.mjs?v=seven-original-maps-20261028c';
import {isSupportedCollectibleArt,earnedKeys,visibleCollectedKeys,toggleCollectedInWorld,canPlaceDecorationInWorld,moveOwnedDecoration} from './collection-inventory.mjs?v=world-exclusive-decor-20261029a';

import {directions,tile,route,buildLevel,migrateAdventure,upgradeFriend,completeLevel,rescueWorld,rescueReady,pendingWorldRescue,arrowPattern,buyWorld,placeFriend,choosePlayerCharacter,restoreSavedEnemyRoster} from './adventure-core.mjs?v=varied-patterns-20261029';
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
export async function openAdventure({number,storageKey,teacherName,teachers,verifyTeacherCode=()=>false,goPractice,onLogout}){
 const names=['characters','rainbow_lands','levels','game_config','enemies','computer_collectibles','skill_badges'];
 const values=await(dataPromise??=Promise.all(names.map(readJSON)));const data=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
 const worldThemes=[
 {name:'Candy',icon:'🍬',id:'candy',color:'#f66cba',backgroundImage:'/arrow-lab/scenes/candy.jpg?v=candyworld1'},
 {name:'Pirate',icon:'🏴‍☠️',id:'pirate',color:'#d39a54',backgroundImage:'/arrow-lab/scenes/pirate.jpg'},
 {name:'Arctic',icon:'🐧',id:'arctic',color:'#60c4f3',backgroundImage:'/arrow-lab/scenes/arctic.jpg'},
 {name:'Castle',icon:'🏰',id:'castle',color:'#9c7cdd',backgroundImage:'/arrow-lab/scenes/castle.jpg'},
 {name:'Space',icon:'🚀',id:'space',color:'#7659de',backgroundImage:'/arrow-lab/scenes/space.jpg'},
 {name:'Jurassic',icon:'🦕',id:'jurassic',color:'#5fbc74',backgroundImage:'/arrow-lab/scenes/jurassic.jpg'},
 {name:'Ocean',icon:'🐬',id:'ocean',color:'#41bce2',backgroundImage:'/arrow-lab/scenes/ocean.jpg'},
 {name:'Lava',icon:'🌋',id:'lava',color:'#ee7748',backgroundImage:'/arrow-lab/scenes/lava.jpg'}
 ];
 const activityNames=['First Steps','Rainbow Turns','Find the Treasure','Bridge Crossing','Star Path','Friend Quest','Winding Maze','World Finale'];

 const candyObjects=[
 ['lollipop','Lollipop'],['gummy_bear','Gummy Bear'],['cupcake','Cupcake'],['candy_cane','Candy Cane'],
 ['ice_cream','Ice Cream'],['wrapped_candy','Wrapped Candy'],['donut','Donut'],['candy_necklace','Candy Necklace'],
 ['chocolate_bar','Chocolate Bar'],['jellybean_jar','Jellybean Jar'],['star_cookie','Star Cookie'],['gumdrop','Gumdrop'],
 ['marshmallow','Marshmallow'],['cotton_candy','Cotton Candy'],['candy_apple','Candy Apple'],['gingerbread_house','Gingerbread House']
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
 // New maze collectibles must have genuine PNG/JPEG files; never SVG or shape-built art.
 // Previously acquired rewards remain in each student's saved inventory.
 const pickupArtPath=id=>objectArtPaths[id]||data.computer_collectibles.find(o=>o.id===id)?.thumbnail||data.computer_collectibles.find(o=>o.id===id)?.image||'';
 const canSpawnPickup=id=>isSupportedCollectibleArt(pickupArtPath(id));
 // Until the remaining four worlds' original transparent treasure art is
 // available, use two DISTINCT published computer-gear PNGs per maze instead
 // of the previous zero/one objectives. Do not invent missing art URLs.
 const fallbackGearPair=(stageIndex,legacyIds=[])=>{
   const ids=data.computer_collectibles.map(i=>i.id);
   const schedule=[[4,2],[3,1],[2,0],[3,4],[1,2],[1,0],[0,3],[4,1]];
   return [...new Set([...legacyIds.filter(id=>ids.includes(id)),...schedule[stageIndex].map(i=>ids[i])])].slice(0,2);
 };
 const pairFor=(worldIndex,stageIndex)=>{
  if(worldIndex===0)return [candyObjects[(stageIndex*2)%10][0],candyObjects[(stageIndex*2+1)%10][0]];
  const objects=worldIndex===1?pirateObjects:worldIndex===2?arcticObjects:worldIndex===6?oceanObjects:null;
  return objects?[objects[(stageIndex*3)%10][0],objects[(stageIndex*3+4)%10][0]]:undefined;
 };
 // Use the exact seven characters supplied by the teacher as the definitive rescue art.
// The approved 1254×1254 transparent PNGs must be uploaded unchanged to these paths.
const approvedFriendFiles={pirate:'arrow-lab/friends/pirate-parrot.png',arctic:'arrow-lab/friends/arctic-penguin.png',castle:'arrow-lab/friends/royal-dragon.png',space:'arrow-lab/friends/space-alien.png',jurassic:'arrow-lab/friends/explorer-dino.png',ocean:'arrow-lab/friends/ocean-dolphin.png',lava:'arrow-lab/friends/lava-dragon.png'};
const companions=[['Candy Bunny','🐰'],['Pirate Parrot','🦜'],['Arctic Penguin','🐧'],['Royal Dragon','🐉'],['Space Alien','👽'],['Explorer Dino','🦖'],['Ocean Dolphin','🐬'],['Lava Dragon','🐲']].map(([name,icon],i)=>({id:worldThemes[i].id,name,icon,art:i===0?'arrow-lab/friends/candy-bunny.png':approvedFriendFiles[worldThemes[i].id],approvedArtPath:i===0?'arrow-lab/friends/candy-bunny.png':approvedFriendFiles[worldThemes[i].id]}));
 const homeArt=[candyStageBackgrounds[0],pirateStageBackgrounds[0],arcticStageBackgrounds[0],worldThemes[3].backgroundImage,worldThemes[4].backgroundImage,worldThemes[5].backgroundImage,oceanStageBackgrounds[0],worldThemes[7].backgroundImage];
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
 {id:'candy_gingerbread',name:'Gingerbread Cottage',world:'candy',kind:'decor',cost:6,artPath:'arrow-lab/collectibles/candy/gingerbread_house.png'},
 {id:'candy_cottoncandy',name:'Cotton Candy Tree',world:'candy',kind:'decor',cost:4,artPath:'arrow-lab/collectibles/candy/cotton_candy.png'},
 {id:'candy_apple_present',name:'Candy Apple Gift',world:'candy',kind:'gift',cost:3,artPath:'arrow-lab/collectibles/candy/candy_apple.png'},
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
 const fullDecorations=[...decorations.map(d=>({...d,world:'all',kind:'decor'})),...themedGoods,...shopExclusives];
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
   return {...template,id:'lab_'+world.id+'_'+(ai+1),number:wi*8+ai+1,title:world.name+' · '+(stageNames[world.id]?.[ai]||title),
     worldIndex:wi,worldStage:ai+1,backgroundImage:wi===0?candyStageBackgrounds[ai]:wi===1?pirateStageBackgrounds[ai]:wi===2?arcticStageBackgrounds[ai]:wi===6&&ai===0?oceanStageBackgrounds[0]:world.backgroundImage,individualBackdrop:wi===0||wi===1||wi===2||(wi===6&&ai===0),sceneX:(ai%4)*100/3,sceneY:ai<4?0:100,primarySkill:'arrows',collectibleIds:(pairFor(wi,ai)||fallbackGearPair(ai,template.computerGearIds)).filter(canSpawnPickup),
     mazeGrid:{width:Math.max(11,template.mazeGrid.width),height:Math.max(9,template.mazeGrid.height)},computerGearIds:[...template.computerGearIds],
     skillBadgeIds:[...template.skillBadgeIds],enemyIds:[...enemyRosters[wi]]};
 })),config=data.game_config,key=storageKey;
 config.levelCount=levels.length;
 // Existing unreadable saves are never treated as a new student's empty record.
  let stored={},studentSaveUnreadable=false;
  try{
    const raw=localStorage.getItem(key);
    if(raw!==null){
      const parsed=JSON.parse(raw);
      const invalidProfile=!parsed||typeof parsed!=='object'||Array.isArray(parsed)||
        (parsed.adventure!==undefined&&parsed.adventure!==null&&
         (typeof parsed.adventure!=='object'||Array.isArray(parsed.adventure)));
      if(invalidProfile)studentSaveUnreadable=true;
      else stored=parsed;
    }
  }catch{studentSaveUnreadable=true}
 let a=migrateAdventure(stored.adventure,stored.wallet,chars,lands),r=null,def=null,duck=false,heldSpace=false,interval=null,warning=null,closed=false,view='map',pendingFriend=null,challengeKeys=null,report='Look, choose, press and release, check.',saved=true;
 let currentMapWorld=null,inventoryScrollLeft=0;
 let settings;try{settings=JSON.parse(localStorage.getItem('arrow-lab-teacher-settings')||'{}')}catch{settings={}}
 settings={difficulty:'standard',speed:2200,hints:true,sound:false,reducedMotion:false,...settings,touchArrows:false};
 // Every student automatically owns one starter home. Never ask for a home during onboarding.
 // Retain all existing saved purchases and any established main home.
 const starterWorldId='background_candy';
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
 const char=id=>chars.find(c=>c.id===id),land=id=>lands.find(l=>l.id===id),look=id=>char(id).levels.find(l=>l.id===(a.friends[id]?.upgradeStage||'starter'));
 const pic=id=>{const c=char(id);return c?img(look(id).image,c.name,'friend-art'):'<span class="friend-art pending-character-art" role="img" aria-label="'+esc(id)+' saved friend, illustration unavailable"><span class="pending-character-initial">?</span><small class="pending-character-note">SAVED FRIEND</small></span>';};

 const itemName=id=>allWorldLabels[id]||data.computer_collectibles.find(i=>i.id===id)?.name||data.skill_badges.find(i=>i.id===id)?.name||id;
 const itemArt=id=>objectArtPaths[id]||(data.computer_collectibles.find(i=>i.id===id)?.thumbnail||data.computer_collectibles.find(i=>i.id===id)?.image)||(data.skill_badges.find(i=>i.id===id)?.thumbnail||data.skill_badges.find(i=>i.id===id)?.image);
 const currentStage=id=>['Starter','Power-Up','Super Power'][char(id).levels.findIndex(l=>l.id===(a.friends[id]?.upgradeStage||'starter'))];
 // Never silently imply that a student's work was saved when storage is blocked.
 // Do not overwrite unreadable/corrupted old data: keep it untouched and warn.
 function showStorageWarning(){
   let warning=document.getElementById('arrow-lab-storage-warning');
   if(warning)return;
   warning=document.createElement('div');
   warning.id='arrow-lab-storage-warning';
   warning.className='arrow-lab-fullscreen-note';
   warning.setAttribute('role','alert');
   warning.textContent='This browser is NOT saving your adventure. Tell your teacher before continuing so your progress is not lost.';
   document.body.append(warning);
 }
 function syncBannerStars(){
    const value=$('lab-star-value'),slot=$('lab-banner-stars');
    if(!value||!slot)return;
    const stars=Number(a.wallet?.rainbowStars||0);
    value.textContent=Number.isFinite(stars)?String(Math.max(0,Math.floor(stars))):'0';
    slot.classList.remove('hidden');
 }
 function save(){
  syncBannerStars();
  try{
    if(studentSaveUnreadable)throw Error('Original student save unreadable; refuse overwrite');
    if(r?.id){
      if(r.complete)delete a.mazeRuns[r.id];
      else a.mazeRuns[r.id]=r;
      a.activeRun=r;
    }
    const raw=localStorage.getItem(key);
    const old=raw===null?{}:JSON.parse(raw);
    if(!old||typeof old!=='object'||Array.isArray(old))throw Error('Invalid existing student record');
    writeVerifiedStudentRecord(localStorage,key,{...old,adventure:{...a,activeRun:r||a.activeRun||null}});
    saved=true;
    document.getElementById('arrow-lab-storage-warning')?.remove();
  }catch{
    saved=false;
    showStorageWarning();
  }
 }
 // Report the unsafe old record BEFORE a student starts a new activity.
 if(studentSaveUnreadable)showStorageWarning();
 function clearClock(){clearInterval(interval);clearTimeout(warning);interval=null;warning=null;duck=false}
 function cleanup(){closed=true;clearClock();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',pauseHiddenHazards);window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);observer?.disconnect();if($('kaple-guide'))document.body.append($('kaple-guide'));$('adventure-dialog')?.remove();document.body.classList.remove('adventure-mode','lab-collection-active','lab-map-active','lab-world-active');}
 function sound(){if(!settings.sound)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)(),o=ctx.createOscillator(),gain=ctx.createGain();o.frequency.setValueAtTime(660,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(990,ctx.currentTime+.25);gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.4);o.onended=()=>ctx.close()}catch{}}
 function returnToCurrentMap(){
  challengeKeys=null;save();$('adventure-dialog')?.close();
  if(currentMapWorld!==null)openWorld(currentMapWorld);else map();
 }
 function modal(title,body,bind){
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
  d.classList.remove('final-arrow-modal','friend-reveal-dialog');
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
  const back=document.createElement('button');back.type='button';back.className='modal-map';
  back.textContent='← Back to Map';back.onclick=returnToCurrentMap;
  toolbar.append(back,home,fullscreen);
  tellGuide(d.querySelector('.dialog-content p')?.textContent||title,'⭐ → ✓');
  d.oncancel=e=>{e.preventDefault();returnToCurrentMap()};
  if(!d.open)d.showModal();
  d.scrollTop=0;
  bind?.(d);
  back.focus({preventScroll:true});
  return d;
}
 function closeModal(){const guide=$('kaple-guide');if(guide)document.body.append(guide);$('adventure-dialog')?.close();if(view==='maze'){clock();requestAnimationFrame(()=>$('adventure-maze')?.focus({preventScroll:true}))}}
 function celebrate(title,id,after){
 sound();modal(title,'<div class="celebrate '+(settings.reducedMotion?'still':'')+'">🌟 '+(id?pic(id):'🌈')+' 🌟</div><p>You kept trying. Look what you earned!</p><button id="celebrate-next" class="primary">Hooray! →</button>',()=>{$('celebrate-next').onclick=()=>{closeModal();after()}})}
 function shell(title,content){
 $('header-my-stuff').onclick=()=>navigate('computer');
 $('header-teacher').onclick=teacher;
 syncBannerStars();
 clearClock();document.body.classList.remove('playing');document.body.classList.add('adventure-mode');document.body.classList.toggle('lab-map-active',view==='map');document.body.classList.toggle('lab-world-active',view==='world-select');document.body.classList.toggle('lab-collection-active',view==='computer');document.body.classList.toggle('reduce-adventure-motion',settings.reducedMotion);
 $('who').classList.remove('hidden');$('who').textContent='Change student';$('who').onclick=()=>{save();cleanup();onLogout()};
 const ready=!!a.selectedPlayerCharacterId&&!!a.primaryRainbowLandId;
 const nav=ready?(view==='map'?'':'<div class="actions"><button type="button" data-nav="map" class="always-home">🏠 HOME</button><button data-nav="computer" class="lab-my-stuff-entry">🧸 MY STUFF</button></div>'):'<button id="setup-home" type="button" class="always-home">🏠 HOME</button><span class="setup-steps">First time? Choose your character!</span>';
 $('app').innerHTML='<nav class="adventure-nav">'+nav+'</nav><h1 class="adventure-title">'+title+'</h1>'+content+(saved?'':'<p role="alert">Progress could not save on this browser.</p>');
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('setup-home')?.addEventListener('click',()=>{save();cleanup();onLogout()});
 const first=$('app').querySelector(':scope > p');tellGuide(({map:'Play mazes to earn stars. Visit the Star Shop to buy upgrades, worlds, and decorations.',friends:'Choose a character to upgrade.',lands:'Buy a world, or visit one you own.',decor:'Choose something for your world.'}[view]||first?.textContent||title),'⭐ → 🏁');if(first&&view!=='select')first.hidden=true;
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
   ?'<p>Choose one of your available characters. Your worlds and maze progress will stay saved.</p>'
   :'<p>Welcome to Arrow Adventure! Pick your character to start playing. Everyone gets a FREE starter world automatically—no home to choose!</p>';
 shell(changing?'Change Your Character':'Choose Your Character!',instructions+
   (changing?'<button id="cancel-player">← Back</button>':'')+
   '<div class="adventure-cards">'+chars.map(c=>
     '<button type="button" data-hero="'+c.id+'" aria-label="Choose '+esc(c.name)+'">'+
       img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong></button>').join('')+'</div>');
 document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.hero;
   const prior=a.selectedPlayerCharacterId,home=a.friends[prior]?.homeLandId;
   if(changing&&prior&&prior!==id)a.retiredPlayerCharacterIds=[...new Set([...(a.retiredPlayerCharacterIds||[]),prior])];
   choosePlayerCharacter(a,id,starterWorldId);
   if(changing&&home&&owned(home))a.friends[id].homeLandId=home;
   if(!changing)enterWithStarterWorld();
   else{save();map()}
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
 currentMapWorld=null;
  view='map';
  const next=nextLevel(),playerId=a.selectedPlayerCharacterId;
  const nextFriend=companions.find(c=>!a.worldFriends?.[c.id]);
  const friendIndex=nextFriend?companions.indexOf(nextFriend):7,doneForFriend=worldDoneCount(friendIndex);
  const featuredFriend=canRescue()?companion(pendingWorldRescue(a)):nextFriend;
  const progress=canRescue()?companion(pendingWorldRescue(a)).name+' is ready!':nextFriend?(8-doneForFriend)+' more mazes to rescue '+nextFriend.name+'!':'All 8 world friends rescued!';
  // Exact blank platform centers of the user-supplied 2048×682 eight-world art.
  // Coordinates live in the native-ratio image frame (never a stretched CSS background).
  const coords=[[7.5,57],[19.7,45.8],[32.3,59.7],[43.2,45.6],[56.1,60.8],[67.6,45.6],[81.1,60.9],[92.7,45.7]];
  const nodes=worldThemes.map((world,i)=>{
   const count=worldDoneCount(i),open=isWorldUnlocked(i),current=next.worldIndex===i;
   return '<button type="button" class="lab-world-node'+(count===8?' completed':'')+(current?' current':'')+'" data-world-index="'+i+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" '+(open?'aria-disabled="false"':'aria-disabled="true"')+' aria-label="'+world.name+' world, '+count+' of 8 mazes complete, '+(open?'open':'locked')+'">'+
    '<span class="lab-world-pin" aria-hidden="true">'+(count===8?'⭐':open?'▶':'🔒')+'</span><span class="lab-world-name">'+(i+1)+'. '+world.name+'</span><span class="lab-world-count">'+(open?count+' / 8':'LOCKED')+'</span></button>';
  }).join('');
  const rescueAction=canRescue()?'<button id="ready-rescue" class="lab-rescue" type="button">🐾 Rescue Friend!</button>':'';
  const now=worldThemes[next.worldIndex]||worldThemes[7];
  shell('Rainbow World Map',
   '<section class="lab-map-home" aria-label="Interactive eight-world rainbow map">'+
    '<div class="lab-game-hud"><div class="lab-player-compact"><div class="lab-player-figure">'+pic(playerId)+'</div><div class="lab-player-meta"><span class="lab-kicker">MY PLAYER</span><b>'+esc(char(playerId).name)+'</b><small>'+esc(currentStage(playerId))+'</small><button id="change-player" type="button">Change Player ›</button></div></div>'+
    '<div class="lab-friend-compact"><div class="lab-friend-portrait">'+(featuredFriend?companionArt(featuredFriend.id):'<span aria-label="All friends rescued" role="img">🌟</span>')+'</div><div class="lab-friend-details"><span class="lab-kicker">NEXT FRIEND</span><b>'+esc(progress)+'</b><div class="lab-meter" role="progressbar" aria-valuenow="'+doneForFriend+'" aria-valuemin="0" aria-valuemax="8"><i style="width:'+(doneForFriend/8*100)+'%"></i></div>'+rescueAction+'</div></div></div>'+
    '<div class="lab-map-title"><span>🌈 8 magical worlds · 8 mazes each</span><h2>Choose Your World!</h2><p>Follow the rainbow road. Earn stars. Unlock new lands!</p></div>'+
    '<div class="lab-map-art-frame"><div class="lab-map-canvas" role="group" aria-label="Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava">'+
      '<img class="lab-main-map-art" src="'+asset('arrow-lab/assets/arrow-adventure-eight-worlds-user-20261028-hq.jpg?v=20261028-hq98')+'" alt="Eight illustrated worlds linked by rainbow bridges: Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean and Lava" draggable="false" loading="eager" decoding="sync" onerror="if(!this.dataset.retried){this.dataset.retried=\'1\';this.src=this.src.replace(\'-hq.jpg?v=20261028-hq98\',\'.jpg?v=20261028-map-backup\')}else{this.alt=\'Eight-world map image failed to load; choose a world using the world buttons.\';this.closest(\'.lab-map-canvas\').classList.add(\'lab-map-missing\')}">'+
      nodes+'</div></div>'+
    '<button id="continue-adventure" type="button" class="lab-next-play">▶ PLAY NEXT <small>'+esc(now.name)+' · Maze '+next.worldStage+'</small></button>'+
    '<nav class="lab-main-nav" aria-label="Game navigation"><button type="button" data-nav="map">🏠 <span>Home</span></button><button type="button" data-nav="shop">⭐ <span>Star Shop</span></button><button type="button" data-nav="computer" class="lab-my-stuff-entry">🧸 <span>MY STUFF</span></button></nav>'+
    '<details class="lab-overflow"><summary>⚙ More</summary><button type="button" data-nav="computer">🧸 MY STUFF — Make My Scene</button><button type="button" id="endless">Arrow Practice</button><button type="button" id="teacher-settings">Teacher Settings</button></details>'+
   '</section>'
  );
  $('change-player').onclick=()=>selectCharacter(true);
  $('continue-adventure').onclick=playNext;
  $('ready-rescue')?.addEventListener('click',continueRescue);
  $('teacher-settings').onclick=teacher;
  $('endless').onclick=()=>{save();cleanup();goPractice()};
  document.querySelectorAll('[data-world-index]').forEach(b=>b.onclick=()=>{
    const i=Number(b.dataset.worldIndex);
    if(!isWorldUnlocked(i)){
      const previous=worldThemes[i-1],locked=worldThemes[i];
      modal(locked.name+' World is locked',
        '<p>Finish all eight '+esc(previous.name)+' World mazes to unlock '+esc(locked.name)+' World.</p><button id="locked-world-back" type="button" class="primary">Back to World Map</button>',()=>{
          $('locked-world-back').onclick=closeModal;
        });
      return;
    }
    openWorld(i);
  });
 }

 function friendProgress(i){
  const c=companions[i];
  return '<div class="lab-candy-progress friend-progress">'+companionArt(c.id)+'<span>'+esc(c.name)+'<br>'+worldDoneCount(i)+' / 8 COMPLETE</span></div>';
 }
 function introduceFriend(i){
  const c=companions[i];
  if(a.friendIntrosShown?.[c.id]||a.worldFriends?.[c.id])return;
  const prior=a.friendIntrosShown;
  a.friendIntrosShown={...(prior&&typeof prior==='object'&&!Array.isArray(prior)?prior:{}),[c.id]:true};
  save();if(!saved)a.friendIntrosShown=prior;
  const d=modal('Meet '+c.name+'!', '<div class="friend-reveal">'+companionArt(c.id)+'<p>You are working to rescue '+esc(c.name)+'!</p><button id="friend-intro-go" class="primary">Let’s explore!</button></div>',()=>{$('friend-intro-go').onclick=closeModal});
  d.classList.add('friend-reveal-dialog');
 }
 function openCandyWorld(){
   currentMapWorld=0;
   view='world-select';
   const positions=WORLD_STOP_POINTS.map(p=>[p.x,p.y]);
   const points=worldStopModels(0,levels,a).map((p,k)=>{
     const l=p.level,done=p.completed,started=p.started,unlocked=p.unlocked;
     return '<button type="button" data-level="'+l.number+'" class="lab-candy-node'+(done?' done':started?' started':'')+(unlocked?'':' locked')+'" style="--x:'+positions[k][0]+'%;--y:'+positions[k][1]+'%;" aria-disabled="'+(!unlocked)+'"'+
       ' aria-label="Candy maze '+(k+1)+': '+candyNames[k]+(done?', completed':started?', in progress':unlocked?', ready to play':', locked')+'">'+
       '<span class="lab-map-node-number" aria-hidden="true">'+(k+1)+'</span>'+
       '<span class="lab-map-node-indicator" aria-hidden="true">'+(done?'✓':started?'↪':unlocked?'▶':'🔒')+'</span></button>';
   }).join('');
   shell('Candy World',
     '<section class="lab-candy-world" aria-label="Candy World map with eight playable mazes">'+
       '<div class="lab-candy-heading"><button type="button" id="lab-back-map">← ALL WORLDS</button>'+
       '<div><small>WORLD 1 • 8 SWEET MAZES</small><h2>🍬 CANDY WORLD</h2></div>'+
       friendProgress(0)+(canRescue()?'<button class="lab-candy-rescue" id="lab-candy-rescue" type="button">🐾 RESCUE A FRIEND!</button>':'')+'</div>'+
       '<div class="lab-candy-scenery" role="group" aria-label="Eight stops along the Candyland rainbow road">'+'<img class="lab-candy-map-art" src="'+asset('arrow-lab/assets/candy-world-map-original.png')+'" width="2048" height="682" alt="Candy World: eight islands connected by a rainbow road">'+points+'</div>'+
       '<nav class="lab-candy-actions"><button data-nav="map">🏠 HOME</button><button data-nav="shop">⭐ STAR SHOP</button><button data-nav="computer">🧸 MY STUFF</button></nav>'+
     '</section>');
   $('lab-back-map').onclick=map;
   $('lab-candy-rescue')?.addEventListener('click',continueRescue);
   document.querySelectorAll('.lab-candy-node[data-level]').forEach(b=>b.onclick=()=>{
     if(b.getAttribute('aria-disabled')==='true'){
       const number=Number(b.dataset.level);const needed=Math.max(1,number-1);
       modal('Candy maze '+number+' is locked',
         '<p>First finish Candy maze '+needed+'.</p><button id="locked-candy-back" type="button" class="primary">Back to Candy World</button>',()=>{
           $('locked-candy-back').onclick=closeModal;
         });
       return;
     }
     startLevel(Number(b.dataset.level));
   });
  introduceFriend(0);
 }

 function openWorld(i){
  if(!isWorldUnlocked(i))return map();
  currentMapWorld=i;
  if(i===0)return openCandyWorld();
  const world=worldThemes[i];
  view='world-select';
  // Original illustrated 2048×682 map for this world, with measured stop positions.
  // No stretching, cropping, or shared Candy-pad coordinates.
  const picture=PUBLISHED_WORLD_LEVEL_MAPS[world.id];
  const stops=worldStopModels(i,levels,a);
  const points=stops.map(p=>
    '<button type="button" class="lab-candy-node lab-world-stop'+(p.completed?' done':p.started?' started':'')+(p.unlocked?'':' locked')+'"'+
    ' data-level="'+p.level.number+'" style="--x:'+p.position.x+'%;--y:'+p.position.y+'%;" aria-disabled="'+(!p.unlocked)+'"'+
    ' aria-label="'+esc(world.name)+' maze '+p.stage+', '+esc(p.label)+'" title="'+esc(p.level.title)+' — '+esc(p.label)+'">'+
    '<span class="lab-map-node-number" aria-hidden="true">'+p.stage+'</span>'+
    '<span class="lab-map-node-indicator" aria-hidden="true">'+p.symbol+'</span></button>'
  ).join('');
  shell(world.name+' World',
    '<section class="lab-candy-world lab-world-illustrated" aria-label="'+esc(world.name)+' illustrated level selector">'+
    '<div class="lab-candy-heading"><button id="lab-back-map" type="button">← ALL WORLDS</button>'+
    '<div><small>WORLD '+(i+1)+' • EIGHT MAZES</small><h2>'+world.icon+' '+esc(world.name)+' World</h2></div>'+
    friendProgress(i)+
    (canRescue()?'<button class="lab-candy-rescue" id="lab-world-rescue" type="button">🐾 RESCUE FRIEND!</button>':'')+'</div>'+
    '<div class="lab-candy-scenery lab-world-level-scene" role="group" aria-label="Eight numbered maze stops">'+
      '<img class="lab-candy-map-art" src="'+asset(picture)+'" alt="'+esc(world.name)+' illustrated eight-level map" loading="eager" decoding="async" draggable="false">'+points+'</div>'+
    '<div class="lab-world-map-footer">'+
      ''+
      '<nav class="lab-candy-actions" aria-label="World navigation"><button data-nav="map">🏠 HOME</button>'+
       '<button data-nav="shop">⭐ STAR SHOP</button><button data-nav="computer">🧸 MY STUFF</button></nav></div>'+
    '</section>');
  $('lab-back-map').onclick=map;
  $('lab-world-rescue')?.addEventListener('click',continueRescue);
  document.querySelectorAll('.lab-world-stop[data-level]').forEach(b=>b.onclick=()=>{
    const n=Number(b.dataset.level),stage=n-i*8;
    if(b.getAttribute('aria-disabled')==='true'){
      modal(world.name+' maze '+stage+' is locked',
        '<p>Finish '+esc(world.name)+' maze '+Math.max(1,stage-1)+' first.</p>'+
        '<button id="locked-world-maze-back" class="primary" type="button">Back to '+esc(world.name)+' Map</button>',()=>{
           $('locked-world-maze-back').onclick=closeModal;
        });
      return;
    }
    startLevel(n);
  });
  introduceFriend(i);
 }

 function stuff(){map()}
 function owned(id){return a.ownedWorldIds.includes(id)}

 // Never report a successful purchase when browser storage rejected it.
 // Restore in-memory stars and ownership, leaving save()'s warning visible.
 function commitPurchase(change,undo){
  change();
  save();
  if(saved)return true;
  undo();
  syncBannerStars();
  return false;
 }
 // Restore a student's MY STUFF state whenever storage refuses a write.
 function commitSceneMutation(change,fields){
  const before=fields.map(field=>[field,Object.prototype.hasOwnProperty.call(a,field),
   a[field]===undefined?undefined:JSON.parse(JSON.stringify(a[field]))]);
  if(change()===false)return false;
  save();
  if(saved)return true;
  for(const [field,existed,value] of before){
   if(existed)a[field]=value;
   else delete a[field];
  }
  return false;
 }
 function buyHome(id){
  const world=land(id);if(!world)return false;
  const wasOwned=owned(id),cost=worldCosts[lands.indexOf(world)];
  if(!wasOwned&&a.wallet.rainbowStars<cost)return false;
  const previousStars=a.wallet.rainbowStars;
  const previousOwned=[...a.ownedWorldIds];
  const previousHome=a.primaryRainbowLandId;
  return commitPurchase(()=>{
   if(!wasOwned){a.wallet.rainbowStars-=cost;a.ownedWorldIds.push(id)}
   a.primaryRainbowLandId=id;
  },()=>{
   a.wallet.rainbowStars=previousStars;
   a.ownedWorldIds=previousOwned;
   a.primaryRainbowLandId=previousHome;
  });
 }
 function shopArt(d){return d.artPath?img(d.artPath,d.name,'shop-decoration'):d.art?img('trackpad-adventure/decorations/'+d.art+'.webp',d.name,'shop-decoration'):'<span class="shop-emoji">'+(d.emoji||'⭐')+'</span>'}
 function buyShopExclusive(worldId,itemId){
   const item=shopExclusives.find(x=>x.id===itemId&&x.world===backgroundHomes.find(w=>w.id===worldId)?.theme);
   if(!item||!owned(worldId)||Object.values(a.decorations||{}).some(list=>list.includes(itemId))||a.wallet.rainbowStars<item.cost)return false;
   const previousStars=a.wallet.rainbowStars;
   const previousDecorations=Array.isArray(a.decorations[worldId])?[...a.decorations[worldId]]:null;
   const previousHidden=Array.isArray(a.hiddenDecorations?.[worldId])?[...a.hiddenDecorations[worldId]]:null;
   return commitPurchase(()=>{
    a.wallet.rainbowStars-=item.cost;
    (a.decorations[worldId]??=[]).push(itemId);
    if(a.hiddenDecorations?.[worldId])a.hiddenDecorations[worldId]=a.hiddenDecorations[worldId].filter(x=>x!==itemId);
   },()=>{
    a.wallet.rainbowStars=previousStars;
    if(previousDecorations)a.decorations[worldId]=previousDecorations;
    else delete a.decorations[worldId];
    if(previousHidden)a.hiddenDecorations[worldId]=previousHidden;
   });
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
  shell('My Rescued Friends','<p>Finish all 8 mazes in a world to rescue its friend.</p>'+
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
  document.querySelectorAll('[data-move-to]').forEach(b=>b.onclick=()=>{
   const destination=b.dataset.moveTo;
   if(!owned(destination)||!a.worldFriends?.[id])return;
   const previousWorld=a.worldFriends[id].homeLandId;
   if(!commitPurchase(()=>{a.worldFriends[id].homeLandId=destination;},
     ()=>{a.worldFriends[id].homeLandId=previousWorld;}))return;
   computer(destination,'friends');
  });
 }

 function decorShop(){
  view='decor';
  if(!owned(a.primaryRainbowLandId))a.primaryRainbowLandId=a.ownedWorldIds.find(id=>land(id))||'background_candy';
  const id=a.primaryRainbowLandId,world=land(id),theme=backgroundHomes.find(x=>x.id===id)?.theme||'all';
  const goods=fullDecorations.filter(d=>d.kind==='decor'&&(d.world==='all'||d.world===theme));
  shell('Decorate My World','<p>Buy special decorations you cannot collect in mazes. Then arrange them in MY STUFF using your trackpad.</p>'+
   '<div class="world-tabs">'+lands.filter(l=>owned(l.id)).map(l=>'<button data-decor-world="'+l.id+'" aria-pressed="'+(l.id===id)+'">'+esc(l.name)+'</button>').join('')+'</div>'+
   '<h2>For '+esc(world.name)+'</h2><p>⭐ '+a.wallet.rainbowStars+' stars</p>'+
   '<div class="world-hub-actions"><button id="shop-home">🏡 Visit My World</button><button id="decor-change">🌍 Change World</button><button id="decor-gifts">🎁 Friend Gifts</button></div>'+
   '<div class="adventure-cards decoration-cards">'+goods.map(d=>{
     const has=(a.decorations[id]||[]).includes(d.id),ownedAnywhere=d.shopOnly&&Object.values(a.decorations||{}).some(list=>list.includes(d.id));
     return '<article>'+shopArt(d)+'<strong>'+esc(d.name)+'</strong>'+(d.shopOnly?'<span class="shop-only-label">⭐ SHOP ONLY · NOT IN MAZES</span>':'')+'<span>'+(has?'✓ Purchased':ownedAnywhere?'✓ Owned in MY STUFF':'⭐ '+d.cost)+'</span>'+
      '<button data-buy-decor="'+d.id+'" '+(has||ownedAnywhere||a.wallet.rainbowStars<d.cost?'disabled':'')+'>'+(has?'Already in world':ownedAnywhere?'Move from MY STUFF':'Buy Decoration')+'</button></article>';
   }).join('')+'</div>');
  $('shop-home').onclick=()=>computer(id,'decor');$('decor-change').onclick=myWorlds;$('decor-gifts').onclick=()=>friendGiftShop();
  document.querySelectorAll('[data-decor-world]').forEach(b=>b.onclick=()=>{a.primaryRainbowLandId=b.dataset.decorWorld;save();decorShop()});
  document.querySelectorAll('[data-buy-decor]').forEach(b=>b.onclick=()=>{
   const d=goods.find(x=>x.id===b.dataset.buyDecor);
   if(!d||!owned(id)||a.wallet.rainbowStars<d.cost||(a.decorations[id]||[]).includes(d.id))return;
   if(d.shopOnly){if(!buyShopExclusive(id,d.id))return;}
   else{
    const previousStars=a.wallet.rainbowStars;
    const previousDecorations=Array.isArray(a.decorations[id])?[...a.decorations[id]]:null;
    if(!commitPurchase(()=>{
      a.wallet.rainbowStars-=d.cost;
      (a.decorations[id]??=[]).push(d.id);
    },()=>{
      a.wallet.rainbowStars=previousStars;
      if(previousDecorations)a.decorations[id]=previousDecorations;
      else delete a.decorations[id];
    }))return;
   }
   decorShop();
  });
 }
 function friendGiftShop(selectedId=null){
  view='gifts';const rescued=companions.filter(c=>a.worldFriends?.[c.id]);
  if(!rescued.length){
   shell('Friend Gifts','<p>Rescue your first friend by completing all 8 mazes in a play world. Then you can buy them gifts!</p><button id="see-friends">🐾 All Friends</button>');
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
   const alreadyOwned=!!a.friendGifts[chosen.id]?.includes(d.id);
   if(!alreadyOwned&&a.wallet.rainbowStars<d.cost)return;
   const previousStars=a.wallet.rainbowStars;
   const previousGifts=Array.isArray(a.friendGifts[chosen.id])?[...a.friendGifts[chosen.id]]:null;
   const previousEquipped=a.friendGiftEquipped[chosen.id];
   if(!commitPurchase(()=>{
     if(!alreadyOwned){
       a.wallet.rainbowStars-=d.cost;
       (a.friendGifts[chosen.id]??=[]).push(d.id);
     }
     a.friendGiftEquipped[chosen.id]=d.id;
   },()=>{
     a.wallet.rainbowStars=previousStars;
     if(previousGifts)a.friendGifts[chosen.id]=previousGifts;
     else delete a.friendGifts[chosen.id];
     if(previousEquipped===undefined)delete a.friendGiftEquipped[chosen.id];
     else a.friendGiftEquipped[chosen.id]=previousEquipped;
   }))return;
   friendGiftShop(chosen.id);
  });
 }
 function homeMap(){
  view='lands';shell('World Shop','<p>Buy a whole world to visit, arrange, decorate, and share with rescued friends. Maze worlds unlock through play, not spending stars.</p>'+
   '<div class="world-hub-actions"><button id="shop-owned-worlds">🧸 MY STUFF</button><strong>⭐ '+a.wallet.rainbowStars+'</strong></div>'+
   '<div class="adventure-cards land-cards">'+backgroundHomes.map(w=>{
     const has=owned(w.id),price=worldCosts[lands.indexOf(w)];
     return '<article>'+img…10574 tokens truncated… class="skill-target">⭐</button>';
 if(kind==='double_click')body='<p>Click the star TWO times quickly: click-click! Take as many tries as you need.</p><button id="skill-target" class="skill-target">⭐</button>';
 if(kind==='typing')body='<p>Type <strong>cat</strong> in the box.</p><input id="skill-type" aria-label="Type cat" autocomplete="off" spellcheck="false"><button id="check-type">Check</button>';
 if(kind==='arrows')body='<p>'+(mobileTouch?'Tap the matching arrow to follow the pattern.':'Use your keyboard to follow these directions.')+' Your progress is saved if you leave and return.</p><div id="skill-sequence" aria-label="Arrow pattern">'+sequenceHtml(i)+'</div>'+(mobileTouch?mobileArrowPadHtml('Tap the matching pattern arrow'):'');
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
   if(mobileTouch)bindMobileArrows($('adventure-dialog'),challengeKeys);
 }
 if(kind==='drag_and_drop'){
 const source=$('drag-picture'),box=$('drag-box');let held=false,pointer=null,ghost=null;
 const clean=()=>{ghost?.remove();ghost=null;source.classList.remove('picked-up')};
 source.onpointerdown=e=>{if(e.pointerType!=='mouse'&&!(mobileTouch&&e.pointerType==='touch'))return;e.preventDefault();held=true;pointer=e.pointerId;source.setPointerCapture(pointer);source.classList.add('picked-up');ghost=source.querySelector('img').cloneNode();ghost.style.cssText='position:fixed;width:90px;height:90px;object-fit:contain;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)';$('adventure-dialog').append(ghost);ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'};
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
   '<p class="final-arrow-keyboard-note">'+(mobileTouch?'Tap the matching arrow below.':'Use your keyboard arrow keys.')+'</p>'+(mobileTouch?mobileArrowPadHtml('Tap the matching rescue arrow'):'');
  modal('Final Arrow Rescue Challenge!',contents,d=>{
    d.classList.add('final-arrow-modal');
    const count=d.querySelector('#final-arrow-count'),big=d.querySelector('#final-arrow-big'),feedback=d.querySelector('#final-arrow-feedback');
    const show=()=>{count.textContent='ARROW '+(at+1)+' / 10';big.textContent=symbols[r.finalArrowSequence[at]];big.setAttribute('aria-label',r.finalArrowSequence[at].slice(5));
      big.classList.remove('flash-arrow');void big.offsetWidth;big.classList.add('flash-arrow')};
    challengeKeys=k=>{
      if(k!==r.finalArrowSequence[at]){feedback.textContent='Not quite! Look again and try the same arrow.';big.classList.remove('flash-arrow');void big.offsetWidth;big.classList.add('flash-arrow');return}
      at++;r.finalArrowIndex=at;save();sound();
      if(at===10){challengeKeys=null;d.classList.remove('final-arrow-modal','friend-reveal-dialog');d.close();finish();return}
      feedback.textContent='Great! Here is your next arrow.';show();
    };
    if(mobileTouch)bindMobileArrows(d,challengeKeys);
    show();
  });
 }
 function finish(){
 if(def.worldStage===8&&(r.finalArrowIndex||0)<10){finalArrowChallenge();return}
 // Commit the completion before celebrating. If Chromebook storage refuses the
 // write, restore every in-memory reward/unlock and the unfinished maze run.
 // The saved tenth arrow remains intact so the student can retry without replay.
 const beforeAdventure=JSON.parse(JSON.stringify(a));
 const beforeRun=JSON.parse(JSON.stringify(r));
 r.complete=true;
 // Physical pickups already grant ownership; no extra completion objects.
 const stars=completeLevel(a,r,def,config);
 save();
 if(!saved){
   a=beforeAdventure;
   r=beforeRun;
   syncBannerStars();
   modal('Your finish is NOT saved yet',
     '<p>Your Chromebook could not save this maze completion. No stars or rescues have been awarded. Please tell your teacher and try again.</p><button id="retry-finish-save" type="button" class="primary">Try saving again</button>',
     ()=>{$('retry-finish-save').onclick=()=>{closeModal();finish()}});
   return;
 }
 sound();const ready=canRescue(),left=8-worldDoneCount(def.worldIndex);
 modal(ready?'YOU DID IT!':'You reached the flag!',(ready?'<div class="friend-reveal rescue-celebration">'+companionArt(pendingWorldRescue(a))+'</div>':'')+'<p class="reward-stars">+'+stars+' Rainbow Stars ⭐</p><p>You finished maze '+def.number+'!</p><p>'+(ready?companion(pendingWorldRescue(a)).name+' is ready to come home!':left>0?left+' more '+(left===1?'maze':'mazes')+' to rescue '+companions[def.worldIndex].name+'.':'Keep earning stars for your worlds!')+'</p><button id="level-next" class="primary big-next">'+('🗺 '+worldThemes[def.worldIndex].name+' Map')+'</button>',()=>{$('level-next').onclick=()=>{closeModal();if(ready)rescue();else afterLevel()}});
 // Optional completed-level replays do not grant extra stars or count as new finishes.
 // Keep the legacy wallet in sync for returning students. This is a SECOND
 // storage write after the adventure save, so a failure must never be silent.
 // Do not replace a malformed old record or pretend its bonus was saved.
 // Only update the practice wallet if the adventure write was verified.
 // A rejected adventure save must never trigger a second write to the same
 // student record. Verify this write too: managed storage may silently ignore it.
 if(stars>0&&saved){
   try{
     const raw=localStorage.getItem(key);
     const old=raw===null?null:JSON.parse(raw);
     if(!old||typeof old!=='object'||Array.isArray(old))throw Error('Invalid student record');
     if(old.wallet){
       if(typeof old.wallet!=='object'||Array.isArray(old.wallet))throw Error('Invalid legacy wallet');
       const wallet={...old.wallet,
         total:(Number(old.wallet.total)||0)+5,
         earned:(Number(old.wallet.earned)||0)+5,
         finished:(Number(old.wallet.finished)||0)+1};
       writeVerifiedStudentRecord(localStorage,key,{...old,wallet});
     }
   }catch{
     saved=false;
     showStorageWarning();
   }
 }
 }
 function afterLevel(){if(def?.worldIndex!=null){openWorld(def.worldIndex);return}map()}
 // A rescued friend is not placed until the student's saved record confirms it.
 // If Chromebook storage refuses the write, leave the rescue available to retry.
 function commitRescueHome(id,home){
  const previousFriends=a.worldFriends?{...a.worldFriends}:null;
  const previousPending=a.pendingRescueFriendId;
  if(!rescueWorld(a,id,home))return false;
  save();
  if(saved)return true;
  if(previousFriends)a.worldFriends=previousFriends;
  else delete a.worldFriends;
  a.pendingRescueFriendId=previousPending;
  return false;
 }
 function rescue(){
 const id=pendingWorldRescue(a);if(!id){map();return}const c=companion(id);view='rescue';
 shell('You rescued '+c.name+'!','<p>You finished all 8 '+worldThemes[companions.indexOf(c)].name+' mazes! Choose a world for '+c.name+'.</p><div class="placing-friend">'+companionArt(id)+'</div><div class="adventure-cards land-cards">'+lands.filter(l=>owned(l.id)).map(l=>'<button data-companion-home="'+l.id+'">'+img(l.cardPreview,l.name)+'<strong>'+esc(l.name)+'</strong></button>').join('')+'</div><button id="rescue-background-shop">Buy a World</button>');
 $('rescue-background-shop').onclick=homeMap;
 document.querySelectorAll('[data-companion-home]').forEach(b=>b.onclick=()=>{if(commitRescueHome(id,b.dataset.companionHome)){sound();computer(b.dataset.companionHome,"friends")}});
 }
 function teacher(){
 const content='<p>Settings apply on this browser. Skipping opens a level but does not award badges, stars, or friends.</p><label>Challenge <select id="set-difficulty"><option value="standard">Standard · moving bad guys</option><option value="gentle">Gentle · stationary bad guys</option></select></label><label>Obstacle pace <select id="set-speed"><option value="1600">Slow</option><option value="2200">Slower</option><option value="3200">Slowest</option></select></label>'+[['hints','Show hints'],['sound','Celebration sound'],['reducedMotion','Reduce motion']].map(([id,label])=>'<label><input id="set-'+id+'" type="checkbox"> '+label+'</label>').join('')+'<label>Power-Up stars <input id="cost-power" type="number" min="1" max="20" value="'+config.progression.upgradeCost.power_up+'"></label><label>Super Power stars <input id="cost-super" type="number" min="1" max="30" value="'+config.progression.upgradeCost.super_power_additional+'"></label><label for="teacher-skip-code">Teacher code (required for settings, skip, and export) <input id="teacher-skip-code" type="password" inputmode="numeric" autocomplete="off"></label><p id="teacher-skip-feedback" role="status" aria-live="polite"></p><button id="save-settings" class="primary">Save settings</button><button id="skip-level">Open next level · no rewards</button><button id="export-progress">Download progress CSV</button><button id="close-settings">Back</button>';
 modal('Teacher settings',content,()=>{$('set-difficulty').value=settings.difficulty;$('set-speed').value=settings.speed;for(const k of ['hints','sound','reducedMotion'])$('set-'+k).checked=settings[k];
 const requireTeacherCode=()=>{
   if(verifyTeacherCode($('teacher-skip-code')?.value))return true;
   $('teacher-skip-feedback').textContent='Enter the teacher code to use teacher tools.';
   $('teacher-skip-code')?.focus();
   return false;
 };
 $('save-settings').onclick=()=>{if(!requireTeacherCode())return;settings.difficulty=$('set-difficulty').value;settings.speed=Number($('set-speed').value);for(const k of ['hints','sound','reducedMotion'])settings[k]=$('set-'+k).checked;settings.touchArrows=false;settings.costs={power_up:Math.max(1,Math.min(20,Number($('cost-power').value)||2)),super_power_additional:Math.max(1,Math.min(30,Number($('cost-super').value)||4))};config.progression.upgradeCost={...settings.costs};try{localStorage.setItem('arrow-lab-teacher-settings',JSON.stringify(settings))}catch{}save();closeModal();if(view==='maze')startLevel(def.number,false);else map()};
 if(a.highestUnlockedLevel>=levels.length){
   const skipButton=$('skip-level');
   skipButton.disabled=true;
   skipButton.textContent='All 64 mazes are already open';
 }
 $('skip-level').onclick=()=>{
   // Students can open settings, but only a teacher-confirmed action may unlock a maze.
   if(!requireTeacherCode())return;
   // Unlock the next maze without completing the skipped maze, awarding stars,
   // or deleting the student's unfinished saved run.
   const next=Math.min(levels.length,a.highestUnlockedLevel+1);
   if(next===a.highestUnlockedLevel){
     $('skip-level').textContent='All 64 mazes are already open';
     $('skip-level').disabled=true;
     return;
   }
   // Never enter a newly unlocked maze until its unlock is durably saved.
   // A blocked/full Chromebook storage write must leave the previous unlock
   // intact, the teacher dialog open, and the student's unfinished run safe.
   const previousUnlock=a.highestUnlockedLevel;
   a.highestUnlockedLevel=next;
   save();
   if(!saved){
     a.highestUnlockedLevel=previousUnlock;
     $('teacher-skip-feedback').textContent='The new level was NOT saved. Tell your teacher and try again after storage is fixed.';
     return;
   }
   closeModal();
   startLevel(next);
 };
 $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{
 if(!requireTeacherCode())return;
 try{
  const csv=buildArrowLabProgressCsv(teachers,localStorage);
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),link=document.createElement('a');
  link.href=url;link.download='arrow-adventure-progress.csv';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch{
  const button=$('export-progress');
  if(button)button.textContent='Progress export unavailable — check browser storage';
 }
};
 });
 }
 function keydown(e){
 if(closed)return;if(e.code==='Space'&&heldSpace&&$('adventure-dialog')?.open){e.preventDefault();return}const target=e.target;if(target instanceof HTMLInputElement||target instanceof HTMLSelectElement||target instanceof HTMLTextAreaElement)return;
 if($('adventure-dialog')?.open){/* Native Enter activates the focused popup button; never hijack it to leave the maze. */if(challengeKeys&&directions[e.key]){e.preventDefault();if(!e.repeat)challengeKeys(e.key)}return}
 if(view!=='maze')return;
 if(e.code==='Space'&&target.id!=='duck-button'){e.preventDefault();heldSpace=true;setDuck(true);return}
 if(directions[e.key]){e.preventDefault();if(!e.repeat)move(e.key)}
 }
 function keyup(e){if(e.code==='Space'){if(heldSpace)e.preventDefault();heldSpace=false;setDuck(false)}}
 // Switching away from a Chromebook tab must not let a queued enemy step
 // resolve invisibly. Resume on the next normal, visibly warned patrol tick.
 function pauseHiddenHazards(){
   if(!document.hidden||!r?.hazards)return;
   clearTimeout(warning);warning=null;
   for(const enemy of r.hazards)delete enemy.warning;
 }
 function blur(){heldSpace=false;setDuck(false);pauseHiddenHazards()}
 const observer='ResizeObserver'in window?new ResizeObserver(()=>requestAnimationFrame(fit)):null;observer?.observe($('app'));
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',pauseHiddenHazards);window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
 if(settings.costs)config.progression.upgradeCost={...settings.costs};
 $('help').onclick=()=>{
  // Do not overwrite an unfinished keyboard challenge or rescue dialog.
  if($('adventure-dialog')?.open)return;
  const t=mobileTouch?'Start at the star. Tap an arrow on your screen to move one space. Collect your computer equipment and tap the matching arrows at skill stops. Tap DUCK before moving under a striped bridge. Finish at the checkered flag.':'Start at the star. Use your keyboard arrows. Press and release to move one space. Collect your computer equipment. Follow the arrows at each arrow stop. Hold the space bar to duck under a striped bridge. Finish at the checkered flag.';
  modal('How to Play','<p>'+esc(t)+'</p><div class="actions"><button id="help-read-aloud" type="button">🔊 Read aloud</button><button id="help-back" class="primary" type="button">Back to adventure</button></div>',()=>{
    const speech=window.speechSynthesis,read=$('help-read-aloud');
    read.disabled=!(speech&&window.SpeechSynthesisUtterance);
    read.onclick=()=>{if(read.disabled)return;try{speech.cancel();const u=new window.SpeechSynthesisUtterance(t);u.rate=.85;speech.speak(u)}catch{}};
    $('help-back').onclick=()=>{try{speech?.cancel()}catch{}closeModal()};
  });
 };
 if(!a.selectedPlayerCharacterId)selectCharacter();else if(canRescue())continueRescue();else map();
 return {cleanup,goHome:()=>{challengeKeys=null;$('adventure-dialog')?.close();if(a.selectedPlayerCharacterId)map();else{cleanup();onLogout()}}};
}

