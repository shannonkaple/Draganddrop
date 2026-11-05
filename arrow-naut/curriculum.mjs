/** Independent second-grade ARROW-NAUT mission curriculum.
 * All planet names, characters and visual assets are new to this game.
 * Illustrations in the prototype are temporary, not final approved art.
 */
import {makeFinalMaze} from './finale-maze.mjs?v=all-boss-safe-lasers-20261102';
export const GRID={columns:12,rows:7};
export const PLANETS=[
  // IMPORTANT: legacy internal IDs stay intact to protect saved progress.
  {id:'launch',name:'Candy Moon',friend:'Stella Space Bunny',hue:315,blurb:'Careful space clicking on the candy moon.',enemyIdeas:['Moon Mite','Sprinkle Drone','Gumdrop Hopper','Sugar Sprite']},
  {id:'moon',name:'Rocket Launch',friend:'Zippy Space Turtle',hue:213,blurb:'Move your rover at the launch base.',enemyIdeas:['Rocket Gremlin','Fuel Beetle','Zap Bot','Spark Drone']},
  {id:'robot',name:'Neon Ringed Planet',friend:'Orbit Otter',hue:275,blurb:'Fit colorful cargo into space bays.',enemyIdeas:['Orbit Mite','Ring Crawler','Plasma Pixie','Zap Sprite']},
  {id:'crystal',name:'Crystal Ice',friend:'Cosmic Koala',hue:195,blurb:'Resize and arrange icy space tools.',enemyIdeas:['Ice Mite','Prism Moth','Snow Sprite','Frost Drone']},
  {id:'slime',name:'Robot Space Station',friend:'Pixel Space Pup',hue:190,blurb:'Repair robots using careful selection.',enemyIdeas:['Glitch Bug','Gear Gremlin','Circuit Crawler','Battery Bot']},
  {id:'ice',name:'Dino Asteroid',friend:'Nova Space Panda',hue:105,blurb:'Solve prehistoric asteroid puzzles.',enemyIdeas:['Meteor Beetle','Fossil Hopper','Crater Crab','Comet Crawler']},
  {id:'jungle',name:'Ocean Planet',friend:'Comet Space Kitty',hue:185,blurb:'Fit equipment in a watery world.',enemyIdeas:['Wave Mite','Bubble Bot','Coral Crab','Reef Crawler']},
  {id:'core',name:'Lava Planet',friend:'Starbot Explorer',hue:14,blurb:'Combine all your skills at the final planet.',enemyIdeas:['Lava Blob','Ember Beetle','Magma Sprite','Fire Drone']},
];
export const MISSION_NAMES=[
  'Color Signal Click','Star Rover Expedition','Match Cargo Bays','Stretch the Rocket',
  'Find the Blue Module','Repair the Satellite','Build the Space Station','Planet Maze Finale',
  'Double-Star Rover Run','Space Signal Search'
];
/** Eight distinct mission orders: final boss stays level 8 to gate rescue and next world.
 * IDs / levels are never renumbered so saved stars and unlocks are preserved.
 */
export const WORLD_ORDERS=[
 [0,1,2,3,4,5,6],
 [8,4,0,5,2,6,3],
 [2,0,9,1,3,4,6],
 [4,2,6,8,1,3,5],
 [5,1,3,2,0,8,4],
 [3,6,9,4,2,0,5],
 [6,4,2,5,1,9,0],
 [8,5,4,6,9,1,2]
];
export const MISSION_SKILLS=[
  'Click carefully INSIDE the requested box.',
  'Click the rover. Move with your arrow keys.',
  'Click each block inside, then use arrows to fit it into its outline.',
  'Click and hold a rocket corner handle, then DRAG with the trackpad to stretch it.',
  'Click the correct object, not the one overlapping it. Then move it.',
  'Move the satellite with arrows. DRAG the panel handle to resize it.',
  'Click inside to select, use arrows to move, and DRAG handles to stretch the pieces.',
  'Use arrow keys to escape the maze! Press SPACE or click FIRE LASER to zap bad guys. Reach EXIT to earn 10 stars and unlock the next planet.',
  'Collect TWO star signals while dodging the bad guys, then guide the rover into the labeled dock.',
  'Find the blue communications module. Collect both signal crystals, then move it into the matching dock.'
];
const shape=(id,name,x,y,cells,goal,color)=>({id,name,x,y,w:Math.max(...cells.map(c=>c[0]))+1,h:Math.max(...cells.map(c=>c[1]))+1,cells,goal,color,resize:false});
const rectangle=(id,name,x,y,w,h,goal,color,resize=false)=>({id,name,x,y,w,h,goal,color,resize});
/** Original, fixed-grid, no-drag puzzles; different planet offsets vary layouts without changing controls. */
function buildBaseMission(planetIndex,stage){
 if(!Number.isInteger(planetIndex)||planetIndex<0||planetIndex>=PLANETS.length||!Number.isInteger(stage)||stage<0||stage>7)throw Error('Unknown mission');
 const planet=PLANETS[planetIndex];
 const templateStage=stage===7?7:WORLD_ORDERS[planetIndex][stage];
 const base={id:`${planet.id}-${stage+1}`,planetIndex,stage,planet,number:planetIndex*8+stage+1,
  title:MISSION_NAMES[templateStage],directions:MISSION_SKILLS[templateStage],pieces:[],obstacles:[],pickups:[],kind:'place',templateStage,layoutVersion:3};
 // Planet difficulty 1-8: more choices, longer routes, larger stretch targets
 // and extra rescue equipment. All coordinates stay inside the 12x7 board.
 if(templateStage===0){
  // Selecting the correct picture is step ONE, not a one-click win.
  // Each planet changes the chosen picture, route, checkpoint and destination.
  const odd=planetIndex%2===1,target=odd?'box-b':'box-a';
  const goal=odd?{x:1,y:4,w:2,h:2}:{x:9,y:4,w:2,h:2};
  const checkpoint=odd?{x:5,y:1}:{x:4,y:2};
  return {...base,kind:'precision',layoutVersion:5,
   title:odd?'Blue Signal Search & Delivery':'Pink Signal Search & Delivery',
   directions:'Find and CLICK the '+(odd?'BLUE':'PINK')+' picture (not the decoys). Use ARROW KEYS to collect its glowing star, dodge obstacles, and deliver it into the matching dock. One click does NOT finish the level.',
   pieces:[
    rectangle('box-a','Pink signal picture',2,2,2,2,odd?null:goal,'pink'),
    rectangle('box-b','Blue signal picture',7,1,2,2,odd?goal:null,'blue'),
    rectangle('box-c','Purple decoy',7,5,1,1,null,'purple')],
   pickups:[{id:'select-signal',x:checkpoint.x,y:checkpoint.y,name:'Signal star',image:'./assets/standalone/pickup_star.png'}],
   clickTarget:target};
 }
 if(templateStage===1){
  const obstacles=[[4,2],[4,3],[4,4],[6,0],[6,1],[8,4],[8,5],[8,6]];
  if(planetIndex>=2)obstacles.push([2,3],[3,3]);
  if(planetIndex>=4)obstacles.push([6,3],[6,4]);
  if(planetIndex>=6)obstacles.push([9,2],[9,3]);
  return {...base,pieces:[rectangle('rover','Moon rover',1,5,1,1,{x:10,y:planetIndex>=4?0:1,w:1,h:1},'mint')],obstacles,kind:'move',
   pickups:[{id:'rover-star',x:7,y:3,name:'Star signal',image:'./assets/standalone/pickup_star.png'}],
   directions:'Click the rover. Use keyboard arrows to move around bad guys, COLLECT the star signal, then reach the matching rover dock.'};
 }
 if(templateStage===2)return {...base,kind:'fit',directions:'Click the full L or T cargo picture. Use arrow keys to turn around space bad guys and FIT each into its matching labeled cargo dock.',obstacles:[[11,6],[0,0]],pieces:[
  shape('cargo-l','L-shaped cargo',1,1,[[0,0],[0,1],[0,2],[1,2]],{x:planetIndex>=4?8:7,y:0},'pink'),
  shape('cargo-t','T-shaped cargo',1,4,[[0,0],[1,0],[2,0],[1,1],[1,2]],{x:planetIndex>=5?6:7,y:3},'blue'),
 ]};
 if(templateStage===3)return {...base,kind:'resize',pieces:[rectangle('rocket','Rocket cabin',2,2,2,2,
  {x:2,y:2,w:3+Math.floor(planetIndex/2),h:2+(planetIndex>=3?1:0)+(planetIndex>=6?1:0)},'pink',true)]};
 if(templateStage===4)return {...base,kind:'precision',directions:'Click the BLUE module, not a decoy. Collect the crystal on the way, then FIT it inside the BLUE MODULE dock.',
  obstacles:[[11,0],[0,6]],pickups:[{id:'module-crystal',x:6,y:4,name:'Module crystal',image:'./assets/standalone/pickup_crystals.png'}],pieces:[rectangle('decoy','Pink module',1,0,2,2,null,'pink'),rectangle('module','Blue module',4,2,3,2,{x:8,y:4,w:3,h:2},'blue'),
   ...(planetIndex>=3?[rectangle('decoy-2','Purple module',1,5,2,1,null,'purple')]:[]),
   ...(planetIndex>=6?[rectangle('decoy-3','Mint module',9,0,2,1,null,'mint')]:[])],clickTarget:'module'};
 if(templateStage===5)return {...base,kind:'mixed',obstacles:[[0,6],[11,0]],pieces:[
  rectangle('satellite','Satellite body',1,4,2,1,{x:8,y:planetIndex>=4?5:4,w:2,h:1},'mint'),
  rectangle('panel','Solar panel',1,1,2,1,{x:6,y:1,w:3+Math.floor(planetIndex/3),h:2+(planetIndex>=5?1:0)},'blue',true),
 ]};
 if(templateStage===6)return {...base,kind:'mixed',obstacles:[[0,6],[11,0]],pieces:[
  rectangle('antenna','Antenna',1,1,1,2,{x:10,y:1,w:1,h:2},'mint'),
  rectangle('window','Space window',1,4,2,2,{x:6,y:planetIndex>=4?2:3,w:3+(planetIndex>=4?1:0),h:2+(planetIndex>=4?1:0)},'pink',true),
  rectangle('console','Control console',4,5,2,1,{x:7,y:5,w:2,h:1},'blue'),
 ]};
 if(templateStage===8)return {...base,kind:'move',title:'Double-Star Rover Run',
  directions:MISSION_SKILLS[8],
  pieces:[rectangle('rover','Moon rover',1,5,1,1,{x:10,y:1,w:1,h:1},'mint')],
  obstacles:[[5,2],[5,3],[6,3],[8,1],[10,5]],
  pickups:[
   {id:'first-star',x:3,y:2,name:'Star Signal One',image:'./assets/standalone/pickup_star.png'},
   {id:'second-star',x:8,y:4,name:'Star Signal Two',image:'./assets/standalone/pickup_star.png'}
  ]};
 if(templateStage===9)return {...base,kind:'precision',title:'Space Signal Search',
  directions:MISSION_SKILLS[9],clickTarget:'module',
  pieces:[rectangle('module','Blue communications module',1,1,2,2,{x:8,y:4,w:2,h:2},'blue'),
   rectangle('decoy','Pink decoy',5,0,2,1,null,'pink'),
   rectangle('decoy-2','Purple decoy',1,5,2,1,null,'purple')],
  obstacles:[[11,0],[0,6]],
  pickups:[
   {id:'signal-one',x:4,y:1,name:'Signal Crystal One',image:'./assets/standalone/pickup_crystals.png'},
   {id:'signal-two',x:6,y:3,name:'Signal Crystal Two',image:'./assets/standalone/pickup_star.png'}
  ]};
 const final=makeFinalMaze(planetIndex);
 return {...base,kind:'final-maze',title:'Planet Maze Finale',directions:MISSION_SKILLS[7],
  pieces:[],obstacles:[],walls:final.walls,safeRoute:final.safeRoute,mazeStart:final.start,mazeGoal:final.goal,enemies:final.enemies};

}
/** Progressive second-grade workshop tasks.
 * Later non-boss missions add 1–3 separate trackpad-handle resize challenges.
 * Reservation checks keep every starter and final dock clear of every other
 * starter, obstacle, collectible, and goal. Junior never imports this.
 */
function addProgressiveResizes(mission){
 if(mission.kind==='click'||mission.kind==='final-maze')return mission;
 const {planetIndex,stage}=mission;
 const desired=Math.min(3,Math.max(0,Math.floor((planetIndex*7+stage)/11)));
 if(!desired)return mission;
 const blocked=new Set();
 const mark=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)blocked.add(xx+','+yy)};
 for(const p of mission.pieces){
  mark(p.x,p.y,p.w,p.h);
  if(p.goal)mark(p.goal.x,p.goal.y,p.goal.w??p.w,p.goal.h??p.h);
 }
 for(const [x,y]of mission.obstacles||[])mark(x,y,1,1);
 for(const p of mission.pickups||[])mark(p.x,p.y,1,1);
 const types=[
  {name:'Solar Tile',w:2,h:1,color:'blue'},
  {name:'Signal Tile',w:1,h:2,color:'mint'},
  {name:'Star Tile',w:2,h:2,color:'pink'}
 ];
 const added=[];
 // Spread optional stations vertically and horizontally where there is room.
 for(let n=0;n<desired;n++){
  const type=types[n],candidates=[];
  for(let y=0;y<=GRID.rows-type.h;y++)for(let x=0;x<=GRID.columns-type.w;x++){
   let free=true;
   for(let yy=y;yy<y+type.h;yy++)for(let xx=x;xx<x+type.w;xx++)
    if(blocked.has(xx+','+yy))free=false;
   if(free)candidates.push({x,y,score:Math.abs(x-(n===1?2:9))*2+Math.abs(y-(n===0?0:n===1?5:3))});
  }
  candidates.sort((a,b)=>a.score-b.score);
  if(!candidates.length)continue;
  const {x,y}=candidates[0];
  const id='resize-tile-'+(n+1);
  added.push(rectangle(id,type.name+' '+(n+1),x,y,1,1,{x,y,w:type.w,h:type.h},type.color,true));
  mark(x,y,type.w,type.h);
 }
 if(!added.length)return mission;
 return {...mission,layoutVersion:4,pieces:[...mission.pieces,...added],
  directions:mission.directions+' BONUS: Click the matching space tiles, hold and drag their resize handles, and fit EACH one into its own labeled dock.'};
}
// Optional Map Two practice labs. Preserve ALL legacy level IDs 1–8 and boss rescues.
export const BONUS_STAGES=8;
const BONUS_ORDER=[3,6,5,1,2,4,0,3];
export function createMission(planetIndex,stage){
 if(Number.isInteger(stage)&&stage>=8&&stage<8+BONUS_STAGES){
  const base=buildBaseMission(planetIndex,BONUS_ORDER[stage-8]);
  // New stable IDs never collide with original 64 levels or saved student runs.
  return addProgressiveResizes({...base,id:PLANETS[planetIndex].id+'-bonus-'+(stage-7),
   stage,number:64+planetIndex*BONUS_STAGES+(stage-7),layoutVersion:5,
   title:'Bonus Lab '+(stage-7)+': '+base.title,
   directions:base.directions+' This is an extra Map Two practice mission.'});
 }
 return addProgressiveResizes(buildBaseMission(planetIndex,stage));
}
export function allMissions(){return PLANETS.flatMap((_,pi)=>Array.from({length:8},(_,stage)=>createMission(pi,stage)))}
export function allBonusMissions(){return PLANETS.flatMap((_,pi)=>Array.from({length:BONUS_STAGES},(_,n)=>createMission(pi,8+n)))}
export function createProgress(){return {version:1,completed:[],stars:0,seenIntros:[],rescued:[],purchases:[],worldScene:[],active:null,playerId:'astro-pup'}}
export function completedCount(progress,planetIndex){const id=PLANETS[planetIndex].id;return (progress.completed||[]).filter(level=>Array.from({length:8},(_,n)=>id+'-'+(n+1)).includes(level)).length}
export function bonusCompletedCount(progress,planetIndex){const id=PLANETS[planetIndex].id+'-bonus-';return (progress.completed||[]).filter(level=>Array.from({length:BONUS_STAGES},(_,n)=>id+(n+1)).includes(level)).length}
export function planetUnlocked(progress,index){return index===0||PLANETS.slice(0,index).every((_,i)=>completedCount(progress,i)===8)}
export const sceneUnlocked=(progress,index)=>Number.isInteger(index)&&index>=0&&index<PLANETS.length&&!!progress?.completed?.includes(PLANETS[index].id+'-8');
export function stageUnlocked(progress,pi,stage){
 if(!planetUnlocked(progress,pi))return false;
 if(stage>=8&&stage<8+BONUS_STAGES){
  const base=PLANETS[pi].id;
  return (progress.completed||[]).includes(stage===8?base+'-8':base+'-bonus-'+(stage-8));
 }
 return stage===0||((progress.completed||[]).includes(`${PLANETS[pi].id}-${stage}`));
}
export const SPACE_SHOP=[
 {id:'telescope',name:'Starlight Telescope',price:6},
 {id:'moon-buggy',name:'Mini Moon Buggy',price:9},
 {id:'robot-pet',name:'Robot Pet',price:12},
 {id:'crystals',name:'Crystal Garden',price:15},
 {id:'rocket-lamp',name:'Rocket Lamp',price:18},
 {id:'alien-plant',name:'Alien Plant',price:21},
 {id:'space-helmet',name:'Astronaut Helmet',price:9},
 {id:'rocket-boots',name:'Rocket Boots',price:12},
 {id:'star-cape',name:'Starlight Cape',price:15},
 {id:'astro-goggles',name:'Astro Goggles',price:12},
 {id:'mini-ufo',name:'Mini UFO',price:18},
 {id:'solar-satellite',name:'Solar Satellite',price:18},
 {id:'cosmic-snowglobe',name:'Space Snow Globe',price:21},
 // Complete original Arrow Adventure PNG decorations (not backgrounds).
 {id:'legacy-lollipop',name:'Candy Planet Lollipop',price:5},
 {id:'legacy-cupcake',name:'Galaxy Cupcake',price:6},
 {id:'legacy-pirate-chest',name:'Space Pirate Treasure Chest',price:9},
 {id:'legacy-gold-coins',name:'Golden Space Coins',price:7},
 {id:'legacy-compass',name:'Explorer Compass',price:6},
 {id:'legacy-ice-gem',name:'Frozen Crystal Gem',price:6},
 {id:'legacy-snowglobe',name:'Arctic Snow Globe',price:8},
 {id:'legacy-pearl-shell',name:'Ocean Pearl Shell',price:7},
 {id:'legacy-sea-turtle',name:'Ocean Turtle Friend',price:10},
 {id:'legacy-starfish',name:'Starfish Treasure',price:5},
 {id:'legacy-golden-key',name:'Golden Castle Key',price:9},
 {id:'legacy-hot-cocoa',name:'Explorer Hot Cocoa',price:5},
];
