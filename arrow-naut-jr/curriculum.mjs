/** Arrow-Naut Junior: FIRST GRADE click + keyboard-arrow movement only.
 * Independent IDs and saves. No draggable or resizable objects.
 */
import {makeFinalMaze} from '../arrow-naut/finale-maze.mjs?v=all-boss-safe-lasers-20261102';
export const COLS=12,ROWS=7;
const jpeg=n=>'../arrow-naut/assets/'+n+'.jpg';
const png=n=>'../game-assets/collectibles/computer/'+n+'_512.png';
const skill=n=>'../game-assets/collectibles/skills/'+n+'_512.png';
const puzzle=n=>'./assets/puzzle/'+n+'.png';
const moveFind=n=>'./assets/move-find/'+n+'.png';
export const WORLDS=[
 {id:'launch',name:'Candy Moon',jpg:jpeg('candy-moon'),friend:'../arrow-naut/assets/standalone/rescue_bunny.png'},
 {id:'moon',name:'Rocket Launch',jpg:jpeg('rocket-launch'),friend:'../arrow-naut/assets/standalone/rescue_turtle.png'},
 {id:'robot',name:'Neon Ringed Planet',jpg:jpeg('neon-rings'),friend:'../arrow-naut/assets/standalone/rescue_otter.png'},
 {id:'crystal',name:'Crystal Ice',jpg:jpeg('crystal-ice'),friend:'../arrow-naut/assets/standalone/rescue_koala.png'},
 {id:'slime',name:'Robot Space Station',jpg:jpeg('robot-station'),friend:'../arrow-naut/assets/standalone/rescue_puppy.png'},
 {id:'ice',name:'Dino Asteroid',jpg:jpeg('dino-asteroid'),friend:'./assets/explorers/space_panda.png'},
 {id:'jungle',name:'Ocean Planet',jpg:jpeg('ocean-planet'),friend:'./assets/explorers/space_kitty.png'},
 {id:'core',name:'Lava Planet',jpg:jpeg('lava-planet'),friend:'./assets/explorers/star_bot.png'}
];
export const GALAXY='../arrow-naut/assets/galaxy-map.jpg';
export const WORLD_STOPS=[
 {x:7.2,y:47.2},{x:20.7,y:43.4},{x:33,y:45.3},{x:44.7,y:49.4},
 {x:56.3,y:44.2},{x:67.6,y:50.8},{x:79.6,y:45.5},{x:92.1,y:45.5}];
export const LEVEL_STOPS=[
 {x:16,y:32},{x:35,y:22},{x:57,y:26},{x:79,y:35},
 {x:84,y:65},{x:62,y:76},{x:40,y:73},{x:18,y:64}];
export const CHARACTERS=[
 {id:'astro_ace',name:'Astro Ace',img:'../game-assets/characters/starter/png_512/astro_ace.png'},
 {id:'space_panda',name:'Nova Panda Astronaut',img:'./assets/explorers/space_panda.png'},
 {id:'space_kitty',name:'Comet Kitty Astronaut',img:'./assets/explorers/space_kitty.png'},
 {id:'space_robot',name:'Orbit Space Robot',img:'./assets/explorers/star_bot.png'},
 {id:'astro_fox',name:'Cosmo Fox Astronaut',img:'../arrow-naut/assets/standalone/astro_fox.png'},
 {id:'astro_panda_new',name:'Space Panda Explorer',img:'../arrow-naut/assets/standalone/astro_panda.png'},
 {id:'astro_kitten_new',name:'Kitty Space Explorer',img:'../arrow-naut/assets/standalone/astro_kitten.png'},
 {id:'astro_robot_new',name:'Rocket Astronaut Bot',img:'../arrow-naut/assets/standalone/astro_robot.png'}
];
export const ENEMIES=[
 './assets/new-space-art/meteor_slime.png',
 './assets/new-space-art/space_bat.png',
 '../game-assets/enemies/rock_golem_256.png',
 '../game-assets/enemies/purple_slime_256.png'
];
export const ITEMS=[
 {id:'trackpad',name:'Magic Trackpad',price:3,img:png('trackpad')},
 {id:'keyboard',name:'Communications Satellite',price:4,img:png('keyboard')},
 {id:'mouse',name:'Rocket Mouse',price:5,img:png('mouse')},
 {id:'laptop',name:'Star Laptop',price:6,img:png('laptop')},
 {id:'arrows',name:'Arrow Power',price:7,img:skill('arrows')},
 {id:'click',name:'Click Medal',price:8,img:skill('click')},
 {id:'desktop',name:'Control Computer',price:9,img:png('desktop')},
 {id:'star',name:'Golden Space Star',price:10,img:'../arrow-lab/assets/star-icon.png'},
 {id:'orbit-satellite',name:'Solar Panel Satellite',price:5,img:moveFind('solar_panel_satellite')},
 {id:'signal-dish',name:'Satellite Dish',price:5,img:moveFind('satellite_dish')},
 {id:'star-key',name:'Golden Space Key',price:4,img:moveFind('golden_signal_key')},
 {id:'ice-key',name:'Ice Planet Key',price:5,img:moveFind('blue_ice_key')},
 {id:'landing-pad',name:'Space Landing Dock',price:7,img:moveFind('blue_landing_dock')},
 {id:'star-crate',name:'Star Cargo Crate',price:6,img:moveFind('star_cargo_crate')},
 {id:'crystal-garden',name:'Space Crystal Cluster',price:5,img:moveFind('crystal_cluster')},
 {id:'frozen-home',name:'Frozen Space Habitat',price:8,img:moveFind('frozen_habitat')},
 {id:'power-cell',name:'Lightning Energy Cell',price:6,img:moveFind('lightning_energy_cell')},
 {id:'ice-blocks',name:'Ice Wall Blocks',price:4,img:moveFind('ice_wall_four_blocks')},
 {id:'special-rover',name:'Purple-Wheel Moon Rover',price:7,img:moveFind('moon_rover')},
 {id:'moon_crystal',name:'Crystal Moon',price:7,img:'./assets/new-space-art/crystal_moon.png'},
 {id:'treasure_chest',name:'Galaxy Treasure Chest',price:12,img:'./assets/new-space-art/star_chest.png'},
 {id:'star_beacon',name:'Star Signal Beacon',price:8,img:'./assets/new-space-art/star_beacon.png'},
 {id:'space_rover',name:'Moon Rover',price:9,img:'./assets/new-space-art/space_rover.png'},
 {id:'star_wand',name:'Star Wand',price:10,img:'./assets/new-space-art/star_wand.png'},
 {id:'legacy-lollipop',name:'Candy Planet Lollipop',price:5,img:'../arrow-lab/collectibles/candy/lollipop.png'},
 {id:'legacy-cupcake',name:'Galaxy Cupcake',price:6,img:'../arrow-lab/collectibles/candy/cupcake.png'},
 {id:'legacy-pirate-chest',name:'Space Pirate Treasure Chest',price:9,img:'../arrow-lab/collectibles/pirate/treasure_chest.png'},
 {id:'legacy-gold-coins',name:'Golden Space Coins',price:7,img:'../arrow-lab/collectibles/pirate/gold_coins.png'},
 {id:'legacy-compass',name:'Explorer Compass',price:6,img:'../arrow-lab/collectibles/pirate/compass.png'},
 {id:'legacy-ice-gem',name:'Frozen Crystal Gem',price:6,img:'../arrow-lab/collectibles/arctic/icicle_gem.png'},
 {id:'legacy-snowglobe',name:'Arctic Snow Globe',price:8,img:'../arrow-lab/collectibles/arctic/snow_globe.png'},
 {id:'legacy-pearl-shell',name:'Ocean Pearl Shell',price:7,img:'../arrow-lab/collectibles/ocean/pearl_shell.png'},
 {id:'legacy-sea-turtle',name:'Ocean Turtle Friend',price:10,img:'../arrow-lab/collectibles/ocean/sea_turtle.png'},
 {id:'legacy-starfish',name:'Starfish Treasure',price:5,img:'../arrow-lab/collectibles/ocean/starfish.png'},
 {id:'legacy-golden-key',name:'Golden Castle Key',price:9,img:'../arrow-lab/collectibles/castle/golden_key.png'},
 {id:'legacy-hot-cocoa',name:'Explorer Hot Cocoa',price:5,img:'../arrow-lab/collectibles/arctic/hot_cocoa.png'}
];
export const NAMES=['Find & Dock','Starlight Trail','Fuel Crystal Hunt','Match the Space Cargo','Find the Secret Cargo','Unlock the Force Field','Space Signal Relay','Rescue Maze'];
const pc=(id,name,x,y,goal,img,w=1,h=1,shape=null)=>({id,name,x,y,goal,img,w,h,shape});
const cargoL=puzzle('l_shaped_cargo'),cargoT=puzzle('t_shaped_cargo');

const art=[puzzle('robot_probe'),moveFind('solar_panel_satellite'),moveFind('moon_rover'),puzzle('rocket'),moveFind('star_cargo_crate'),puzzle('space_station_satellite'),puzzle('flying_saucer')];
/** First-grade worlds have distinct activity orders while keeping level 8 as rescue.
 * Existing save IDs (worldId-levelNumber) are unchanged.
 */
export const WORLD_ORDERS=[
 [0,1,2,3,4,5,6],
 [1,4,3,2,0,6,5],
 [2,0,5,1,6,4,3],
 [4,3,0,6,1,5,2],
 [5,1,3,0,2,4,6],
 [3,6,2,4,0,1,5],
 [6,2,4,5,1,3,0],
 [1,5,6,2,3,0,4]
];
export function createMission(world,stage){
 if(!Number.isInteger(world)||world<0||world>=8||!Number.isInteger(stage)||stage<0||stage>7)
  throw Error('Unknown first-grade mission');
 const id=WORLDS[world].id+'-'+(stage+1),w=WORLDS[world];
 const activity=stage===7?7:WORLD_ORDERS[world][stage];
 const base={id,world,stage,activity,mechanicVersion:activity===0||activity===3?4:(activity!==stage?5:3),kind:'move',name:NAMES[activity],
  pieces:[],rocks:[],pickups:[],target:null,worldData:w};
 const offset=world%3;
 const gold='../arrow-lab/assets/star-icon.png',gem='./assets/new-space-art/crystal_moon.png',starSignal='./assets/new-space-art/star_beacon.png';
 const beacon=(id,x,y,name,img=gold,piece=null)=>({id,x,y,name,img,piece});
 if(activity===0){
  const firstGear=[
   {name:'Rocket Ship',img:art[3]},
   {name:'Moon Rover',img:art[2]},
   {name:'Communications Satellite',img:art[1]},
   {name:'Robot Probe',img:art[0]},
   {name:'Star Cargo Crate',img:art[4]},
   {name:'Space Station',img:art[5]},
   {name:'Flying Saucer',img:art[6]},
   {name:'Moon Rover',img:'./assets/new-space-art/space_rover.png'}
  ][world];
  return {...base,kind:'precision',name:'Find & Dock '+firstGear.name,
   directions:'MISSION 1! CLICK the '+firstGear.name.toUpperCase()+' IN THE MIDDLE with your trackpad. Then use KEYBOARD ARROWS to collect the glowing checkpoint and FIT the picture in its matching dock!',
   target:'target',pieces:[
    pc('target',firstGear.name,2,3,{x:9,y:world%2?1:5},firstGear.img),
    pc('decoy1','Other Space Picture',5,1, null,art[(world+1)%art.length]),
    pc('decoy2','Other Space Picture',7,6,null,art[(world+2)%art.length]),
    pc('decoy3','Other Space Picture',10,3,null,art[(world+3)%art.length]),
    ...(world>=3?[pc('decoy4','Other Space Picture',6,5,null,art[(world+4)%art.length])]:[])
   ],
   pickups:[beacon('starter-signal',5,world%2?4:2,'Signal Checkpoint',starSignal,'target')],
   rocks:world>=5?[[6,3],[8,4]]:world>=2?[[6,3]]:[]
  };
 }
 if(activity===1)return {...base,kind:'trail',name:NAMES[1],
  directions:'STARLIGHT TRAIL! CLICK your explorer. Use KEYBOARD ARROWS to touch the glowing stars IN ORDER. Then go to the green finish!',
  pieces:[pc('rover','Your Space Explorer',1,3,{x:10,y:3},art[2])],
  pickups:[beacon('trail-1',3,world%2?2:4,'Star 1'),
   beacon('trail-2',6,world%2?4:2,'Star 2'),
   ...(world>=3?[beacon('trail-3',8,world%2?2:4,'Star 3')]:[])],
  pickupOrder:'ordered'};
 if(activity===2)return {...base,kind:'collect',name:NAMES[2],
  directions:'FUEL CRYSTAL HUNT! Click your explorer, steer AROUND the space rocks, collect ALL crystals, then go to the finish!',
  pieces:[pc('rover','Your Space Explorer',1,3,{x:10,y:3},art[2])],
  rocks:[[4,1],[4,2],[4,3],[4,4],[6,3],[7,3],...(world>=3?[[7,2],[7,4]]:[])],
  pickups:[beacon('fuel-a',2,5,'Fuel Crystal A',moveFind('crystal_cluster')),
   beacon('fuel-b',8,1,'Fuel Crystal B',moveFind('crystal_cluster')),
   ...(world>=4?[beacon('fuel-c',9,5,'Fuel Crystal C',moveFind('crystal_cluster'))]:[])]};
 if(activity===3)return {...base,kind:'delivery',name:NAMES[3],
  directions:'FIT THE SPACE CARGO! CLICK the L or T picture in the middle. Use ARROW KEYS to guide each piece into its SAME-SIZE faded picture. NO scan stars to chase, NO turning, and NO resizing!',
  pieces:[pc('laptop','L-Shaped Cargo',2,1,{x:7, y:0},cargoL,2,3,'L'),
   pc('keyboard','T-Shaped Cargo',1,4,{x:7,y:3},cargoT,3,3,'T')],
  pickups:[],rocks:[[0,0],[11,6]]};
 if(activity===4)return {...base,kind:'precision',name:NAMES[4],target:'target',
  directions:'SECRET CARGO! Click the BLUE cargo crate, NOT the decoys. Move it to BOTH signal stars before docking!',
  pieces:[pc('target','Secret Cargo Crate',2,3,{x:9,y:3},art[4]),
   pc('decoy1','Moon Rover',6,1,null,art[2]),
   pc('decoy2','Rocket Ship',7,5,null,art[3]),
   pc('decoy3','Communications Satellite',5,4,null,art[1]),
   ...(world>=4?[pc('decoy4','Robot Probe',9,5,null,art[0])]:[])],
  rocks:[[11,0],[0,6]],pickups:[beacon('signal-a',4,world%2?2:4,'Signal 1',starSignal,'target'),
   beacon('signal-b',7,world%2?4:2,'Signal 2',starSignal,'target')]};
 if(activity===5)return {...base,kind:'key-gate',name:NAMES[5],
  directions:'FORCE FIELD! Click the SATELLITE and collect the key to open the gate. Then guide the rover through its scan star before docking BOTH pictures.',
  pieces:[pc('keyboard','Communications Satellite',1,1,{x:9,y:1},art[1]),
   pc('mouse','Moon Rover',1,5,{x:9,y:5},art[2])],
  rocks:Array.from({length:7},(_,y)=>[5,y]).filter(v=>v[1]!==3),
  gate:{x:5,y:3,img:moveFind('lightning_energy_cell')},
  pickups:[beacon('gate-key',3+world%2,3,'Open the Gate',moveFind(world===3?'blue_ice_key':'golden_signal_key'),'keyboard'),beacon('scan-rover',7,4,'Rover Scan',gold,'mouse')]};
 if(activity===6)return {...base,kind:'relay',name:NAMES[6],
  directions:'SPACE DOCKS! Click the glowing picture FIRST. Use ARROW KEYS to move it into its matching dock. Then click the next picture. No turning or resizing!',
  pieces:[pc('trackpad','Little Robot Probe',4,3,{x:10,y:2},art[0]),
   pc('arrows','L-Shaped Cargo',1,0,{x:9,y:1},cargoL,2,3,'L'),
   pc('laptop','T-Shaped Cargo',1,3,{x:6,y:4},cargoT,3,3,'T')],
  deliveryOrder:world%3===0?['trackpad','arrows','laptop']:world%3===1?['arrows','laptop','trackpad']:['laptop','trackpad','arrows'],
  rocks:[[11,0],[0,6]]};
 const maze=makeFinalMaze(world);
 return {...base,kind:'maze',name:NAMES[7],
  directions:'RESCUE MAZE! CLICK your explorer. Use the ARROW KEYS to find EXIT. Space bad guys move on safe side paths!',
  pieces:[],rocks:maze.walls,mazeStart:maze.start,mazeGoal:maze.goal,enemies:maze.enemies,safeRoute:maze.safeRoute};
}
export function createProgress(){return {version:1,completed:[],stars:0,purchases:[],rescued:[],character:CHARACTERS[0].id,worldScene:[],sceneWorld:0,active:null}}
export function completedCount(progress,w){return progress.completed.filter(id=>id.startsWith(WORLDS[w].id+'-')).length}
export function worldUnlocked(progress,w){return w===0||WORLDS.slice(0,w).every((_,i)=>progress.completed.includes(WORLDS[i].id+'-8'))}
export function levelUnlocked(progress,w,stage){return worldUnlocked(progress,w)&&(stage===0||progress.completed.includes(WORLDS[w].id+'-'+stage))}
export function allMissions(){return WORLDS.flatMap((_,w)=>NAMES.map((_,s)=>createMission(w,s)))}
