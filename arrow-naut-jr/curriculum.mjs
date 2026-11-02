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
export const NAMES=['Find the Star','Move the Rover','Avoid the Space Rocks','Two Deliveries','Choose Carefully','Space Helpers','Three Star Deliveries','Rescue Maze'];
const pc=(id,name,x,y,goal,img)=>({id,name,x,y,goal,img,w:1,h:1});
const art=[png('trackpad'),png('keyboard'),png('mouse'),png('laptop'),png('desktop'),skill('arrows'),skill('click')];
export function createMission(world,stage){
 if(!Number.isInteger(world)||world<0||world>=8||!Number.isInteger(stage)||stage<0||stage>7)
  throw Error('Unknown first-grade mission');
 const id=WORLDS[world].id+'-'+(stage+1),w=WORLDS[world];
 const base={id,world,stage,kind:'move',name:NAMES[stage],pieces:[],rocks:[],target:null,worldData:w};
 const offset=world%3;
 if(stage===0)return {...base,kind:'click',name:'Click the Space Star',
  directions:'Click INSIDE the golden space star with your TRACKPAD.',
  target:'star',
  pieces:[
   pc('star','Golden Space Star',2+offset,2,null,'../arrow-lab/assets/star-icon.png'),
   pc('decoy1','Space Laptop',8,1,null,art[3]),
   pc('decoy2','Space Keyboard',7,4,null,art[1]),
   ...(world>=3?[pc('decoy3','Space Mouse',10,4,null,art[2])]:[])
  ]};
 if(stage===1)return {...base,directions:'Click the rover. Use the KEYBOARD ARROWS to move it into the green finish square.',
  pieces:[pc('rover','Space Rover',2,4,{x:5+offset,y:4},art[2])]};
 if(stage===2)return {...base,directions:'Click the rover. Use ARROW KEYS to drive AROUND the space rocks to the green finish.',
  pieces:[pc('rover','Space Rover',1,3,{x:10,y:3},art[2])],
  rocks:[[4,1],[4,2],[4,3],[4,4],[6,3],[7,3],...(world>=3?[[7,2],[7,4]]:[])]};
 if(stage===3)return {...base,directions:'Click ONE space item at a time. Move each item to its own green finish square.',
  pieces:[pc('laptop','Space Laptop',1,1,{x:8,y:1},art[3]),pc('keyboard','Space Keyboard',1,5,{x:8,y:5},art[1])]};
 if(stage===4)return {...base,kind:'precision',target:'target',directions:'Click the BLUE computer INSIDE its picture. Move it to its finish square. Do NOT click the other objects.',
  pieces:[pc('target','Blue Computer',2,3,{x:9,y:3},art[4]),
   pc('decoy1','Space Mouse',6,1,null,art[2]),pc('decoy2','Space Laptop',7,5,null,art[3]),
   ...(world>=3?[pc('decoy3','Space Keyboard',5,4,null,art[1])]:[])]};
 if(stage===5)return {...base,directions:'Select and move BOTH helpers around the rocks to their green finish squares.',
  pieces:[pc('keyboard','Space Keyboard',1,1,{x:9,y:1},art[1]),pc('mouse','Space Mouse',1,5,{x:9,y:5},art[2])],
  rocks:[[5,1],[5,2],[5,4],[5,5],...(world>=4?[[7,3]]:[])]};
 if(stage===6)return {...base,directions:'Click and move THREE space tools, ONE at a time, to their matching finish squares.',
  pieces:[pc('trackpad','Trackpad',1,1,{x:9,y:1},art[0]),pc('arrows','Arrow Controls',1,3,{x:9,y:3},art[5]),
    pc('laptop','Laptop',1,5,{x:9,y:5},art[3])],
  rocks:[[5,0],[5,2],[5,4],[5,6],...(world>=4?[[7,2],[7,4]]:[])]};
 const maze=makeFinalMaze(world);
 return {...base,kind:'maze',name:'Rescue Maze',directions:'CLICK your space explorer to select it. Use KEYBOARD ARROWS to reach EXIT. Bad guys patrol side paths.',
  pieces:[],rocks:maze.walls,mazeStart:maze.start,mazeGoal:maze.goal,enemies:maze.enemies,safeRoute:maze.safeRoute};
}
export function createProgress(){return {version:1,completed:[],stars:0,purchases:[],rescued:[],character:CHARACTERS[0].id,worldScene:[],sceneWorld:0,active:null}}
export function completedCount(progress,w){return progress.completed.filter(id=>id.startsWith(WORLDS[w].id+'-')).length}
export function worldUnlocked(progress,w){return w===0||WORLDS.slice(0,w).every((_,i)=>progress.completed.includes(WORLDS[i].id+'-8'))}
export function levelUnlocked(progress,w,stage){return worldUnlocked(progress,w)&&(stage===0||progress.completed.includes(WORLDS[w].id+'-'+stage))}
export function allMissions(){return WORLDS.flatMap((_,w)=>NAMES.map((_,s)=>createMission(w,s)))}
