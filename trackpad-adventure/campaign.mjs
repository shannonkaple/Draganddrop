// Eight-world campaign: the map controls unlocking; stars only buy optional decorations.
export const adventureWorlds=[
 {id:'candy',name:'Candy World',icon:'🍭',land:'candy_clouds',friend:'sunny_kitten',target:'🍬',targetName:'Candy basket',action:'Collect the right tech supplies for the candy shop!',color:'#f45ca9'},
 {id:'pirate',name:'Pirate World',icon:'🏴‍☠️',land:'rainbow_meadow',friend:'poppy_pup',target:'🧰',targetName:'Treasure chest',action:'Find the correct supplies to unlock the treasure!',color:'#d09a3b'},
 {id:'arctic',name:'Arctic World',icon:'🐧',land:'cloud_kingdom',friend:'penny_penguin',target:'🛷',targetName:'Arctic sled',action:'Load the sled to help your friends in the snow!',color:'#56b9ec'},
 {id:'castle',name:'Castle World',icon:'🏰',land:'star_trophy_land',friend:'twinkle_fairy',target:'🏰',targetName:'Castle gate',action:'Deliver the correct tech tools to the castle!',color:'#9b6ade'},
 {id:'space',name:'Space World',icon:'🚀',land:'galaxy_gardens',friend:'beep_bop_robot',target:'🚀',targetName:'Space rocket',action:'Load the correct supplies before the rocket launches!',color:'#766bd3'},
 {id:'jurassic',name:'Jurassic World',icon:'🦕',land:'rainbow_meadow',friend:'dizzy_dino',target:'🦴',targetName:'Dinosaur discovery',action:'Help the dinosaurs gather the right supplies!',color:'#63bd64'},
 {id:'ocean',name:'Ocean World',icon:'🐬',land:'rainbow_reef',friend:'rainbow_rocket_unicorn',target:'🐚',targetName:'Ocean treasure',action:'Restore the ocean by dragging the right supplies!',color:'#34b7ce'},
 {id:'lava',name:'Lava World',icon:'🌋',land:'star_trophy_land',friend:'astro_ace',target:'⚙️',targetName:'Volcano control',action:'Repair the volcano controls with the right items!',color:'#ec6343'}
];
export const activityNames=['Find & collect','Click and carry','Avoid the bad guy','Fix the route','Match the supplies','Rescue delivery','Careful crossing','World challenge'];
export const activitiesPerWorld=8;
export function campaign(state){
 if(!state.campaign||!Array.isArray(state.campaign.completed)){
  state.campaign={completed:Array(8).fill(0),current:0,level:0,replay:false,awarded:[],version:1};
 }
 const c=state.campaign;
 c.completed=Array.from({length:8},(_,i)=>Math.max(0,Math.min(8,Math.floor(Number(c.completed[i])||0))));
 c.awarded=Array.isArray(c.awarded)?c.awarded:[];
 c.current=Math.max(0,Math.min(7,Math.floor(Number(c.current)||0)));
 c.level=Math.max(0,Math.min(7,Math.floor(Number(c.level)||0)));
 const unlocked=c.completed.findIndex(v=>v<8);
 c.unlocked=unlocked===-1?7:unlocked;
 if(c.current>c.unlocked)c.current=c.unlocked;
 if(c.level>c.completed[c.current])c.level=Math.min(7,c.completed[c.current]);
 return c;
}
export const mapPath=(world)=>'trackpad-adventure/maps/'+(typeof world==='string'?world:world.id)+'.svg';
export function friendForWorld(index){return adventureWorlds[index]?.friend}
export function isWorldUnlocked(state,index){return index===0||campaign(state).completed[index-1]===8}
export function activityStatus(state,index,level){
 const c=campaign(state),done=c.completed[index],open=isWorldUnlocked(state,index);
 if(!open)return 'locked';
 if(level<done)return 'complete';
 if(level===done&&level<8)return 'next';
 return 'locked';
}
export function makeWorldTask(state,allItems){
 const c=campaign(state),w=c.current,l=c.level;
 const count=l>=6?5:l>=3?4:3;
 const shift=(w*7+l*4)%allItems.length;
 return {ids:Array.from({length:count},(_,i)=>allItems[(shift+i)%allItems.length]),
  done:[],attempts:0,totalClicks:0,misses:0,cancelled:0,clickOnly:0,touchBlocked:0,enemyBumps:0,
  drags:[],started:Date.now(),worldId:adventureWorlds[w].id,worldIndex:w,activityIndex:l};
}
