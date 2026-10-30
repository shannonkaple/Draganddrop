// Eight independent, traversable FIRST-stage maze layouts, in a 1000×600 board.
// Existing student save IDs, pieces, targets, rewards and other stages remain unchanged.
// Walls are opaque barriers; enemies must have a full movement corridor clear of walls.
const layouts=[
 [245,345,570,215], // Candy: straightforward beginner snake, no bad guys
 [300,355,650,200], // Pirate: north bridge and southern bend
 [335,385,710,235], // Arctic: deep snow wall then high exit
 [255,315,580,190], // Castle: short gate then long stone rampart
 [360,375,625,225], // Space: shifted lunar barriers
 [230,365,700,205], // Jurassic: narrow first passage
 [315,340,665,240], // Ocean: deep reef passage
 [380,380,755,215]  // Lava: far-right volcanic wall
];
const rect=(x,y,w,h)=>({x,y,w,h});
export const boxesOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function firstMazeLayout(worldIndex,enemyArt=[]){
 if(!Number.isInteger(worldIndex)||worldIndex<0||worldIndex>=layouts.length)throw Error('Unknown first maze world');
 const [firstX,firstBottom,secondX,secondTop]=layouts[worldIndex];
 const walls=[rect(firstX,0,38,firstBottom),rect(secondX,secondTop,38,600-secondTop)];
 // Keep the moving enemy fully between the walls. A second enemy, when earned,
 // lives on the right-hand side, rather than inside or across a wall.
 const gapLeft=firstX+38,gapRight=secondX;
 const between=gapLeft+(gapRight-gapLeft)/2;
 const hazards=worldIndex===0?[]:enemyArt.slice(0,worldIndex>=3?2:1).map((asset,i)=>{
  const h=i===0
   ?{...rect(Math.round(between-32),250,64,64),motion:{axis:'x',range:Math.min(28,Math.floor((gapRight-gapLeft-64)/2)-12),period:6500+worldIndex*300}}
   :{...rect(815,245,64,64),motion:{axis:'y',range:26,period:7400+worldIndex*300}};
  return {id:'hazard-'+i,asset,...h};
 });
 for(const h of hazards){
  const sweep={...h};
  if(h.motion?.axis==='x'){sweep.x-=h.motion.range;sweep.w+=2*h.motion.range}
  if(h.motion?.axis==='y'){sweep.y-=h.motion.range;sweep.h+=2*h.motion.range}
  if(walls.some(w=>boxesOverlap(w,sweep)))throw Error('Enemy movement overlaps a first-level wall: '+worldIndex);
 }
 // Walk below the first wall, up between walls, then above the second wall.
 const bottom=Math.min(520,firstBottom+70);
 const center=Math.round(between);
 const solution=[{x:95,y:120},{x:105,y:bottom},{x:center,y:bottom},
   {x:center,y:105},{x:915,y:105},{x:915,y:490}];
 return {walls,hazards,solution};
}
