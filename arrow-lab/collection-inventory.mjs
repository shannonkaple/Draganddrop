// MY STUFF scene inventory helpers. No data is ever removed from saved student collections.
// Future game pickups are deliberately JPEG-only; past PNG treasures can still be
// displayed and arranged, because deleting earned items would erase student progress.
export const isJpegArt=path=>typeof path==='string'&&/\.jpe?g(?:[?#].*)?$/i.test(path);
export const earnedKeys=state=>[...new Set([
  ...(state.collectedWorldItems||[]),
  ...(state.collectedComputerGearIds||[]),
  ...(state.earnedSkillBadgeIds||[])
].filter(id=>typeof id==='string'&&id.length))];
export function visibleCollectedKeys(state,worldId){
 const earned=new Set(earnedKeys(state));
 return [...new Set(state.collectionExtraObjects?.[worldId]||[])].filter(id=>earned.has(id));
}
export function toggleCollectedInWorld(state,worldId,key){
 if(!earnedKeys(state).includes(key))return {changed:false,added:false};
 state.collectionExtraObjects??={};
 const list=state.collectionExtraObjects[worldId]??=[];
 if(list.includes(key)){
   state.collectionExtraObjects[worldId]=list.filter(id=>id!==key);
   return {changed:true,added:false};
 }
 list.push(key);
 // Save a clear, visible starting position rather than placing behind a
 // character, the extreme edge of the scene, or outside a small Chromebook.
 state.positions??={};
 state.positions[worldId]??={};
 const slot=(list.length-1)%9,col=slot%3,row=Math.floor(slot/3);
 state.positions[worldId]['treasure:'+key]??={x:35+col*15,y:38+row*15};
 return {changed:true,added:true};
}
