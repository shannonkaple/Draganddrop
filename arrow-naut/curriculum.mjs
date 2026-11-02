/** Independent second-grade ARROW-NAUT mission curriculum.
 * All planet names, characters and visual assets are new to this game.
 * Illustrations in the prototype are temporary, not final approved art.
 */
export const GRID={columns:12,rows:7};
export const PLANETS=[
  // IMPORTANT: legacy internal IDs stay intact to protect saved progress.
  {id:'launch',name:'Candy Moon',symbol:'🍬',friend:'Pip the Star Sprout',hue:315,blurb:'Careful space clicking on the candy moon.',enemyIdeas:['Moon Mite','Sprinkle Drone','Gumdrop Hopper','Sugar Sprite']},
  {id:'moon',name:'Rocket Launch',symbol:'🚀',friend:'Momo Moon Mouse',hue:213,blurb:'Move your rover at the launch base.',enemyIdeas:['Rocket Gremlin','Fuel Beetle','Zap Bot','Spark Drone']},
  {id:'robot',name:'Neon Ringed Planet',symbol:'🪐',friend:'Beebo Bot',hue:275,blurb:'Fit colorful cargo into space bays.',enemyIdeas:['Orbit Mite','Ring Crawler','Plasma Pixie','Zap Sprite']},
  {id:'crystal',name:'Crystal Ice',symbol:'❄️',friend:'Glimmer Gecko',hue:195,blurb:'Resize and arrange icy space tools.',enemyIdeas:['Ice Mite','Prism Moth','Snow Sprite','Frost Drone']},
  {id:'slime',name:'Robot Space Station',symbol:'🤖',friend:'Bloop the Blob',hue:190,blurb:'Repair robots using careful selection.',enemyIdeas:['Glitch Bug','Gear Gremlin','Circuit Crawler','Battery Bot']},
  {id:'ice',name:'Dino Asteroid',symbol:'🦖',friend:'Frosty Ferret',hue:105,blurb:'Solve prehistoric asteroid puzzles.',enemyIdeas:['Meteor Beetle','Fossil Hopper','Crater Crab','Comet Crawler']},
  {id:'jungle',name:'Ocean Planet',symbol:'🌊',friend:'Zuzu Comet Cub',hue:185,blurb:'Fit equipment in a watery world.',enemyIdeas:['Wave Mite','Bubble Bot','Coral Crab','Reef Crawler']},
  {id:'core',name:'Lava Planet',symbol:'🌋',friend:'Nova Starling',hue:14,blurb:'Combine all your skills at the final planet.',enemyIdeas:['Lava Blob','Ember Beetle','Magma Sprite','Fire Drone']},
];
export const MISSION_NAMES=[
  'Target Click','Rover Route','Cargo Bay Fit','Resize the Rocket',
  'Careful Selection','Satellite Repair','Space Station Builder','Rescue Mission'
];
export const MISSION_SKILLS=[
  'Click carefully INSIDE the requested box.',
  'Click the rover. Move with your arrow keys.',
  'Click each block inside, then use arrows to fit it into its outline.',
  'Click the corner handle. Use arrows to resize the rocket.',
  'Click the correct object, not the one overlapping it. Then move it.',
  'Move the satellite, then use a handle to resize its panel.',
  'Select, move, and resize different pieces to build a station.',
  'Combine careful clicking, arrow movement, and resizing to rescue a friend.'
];
const shape=(id,name,x,y,cells,goal,color)=>({id,name,x,y,w:Math.max(...cells.map(c=>c[0]))+1,h:Math.max(...cells.map(c=>c[1]))+1,cells,goal,color,resize:false});
const rectangle=(id,name,x,y,w,h,goal,color,resize=false)=>({id,name,x,y,w,h,goal,color,resize});
/** Original, fixed-grid, no-drag puzzles; different planet offsets vary layouts without changing controls. */
export function createMission(planetIndex,stage){
 if(!Number.isInteger(planetIndex)||planetIndex<0||planetIndex>=PLANETS.length||!Number.isInteger(stage)||stage<0||stage>7)throw Error('Unknown mission');
 const planet=PLANETS[planetIndex];
 const base={id:`${planet.id}-${stage+1}`,planetIndex,stage,planet,number:planetIndex*8+stage+1,
  title:MISSION_NAMES[stage],directions:MISSION_SKILLS[stage],pieces:[],obstacles:[],kind:'place'};
 // Stage 1: tiny target selection, not a disguised drag or crop operation.
 if(stage===0)return {...base,kind:'click',directions:'Carefully click INSIDE the glowing '+(planetIndex%2?'blue':'pink')+' space box.',
  pieces:[rectangle('box-a','Pink box',2,2,2,2,null,'pink'),rectangle('box-b','Blue box',7,1,2,2,null,'blue'),rectangle('box-c','Purple box',7,4,1,1,null,'purple')],
  clickTarget:planetIndex%2?'box-b':'box-a'};
 if(stage===1)return {...base,pieces:[rectangle('rover','Moon rover',1,5,1,1,{x:10,y:1,w:1,h:1},'mint')],
  obstacles:[[4,2],[4,3],[4,4],[6,0],[6,1],[8,4],[8,5],[8,6]],kind:'move'};
 if(stage===2)return {...base,kind:'fit',pieces:[
  shape('cargo-l','L-shaped cargo',1,1,[[0,0],[0,1],[1,1]],{x:7,y:1},'pink'),
  shape('cargo-t','T-shaped cargo',1,4,[[0,0],[1,0],[2,0],[1,1]],{x:7,y:4},'blue'),
 ]};
 if(stage===3)return {...base,kind:'resize',pieces:[rectangle('rocket','Rocket cabin',2,2,2,2,{x:2,y:2,w:5,h:3},'pink',true)]};
 if(stage===4)return {...base,kind:'precision',directions:'Carefully click INSIDE the BLUE module. Then move it to the glowing target.',
  pieces:[rectangle('decoy','Pink module',3,2,2,2,null,'pink'),rectangle('module','Blue module',4,2,3,2,{x:8,y:4,w:3,h:2},'blue')],clickTarget:'module'};
 if(stage===5)return {...base,kind:'mixed',pieces:[
  rectangle('satellite','Satellite body',1,4,2,1,{x:8,y:4,w:2,h:1},'mint'),
  rectangle('panel','Solar panel',1,1,2,1,{x:6,y:1,w:4,h:2},'blue',true),
 ]};
 if(stage===6)return {...base,kind:'mixed',pieces:[
  rectangle('antenna','Antenna',1,1,1,2,{x:10,y:1,w:1,h:2},'mint'),
  rectangle('window','Space window',1,4,2,2,{x:6,y:3,w:3,h:2},'pink',true),
  rectangle('console','Control console',4,5,2,1,{x:7,y:5,w:2,h:1},'blue'),
 ]};
 return {...base,kind:'rescue',pieces:[
  rectangle('bridge','Rescue bridge',1,4,2,1,{x:5,y:4,w:4,h:1},'mint',true),
  rectangle('beacon','Rescue beacon',2,1,1,1,{x:10,y:1,w:1,h:1},'pink'),
 ]};
}
export function allMissions(){return PLANETS.flatMap((_,pi)=>MISSION_NAMES.map((_,stage)=>createMission(pi,stage)))}
export function createProgress(){return {version:1,completed:[],stars:0,seenIntros:[],rescued:[],purchases:[],worldScene:[],active:null,playerId:'astro-pup'}}
export function completedCount(progress,planetIndex){const prefix=PLANETS[planetIndex].id+'-';return (progress.completed||[]).filter(id=>id.startsWith(prefix)).length}
export function planetUnlocked(progress,index){return index===0||PLANETS.slice(0,index).every((_,i)=>completedCount(progress,i)===8)}
export function stageUnlocked(progress,pi,stage){return planetUnlocked(progress,pi)&&(stage===0||((progress.completed||[]).includes(`${PLANETS[pi].id}-${stage}`)))}
export const SPACE_SHOP=[
 {id:'telescope',name:'Starlight Telescope',price:6,symbol:'🔭'},
 {id:'moon-buggy',name:'Mini Moon Buggy',price:9,symbol:'🚙'},
 {id:'robot-pet',name:'Robot Pet',price:12,symbol:'🤖'},
 {id:'crystals',name:'Crystal Garden',price:15,symbol:'💎'},
 {id:'rocket-lamp',name:'Rocket Lamp',price:18,symbol:'🚀'},
 {id:'alien-plant',name:'Alien Plant',price:21,symbol:'🌱'},
 {id:'space-helmet',name:'Astronaut Helmet',price:9,symbol:'🪐'},
 {id:'rocket-boots',name:'Rocket Boots',price:12,symbol:'🚀'},
 {id:'star-cape',name:'Starlight Cape',price:15,symbol:'⭐'},
 {id:'astro-goggles',name:'Astro Goggles',price:12,symbol:'✨'},
 {id:'mini-ufo',name:'Mini UFO',price:18,symbol:'🛸'},
 {id:'solar-satellite',name:'Solar Satellite',price:18,symbol:'🛰️'},
 {id:'cosmic-snowglobe',name:'Space Snow Globe',price:21,symbol:'🌌'},
];
