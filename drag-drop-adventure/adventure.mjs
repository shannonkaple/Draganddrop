import {mountDragActivity} from './drag-activity.mjs?v=20261028-blockers';
import {tellGuide,starIcon} from './viewport.mjs?v=20261028-blockers';
import {decorations} from '../trackpad-adventure/economy.mjs?v=20261021-class24';
import {arrowLabCharacters} from '../arrow-lab/character-placeholders.mjs?v=approved-friends-luna-20261028a';

import {directions,tile,route,buildLevel,migrateAdventure,upgradeFriend,completeLevel,rescueWorld,rescueReady,pendingWorldRescue,arrowPattern,buyWorld,placeFriend,choosePlayerCharacter,restoreSavedEnemyRoster} from '../arrow-lab/adventure-core.mjs?v=preserve-unlocks-20261028b';
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
export async function openAdventure({number,storageKey,teacherName,teachers,goPractice,onLogout}){
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
 const activityNames=['First Steps','Rainbow Turns','Find the Treasure','Bridge Crossing','Star Path','Friend Quest','Winding Activity','World Finale'];

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
 // Until the remaining four worlds' original transparent treasure art is
 // available, use two DISTINCT published computer-gear PNGs per maze instead
 // of the previous zero/one objectives. Do not invent missing art URLs.
 const fallbackGearPair=(stageIndex,legacyIds=[])=>{
   const ids=data.computer_collectibles.map(i=>i.id);
   const schedule=[[4,2],[3,1],[2,0],[3,4],[1,2],[1,0],[0,3],[4,1]];
   return [...new Set([...legacyIds.filter(id=>ids.includes(id)),...schedule[stageIndex].map(i=>ids[i])])].slice(0,2);
 };
 const pairFor=(worldIndex,stageIndex)=>{
  if(worldIndex===0)return candyObjects.slice(stageIndex*2,stageIndex*2+2).map(x=>x[0]);
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
     worldIndex:wi,worldStage:ai+1,backgroundImage:wi===0?candyStageBackgrounds[ai]:wi===1?pirateStageBackgrounds[ai]:wi===2?arcticStageBackgrounds[ai]:wi===6&&ai===0?oceanStageBackgrounds[0]:world.backgroundImage,individualBackdrop:wi===0||wi===1||wi===2||(wi===6&&ai===0),sceneX:(ai%4)*100/3,sceneY:ai<4?0:100,primarySkill:'drag',collectibleIds:pairFor(wi,ai)||fallbackGearPair(ai,template.computerGearIds),
     mazeGrid:{width:Math.max(11,template.mazeGrid.width),height:Math.max(9,template.mazeGrid.height)},computerGearIds:[...template.computerGearIds],
     skillBadgeIds:[...template.skillBadgeIds],enemyIds:[...enemyRosters[wi]]};
 })),config=data.game_config,key=storageKey;
 config.levelCount=levels.length;
 let stored;try{stored=JSON.parse(localStorage.getItem(key)||'{}')}catch{stored={}}
 let a=migrateAdventure(stored.adventure,stored.wallet,chars,lands),r=null,def=null,duck=false,heldSpace=false,interval=null,warning=null,closed=false,view='map',pendingFriend=null,challengeKeys=null,report='Look, choose, press and release, check.',saved=true;
 let dragSession=null;
 let settings;try{settings=JSON.parse(localStorage.getItem('drag-drop-adventure-teacher-settings')||'{}')}catch{settings={}}
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
 function save(){
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
 function cleanup(){dragSession?.destroy();dragSession=null;closed=true;clearClock();document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);observer?.disconnect();if($('kaple-guide'))document.body.append($('kaple-guide'));$('adventure-dialog')?.remove();document.body.classList.remove('adventure-mode','lab-collection-active','lab-map-active');}
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
 clearClock();document.body.classList.remove('playing');document.body.classList.add('adventure-mode');document.body.classList.toggle('lab-map-active',view==='map');document.body.classList.toggle('lab-collection-active',view==='computer');document.body.classList.toggle('reduce-adventure-motion',settings.reducedMotion);
 $('who').classList.remove('hidden');$('who').textContent='Change student';$('who').onclick=()=>{save();cleanup();onLogout()};
 const ready=!!a.selectedPlayerCharacterId&&!!a.primaryRainbowLandId;
 const nav=ready?(view==='map'?'':'<div class="actions"><button type="button" data-nav="map" class="always-home">🏠 HOME</button><button data-nav="computer" class="lab-my-stuff-entry">🧸 MY STUFF</button></div>'):'<button id="setup-home" type="button" class="always-home">🏠 HOME</button><span class="setup-steps">First time? Choose your character!</span>';
 $('app').innerHTML='<nav class="adventure-nav"><strong>'+esc(teacherName)+' · #'+number+' <span class="star-wallet">⭐ '+a.wallet.rainbowStars+'</span></strong>'+nav+'</nav><h1 class="adventure-title">'+title+'</h1>'+content+(saved?'':'<p role="alert">Progress could not save on this browser.</p>');
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
   ?'<p>Choose one of your available characters. Your worlds and activity progress will stay saved.</p>'
   :'<p>Welcome to Drag & Drop Adventure! Pick your character to start playing. Everyone gets a FREE starter world automatically—no home to choose!</p>';
 shell(changing?'Change Your Character':'Choose Your Character!',instructions+
   (changing?'<button id="cancel-player">← Back</button>':'')+
   '<div class="adventure-cards">'+chars.map(c=>
     '<button type="button" data-hero="'+c.id+'" aria-label="Choose '+esc(c.name)+'">'+
       img(c.levels[0].image,c.name)+'<strong>'+esc(c.name)+'</strong></button>').join('')+'</div>');
 document.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.hero;
   choosePlayerCharacter(a,id,starterWorldId);
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
  view='map';
  const next=nextLevel(),playerId=a.selectedPlayerCharacterId;
  const nextFriend=companions.find(c=>!a.worldFriends?.[c.id]);
  const friendIndex=nextFriend?companions.indexOf(nextFriend):7,doneForFriend=worldDoneCount(friendIndex);
  const progress=canRescue()?companion(pendingWorldRescue(a)).name+' is ready!':nextFriend?(8-doneForFriend)+' more activities to rescue '+nextFriend.name+'!':'All 8 world friends rescued!';
  const coords=[[8.0,60],[20.5,47],[34.1,72],[44.2,46],[56.7,70],[68.5,45],[80.3,64],[91.5,45]];
  const nodes=worldThemes.map((world,i)=>{
   const count=worldDoneCount(i),open=isWorldUnlocked(i),current=next.worldIndex===i;
   return '<button type="button" class="lab-world-node'+(count===8?' completed':'')+(current?' current':'')+'" data-world-index="'+i+'" style="left:'+coords[i][0]+'%;top:'+coords[i][1]+'%" '+(open?'aria-disabled="false"':'aria-disabled="true"')+' aria-label="'+world.name+' world, '+count+' of 8 activities complete, '+(open?'open':'locked')+'">'+
    '<span class="lab-world-pin" aria-hidden="true">'+(count===8?'⭐':open?'▶':'🔒')+'</span><span class="lab-world-name">'+(i+1)+'. '+world.name+'</span><span class="lab-world-count">'+(open?count+' / 8':'LOCKED')+'</span></button>';
  }).join('');
  const rescueAction=canRescue()?'<button id="ready-rescue" class="lab-rescue" type="button">🐾 Rescue Friend!</button>':'';
  const now=worldThemes[next.worldIndex]||worldThemes[7];
  shell('Rainbow World Map',
   '<section class="lab-map-home" aria-label="Interactive eight-world rainbow map">'+
    '<div class="lab-game-hud"><div class="lab-player-compact"><div class="lab-player-figure">'+pic(playerId)+'</div><div class="lab-player-meta"><span class="lab-kicker">MY PLAYER</span><b>'+esc(char(playerId).name)+'</b><small>'+esc(currentStage(playerId))+'</small><button id="change-player" type="button">Change Player ›</button></div></div>'+
    '<div class="lab-friend-compact"><span class="lab-kicker">NEXT FRIEND</span><b>'+esc(progress)+'</b><div class="lab-meter" role="progressbar" aria-valuenow="'+doneForFriend+'" aria-valuemin="0" aria-valuemax="8"><i style="width:'+(doneForFriend/8*100)+'%"></i></div>'+rescueAction+'</div></div>'+
    '<div class="lab-map-title"><span>🌈 8 magical worlds · 8 activities each</span><h2>Choose Your World!</h2><p>Follow the rainbow road. Earn stars. Unlock new lands!</p></div>'+
    '<div class="lab-map-canvas" role="group" aria-label="Candy, Pirate, Arctic, Castle, Space, Jurassic, Ocean, Lava">'+nodes+'</div>'+
    '<button id="continue-adventure" type="button" class="lab-next-play">▶ PLAY NEXT <small>'+esc(now.name)+' · Activity '+next.worldStage+'</small></button>'+
    '<nav class="lab-main-nav" aria-label="Game navigation"><button type="button" data-nav="map">🏠 <span>Home</span></button><button type="button" data-nav="shop">⭐ <span>Star Shop</span></button><button type="button" data-nav="computer" class="lab-my-stuff-entry">🧸 <span>MY STUFF</span></button></nav>'+
    '<details class="lab-overflow"><summary>⚙ More</summary><button type="button" data-nav="computer">🧸 MY STUFF — Make My Scene</button><button type="button" id="endless">Drag Practice</button><button type="button" id="teacher-settings">Teacher Settings</button></details>'+
   '</section>'
  );
  $('change-player').onclick=()=>selectCharacter(true);
  $('continue-adventure').onclick=playNext;
  $('ready-rescue')?.addEventListener('click',continueRescue);
  $('teacher-settings').onclick=teacher;
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

 function openCandyWorld(){
   view='world-select';
   const positions=[[6.7,41.7],[20.8,53.7],[33.1,70.6],[39.4,42.3],[53.5,57.0],[69.2,51.5],[84.2,69.8],[92.1,37.4]];
   const points=levels.slice(0,8).map((l,k)=>{
     const done=a.completedLevelIds.includes(l.id),started=!!a.mazeRuns?.[l.id],unlocked=l.number<=a.highestUnlockedLevel;
     return '<button type="button" data-level="'+l.number+'" class="lab-candy-node'+(done?' done':started?' started':'')+(unlocked?'':' locked')+'" style="--x:'+positions[k][0]+'%;--y:'+positions[k][1]+'%;" aria-disabled="'+(!unlocked)+'"'+
       ' aria-label="Candy activity '+(k+1)+': '+candyNames[k]+(done?', completed':started?', in progress':unlocked?', ready to play':', locked')+'">'+
       '<span class="lab-map-node-number" aria-hidden="true">'+(k+1)+'</span>'+
       '<span class="lab-map-node-indicator" aria-hidden="true">'+(done?'✓':started?'↪':unlocked?'▶':'🔒')+'</span></button>';
   }).join('');
   shell('Candy World',
     '<section class="lab-candy-world" aria-label="Candy World map with eight playable activities">'+
       '<div class="lab-candy-heading"><button type="button" id="lab-back-map">← ALL WORLDS</button>'+
       '<div><small>WORLD 1 • 8 SWEET ACTIVITIES</small><h2>🍬 CANDY WORLD</h2></div>'+
       '<div class="lab-candy-progress">'+worldDoneCount(0)+' / 8 COMPLETE</div>'+(canRescue()?'<button class="lab-candy-rescue" id="lab-candy-rescue" type="button">🐾 RESCUE A FRIEND!</button>':'')+'</div>'+
       '<div class="lab-candy-scenery" role="group" aria-label="Eight stops along the Candyland rainbow road">'+'<img class="lab-candy-map-art" src="'+asset('arrow-lab/assets/candy-world-map-original.png')+'" width="2048" height="682" alt="Candy World: eight islands connected by a rainbow road">'+points+'</div>'+
       '<nav class="lab-candy-actions"><button data-nav="map">🏠 HOME</button><button data-nav="shop">⭐ STAR SHOP</button><button data-nav="computer">🧸 MY STUFF</button></nav>'+
     '</section>');
   $('lab-back-map').onclick=map;
   $('lab-candy-rescue')?.addEventListener('click',continueRescue);
   document.querySelectorAll('.lab-candy-node[data-level]').forEach(b=>b.onclick=()=>{
     if(b.getAttribute('aria-disabled')==='true'){
       const number=Number(b.dataset.level);const needed=Math.max(1,number-1);
       modal('Candy activity '+number+' is locked',
         '<p>First finish Candy activity '+needed+'.</p><button id="locked-candy-back" type="button" class="primary">Back to Candy World</button>',()=>{
           $('locked-candy-back').onclick=closeModal;
         });
       return;
     }
     startLevel(Number(b.dataset.level));
   });
 }

 function openWorld(i){
   if(!isWorldUnlocked(i))return map();
   if(i===0)return openCandyWorld();
   const world=worldThemes[i];
   view='world-select';
   const cards=levels.slice(i*8,i*8+8).map((l,k)=>{
     const cleared=a.completedLevelIds.includes(l.id),started=!!a.mazeRuns?.[l.id],open=l.number<=a.highestUnlockedLevel;
     return '<button type="button" class="lab-activity-card'+(cleared?' cleared':started?' started':open?'':' locked')+'" data-level="'+l.number+'" aria-disabled="'+(!open)+'" aria-label="'+esc(world.name)+' maze '+(k+1)+(cleared?', completed':started?', in progress':open?', ready to play':', locked')+'">'+
       '<span class="lab-activity-icon">'+(cleared?'✓':started?'↪':open?'▶':'🔒')+'</span>'+
       '<span class="lab-activity-number">ACTIVITY '+(k+1)+'</span><strong>'+esc(stageNames[world.id]?.[k]||activityNames[k])+'</strong>'+
       '<small>'+(cleared?'✓ ALREADY PLAYED':started?'↪ CONTINUE SAVED ACTIVITY':open?'▶ READY TO PLAY':'🔒 LOCKED')+'</small></button>';
   }).join('');
   shell(world.name+' World',
    '<section class="lab-world-select" style="--world-hue:'+world.color+';background-image:linear-gradient(150deg,#ffffffd4,#eef9ffba),url('+asset(world.backgroundImage)+');background-size:cover,cover;background-position:center,center">'+
    '<div class="lab-world-heading"><button id="lab-back-map" type="button">← World Map</button>'+
    '<div><span>WORLD '+(i+1)+' OF 8</span><h2>'+world.icon+' '+esc(world.name)+' World</h2><p>'+worldDoneCount(i)+' of 8 activities finished</p></div></div>'+
    '<div class="lab-world-activities">'+cards+'</div>'+
    '<p class="lab-world-tip">Use your arrow keys to move. Finish each maze to unlock the next!</p>'+(canRescue()?'<button class="lab-rescue" id="lab-world-rescue" type="button">🐾 Rescue a Friend!</button>':'')+'</section>');
   $('lab-back-map').onclick=map;
   $('lab-world-rescue')?.addEventListener('click',continueRescue);
   document.querySelectorAll('.lab-activity-card[data-level]').forEach(b=>b.onclick=()=>{
     const number=Number(b.dataset.level);
     if(b.getAttribute('aria-disabled')==='true'){
       const needed=Math.max(1,number-1)-(i*8);
       modal('Activity '+(number-i*8)+' is locked','<p>First finish '+esc(world.name)+' maze '+needed+'.</p><button id="locked-maze-back" type="button" class="primary">Back to '+esc(world.name)+' World</button>',()=>{
         $('locked-maze-back').onclick=closeModal;
       });
       return;
     }
     startLevel(number);
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
 function shopArt(d){return d.artPath?img(d.artPath,d.name,'shop-decoration'):d.art?img('trackpad-adventure/decorations/'+d.art+'.webp',d.name,'shop-decoration'):'<span class="shop-emoji">'+(d.emoji||'⭐')+'</span>'}
 function buyShopExclusive(worldId,itemId){
   const item=shopExclusives.find(x=>x.id===itemId&&x.world===backgroundHomes.find(w=>w.id===worldId)?.theme);
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

 function collectionStage(id){
  const l=land(id),residents=Object.keys(a.friends).filter(c=>a.friends[c]?.homeLandId===id);
  const companionsHere=companions.filter(c=>a.worldFriends?.[c.id]?.homeLandId===id&&!a.hiddenCompanions?.includes(c.id));
  const goods=(a.decorations[id]||[]).filter(key=>!a.hiddenDecorations?.[id]?.includes(key));
  const treasureGoods=(a.collectionExtraObjects?.[id]||[]).filter(key=>[...(a.collectedWorldItems||[]),...(a.collectedComputerGearIds||[]),...(a.earnedSkillBadgeIds||[])].includes(key));
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
  return '<div id="collection-scene" class="land-scene free-world collection-scene" role="group" aria-label="'+esc(l.name)+', including your arranged friends and decorations" style="background-image:url('+asset(picture)+')">'+personArt+friendArt+decorArt+treasureArt+'</div>';
 }
 function enableCollectionDrag(id){
  const scene=$('collection-scene');if(!scene)return;let drag=null;
  scene.onpointerdown=e=>{
    const el=e.target.closest('[data-world-object]');if(!el||e.pointerType!=='mouse'||e.button!==0)return;
    e.preventDefault();const rect=el.getBoundingClientRect();
    drag={el,key:el.dataset.worldObject,pointer:e.pointerId,dx:e.clientX-rect.left-rect.width/2,dy:e.clientY-rect.top-rect.height/2,oldX:el.style.left,oldY:el.style.top};
    el.setPointerCapture(e.pointerId);el.classList.add('moving');
  };
  scene.onpointermove=e=>{
    if(!drag||drag.pointer!==e.pointerId)return;e.preventDefault();
    const rect=scene.getBoundingClientRect();
    drag.x=Math.max(10,Math.min(90,(e.clientX-drag.dx-rect.left)/rect.width*100));
    drag.y=Math.max(18,Math.min(85,(e.clientY-drag.dy-rect.top)/rect.height*100));
    drag.el.style.left=drag.x+'%';drag.el.style.top=drag.y+'%';
  };
  scene.onpointerup=e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    if(drag.x!==undefined){(a.positions[id]??={})[drag.key]={x:drag.x,y:drag.y};save();$('collection-report').textContent='Saved! Your arrangement will be here next time.'}
    drag.el.classList.remove('moving');drag=null;
  };
  scene.onpointercancel=scene.onlostpointercapture=()=>{
    if(!drag)return;drag.el.style.left=drag.oldX;drag.el.style.top=drag.oldY;drag.el.classList.remove('moving');drag=null;
  };
 }
 function computer(worldId=null,section=null){
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
  const rescued=companions.filter(c=>a.worldFriends?.[c.id]);
  const treasures=[...new Set([...(a.collectedWorldItems||[]),...(a.collectedComputerGearIds||[]),...(a.earnedSkillBadgeIds||[])])];
  const decorationCards=ownedDecor.map(key=>{
    const d=findDecoration(key);if(!d)return '';
    const here=(a.decorations[id]||[]).includes(key);
    const placed=here&&!a.hiddenDecorations[id]?.includes(key);
    const elsewhere=!here&&Object.entries(a.decorations||{}).some(([world,items])=>world!==id&&items.includes(key));
    return '<article class="my-stuff-item" data-stuff-kind="decoration">'+shopArt(d)+
      '<strong>'+esc(d.name)+'</strong><button type="button" data-stuff-decor="'+d.id+'" aria-pressed="'+placed+'">'+
      (placed?'✓ In Scene · Put Away':elsewhere?'＋ Move to This World':'＋ Add to Scene')+'</button></article>';
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
  const worldOnlyGoods=shopExclusives.filter(d=>d.world===backgroundHomes.find(w=>w.id===id)?.theme);
  const exclusiveStore='<section class="my-stuff-exclusive-store" aria-label="Shop-only decorations for '+esc(land(id).name)+'">'+
   '<h3>⭐ '+esc(land(id).name)+' · SHOP ONLY</h3><p>These items cannot be collected in activities. Spend stars to buy them for your world!</p>'+
   '<div class="my-stuff-exclusive-cards">'+worldOnlyGoods.map(d=>{
    const here=(a.decorations[id]||[]).includes(d.id),ownedAnywhere=Object.values(a.decorations||{}).some(list=>list.includes(d.id));
    return '<article class="my-stuff-exclusive-item">'+shopArt(d)+'<strong>'+esc(d.name)+'</strong><small>⭐ '+d.cost+' stars · Shop Only</small>'+
      '<button type="button" data-buy-shop-only="'+d.id+'" '+(ownedAnywhere||a.wallet.rainbowStars<d.cost?'disabled':'')+'>'+
      (here?'✓ Owned':ownedAnywhere?'✓ Owned · Move from Tray':a.wallet.rainbowStars<d.cost?'Earn More Stars':'⭐ Buy for '+d.cost+' Stars')+'</button></article>';
   }).join('')+'</div></section>';
  const tray='<p>Pick anything you have earned or bought. Add it to your world, then drag it where you want!</p>'+
    '<div class="my-stuff-tray-controls" aria-label="Browse my decorations"><button id="stuff-scroll-prev" type="button" aria-label="Previous decorations">◀</button><strong>My Decorations, Friends & Treasures</strong><button id="stuff-scroll-next" type="button" aria-label="More decorations">▶</button></div>'+
    '<div id="my-stuff-tray" class="my-stuff-tray" tabindex="0" role="region" aria-label="My earned decorations, rescued friends, and treasures. Scroll horizontally.">'+
      (hasObjects?decorationCards+friendCards+treasureCards:
      '<p class="my-stuff-empty">Your collection starts here! Finish activities to earn treasures, rescue friends and buy decorations.</p>')+
    '</div><div class="my-stuff-shop-actions">'+
      '<button class="my-stuff-action" type="button" id="stuff-decor-shop">⭐ Get More Decorations</button>'+
      '<button class="my-stuff-action" type="button" id="stuff-buy-world">🌍 Get Another World</button></div>';
  shell('MY STUFF','<section class="lab-collection-page my-stuff-room" aria-label="My Stuff: make and play with my world">'+
      '<div class="my-stuff-heading"><div><small>MY WORLD • MY SCENE • MY FRIENDS</small><h2>'+esc(land(id).name)+'</h2></div>'+
        '<div class="my-stuff-scene-actions"><button id="stuff-home" type="button">🏠 Home</button><button id="stuff-help" type="button">✋ How to Move</button></div></div>'+
      '<div class="my-stuff-stage"><div class="collection-world-showcase">'+collectionStage(id)+'</div>'+
       '<p id="collection-report" role="status">This is your world! Click and hold an item with your trackpad, move it, then let go. It saves!</p></div>'+
      '<div class="my-stuff-world-quickstrip" aria-label="Quickly change to a world you own">'+
        '<strong>🌍 My Worlds</strong><div class="my-stuff-quickworlds">'+purchased.map(l=>
          '<button type="button" data-stuff-world="'+l.id+'" aria-label="Show my '+esc(l.name)+' world" aria-pressed="'+(l.id===id)+'">'+
          img(l.cardPreview,l.name,'my-stuff-thumb')+'<span>'+esc(l.name)+'</span></button>').join('')+'</div></div>'+
      '<div class="my-stuff-toolbox"><h3>Make Your Scene!</h3>'+
        '<div class="my-stuff-tray-panel">'+tray+'</div>'+exclusiveStore+'</div></section>');
  enableCollectionDrag(id);
  $('stuff-home').onclick=map;
  $('stuff-help').onclick=()=>{$('collection-report').textContent='Click and HOLD an item inside the large world with your trackpad. Move it to a new spot, then let go to save!'};
  // Keep the tray in view after adding/putting away several objects in a row.
  const refresh=()=>{
    const appScroll=$('app').scrollTop, pageScroll=window.scrollY, trayScroll=$('my-stuff-tray')?.scrollLeft||0;
    computer(id);
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
  $('stuff-buy-world')?.addEventListener('click',homeMap);
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
 clearClock();def=levels[n-1];if(!def||n>a.highestUnlockedLevel)return;
 const previous=a.mazeRuns?.[def.id];
 r=!restart&&previous?.dragVersion===1&&!previous.complete?previous:{id:def.id,dragVersion:1,drops:0,items:[],complete:false,rewarded:a.completedLevelIds.includes(def.id)};
 view='drag';
 shell(esc(def.title),'<div id="drag-activity"></div>');
 const worldObjects=[candyObjects,pirateObjects,arcticObjects,[],[],[],oceanObjects,[]][def.worldIndex];
 const ids=[...new Set([...def.collectibleIds,...worldObjects.map(x=>x[0]),...data.computer_collectibles.map(x=>x.id)])].filter(id=>itemArt(id)).slice(0,6);
 dragSession=mountDragActivity($('drag-activity'),{
  enemies:def.enemyIds.map(id=>data.enemies.find(e=>e.id===id)).filter(Boolean).map(e=>({name:e.name,image:asset(e.thumbnail)})),
  stage:def.worldStage,background:asset(def.backgroundImage),items:ids.map(id=>({id,name:itemName(id),image:asset(itemArt(id))})),completed:r.drops||0,
  onDrop:(count)=>{r.drops=count;save()},
  onComplete:()=>{
   for(const id of def.collectibleIds||[]){if(!(a.collectedWorldItems??=[]).includes(id))a.collectedWorldItems.push(id)}
   r.items=(def.collectibleIds||[]).map(id=>({id,collected:true}));r.skill={done:true,type:'drag'};finish();
  }
 });
 tellGuide('Click and keep holding with one finger. Move the picture to its match. Let go inside the matching spot.'+(def.worldStage>=2?' Go around the bad guy and its striped border.':''),'CLICK → HOLD → MOVE → LET GO');
 a.activeRun=r;save();
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
 const content='<p>Settings apply on this browser. Skipping opens a level but does not award badges, stars, or friends.</p><label hidden>Challenge <select id="set-difficulty"><option value="standard">Standard · moving bad guys</option><option value="gentle">Gentle · stationary bad guys</option></select></label><label hidden>Obstacle pace <select id="set-speed"><option value="1600">Slow</option><option value="2200">Slower</option><option value="3200">Slowest</option></select></label>'+[['hints','Show help'],['sound','Celebration sound'],['reducedMotion','Reduce motion']].map(([id,label])=>'<label><input id="set-'+id+'" type="checkbox"> '+label+'</label>').join('')+'<label>Power-Up stars <input id="cost-power" type="number" min="1" max="20" value="'+config.progression.upgradeCost.power_up+'"></label><label>Super Power stars <input id="cost-super" type="number" min="1" max="30" value="'+config.progression.upgradeCost.super_power_additional+'"></label><button id="save-settings" class="primary">Save settings</button><button id="skip-level">Open next level · no rewards</button><button id="export-progress">Download progress CSV</button><button id="close-settings">Back</button>';
 modal('Teacher settings',content,()=>{$('set-difficulty').value=settings.difficulty;$('set-speed').value=settings.speed;for(const k of ['hints','sound','reducedMotion'])$('set-'+k).checked=settings[k];
 $('save-settings').onclick=()=>{settings.difficulty=$('set-difficulty').value;settings.speed=Number($('set-speed').value);for(const k of ['hints','sound','reducedMotion'])settings[k]=$('set-'+k).checked;settings.touchArrows=false;settings.costs={power_up:Math.max(1,Math.min(20,Number($('cost-power').value)||2)),super_power_additional:Math.max(1,Math.min(30,Number($('cost-super').value)||4))};config.progression.upgradeCost={...settings.costs};try{localStorage.setItem('drag-drop-adventure-teacher-settings',JSON.stringify(settings))}catch{}save();closeModal();if(view==='maze')startLevel(def.number,false);else map()};
 $('skip-level').onclick=()=>{
   // Unlock the next maze without completing the skipped maze, awarding stars,
   // or deleting the student's unfinished saved run.
   const next=Math.min(levels.length,a.highestUnlockedLevel+1);
   if(next===a.highestUnlockedLevel){
     $('skip-level').textContent='All 64 activities are already open';
     $('skip-level').disabled=true;
     return;
   }
   a.highestUnlockedLevel=next;save();closeModal();startLevel(next);
 };
 $('close-settings').onclick=closeModal;$('export-progress').onclick=()=>{const rows=[['Homeroom','Number','Levels','Friends','Rainbow Stars','Equipment','Skill badges']];for(const t of teachers)for(let n=1;n<=24;n++){try{const raw=JSON.parse(localStorage.getItem('drag-drop-adventure-v1:'+t.id+':'+n)||'null'),d=raw?.adventure;if(d)rows.push([raw.teacherName||t.name,n,d.completedLevelIds.length,Object.keys(d.friends).length,d.wallet.rainbowStars,d.collectedComputerGearIds.join(' / '),d.earnedSkillBadgeIds.join(' / ')])}catch{}}const csv=rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),link=document.createElement('a');link.href=url;link.download='arrow-adventure-progress.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
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
  const t='Click and keep holding with one finger. While holding, move the picture to its matching spot. Let go inside the spot. Go around the bad guys and keep the whole picture away from their striped borders. If you touch one, only that drag starts over; finished drops stay saved. If you let go too soon, try again. Each level gives you more drag-and-drop practice. Finish levels to earn stars and rescue friends.';
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
