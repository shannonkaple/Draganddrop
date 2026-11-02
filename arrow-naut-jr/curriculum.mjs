/** Arrow-Naut Junior: FIRST GRADE click + keyboard-arrow movement only.
 * Independent IDs and saves. No draggable or resizable objects.
 */
import {makeFinalMaze} from '../arrow-naut/finale-maze.mjs?v=all-boss-safe-lasers-20261102';
export const COLS=12,ROWS=7;
const jpeg=n=>'../arrow-naut/assets/'+n+'.jpg';
const png=n=>'../game-assets/collectibles/computer/'+n+'_512.png';
const skill=n=>'../game-assets/collectibles/skills/'+n+'_512.png';
export const WORLDS=[
 {id:'launch',name:'Candy Moon',jpg:jpeg('candy-moon'),friend:'../arrow-lab/friends/candy-bunny.png'},
 {id:'moon',name:'Rocket Launch',jpg:jpeg('rocket-launch'),friend:'../arrow-lab/friends/pirate-parrot.png'},
 {id:'robot',name:'Neon Ringed Planet',jpg:jpeg('neon-rings'),friend:'../arrow-lab/friends/space-alien.png'},
 {id:'crystal',name:'Crystal Ice',jpg:jpeg('crystal-ice'),friend:'../arrow-lab/friends/arctic-penguin.png'},
 {id:'slime',name:'Robot Space Station',jpg:jpeg('robot-station'),friend:'../arrow-lab/friends/royal-dragon.png'},
 {id:'ice',name:'Dino Asteroid',jpg:jpeg('dino-asteroid'),friend:'../arrow-lab/friends/explorer-dino.png'},
 {id:'jungle',name:'Ocean Planet',jpg:jpeg('ocean-planet'),friend:'../arrow-lab/friends/ocean-dolphin.png'},
 {id:'core',name:'Lava Planet',jpg:jpeg('lava-planet'),friend:'../arrow-lab/friends/lava-dragon.png'}
];
export const GALAXY='../arrow-naut/assets/galaxy-map.jpg';
export const WORLD_STOPS=[
 {x:7.2,y:47.2},{x:20.7,y:43.4},{x:33,y:45.3},{x:44.7,y:49.4},
 {x:56.3,y:44.2},{x:67.6,y:50.8},{x:79.6,y:45.5},{x:92.1,y:45.5}];
export const LEVEL_STOPS=[
 {x:16,y:32},{x:35,y:22},{x:57,y:26},{x:79,y:35},
 {x:84,y:65},{x:62,y:76},{x:40,y:73},{x:18,y:64}];
export const CHARACTERS=[
 ['astro_ace','Astro Ace'],['beep_bop_robot','Beep-Bop'],['penny_penguin','Penny Penguin'],
 ['poppy_pup','Poppy Pup'],['sunny_kitten','Sunny Kitten'],['dizzy_dino','Dizzy Dino'],
 ['twinkle_fairy','Twinkle Fairy'],['rainbow_rocket_unicorn','Rainbow Rocket']
].map(([id,name])=>({id,name,img:'../game-assets/characters/starter/png_512/'+id+'.png'}));
export const ENEMIES=[
 '../game-assets/enemies/rock_golem_256.png',
 '../game-assets/enemies/purple_slime_256.png',
 '../game-assets/enemies/storm_cloud_256.png',
 '../game-assets/enemies/cranky_crab_256.png'
];
export const ITEMS=[
 {id:'trackpad',name:'Magic Trackpad',price:3,img:png('trackpad')},
 {id:'keyboard',name:'Space Keyboard',price:4,img:png('keyboard')},
 {id:'mouse',name:'Rocket Mouse',price:5,img:png('mouse')},
 {id:'laptop',name:'Star Laptop',price:6,img:png('laptop')},
 {id:'arrows',name:'Arrow Power',price:7,img:skill('arrows')},
 {id:'click',name:'Click Medal',price:8,img:skill('click')},
 {id:'desktop',name:'Control Computer',price:9,img:png('desktop')},
 {id:'star',name:'Golden Space Star',price:10,img:'../arrow-lab/assets/star-icon.png'}
];
export const NAMES=['Space Star Search','Starlight Trail','Fuel Crystal Hunt','Cargo Scan & Deliver','Find the Secret Computer','Unlock the Force Field','Space Signal Relay','Rescue Maze'];
const pc=(id,name,x,y,goal,img)=>({id,name,x,y,goal,img,w:1,h:1});
const art=[png('trackpad'),png('keyboard'),png('mouse'),png('laptop'),png('desktop'),skill('arrows'),skill('click')];
export function createMission(world,stage){
 if(!Number.isInteger(world)||world<0||world>=8||!Number.isInteger(stage)||stage<0||stage>7)
  throw Error('Unknown first-grade mission');
 const id=WORLDS[world].id+'-'+(stage+1),w=WORLDS[world];
 const base={id,world,stage,mechanicVersion:2,kind:'move',name:NAMES[stage],
  pieces:[],rocks:[],pickups:[],target:null,worldData:w};
 const offset=world%3;
 const gold='../arrow-lab/assets/star-icon.png',gem='../arrow-lab/assets/gem-icon.png';
 const beacon=(id,x,y,name,img=gold,piece=null)=>({id,x,y,name,img,piece});
 if(stage===0)return {...base,kind:'click',name:NAMES[0],
  directions:'STAR SEARCH! Click INSIDE the golden space star with your TRACKPAD. Avoid the other pictures.',
  target:'star',pieces:[
   pc('star','Golden Space Star',2+offset,2+world%2,null,gold),
   pc('decoy1','Space Laptop',8,1,null,art[3]),
   pc('decoy2','Space Keyboard',7,4,null,art[1]),
   pc('decoy3','Space Mouse',10,4,null,art[2]),
   ...(world>=4?[pc('decoy4','Space Trackpad',5,5,null,art[0])]:[])
  ]};
 if(stage===1)return {...base,kind:'trail',name:NAMES[1],
  directions:'STARLIGHT TRAIL! CLICK your explorer. Use KEYBOARD ARROWS to touch the glowing stars IN ORDER. Then go to the green finish!',
  pieces:[pc('rover','Your Space Explorer',1,3,{x:10,y:3},art[2])],
  pickups:[beacon('trail-1',3,world%2?2:4,'Star 1'),
   beacon('trail-2',6,world%2?4:2,'Star 2'),
   ...(world>=3?[beacon('trail-3',8,world%2?2:4,'Star 3')]:[])],
  pickupOrder:'ordered'};
 if(stage===2)return {...base,kind:'collect',name:NAMES[2],
  directions:'FUEL CRYSTAL HUNT! Click your explorer, steer AROUND the space rocks, collect ALL crystals, then go to the finish!',
  pieces:[pc('rover','Your Space Explorer',1,3,{x:10,y:3},art[2])],
  rocks:[[4,1],[4,2],[4,3],[4,4],[6,3],[7,3],...(world>=3?[[7,2],[7,4]]:[])],
  pickups:[beacon('fuel-a',2,5,'Fuel Crystal A',gem),
   beacon('fuel-b',8,1,'Fuel Crystal B',gem),
   ...(world>=4?[beacon('fuel-c',9,5,'Fuel Crystal C',gem)]:[])]};
 if(stage===3)return {...base,kind:'delivery',name:NAMES[3],
  directions:'CARGO SCAN! CLICK each space tool. Move it to its glowing scan star FIRST, then take it to the matching green dock. Do BOTH!',
  pieces:[pc('laptop','Space Laptop',1,1,{x:9,y:1},art[3]),
   pc('keyboard','Space Keyboard',1,5,{x:9,y:5},art[1])],
  pickups:[beacon('scan-laptop',4+offset,1,'Laptop Scan',gold,'laptop'),
   beacon('scan-keyboard',4+offset,5,'Keyboard Scan',gold,'keyboard')]};
 if(stage===4)return {...base,kind:'precision',name:NAMES[4],target:'target',
  directions:'SECRET COMPUTER! Click the BLUE computer, NOT the decoys. Move it to BOTH signal stars before docking!',
  pieces:[pc('target','Secret Computer',2,3,{x:9,y:3},art[4]),
   pc('decoy1','Space Mouse',6,1,null,art[2]),
   pc('decoy2','Space Laptop',7,5,null,art[3]),
   pc('decoy3','Space Keyboard',5,4,null,art[1]),
   ...(world>=4?[pc('decoy4','Trackpad',9,5,null,art[0])]:[])],
  pickups:[beacon('signal-a',4,world%2?2:4,'Signal 1',gold,'target'),
   beacon('signal-b',7,world%2?4:2,'Signal 2',gold,'target')]};
 if(stage===5)return {...base,kind:'key-gate',name:NAMES[5],
  directions:'FORCE FIELD! Click the KEYBOARD tool and collect the magic key. The gate opens! Then deliver BOTH tools to their green docks.',
  pieces:[pc('keyboard','Magic Keyboard',1,1,{x:9,y:1},art[1]),
   pc('mouse','Space Mouse',1,5,{x:9,y:5},art[2])],
  rocks:Array.from({length:7},(_,y)=>[5,y]).filter(v=>v[1]!==3),
  gate:{x:5,y:3,img:art[4]},
  pickups:[beacon('gate-key',3+world%2,3,'Open the Gate',gem,'keyboard')]};
 if(stage===6)return {...base,kind:'relay',name:NAMES[6],
  directions:'SPACE SIGNAL RELAY! Click the highlighted tool FIRST. Use arrows to dock it. Then click the NEXT highlighted tool. Connect all THREE!',
  pieces:[pc('trackpad','Trackpad',1,1,{x:9,y:1},art[0]),
   pc('arrows','Arrow Controls',1,3,{x:9,y:3},art[5]),
   pc('laptop','Laptop',1,5,{x:9,y:5},art[3])],
  deliveryOrder:world%3===0?['trackpad','arrows','laptop']:world%3===1?['arrows','laptop','trackpad']:['laptop','trackpad','arrows'],
  rocks:[[5,0],[5,2],[5,4],[5,6],...(world>=4?[[7,2],[7,4]]:[])]};
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
