// MY STUFF: safe, saved placement of earned items.
// Approved collectible art is PNG or JPEG. SVGs and synthetic SVG shapes
// must not appear as newly generated maze pickups.
// IMPORTANT: format policy never deletes a student's previously earned items.
export const isSupportedCollectibleArt=path=>typeof path==='string'&&/\.(?:png|jpe?g)(?:[?#].*)?$/i.test(path);
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
 if(!earnedKeys(state).includes(key)||typeof worldId!=='string'||!worldId)return {changed:false,added:false};
 state.collectionExtraObjects??={};
 const existing=state.collectionExtraObjects[worldId]??=[];
 if(existing.includes(key)){
   state.collectionExtraObjects[worldId]=existing.filter(id=>id!==key);
   return {changed:true,added:false};
 }
 const next=[...existing,key];
 state.collectionExtraObjects[worldId]=next;
 // Put new additions in a visible part of the screen, not behind world edges.
 // Existing manually arranged coordinates remain exactly as students saved them.
 state.positions??={};
 state.positions[worldId]??={};
 const positionKey='treasure:'+key;
 if(!state.positions[worldId][positionKey]){
   const index=(next.length-1)%9;
   state.positions[worldId][positionKey]={x:35+(index%3)*15,y:37+Math.floor(index/3)*16};
 }
 return {changed:true,added:true,position:state.positions[worldId][positionKey]};
}
